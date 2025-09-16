// AI Service for Nyx OS - Robust, env-configured, with offline fallback
export interface AIResponse {
  text: string
  audio?: string
  emotion?: string
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const getEnv = (key: string): string | undefined => {
  // Vite-style env
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
    // @ts-ignore
    return import.meta.env[key]
  }
  // Tauri/Node-like env
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && key in process.env) {
    // @ts-ignore
    return process.env[key]
  }
  return undefined
}

const OPENROUTER_API_KEY = getEnv('VITE_OPENROUTER_API_KEY') || getEnv('OPENROUTER_API_KEY')
const ELEVENLABS_API_KEY = getEnv('VITE_ELEVENLABS_API_KEY') || getEnv('ELEVENLABS_API_KEY')
const VOICE_ID = getEnv('VITE_ELEVENLABS_VOICE_ID') || '21m00Tcm4TlvDq8ikWAM' // default voice id if configured

class AIService {
  private isVoiceMode = false
  private currentConversation: AIMessage[] = []

  constructor() {
    this.initializeServices()
  }

  private async initializeServices() {
    console.log('Nyx OS AI initialized')
    if (!OPENROUTER_API_KEY) console.warn('OpenRouter API key not configured. Using offline fallback.')
    if (!ELEVENLABS_API_KEY) console.warn('ElevenLabs API key not configured. Voice output disabled.')
  }

  setVoiceMode(enabled: boolean) {
    this.isVoiceMode = enabled
  }

  async sendMessage(message: string, useCodeModel = false): Promise<AIResponse> {
    try {
      this.currentConversation.push({ role: 'user', content: message })

      const deviceInfo = this.getDeviceContext()
      const systemMessage: AIMessage = {
        role: 'system',
        content:
          `You are Nyx AI, the built-in assistant of Nyx OS. Be concise, friendly, and highly practical. ` +
          `Adapt to the user's device and context. Prefer step-by-step guidance only when needed. Device: ${deviceInfo}.`
      }

      if (!OPENROUTER_API_KEY) {
        return this.localRespond(message)
      }

      const model = useCodeModel ? 'qwen/qwen3-coder:free' : 'google/gemma-3-12b-it:free'

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
          'X-Title': 'Nyx OS'
        },
        body: JSON.stringify({
          model,
          messages: [systemMessage, ...this.currentConversation.slice(-10)],
          temperature: 0.7,
          max_tokens: 600,
          stream: false
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.warn('OpenRouter API error:', response.status, errorText)
        return this.localRespond(message)
      }

      const data = await response.json()
      const aiText = data.choices?.[0]?.message?.content || 'Sorry, I had trouble understanding that.'
      this.currentConversation.push({ role: 'assistant', content: aiText })

      const result: AIResponse = { text: aiText }
      if (this.isVoiceMode && ELEVENLABS_API_KEY) {
        try {
          result.audio = await this.generateSpeech(aiText)
        } catch (err) {
          console.warn('Voice synthesis failed:', err)
        }
      }
      return result
    } catch (error) {
      console.warn('AI Service error, using fallback:', error)
      return this.localRespond(message)
    }
  }

  private async generateSpeech(text: string): Promise<string> {
    if (!ELEVENLABS_API_KEY) return ''
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({ text, model_id: 'eleven_monolingual_v1', voice_settings: { stability: 0.5, similarity_boost: 0.5 } })
    })
    if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`)
    const audioBlob = await response.blob()
    return URL.createObjectURL(audioBlob)
  }

  async transcribeSpeech(_audioBlob: Blob): Promise<string> {
    // Stub: Plug-in a speech-to-text provider when available
    return 'Voice input received'
  }

  async processVoiceCommand(command: string): Promise<void> {
    const lower = command.toLowerCase()
    if (lower.includes('open') && lower.includes('browser')) {
      window.dispatchEvent(new CustomEvent('nyx:open-browser'))
    } else if (lower.includes('open') && lower.includes('settings')) {
      window.dispatchEvent(new CustomEvent('nyx:open-settings'))
    } else if (lower.includes('change wallpaper')) {
      window.dispatchEvent(new CustomEvent('nyx:change-wallpaper'))
    } else if (lower.includes('voice mode off') || lower.includes('silent mode')) {
      this.setVoiceMode(false)
    } else if (lower.includes('voice mode on')) {
      this.setVoiceMode(true)
    }
  }

  private getDeviceContext(): string {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1440
    const height = typeof window !== 'undefined' ? window.innerHeight : 900
    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    return `${width}x${height}, ${isTouchDevice ? 'touch' : 'no-touch'}`
  }

  private localRespond(message: string): AIResponse {
    const text = message.toLowerCase()
    // Very light heuristic responses to feel helpful offline
    if (text.includes('meeting') || text.includes('summary')) {
      return { text: 'To summarize meetings in this demo, paste your notes here; I will condense them into key points, action items, and deadlines.' }
    }
    if (text.includes('task') || text.includes('todo')) {
      return { text: 'Create a task with: title, priority, due date. I can auto-prioritize based on urgency and calendar conflicts.' }
    }
    if (text.includes('calendar') || text.includes('schedule')) {
      return { text: 'Your calendar is open on Chrono. I can suggest optimal times avoiding conflicts and focus blocks.' }
    }
    return { text: 'Got it. I will keep it tight and helpful. Ask me to open apps, summarize notes, or draft content.' }
  }

  clearConversation() {
    this.currentConversation = []
  }

  getConversationHistory(): AIMessage[] {
    return [...this.currentConversation]
  }
}

export const aiService = new AIService()
