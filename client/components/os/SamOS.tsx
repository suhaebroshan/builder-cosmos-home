import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { WindowManager } from '@/components/window/WindowManager'
import { NyxTaskbar } from '@/components/os/NyxTaskbar'
import { EnhancedDesktop } from '@/components/os/EnhancedDesktop'
import { EnhancedBootAnimation } from '@/components/os/EnhancedBootAnimation'
import { StableLiveWallpaper } from '@/components/os/StableLiveWallpaper'
import { NyxBrowser } from '@/components/apps/NyxBrowser'
import { useSamStore } from '@/store/sam-store'
import { useWindowStore } from '@/store/window-store'
import { useThemeStore, updateCSSVariables } from '@/store/theme-store'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { aiService } from '@/services/ai-service'

interface User {
  id: string
  username: string
  displayName: string
  password: string
  avatar?: string
}

export const NyxOS: React.FC = () => {
  const { currentEmotion, emotionIntensity, addMessage, setEmotion } = useSamStore()
  const { openWindow } = useWindowStore()
  const { settings: themeSettings, setThemeMode } = useThemeStore()
  const { deviceInfo, uiConfig, isPhone, isTablet } = useDeviceDetection()
  const [isBooted, setIsBooted] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Enable global keyboard shortcuts (disabled on phone)
  if (!isPhone) {
    useKeyboardShortcuts()
  }

  // Update CSS variables when theme changes
  useEffect(() => {
    updateCSSVariables(themeSettings)
  }, [themeSettings])

  // Disable default browser shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+W from closing browser tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault()
        e.stopPropagation()
        // Let our OS handle it
        return false
      }

      // Prevent Ctrl+T from opening new tab
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault()
        e.stopPropagation()
        return false
      }

      // Prevent F12 dev tools
      if (e.key === 'F12') {
        e.preventDefault()
        return false
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [])

  const handleBootComplete = (user: User) => {
    setCurrentUser(user)
    setIsBooted(true)

    // Initialize AI service
    aiService.setVoiceMode(true)

    // Welcome message for the user
    setTimeout(() => {
      setEmotion('happy', 0.8)
      addMessage(`Welcome back, ${user.displayName}! Nyx OS is ready for quantum computing.`, 'sam', 'happy')
    }, 1500)
  }

  // Handle system events
  useEffect(() => {
    const handleOpenBrowser = () => {
      openWindow({
        title: 'Nyx Browse',
        component: NyxBrowser,
        position: { x: 100, y: 50 },
        size: { width: 1000, height: 700 },
      })
    }

    const handleOpenSettings = () => {
      // Import Settings dynamically to avoid circular imports
      import('@/components/apps/Settings').then(({ Settings }) => {
        openWindow({
          title: 'Settings',
          component: Settings,
          position: { x: 200, y: 100 },
          size: { width: 800, height: 600 },
        })
      })
    }

    const handleChangeWallpaper = () => {
      // Trigger wallpaper change
      setEmotion('excited', 0.7)
      addMessage("Wallpaper system activated! Check settings for customization options.", 'sam', 'excited')
    }

    window.addEventListener('nyx:open-browser', handleOpenBrowser)
    window.addEventListener('nyx:open-settings', handleOpenSettings)
    window.addEventListener('nyx:change-wallpaper', handleChangeWallpaper)

    return () => {
      window.removeEventListener('nyx:open-browser', handleOpenBrowser)
      window.removeEventListener('nyx:open-settings', handleOpenSettings)
      window.removeEventListener('nyx:change-wallpaper', handleChangeWallpaper)
    }
  }, [openWindow, setEmotion, addMessage])
  
  const getBackgroundGradient = () => {
    const intensity = emotionIntensity * 0.3
    switch (currentEmotion) {
      case 'happy':
        return `radial-gradient(circle at 20% 50%, rgba(34, 197, 94, ${intensity}) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, ${intensity * 0.5}) 0%, transparent 50%)`
      case 'sad':
        return `radial-gradient(circle at 30% 40%, rgba(59, 130, 246, ${intensity}) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(99, 102, 241, ${intensity * 0.5}) 0%, transparent 50%)`
      case 'excited':
        return `radial-gradient(circle at 50% 50%, rgba(251, 191, 36, ${intensity}) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(249, 115, 22, ${intensity * 0.7}) 0%, transparent 50%)`
      case 'annoyed':
        return `radial-gradient(circle at 60% 30%, rgba(239, 68, 68, ${intensity}) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(220, 38, 38, ${intensity * 0.6}) 0%, transparent 50%)`
      case 'focused':
        return `radial-gradient(circle at 40% 20%, rgba(168, 85, 247, ${intensity}) 0%, transparent 50%), radial-gradient(circle at 80% 60%, rgba(139, 92, 246, ${intensity * 0.8}) 0%, transparent 50%)`
      case 'confused':
        return `radial-gradient(circle at 50% 50%, rgba(156, 163, 175, ${intensity}) 0%, transparent 50%)`
      case 'tired':
        return `radial-gradient(circle at 30% 70%, rgba(75, 85, 99, ${intensity}) 0%, transparent 50%)`
      default:
        return `radial-gradient(circle at 50% 50%, rgba(71, 85, 105, ${intensity * 0.3}) 0%, transparent 50%)`
    }
  }
  
  if (!isBooted) {
    return <EnhancedBootAnimation onComplete={handleBootComplete} />
  }

  return (
    <motion.div
      className={`fixed inset-0 overflow-hidden ${themeSettings.mode}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Stable Live Wallpaper System */}
      <StableLiveWallpaper />

      {/* Emotional Overlay */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out pointer-events-none"
        style={{
          background: getBackgroundGradient(),
        }}
      />

      {/* User Info & Theme Toggle - Hidden on phone when in fullscreen apps */}
      {!isPhone && (
        <motion.div
          className="absolute top-4 left-4 flex items-center gap-3 z-30"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
        <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl px-4 py-2 shadow-lg flex items-center gap-3">
          <div className="text-lg">{currentUser?.avatar}</div>
          <div>
            <div className="text-white text-sm font-medium">{currentUser?.displayName}</div>
            <div className="text-purple-300/70 text-xs">@{currentUser?.username}</div>
          </div>
        </div>

        <button
          onClick={() => setThemeMode(themeSettings.mode === 'dark' ? 'light' : 'dark')}
          className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl p-3 hover:bg-black/50 transition-all shadow-lg"
        >
          {themeSettings.mode === 'dark' ? '☀️' : '🌙'}
        </button>
        </motion.div>
      )}

      {/* AI Status Indicator */}
      <motion.div
        className="absolute top-4 right-4 text-white/80 text-sm z-30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl px-4 py-2 shadow-lg">
          <div
            className="w-3 h-3 rounded-full transition-all duration-300"
            style={{
              backgroundColor: currentEmotion === 'happy' ? '#22c55e' :
                             currentEmotion === 'sad' ? '#3b82f6' :
                             currentEmotion === 'excited' ? '#fbbf24' :
                             currentEmotion === 'annoyed' ? '#ef4444' :
                             currentEmotion === 'focused' ? '#a855f7' :
                             currentEmotion === 'confused' ? '#9ca3af' :
                             currentEmotion === 'tired' ? '#4b5563' : '#8b5cf6',
              boxShadow: `0 0 10px currentColor`,
            }}
          />
          <span className="capitalize text-purple-200">{currentEmotion}</span>
          <div className="text-xs text-purple-300/70 ml-2">AI Active</div>
        </div>
      </motion.div>

      {/* Enhanced Desktop with App Icons */}
      <EnhancedDesktop />

      {/* Window Manager */}
      <WindowManager />

      {/* Nyx Taskbar */}
      <NyxTaskbar />
    </motion.div>
  )
}
