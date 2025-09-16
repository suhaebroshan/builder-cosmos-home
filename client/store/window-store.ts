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
  animationOrigin?: { x: number; y: number }
  isFullscreen?: boolean
  desktopId?: number
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
  moveWindowToDesktop: (id: string, desktopId: number) => void
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

    const desktopId = (typeof globalThis !== 'undefined' && (globalThis as any).__NYX_CURRENT_DESKTOP__ !== undefined)
      ? (globalThis as any).__NYX_CURRENT_DESKTOP__
      : 0

    const newWindow: Window = {
      ...windowData,
      id,
      zIndex: state.nextZIndex,
      isMinimized: false,
      isMaximized: false,
      isPinned: false,
      mode: windowData.mode || 'windowed',
      opacity: windowData.opacity || 1,
      desktopId,
    }

    set((prevState) => ({
      windows: [...prevState.windows, newWindow],
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
    const vpW = typeof window !== 'undefined' ? window.innerWidth : 1200
    const vpH = typeof window !== 'undefined' ? window.innerHeight : 800
    set((state) => {
      const w = state.windows.find(win => win.id === id)
      if (!w) return { windows: state.windows }
      const titleVisible = 40
      const minVisibleX = 100
      const rawX = isNaN(position.x) ? (w.position?.x ?? 100) : position.x
      const rawY = isNaN(position.y) ? (w.position?.y ?? 100) : position.y
      const minX = -Math.max(0, (w.size?.width || 300) - minVisibleX)
      const maxX = Math.max(0, vpW - minVisibleX)
      const minY = 0
      const maxY = Math.max(0, vpH - titleVisible)
      const safePosition = {
        x: Math.min(Math.max(minX, rawX), maxX),
        y: Math.min(Math.max(minY, rawY), maxY),
      }
      return {
        windows: state.windows.map((win) =>
          win.id === id ? { ...win, position: safePosition } : win
        ),
      }
    })
  },

  updateWindowSize: (id, size) => {
    const vpW = typeof window !== 'undefined' ? window.innerWidth : 1200
    const vpH = typeof window !== 'undefined' ? window.innerHeight : 800
    set((state) => {
      const w = state.windows.find(win => win.id === id)
      if (!w) return { windows: state.windows }
      const minW = 300
      const minH = 200
      const maxW = Math.max(minW, Math.floor(vpW * 0.95))
      const maxH = Math.max(minH, Math.floor(vpH * 0.9))
      const desiredW = isNaN(size.width) ? (w.size?.width ?? 400) : size.width
      const desiredH = isNaN(size.height) ? (w.size?.height ?? 300) : size.height
      const safeSize = {
        width: Math.min(Math.max(minW, desiredW), maxW),
        height: Math.min(Math.max(minH, desiredH), maxH),
      }
      // Adjust position if window would overflow
      const newX = Math.min(
        Math.max(-Math.max(0, safeSize.width - 100), w.position?.x ?? 100),
        Math.max(0, vpW - 100)
      )
      const newY = Math.min(
        Math.max(0, w.position?.y ?? 100),
        Math.max(0, vpH - 40)
      )
      return {
        windows: state.windows.map((win) =>
          win.id === id ? { ...win, size: safeSize, position: { x: newX, y: newY } } : win
        ),
      }
    })
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

  moveWindowToDesktop: (id, desktopId) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, desktopId } : w
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
