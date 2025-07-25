import { create } from 'zustand'

export interface WallpaperImage {
  id: string
  name: string
  url: string
  type: 'image' | 'video'
  thumbnail?: string
}

export interface WallpaperSettings {
  currentWallpaper: string | null
  wallpaperMode: 'single' | 'carousel' | 'video'
  carouselInterval: number // minutes
  carouselWallpapers: string[]
  videoWallpaper: string | null
  opacity: number
  blur: number
}

interface WallpaperStore {
  wallpapers: WallpaperImage[]
  settings: WallpaperSettings
  
  addWallpaper: (wallpaper: Omit<WallpaperImage, 'id'>) => string
  removeWallpaper: (id: string) => void
  setCurrentWallpaper: (id: string) => void
  setWallpaperMode: (mode: WallpaperSettings['wallpaperMode']) => void
  setCarouselInterval: (minutes: number) => void
  addToCarousel: (id: string) => void
  removeFromCarousel: (id: string) => void
  setVideoWallpaper: (id: string) => void
  updateSettings: (settings: Partial<WallpaperSettings>) => void
  getWallpaper: (id: string) => WallpaperImage | undefined
  getCurrentWallpaper: () => WallpaperImage | null
}

const defaultWallpapers: WallpaperImage[] = [
  {
    id: 'space-1',
    name: 'Deep Space Nebula',
    url: '/wallpapers/space-1.jpg',
    type: 'image',
    thumbnail: '/wallpapers/thumbs/space-1-thumb.jpg'
  },
  {
    id: 'space-2',
    name: 'Purple Galaxy',
    url: '/wallpapers/space-2.jpg',
    type: 'image',
    thumbnail: '/wallpapers/thumbs/space-2-thumb.jpg'
  },
  {
    id: 'nyx-animated',
    name: 'Nyx Quantum Flow',
    url: '/wallpapers/nyx-flow.mp4',
    type: 'video',
    thumbnail: '/wallpapers/thumbs/nyx-flow-thumb.jpg'
  }
]

export const useWallpaperStore = create<WallpaperStore>((set, get) => ({
  wallpapers: defaultWallpapers,
  settings: {
    currentWallpaper: 'space-1',
    wallpaperMode: 'single',
    carouselInterval: 5,
    carouselWallpapers: ['space-1', 'space-2'],
    videoWallpaper: null,
    opacity: 100,
    blur: 0
  },

  addWallpaper: (wallpaperData) => {
    const id = `wallpaper-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const wallpaper: WallpaperImage = {
      ...wallpaperData,
      id
    }
    
    set((state) => ({
      wallpapers: [...state.wallpapers, wallpaper]
    }))
    
    return id
  },

  removeWallpaper: (id) => {
    set((state) => ({
      wallpapers: state.wallpapers.filter(w => w.id !== id),
      settings: {
        ...state.settings,
        currentWallpaper: state.settings.currentWallpaper === id ? null : state.settings.currentWallpaper,
        carouselWallpapers: state.settings.carouselWallpapers.filter(wId => wId !== id),
        videoWallpaper: state.settings.videoWallpaper === id ? null : state.settings.videoWallpaper
      }
    }))
  },

  setCurrentWallpaper: (id) => {
    set((state) => ({
      settings: {
        ...state.settings,
        currentWallpaper: id,
        wallpaperMode: 'single'
      }
    }))
  },

  setWallpaperMode: (mode) => {
    set((state) => ({
      settings: {
        ...state.settings,
        wallpaperMode: mode
      }
    }))
  },

  setCarouselInterval: (minutes) => {
    set((state) => ({
      settings: {
        ...state.settings,
        carouselInterval: minutes
      }
    }))
  },

  addToCarousel: (id) => {
    set((state) => ({
      settings: {
        ...state.settings,
        carouselWallpapers: [...state.settings.carouselWallpapers, id]
      }
    }))
  },

  removeFromCarousel: (id) => {
    set((state) => ({
      settings: {
        ...state.settings,
        carouselWallpapers: state.settings.carouselWallpapers.filter(wId => wId !== id)
      }
    }))
  },

  setVideoWallpaper: (id) => {
    set((state) => ({
      settings: {
        ...state.settings,
        videoWallpaper: id,
        wallpaperMode: 'video'
      }
    }))
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ...newSettings
      }
    }))
  },

  getWallpaper: (id) => {
    return get().wallpapers.find(w => w.id === id)
  },

  getCurrentWallpaper: () => {
    const state = get()
    if (!state.settings.currentWallpaper) return null
    return state.getWallpaper(state.settings.currentWallpaper)
  }
}))

// Wallpaper carousel effect
let carouselInterval: NodeJS.Timeout | null = null

export const startWallpaperCarousel = () => {
  const store = useWallpaperStore.getState()
  
  if (carouselInterval) {
    clearInterval(carouselInterval)
  }
  
  if (store.settings.wallpaperMode === 'carousel' && store.settings.carouselWallpapers.length > 1) {
    let currentIndex = 0
    
    carouselInterval = setInterval(() => {
      const { settings, setCurrentWallpaper } = useWallpaperStore.getState()
      
      if (settings.wallpaperMode === 'carousel') {
        currentIndex = (currentIndex + 1) % settings.carouselWallpapers.length
        setCurrentWallpaper(settings.carouselWallpapers[currentIndex])
      }
    }, store.settings.carouselInterval * 60 * 1000)
  }
}

export const stopWallpaperCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
}
