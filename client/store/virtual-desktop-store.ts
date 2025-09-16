import { create } from 'zustand'

interface VirtualDesktopState {
  currentDesktop: number
  desktopCount: number
}

interface VirtualDesktopStore extends VirtualDesktopState {
  switchDesktop: (index: number) => void
  nextDesktop: () => void
  prevDesktop: () => void
  addDesktop: () => void
  removeCurrentDesktop: () => void
}

export const useVirtualDesktopStore = create<VirtualDesktopStore>((set, get) => ({
  currentDesktop: 0,
  desktopCount: 2,

  switchDesktop: (index) => {
    const idx = Math.max(0, Math.min(index, get().desktopCount - 1))
    if (typeof window !== 'undefined') {
      ;(window as any).__NYX_CURRENT_DESKTOP__ = idx
    }
    set({ currentDesktop: idx })
  },

  nextDesktop: () => {
    const next = (get().currentDesktop + 1) % get().desktopCount
    get().switchDesktop(next)
  },

  prevDesktop: () => {
    const prev = (get().currentDesktop - 1 + get().desktopCount) % get().desktopCount
    get().switchDesktop(prev)
  },

  addDesktop: () => {
    set((state) => ({ desktopCount: state.desktopCount + 1 }))
    get().switchDesktop(get().desktopCount - 1)
  },

  removeCurrentDesktop: () => {
    const { desktopCount, currentDesktop } = get()
    if (desktopCount <= 1) return
    const newCount = desktopCount - 1
    const newCurrent = Math.min(currentDesktop, newCount - 1)
    set({ desktopCount: newCount, currentDesktop: newCurrent })
    if (typeof window !== 'undefined') {
      ;(window as any).__NYX_CURRENT_DESKTOP__ = newCurrent
    }
  },
}))
