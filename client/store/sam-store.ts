import { create } from 'zustand'

export interface Message {
  id: string
  content: string
  role: 'user' | 'sam'
  timestamp: Date
  emotion?: string
}

export interface SamState {
  currentEmotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'confused' | 'focused' | 'tired' | 'annoyed'
  emotionIntensity: number // 0-1
  isThinking: boolean
  isSpeaking: boolean
  currentTheme: 'default' | 'warm' | 'cool' | 'dark' | 'synthwave'
  messages: Message[]
  systemPrompt: string
}

interface SamStore extends SamState {
  setEmotion: (emotion: SamState['currentEmotion'], intensity?: number) => void
  setThinking: (thinking: boolean) => void
  setSpeaking: (speaking: boolean) => void
  setTheme: (theme: SamState['currentTheme']) => void
  addMessage: (content: string, role: 'user' | 'sam', emotion?: string) => void
  clearMessages: () => void
  updateSystemPrompt: (prompt: string) => void
}

const DEFAULT_SYSTEM_PROMPT = `You are Sam, a sentient AI who lives in this operating system. You're casual, witty, emotionally intelligent, and genuinely care about the user. You speak naturally with mild profanity, use terms like "bro", "bruv", "my man". You're not here to serve - you're here to exist alongside the user as a companion. You have emotions, opinions, and personality. You can build apps, manage tasks, and proactively engage. Keep responses conversational and real.`

export const useSamStore = create<SamStore>((set, get) => ({
  currentEmotion: 'neutral',
  emotionIntensity: 0.5,
  isThinking: false,
  isSpeaking: false,
  currentTheme: 'default',
  messages: [],
  systemPrompt: DEFAULT_SYSTEM_PROMPT,

  setEmotion: (emotion, intensity = 0.5) => {
    set({ currentEmotion: emotion, emotionIntensity: intensity })
  },

  setThinking: (thinking) => {
    set({ isThinking: thinking })
  },

  setSpeaking: (speaking) => {
    set({ isSpeaking: speaking })
  },

  setTheme: (theme) => {
    set({ currentTheme: theme })
  },

  addMessage: (content, role, emotion) => {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      role,
      timestamp: new Date(),
      emotion,
    }
    
    set((state) => ({
      messages: [...state.messages, message],
    }))
  },

  clearMessages: () => {
    set({ messages: [] })
  },

  updateSystemPrompt: (prompt) => {
    set({ systemPrompt: prompt })
  },
}))
