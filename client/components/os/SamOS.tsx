import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { WindowManager } from '@/components/window/WindowManager'
import { NyxTaskbar } from '@/components/os/NyxTaskbar'
import { EnhancedDesktop } from '@/components/os/EnhancedDesktop'
import { OptimizedBootAnimation } from '@/components/os/OptimizedBootAnimation'
import { DeviceSetupScreen } from '@/components/os/DeviceSetupScreen'
import { EnhancedLiveWallpaper } from '@/components/os/EnhancedLiveWallpaper'
import { OneUIHomeScreen } from '@/components/mobile/OneUIHomeScreen'
import { AndroidNavigation } from '@/components/mobile/AndroidNavigation'
import { OptimizedShutdownSystem } from '@/components/os/OptimizedShutdownSystem'
import { IntroCutscene } from '@/components/os/IntroCutscene'
import { PerformanceMonitor } from '@/components/os/PerformanceMonitor'
import { NyxBrowser } from '@/components/apps/NyxBrowser'
import { useSamStore } from '@/store/sam-store'
import { useWindowStore } from '@/store/window-store'
import { useThemeStore, updateCSSVariables } from '@/store/theme-store'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useDeviceDetection, DeviceType } from '@/hooks/useDeviceDetection'
import { usePerformanceManager } from '@/hooks/usePerformanceManager'
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

interface DisclaimerProps {
  onClose: () => void
}

const DisclaimerModal: React.FC<DisclaimerProps> = ({ onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white/20 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-white/20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">���</div>
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to Nyx OS</h2>
          <div className="space-y-3 text-white/80 text-sm leading-relaxed">
            <p>
              <strong>This is a demonstration, prototype, and proof of concept</strong> of what's possible with modern web technologies.
            </p>
            <p>
              Nyx OS showcases advanced UI/UX design, performance optimization, and cross-platform compatibility - all running entirely in your browser.
            </p>
            <p>
              While fully functional, this is not a production operating system. It's a glimpse into the future of web-based computing experiences.
            </p>
            <div className="mt-6 p-4 bg-blue-500/20 rounded-2xl border border-blue-400/30">
              <p className="text-blue-200 text-xs">
                💡 <strong>Pro tip:</strong> Try switching between device modes, test the apps, and enjoy the adaptive performance system that scales with your device capabilities!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-6 w-full py-3 bg-white/20 hover:bg-white/30 border border-white/30 rounded-2xl text-white font-medium transition-all duration-200"
          >
            Let's Explore! 🎉
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export const NyxOS: React.FC = () => {
  const { currentEmotion, emotionIntensity, addMessage, setEmotion } = useSamStore()
  const { openWindow } = useWindowStore()
  const { settings: themeSettings, setThemeMode } = useThemeStore()
  const { deviceInfo, uiConfig, isPhone, isTablet, isDesktop } = useDeviceDetection()
  const { profile, isLowPerformance, optimizeMemory } = usePerformanceManager()
  const [isBooted, setIsBooted] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showIntroCutscene, setShowIntroCutscene] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [navigationStyle, setNavigationStyle] = useState<'gestures' | 'buttons'>('buttons')
  
  // Auto-detect device type with fallback for small screens
  const selectedDeviceType: DeviceType = isPhone ? 'phone' : isTablet ? 'tablet' : 'desktop'

  // Force mobile view for small screens or touch devices
  const forcePhoneView = window.innerWidth < 768 || (window.innerWidth < 900 && 'ontouchstart' in window)
  const forceMobileView = forcePhoneView || (window.innerWidth < 1200 && navigator.maxTouchPoints > 0)
  const actualDeviceType = forcePhoneView ? 'phone' : forceMobileView && selectedDeviceType === 'desktop' ? 'tablet' : selectedDeviceType

  // Enable global keyboard shortcuts (disabled on phone)
  useKeyboardShortcuts(!isPhone && actualDeviceType !== 'phone')

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
    setShowIntroCutscene(true)

    // Initialize AI service
    aiService.setVoiceMode(true)

    // Device-specific welcome message
    setTimeout(() => {
      setEmotion('excited', 0.9)
      let welcomeMessage = `Welcome to Nyx OS, ${user.displayName}! `

      switch (actualDeviceType) {
        case 'phone':
          welcomeMessage += "Your Samsung One UI 7 style mobile experience is ready with smooth gestures and dynamic wallpapers!"
          break
        case 'tablet':
          welcomeMessage += "Your hybrid tablet experience combines mobile smoothness with desktop functionality!"
          break
        case 'desktop':
          welcomeMessage += "Your full desktop experience is ready with advanced multitasking and performance monitoring!"
          break
      }

      addMessage(welcomeMessage, 'sam', 'excited')
    }, 1500)
  }

  const handleIntroCutsceneComplete = () => {
    setShowIntroCutscene(false)
    setShowDisclaimer(true) // Show disclaimer after intro

    // Apply user-specific theme
    if (currentUser) {
      applyUserTheme(currentUser.username)
    }
  }

  const applyUserTheme = (username: string) => {
    const { updateSettings } = useThemeStore.getState()

    switch (username) {
      case 'shreya':
        updateSettings({
          accentColor: '#ec4899',
          customColors: {
            primary: '#be185d',
            secondary: '#f472b6',
            accent: '#ec4899'
          }
        })
        break
      case 'suhaeb':
        updateSettings({
          accentColor: '#8b5cf6',
          customColors: {
            primary: '#7c3aed',
            secondary: '#a855f7',
            accent: '#8b5cf6'
          }
        })
        break
      case 'raheel':
        updateSettings({
          accentColor: '#3b82f6',
          customColors: {
            primary: '#1d4ed8',
            secondary: '#60a5fa',
            accent: '#3b82f6'
          }
        })
        break
      default:
        updateSettings({
          accentColor: '#8b5cf6',
          customColors: {
            primary: '#7c3aed',
            secondary: '#a855f7',
            accent: '#8b5cf6'
          }
        })
    }
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
      setEmotion('excited', 0.7)
      addMessage("Dynamic wallpaper system activated! Experience different themes in dark and light modes.", 'sam', 'excited')
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
    return <OptimizedBootAnimation onComplete={handleBootComplete} />
  }

  // Show intro cutscene after boot but before main OS
  if (showIntroCutscene && currentUser) {
    return <IntroCutscene user={currentUser} onComplete={handleIntroCutsceneComplete} />
  }

  return (
    <OptimizedShutdownSystem>
      <motion.div
        className={`fixed inset-0 overflow-hidden ${themeSettings.mode}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: profile.useReducedMotion ? 0.3 : 1 }}
      >
        {/* Enhanced Live Wallpaper System */}
        <EnhancedLiveWallpaper />

        {/* Emotional Overlay */}
        <div
          className="absolute inset-0 transition-all duration-1000 ease-out pointer-events-none"
          style={{
            background: getBackgroundGradient(),
          }}
        />

        {/* User Info & Theme Toggle - Hidden on phone and tablet */}
        {actualDeviceType === 'desktop' && (
          <motion.div
            className="absolute top-4 left-4 flex items-center gap-3 z-30"
            initial={{ opacity: 0, x: profile.useReducedMotion ? -10 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: profile.useReducedMotion ? 0.1 : 0.2, duration: profile.animationDuration / 1000 }}
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

        {/* Performance Monitor - Desktop only */}
        {actualDeviceType === 'desktop' && (
          <PerformanceMonitor />
        )}

        {/* AI Status Indicator - Desktop only */}
        {actualDeviceType === 'desktop' && (
          <motion.div
            className={cn(
              "absolute top-4 right-4 text-white/80 z-30",
              isTablet ? "text-xs" : "text-sm"
            )}
            initial={{ opacity: 0, y: profile.useReducedMotion ? -10 : -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: profile.useReducedMotion ? 0.2 : 0.4, duration: profile.animationDuration / 1000 }}
            style={{ right: '300px' }} // Offset for performance monitor
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

        {/* Enhanced Desktop with App Icons - Desktop only */}
        {actualDeviceType === 'desktop' && <EnhancedDesktop />}

        {/* One UI 7 Mobile Home Screen - Mobile and tablet only */}
        {(actualDeviceType === 'phone' || actualDeviceType === 'tablet') && <OneUIHomeScreen />}

        {/* Android Navigation - For mobile and tablet */}
        {(actualDeviceType === 'phone' || actualDeviceType === 'tablet') && (
          <AndroidNavigation
            navigationStyle={navigationStyle}
            onNavigationStyleChange={setNavigationStyle}
            showStatusBarControls={true}
          />
        )}

        {/* Window Manager with Performance Limits */}
        <WindowManager maxWindows={profile.maxWindows} />

        {/* Nyx Taskbar - Desktop only, tablet uses Android navigation */}
        {actualDeviceType === 'desktop' && <NyxTaskbar />}
      </motion.div>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <DisclaimerModal onClose={() => setShowDisclaimer(false)} />
      )}
    </OptimizedShutdownSystem>
  )
}
