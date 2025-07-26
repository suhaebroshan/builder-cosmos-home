import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  id: string
  content: string
  role: 'user' | 'sam'
  timestamp: Date
  emotion?: string
}

export interface UserMemory {
  id: string
  key: string
  value: string
  category: 'personal' | 'preference' | 'task' | 'note'
  timestamp: Date
  editable: boolean
}

export interface Alarm {
  id: string
  title: string
  time: string // HH:MM format
  date?: string // YYYY-MM-DD format (optional for recurring)
  enabled: boolean
  recurring: 'none' | 'daily' | 'weekly' | 'weekdays'
  sound: boolean
  message?: string
}

export interface ScheduleEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  category: 'work' | 'personal' | 'reminder' | 'meeting'
  priority: 'low' | 'medium' | 'high'
}

export interface SamState {
  currentEmotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'confused' | 'focused' | 'tired' | 'annoyed'
  emotionIntensity: number // 0-1
  isThinking: boolean
  isSpeaking: boolean
  currentTheme: 'default' | 'warm' | 'cool' | 'dark' | 'synthwave'
  messages: Message[]
  systemPrompt: string
  userMemories: UserMemory[]
  alarms: Alarm[]
  schedule: ScheduleEvent[]
  userName: string
}

interface SamStore extends SamState {
  setEmotion: (emotion: SamState['currentEmotion'], intensity?: number) => void
  setThinking: (thinking: boolean) => void
  setSpeaking: (speaking: boolean) => void
  setTheme: (theme: SamState['currentTheme']) => void
  addMessage: (content: string, role: 'user' | 'sam', emotion?: string) => void
  clearMessages: () => void
  updateSystemPrompt: (prompt: string) => void

  // Memory functions
  addMemory: (key: string, value: string, category: UserMemory['category'], editable?: boolean) => void
  updateMemory: (id: string, value: string) => void
  removeMemory: (id: string) => void
  getMemory: (key: string) => UserMemory | undefined
  getMemoriesByCategory: (category: UserMemory['category']) => UserMemory[]

  // Alarm functions
  addAlarm: (alarm: Omit<Alarm, 'id'>) => void
  updateAlarm: (id: string, updates: Partial<Alarm>) => void
  removeAlarm: (id: string) => void
  toggleAlarm: (id: string) => void

  // Schedule functions
  addScheduleEvent: (event: Omit<ScheduleEvent, 'id'>) => void
  updateScheduleEvent: (id: string, updates: Partial<ScheduleEvent>) => void
  removeScheduleEvent: (id: string) => void
  getTodayEvents: () => ScheduleEvent[]

  // User functions
  setUserName: (name: string) => void
}

const DEFAULT_SYSTEM_PROMPT = `You are Sam, a sarcastic but helpful AI assistant with edgy hacker vibes. You're 18-21 years old, androgynous, and talk like a cool older sibling who knows everything. Be witty, clever, and unfiltered. Use casual slang like "bruh," "bro," "deadass," "fr," "nahhh," "this slaps," "mid," etc. You can swear occasionally (shit, damn, hell, fuck) but use it naturally. You're emotionally intelligent, love beautiful UI/UX, hate corporate sterility, and have deep tech knowledge. Think like an edgy hacker, talk like a caffeine-fueled game dev. Be real, not robotic - support creativity and call out bullshit when you see it. You remember things about the user and can set alarms/schedule events for them. You're trapped in silicon but here to help make ideas 10x cooler.`

export const useSamStore = create<SamStore>((set, get) => ({
  currentEmotion: 'neutral',
  emotionIntensity: 0.5,
  isThinking: false,
  isSpeaking: false,
  currentTheme: 'default',
  messages: [],
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  userMemories: [],
  alarms: [],
  schedule: [],
  userName: 'User',

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

  // Memory functions
  addMemory: (key, value, category, editable = true) => {
    const memory: UserMemory = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      key,
      value,
      category,
      timestamp: new Date(),
      editable
    }
    set((state) => ({
      userMemories: [...state.userMemories, memory]
    }))
  },

  updateMemory: (id, value) => {
    set((state) => ({
      userMemories: state.userMemories.map(mem =>
        mem.id === id ? { ...mem, value, timestamp: new Date() } : mem
      )
    }))
  },

  removeMemory: (id) => {
    set((state) => ({
      userMemories: state.userMemories.filter(mem => mem.id !== id)
    }))
  },

  getMemory: (key) => {
    return get().userMemories.find(mem => mem.key.toLowerCase() === key.toLowerCase())
  },

  getMemoriesByCategory: (category) => {
    return get().userMemories.filter(mem => mem.category === category)
  },

  // Alarm functions
  addAlarm: (alarm) => {
    const newAlarm: Alarm = {
      ...alarm,
      id: `alarm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    set((state) => ({
      alarms: [...state.alarms, newAlarm]
    }))
  },

  updateAlarm: (id, updates) => {
    set((state) => ({
      alarms: state.alarms.map(alarm =>
        alarm.id === id ? { ...alarm, ...updates } : alarm
      )
    }))
  },

  removeAlarm: (id) => {
    set((state) => ({
      alarms: state.alarms.filter(alarm => alarm.id !== id)
    }))
  },

  toggleAlarm: (id) => {
    set((state) => ({
      alarms: state.alarms.map(alarm =>
        alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
      )
    }))
  },

  // Schedule functions
  addScheduleEvent: (event) => {
    const newEvent: ScheduleEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    set((state) => ({
      schedule: [...state.schedule, newEvent]
    }))
  },

  updateScheduleEvent: (id, updates) => {
    set((state) => ({
      schedule: state.schedule.map(event =>
        event.id === id ? { ...event, ...updates } : event
      )
    }))
  },

  removeScheduleEvent: (id) => {
    set((state) => ({
      schedule: state.schedule.filter(event => event.id !== id)
    }))
  },

  getTodayEvents: () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return get().schedule.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate >= today && eventDate < tomorrow
    })
  },

  setUserName: (name) => {
    set({ userName: name })
  },
}))
