import { create } from 'zustand'

export interface Window {
  id: string
  title: string
  component: React.ComponentType<any>
  props?: any
  position: { x: number; y: number }
  size: { width: number; height: number }
  isMinimized: boolean
  isMaximized: boolean
  isPinned: boolean
  zIndex: number
}

interface WindowStore {
  windows: Window[]
  focusedWindowId: string | null
  nextZIndex: number
  
  openWindow: (window: Omit<Window, 'id' | 'zIndex'>) => string
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void
  updateWindowSize: (id: string, size: { width: number; height: number }) => void
  togglePin: (id: string) => void
  getWindow: (id: string) => Window | undefined
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  focusedWindowId: null,
  nextZIndex: 1000,

  openWindow: (windowData) => {
    const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const window: Window = {
      ...windowData,
      id,
      zIndex: get().nextZIndex,
      isMinimized: false,
      isMaximized: false,
      isPinned: false,
    }
    
    set((state) => ({
      windows: [...state.windows, window],
      focusedWindowId: id,
      nextZIndex: state.nextZIndex + 1,
    }))
    
    return id
  },

  closeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
      focusedWindowId: state.focusedWindowId === id ? null : state.focusedWindowId,
    }))
  },

  focusWindow: (id) => {
    const window = get().getWindow(id)
    if (!window) return
    
    set((state) => ({
      focusedWindowId: id,
      nextZIndex: state.nextZIndex + 1,
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: state.nextZIndex } : w
      ),
    }))
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
      ),
    }))
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      ),
    }))
  },

  updateWindowPosition: (id, position) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, position } : w
      ),
    }))
  },

  updateWindowSize: (id, size) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, size } : w
      ),
    }))
  },

  togglePin: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isPinned: !w.isPinned } : w
      ),
    }))
  },

  getWindow: (id) => {
    return get().windows.find((w) => w.id === id)
  },
}))
