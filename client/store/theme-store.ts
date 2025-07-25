import { create } from 'zustand'

export interface ThemeSettings {
  mode: 'light' | 'dark'
  accentColor: string
  iconColor: string
  wallpaperType: 'lively' | 'static' | 'video'
  customColors: {
    primary: string
    secondary: string
    accent: string
  }
}

interface ThemeStore {
  settings: ThemeSettings
  setThemeMode: (mode: 'light' | 'dark') => void
  setAccentColor: (color: string) => void
  setIconColor: (color: string) => void
  setWallpaperType: (type: ThemeSettings['wallpaperType']) => void
  setCustomColor: (key: keyof ThemeSettings['customColors'], color: string) => void
  updateSettings: (newSettings: Partial<ThemeSettings>) => void
  getIconColorForTheme: () => string
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  settings: {
    mode: 'dark',
    accentColor: '#8b5cf6', // purple-500
    iconColor: '#ffffff',
    wallpaperType: 'lively',
    customColors: {
      primary: '#8b5cf6',
      secondary: '#a855f7', 
      accent: '#c084fc'
    }
  },

  setThemeMode: (mode) => {
    set((state) => ({
      settings: {
        ...state.settings,
        mode,
        // Auto-adjust icon color based on theme
        iconColor: mode === 'dark' ? '#ffffff' : '#1f2937'
      }
    }))
  },

  setAccentColor: (accentColor) => {
    set((state) => ({
      settings: {
        ...state.settings,
        accentColor
      }
    }))
  },

  setIconColor: (iconColor) => {
    set((state) => ({
      settings: {
        ...state.settings,
        iconColor
      }
    }))
  },

  setWallpaperType: (wallpaperType) => {
    set((state) => ({
      settings: {
        ...state.settings,
        wallpaperType
      }
    }))
  },

  setCustomColor: (key, color) => {
    set((state) => ({
      settings: {
        ...state.settings,
        customColors: {
          ...state.settings.customColors,
          [key]: color
        }
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

  getIconColorForTheme: () => {
    const { settings } = get()
    return settings.mode === 'dark' ? '#ffffff' : '#1f2937'
  }
}))

// Theme CSS variables updater
export const updateCSSVariables = (settings: ThemeSettings) => {
  const root = document.documentElement
  
  if (settings.mode === 'dark') {
    root.style.setProperty('--background', '222.2 84% 4.9%')
    root.style.setProperty('--foreground', '210 40% 98%')
    root.style.setProperty('--card', '222.2 84% 4.9%')
    root.style.setProperty('--card-foreground', '210 40% 98%')
    root.style.setProperty('--primary', '210 40% 98%')
    root.style.setProperty('--primary-foreground', '222.2 47.4% 11.2%')
  } else {
    root.style.setProperty('--background', '0 0% 100%')
    root.style.setProperty('--foreground', '222.2 84% 4.9%')
    root.style.setProperty('--card', '0 0% 100%')
    root.style.setProperty('--card-foreground', '222.2 84% 4.9%')
    root.style.setProperty('--primary', '222.2 47.4% 11.2%')
    root.style.setProperty('--primary-foreground', '210 40% 98%')
  }
  
  // Set custom accent color
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2
    
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
  }
  
  root.style.setProperty('--accent', hexToHsl(settings.accentColor))
}
