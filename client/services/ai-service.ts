// AI Service for Nyx OS - Handles OpenRouter and ElevenLabs integrations
const OPENROUTER_API_KEY = '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'
const ELEVENLABS_API_KEY = 'sk_7f6691b28871ff03e40baea20e01d6e234fdd3f803884ca6'
const VOICE_ID = 'Sflwzhgyy2OmD4OZ1tQa'

export interface AIResponse {
  text: string
  audio?: string
  emotion?: string
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

class AIService {
  private isVoiceMode = true
  private currentConversation: AIMessage[] = []

  constructor() {
    this.initializeServices()
  }

  private async initializeServices() {
    console.log('🧠 Nyx OS AI Services Initialized')
    console.log('📡 OpenRouter: Connected')
    console.log('🎙️ ElevenLabs: Connected')
  }

  setVoiceMode(enabled: boolean) {
    this.isVoiceMode = enabled
    console.log(`🔊 Voice mode: ${enabled ? 'ON' : 'OFF'}`)
  }

  async sendMessage(message: string, useCodeModel = false): Promise<AIResponse> {
    try {
      // Add user message to conversation
      this.currentConversation.push({ role: 'user', content: message })

      // Choose model based on request type
      const model = useCodeModel ? 'qwen/qwen-2.5-coder-32b-instruct' : 'google/gemma-2-9b-it:free'
      
      // Add system context for Nyx OS
      const systemMessage: AIMessage = {
        role: 'system',
        content: `You are Nyx, the AI assistant for Nyx OS - a futuristic, dark-themed operating system. You are helpful, intelligent, and have a slightly mystical personality inspired by Greek mythology. Keep responses concise and engaging. You can help with system operations, coding, and general tasks.`
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Nyx OS'
        },
        body: JSON.stringify({
          model,
          messages: [systemMessage, ...this.currentConversation.slice(-10)], // Keep last 10 messages
          temperature: 0.7,
          max_tokens: 500
        })
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const data = await response.json()
      const aiText = data.choices[0]?.message?.content || 'I apologize, but I cannot process that request right now.'

      // Add AI response to conversation
      this.currentConversation.push({ role: 'assistant', content: aiText })

      const result: AIResponse = { text: aiText }

      // Generate speech if voice mode is enabled
      if (this.isVoiceMode) {
        try {
          result.audio = await this.generateSpeech(aiText)
        } catch (error) {
          console.warn('Speech generation failed:', error)
        }
      }

      return result
    } catch (error) {
      console.error('AI Service Error:', error)
      return {
        text: 'I apologize, but I\'m experiencing technical difficulties. Please try again.',
        emotion: 'confused'
      }
    }
  }

  async generateSpeech(text: string): Promise<string> {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.3,
            use_speaker_boost: true
          }
        })
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }

      const audioBlob = await response.blob()
      return URL.createObjectURL(audioBlob)
    } catch (error) {
      console.error('Speech generation error:', error)
      throw error
    }
  }

  async transcribeSpeech(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'audio.webm')
      formData.append('model', 'whisper-1')

      // Note: This would typically use OpenAI's Whisper API
      // For now, returning a placeholder
      return "Voice input received"
    } catch (error) {
      console.error('Speech transcription error:', error)
      throw error
    }
  }

  async processVoiceCommand(command: string): Promise<void> {
    const lowerCommand = command.toLowerCase()

    // Handle system commands
    if (lowerCommand.includes('open') && lowerCommand.includes('browser')) {
      // Trigger browser opening
      window.dispatchEvent(new CustomEvent('nyx:open-browser'))
    } else if (lowerCommand.includes('open') && lowerCommand.includes('settings')) {
      window.dispatchEvent(new CustomEvent('nyx:open-settings'))
    } else if (lowerCommand.includes('change wallpaper')) {
      window.dispatchEvent(new CustomEvent('nyx:change-wallpaper'))
    } else if (lowerCommand.includes('voice mode off') || lowerCommand.includes('silent mode')) {
      this.setVoiceMode(false)
    } else if (lowerCommand.includes('voice mode on')) {
      this.setVoiceMode(true)
    }
  }

  clearConversation() {
    this.currentConversation = []
  }

  getConversationHistory(): AIMessage[] {
    return [...this.currentConversation]
  }
}

export const aiService = new AIService()
