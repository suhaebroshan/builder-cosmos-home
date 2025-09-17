import { useEffect } from 'react'
import { useWindowStore } from '@/store/window-store'
import { useThemeStore } from '@/store/theme-store'
import { usePerformanceManager } from '@/hooks/usePerformanceManager'

// Adapt glass intensity based on window count, theme, FPS, and time of day
export const useLiquidGlass = () => {
  const { windows } = useWindowStore()
  const { settings } = useThemeStore()
  const { performanceStats, currentProfile } = usePerformanceManager()

  useEffect(() => {
    const hour = new Date().getHours()
    const isNight = hour >= 19 || hour < 6
    const count = windows.filter(w => !w.isMinimized).length
    const fps = performanceStats.fps || 60

    const density = Math.min(1, count / 8)
    const performanceScale = fps < 40 ? 0.8 : fps > 90 ? 1.15 : 1

    const blurBase = settings.mode === 'dark' ? 16 : 12
    const blur = Math.round(blurBase * (0.9 + density * 0.6) * performanceScale)

    const root = document.documentElement
    root.style.setProperty('--blur-intensity', `${blur}px`)

    // Dense UI when many windows
    if (density > 0.6 || fps < 35) {
      root.classList.add('dense-ui')
    } else {
      root.classList.remove('dense-ui')
    }

    // Night tint for subtle warmth at night
    if (isNight) {
      root.classList.add('night-ui')
    } else {
      root.classList.remove('night-ui')
    }
  }, [windows.length, settings.mode, performanceStats.fps, currentProfile])
}
