import { create } from 'zustand'

export type WindowMode = 'windowed' | 'fullscreen' | 'split-left' | 'split-right' | 'floating' | 'pip'

export interface Window {
  id: string
  appId: string
  title: string
  component: React.ComponentType<any>
  props?: any
  position: { x: number; y: number }
  size: { width: number; height: number }
  isMinimized: boolean
  isMaximized: boolean
  isPinned: boolean
  zIndex: number
  mode: WindowMode
  splitPartner?: string
  isFloating?: boolean
  opacity?: number
}

interface WindowStore {
  windows: Window[]
  focusedWindowId: string | null
  nextZIndex: number
  appInstances: Record<string, number>
  splitScreenWindows: { left?: string; right?: string }
  recentApps: string[]

  openWindow: (window: Omit<Window, 'id' | 'zIndex'>) => string
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void
  updateWindowSize: (id: string, size: { width: number; height: number }) => void
  updateWindowMode: (id: string, mode: WindowMode) => void
  togglePin: (id: string) => void
  setSplitScreen: (leftWindowId: string, rightWindowId?: string) => void
  clearSplitScreen: () => void
  makeFloating: (id: string, floating: boolean) => void
  setWindowOpacity: (id: string, opacity: number) => void
  getWindow: (id: string) => Window | undefined
  getWindowsByApp: (appId: string) => Window[]
  addToRecents: (appId: string) => void
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  focusedWindowId: null,
  nextZIndex: 1000,
  appInstances: {},
  splitScreenWindows: {},
  recentApps: [],

  openWindow: (windowData) => {
    const state = get()
    const instanceCount = state.appInstances[windowData.appId] || 0
    const id = `${windowData.appId}-${instanceCount + 1}-${Date.now()}`

    const window: Window = {
      ...windowData,
      id,
      zIndex: state.nextZIndex,
      isMinimized: false,
      isMaximized: false,
      isPinned: false,
      mode: windowData.mode || 'windowed',
      opacity: windowData.opacity || 1,
    }

    set((prevState) => ({
      windows: [...prevState.windows, window],
      focusedWindowId: id,
      nextZIndex: prevState.nextZIndex + 1,
      appInstances: {
        ...prevState.appInstances,
        [windowData.appId]: instanceCount + 1
      }
    }))

    get().addToRecents(windowData.appId)
    return id
  },

  closeWindow: (id) => {
    const state = get()
    const window = state.windows.find(w => w.id === id)

    // Clear split screen if this window was part of it
    if (state.splitScreenWindows.left === id || state.splitScreenWindows.right === id) {
      get().clearSplitScreen()
    }

    set((prevState) => ({
      windows: prevState.windows.filter((w) => w.id !== id),
      focusedWindowId: prevState.focusedWindowId === id ? null : prevState.focusedWindowId,
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
    const safePosition = {
      x: isNaN(position.x) ? 100 : Math.max(0, position.x),
      y: isNaN(position.y) ? 100 : Math.max(0, position.y),
    }
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, position: safePosition } : w
      ),
    }))
  },

  updateWindowSize: (id, size) => {
    const safeSize = {
      width: isNaN(size.width) ? 400 : Math.max(200, size.width),
      height: isNaN(size.height) ? 300 : Math.max(150, size.height),
    }
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, size: safeSize } : w
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

  updateWindowMode: (id, mode) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, mode } : w
      ),
    }))
  },

  setSplitScreen: (leftWindowId, rightWindowId) => {
    set((state) => ({
      splitScreenWindows: { left: leftWindowId, right: rightWindowId },
      windows: state.windows.map((w) => {
        if (w.id === leftWindowId) {
          return { ...w, mode: 'split-left', size: { width: window.innerWidth / 2, height: window.innerHeight - 120 } }
        }
        if (w.id === rightWindowId) {
          return { ...w, mode: 'split-right', size: { width: window.innerWidth / 2, height: window.innerHeight - 120 } }
        }
        return w
      }),
    }))
  },

  clearSplitScreen: () => {
    set((state) => ({
      splitScreenWindows: {},
      windows: state.windows.map((w) => ({
        ...w,
        mode: w.mode.startsWith('split-') ? 'windowed' : w.mode
      })),
    }))
  },

  makeFloating: (id, floating) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isFloating: floating, mode: floating ? 'floating' : 'windowed' } : w
      ),
    }))
  },

  setWindowOpacity: (id, opacity) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, opacity: Math.max(0.1, Math.min(1, opacity)) } : w
      ),
    }))
  },

  getWindow: (id) => {
    return get().windows.find((w) => w.id === id)
  },

  getWindowsByApp: (appId) => {
    return get().windows.filter((w) => w.appId === appId)
  },

  addToRecents: (appId) => {
    set((state) => {
      const newRecents = [appId, ...state.recentApps.filter(id => id !== appId)].slice(0, 10)
      return { recentApps: newRecents }
    })
  },
}))
