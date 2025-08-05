import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { WindowManager } from '@/components/window/WindowManager'
import { NyxTaskbar } from '@/components/os/NyxTaskbar'
import { EnhancedDesktop } from '@/components/os/EnhancedDesktop'
import { EnhancedBootAnimation } from '@/components/os/EnhancedBootAnimation'
import { DeviceSetupScreen } from '@/components/os/DeviceSetupScreen'
import { StableLiveWallpaper } from '@/components/os/StableLiveWallpaper'
import { MobileHomeScreen } from '@/components/mobile/MobileHomeScreen'
import { AndroidNavigation } from '@/components/mobile/AndroidNavigation'
import { NyxBrowser } from '@/components/apps/NyxBrowser'
import { useSamStore } from '@/store/sam-store'
import { useWindowStore } from '@/store/window-store'
import { useThemeStore, updateCSSVariables } from '@/store/theme-store'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useDeviceDetection, DeviceType } from '@/hooks/useDeviceDetection'
import { aiService } from '@/services/ai-service'
import { cn } from '@/lib/utils'

interface User {
  id: string
  username: string
  displayName: string
  avatar?: string
  passcode?: string
  pattern?: number[]
  authMethod: 'none' | 'passcode' | 'pattern'
}

export const NyxOS: React.FC = () => {
  const { currentEmotion, emotionIntensity, addMessage, setEmotion } = useSamStore()
  const { openWindow } = useWindowStore()
  const { settings: themeSettings, setThemeMode } = useThemeStore()
  const { deviceInfo, uiConfig, isPhone, isTablet } = useDeviceDetection()
  const [isBooted, setIsBooted] = useState(false)
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType | null>(null)
  const [navigationStyle, setNavigationStyle] = useState<'gestures' | 'buttons'>('gestures')

  // Enable global keyboard shortcuts (disabled on phone)
  if (!isPhone && selectedDeviceType !== 'phone') {
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

  const handleDeviceSetupComplete = (user: User, deviceType: DeviceType) => {
    setCurrentUser(user)
    setSelectedDeviceType(deviceType)
    setIsSetupComplete(true)
    setIsBooted(true)

    // Initialize AI service
    aiService.setVoiceMode(true)

    // Device-specific welcome message
    setTimeout(() => {
      setEmotion('excited', 0.9)
      let welcomeMessage = `Welcome to Nyx OS, ${user.displayName}! `

      switch (deviceType) {
        case 'phone':
          welcomeMessage += "Your Android-style mobile experience is ready with smooth gestures and bouncy animations!"
          break
        case 'tablet':
          welcomeMessage += "Your hybrid tablet experience combines the best of mobile and desktop - enjoy 80% mobile smoothness with 20% desktop power!"
          break
        case 'desktop':
          welcomeMessage += "Your full desktop experience is ready with advanced multitasking and all the pro features you need!"
          break
      }

      addMessage(welcomeMessage, 'sam', 'excited')
    }, 1500)
  }

  const handleBootComplete = (user: User) => {
    // Legacy handler for direct boot - redirect to device setup
    handleDeviceSetupComplete(user, 'desktop')
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
    const baseIntensity = themeSettings.mode === 'dark' ? 0.3 : 0.15
    const intensity = emotionIntensity * baseIntensity
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
        <div className={cn(
          "backdrop-blur-xl rounded-2xl px-4 py-2 shadow-lg flex items-center gap-3",
          themeSettings.mode === 'dark'
            ? "bg-black/40 border border-purple-500/30"
            : "bg-white/40 border border-blue-300/40"
        )}>
          <div className="text-lg">{currentUser?.avatar}</div>
          <div>
            <div className={cn(
              "text-sm font-medium",
              themeSettings.mode === 'dark' ? "text-white" : "text-gray-800"
            )}>{currentUser?.displayName}</div>
            <div className={cn(
              "text-xs",
              themeSettings.mode === 'dark' ? "text-purple-300/70" : "text-blue-600/70"
            )}>@{currentUser?.username}</div>
          </div>
        </div>

        <button
          onClick={() => setThemeMode(themeSettings.mode === 'dark' ? 'light' : 'dark')}
          className={cn(
            "backdrop-blur-xl rounded-xl p-3 transition-all shadow-lg hover:scale-105",
            themeSettings.mode === 'dark'
              ? "bg-black/40 border border-purple-500/30 hover:bg-black/50"
              : "bg-white/40 border border-blue-300/40 hover:bg-white/50"
          )}
        >
          {themeSettings.mode === 'dark' ? '☀️' : '🌙'}
        </button>
        </motion.div>
      )}

      {/* AI Status Indicator - Smaller on tablet, hidden on phone */}
      {!isPhone && (
        <motion.div
          className={cn(
            "absolute top-4 right-4 text-white/80 z-30",
            isTablet ? "text-xs" : "text-sm"
          )}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
        <div className={cn(
          "flex items-center gap-2 backdrop-blur-xl rounded-2xl px-4 py-2 shadow-lg",
          themeSettings.mode === 'dark'
            ? "bg-black/40 border border-purple-500/30"
            : "bg-white/40 border border-blue-300/40"
        )}>
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
          <span className={cn(
            "capitalize",
            themeSettings.mode === 'dark' ? "text-purple-200" : "text-blue-700"
          )}>{currentEmotion}</span>
          <div className={cn(
            "text-xs ml-2",
            themeSettings.mode === 'dark' ? "text-purple-300/70" : "text-blue-600/70"
          )}>AI Active</div>
        </div>
        </motion.div>
      )}

      {/* Enhanced Desktop with App Icons */}
      <EnhancedDesktop />

      {/* Mobile Home Screen */}
      <MobileHomeScreen />

      {/* Window Manager */}
      <WindowManager />

      {/* Nyx Taskbar - Hidden on phone */}
      {!isPhone && <NyxTaskbar />}
    </motion.div>
  )
}
