import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWindowStore } from '@/store/window-store'
import { useSamStore } from '@/store/sam-store'
import { useDesktopStore } from '@/store/desktop-store'
import { useThemeStore } from '@/store/theme-store'
import {
  Menu,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Battery,
  BatteryLow,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Settings,
  Power,
  Monitor,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  MessageCircle,
  Phone,
  Folder,
  Wrench,
  Calendar as CalendarIcon,
  Globe,
  Calculator as CalculatorIcon,
  FileText,
  Crown,
  Gamepad2,
  HelpCircle,
  Music,
  LogOut,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const NyxTaskbar: React.FC = () => {
  const { windows, focusedWindowId, minimizeWindow, focusWindow, openWindow } = useWindowStore()
  const { currentEmotion, emotionIntensity, addMessage } = useSamStore()
  const { setEditMode } = useDesktopStore()
  const { setThemeMode, settings: themeSettings } = useThemeStore()

  const [currentTime, setCurrentTime] = useState(new Date())
  const [isMoonMenuOpen, setIsMoonMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [systemStats, setSystemStats] = useState({
    wifi: navigator.onLine,
    bluetooth: false,
    battery: null as BatteryManager | null,
    batteryLevel: 1,
    batteryCharging: false,
    volume: 1,
    notifications: 3,
    memoryUsage: null as any,
    networkSpeed: 0
  })

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Apply theme changes to document
  useEffect(() => {
    const root = document.documentElement
    if (themeSettings.mode === 'dark') {
      root.classList.remove('light')
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
  }, [themeSettings.mode])

  // Initialize real system information
  useEffect(() => {
    // Battery API
    const getBatteryInfo = async () => {
      try {
        if ('getBattery' in navigator) {
          const battery = await (navigator as any).getBattery()
          setSystemStats(prev => ({
            ...prev,
            battery,
            batteryLevel: battery.level,
            batteryCharging: battery.charging
          }))

          // Update battery info when it changes
          battery.addEventListener('levelchange', () => {
            setSystemStats(prev => ({ ...prev, batteryLevel: battery.level }))
          })

          battery.addEventListener('chargingchange', () => {
            setSystemStats(prev => ({ ...prev, batteryCharging: battery.charging }))
          })
        }
      } catch (error) {
        console.log('Battery API not supported')
      }
    }

    // Network status
    const updateNetworkStatus = () => {
      setSystemStats(prev => ({ ...prev, wifi: navigator.onLine }))
    }

    // Memory API (if available)
    const getMemoryInfo = () => {
      if ('memory' in performance) {
        setSystemStats(prev => ({ ...prev, memoryUsage: (performance as any).memory }))
      }
    }

    // Bluetooth API (experimental)
    const getBluetoothInfo = async () => {
      try {
        if ('bluetooth' in navigator) {
          const available = await navigator.bluetooth.getAvailability()
          setSystemStats(prev => ({ ...prev, bluetooth: available }))
        }
      } catch (error) {
        console.log('Bluetooth API not supported')
      }
    }

    getBatteryInfo()
    getMemoryInfo()
    getBluetoothInfo()

    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)

    // Update memory info periodically
    const memoryInterval = setInterval(getMemoryInfo, 5000)

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
      clearInterval(memoryInterval)
    }
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getEmotionGlow = () => {
    const intensity = emotionIntensity * 0.4
    switch (currentEmotion) {
      case 'happy':
        return `0 0 20px rgba(34, 197, 94, ${intensity})`
      case 'excited':
        return `0 0 20px rgba(251, 191, 36, ${intensity})`
      case 'focused':
        return `0 0 20px rgba(168, 85, 247, ${intensity})`
      case 'annoyed':
        return `0 0 20px rgba(239, 68, 68, ${intensity})`
      default:
        return `0 0 20px rgba(139, 92, 246, ${intensity})`
    }
  }

  const getBatteryIcon = () => {
    if (systemStats.batteryLevel <= 0.15) return BatteryLow
    return Battery
  }

  const getBatteryColor = () => {
    if (systemStats.batteryCharging) return 'text-green-400'
    if (systemStats.batteryLevel <= 0.15) return 'text-red-400'
    if (systemStats.batteryLevel <= 0.30) return 'text-yellow-400'
    return 'text-white'
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const quickActions = [
    {
      icon: Settings,
      label: 'Settings',
      action: async () => {
        const { Settings: SettingsApp } = await import('@/components/apps/Settings')
        openWindow({
          appId: 'settings',
          title: 'Settings',
          component: SettingsApp,
          position: { x: 100, y: 100 },
          size: { width: 900, height: 700 }
        })
      }
    },
    { icon: Monitor, label: 'Display', action: async () => {
      const { Settings: SettingsApp } = await import('@/components/apps/Settings')
      openWindow({
        appId: 'settings-display',
        title: 'Display Settings',
        component: SettingsApp,
        position: { x: 100, y: 100 },
        size: { width: 900, height: 700 }
      })
    }},
    { icon: systemStats.wifi ? Wifi : WifiOff, label: systemStats.wifi ? 'Connected' : 'Offline', action: () => {
      // Toggle network status simulation
      setSystemStats(prev => ({ ...prev, wifi: !prev.wifi }))
    }},
    { icon: systemStats.bluetooth ? Bluetooth : BluetoothOff, label: systemStats.bluetooth ? 'Bluetooth On' : 'Bluetooth Off', action: () => {
      // Toggle bluetooth status simulation
      setSystemStats(prev => ({ ...prev, bluetooth: !prev.bluetooth }))
    }},
    { icon: LogOut, label: 'Shutdown', action: () => {
      if (confirm('Shutdown Nyx OS?')) {
        window.location.reload()
      }
    }},
  ]

  const frequentApps = [
    {
      icon: MessageCircle,
      label: 'Sam Chat',
      action: async () => {
        const { SamChat } = await import('@/components/apps/SamChat')
        openWindow({
          appId: 'sam-chat',
          title: 'Sam Chat',
          component: SamChat,
          position: { x: 100, y: 100 },
          size: { width: 450, height: 650 }
        })
        setIsLauncherOpen(false)
      }
    },
    {
      icon: Music,
      label: 'Media Player',
      action: async () => {
        const { WindowsMediaPlayer } = await import('@/components/apps/WindowsMediaPlayer')
        openWindow({
          appId: 'media-player',
          title: 'Windows Media Player',
          component: WindowsMediaPlayer,
          position: { x: 180, y: 80 },
          size: { width: 1000, height: 700 }
        })
        setIsLauncherOpen(false)
      }
    },
    {
      icon: Folder,
      label: 'Files',
      action: async () => {
        const { Files } = await import('@/components/apps/Files')
        openWindow({
          appId: 'files',
          title: 'Files',
          component: Files,
          position: { x: 150, y: 120 },
          size: { width: 800, height: 600 }
        })
        setIsLauncherOpen(false)
      }
    },
    {
      icon: Globe,
      label: 'Browser',
      action: async () => {
        const { NyxBrowser } = await import('@/components/apps/NyxBrowser')
        openWindow({
          appId: 'nyx-browser',
          title: 'Nyx Browser',
          component: NyxBrowser,
          position: { x: 50, y: 50 },
          size: { width: 1200, height: 800 }
        })
        setIsLauncherOpen(false)
      }
    },
    {
      icon: CalculatorIcon,
      label: 'Calculator',
      action: async () => {
        const { Calculator } = await import('@/components/apps/Calculator')
        openWindow({
          appId: 'calculator',
          title: 'Calculator',
          component: Calculator,
          position: { x: 300, y: 150 },
          size: { width: 350, height: 500 }
        })
        setIsLauncherOpen(false)
      }
    },
    {
      icon: CalendarIcon,
      label: 'Calendar',
      action: async () => {
        const { Calendar } = await import('@/components/apps/Calendar')
        openWindow({
          appId: 'calendar',
          title: 'Chrono',
          component: Calendar,
          position: { x: 200, y: 50 },
          size: { width: 900, height: 600 }
        })
        setIsLauncherOpen(false)
      }
    }
  ]

  const notifications = [
    { id: 1, title: 'System Update', message: 'Nyx OS 1.1 is available', time: '2m ago', type: 'system' },
    { id: 2, title: 'AI Assistant', message: 'Voice recognition optimized', time: '5m ago', type: 'ai' },
    { id: 3, title: 'Security', message: 'All systems secure', time: '10m ago', type: 'security' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* System Info Tooltip */}
      <AnimatePresence>
        {isNotificationOpen && (
          <motion.div
            className="absolute bottom-16 right-4 w-80 liquid-glass-dark rounded-2xl p-4 z-40 liquid-reflection"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <h3 className="text-white font-semibold mb-3">System Information</h3>
            <div className="space-y-3">
              {/* Battery Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery className={cn('w-4 h-4', getBatteryColor())} />
                  <span className="text-purple-300 text-sm">Battery</span>
                </div>
                <div className="text-white text-sm">
                  {Math.round(systemStats.batteryLevel * 100)}%
                  {systemStats.batteryCharging && ' ⚡'}
                </div>
              </div>

              {/* Network Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {systemStats.wifi ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-purple-300 text-sm">Network</span>
                </div>
                <div className="text-white text-sm">
                  {systemStats.wifi ? 'Connected' : 'Offline'}
                </div>
              </div>

              {/* Memory Info */}
              {systemStats.memoryUsage && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-400" />
                    <span className="text-purple-300 text-sm">Memory</span>
                  </div>
                  <div className="text-white text-sm">
                    {formatBytes(systemStats.memoryUsage.usedJSHeapSize)} / {formatBytes(systemStats.memoryUsage.totalJSHeapSize)}
                  </div>
                </div>
              )}

              {/* Bluetooth Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {systemStats.bluetooth ? (
                    <Bluetooth className="w-4 h-4 text-blue-400" />
                  ) : (
                    <BluetoothOff className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-purple-300 text-sm">Bluetooth</span>
                </div>
                <div className="text-white text-sm">
                  {systemStats.bluetooth ? 'Available' : 'Unavailable'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Taskbar - Cleaner, Mac-inspired layout */}
      <motion.div
        className="h-14 liquid-glass-dark border-t border-purple-500/20 flex items-center justify-between px-4 liquid-reflection gap-3"
        style={{ boxShadow: getEmotionGlow() }}
        initial={{ y: 56 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        {/* Left Section: System Menu (Moon) */}
        <div className="flex items-center gap-2 relative">
          <motion.button
            className="h-9 w-9 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 flex items-center justify-center transition-all duration-200 flex-shrink-0"
            onClick={() => setIsMoonMenuOpen(!isMoonMenuOpen)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title="System Menu"
          >
            <Moon className="w-4 h-4 text-white/80" />
          </motion.button>
        </div>

        {/* Center Section: Window Tasks */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto hide-scrollbar">
          {windows.slice(0, 8).map((window) => {
            const isActive = focusedWindowId === window.id
            const isMinimized = window.isMinimized

            return (
              <motion.button
                key={window.id}
                className={cn(
                  "h-8 px-3 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 flex-shrink-0 whitespace-nowrap",
                  isActive
                    ? "bg-purple-600/40 text-purple-100 border border-purple-400/40"
                    : "bg-white/8 text-white/70 hover:bg-white/12 border border-white/10",
                  isMinimized && "opacity-60"
                )}
                onClick={() => {
                  if (isMinimized) {
                    minimizeWindow(window.id)
                  }
                  focusWindow(window.id)
                }}
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="truncate max-w-32">{window.title}</div>
                {isMinimized && <Minimize2 className="w-3 h-3 flex-shrink-0" />}
              </motion.button>
            )
          })}
          {windows.length > 8 && (
            <div className="text-xs text-white/50 px-2">+{windows.length - 8}</div>
          )}
        </div>

        {/* Right Section: System Status */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Compact System Icons */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
            {systemStats.wifi ? (
              <Wifi className="w-3.5 h-3.5 text-green-400" title="Connected" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-red-400" title="Offline" />
            )}

            {systemStats.volume > 0 ? (
              <Volume2 className="w-3.5 h-3.5 text-white/70" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            )}

            <div className="w-px h-4 bg-white/10" />

            <span className="text-xs text-white/70 font-medium">
              {Math.round(systemStats.batteryLevel * 100)}%
            </span>
            {React.createElement(getBatteryIcon(), { className: cn('w-3.5 h-3.5', getBatteryColor()) })}
          </div>

          {/* Notifications */}
          <motion.button
            className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            {systemStats.notifications > 0 ? (
              <>
                <Bell className="w-4 h-4 text-white/70" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {Math.min(systemStats.notifications, 9)}
                </span>
              </>
            ) : (
              <BellOff className="w-4 h-4 text-white/70" />
            )}
          </motion.button>

          {/* Time Display */}
          <button
            className="text-right px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            title="System Information"
          >
            <div className="text-xs text-white/90 font-medium">
              {formatTime(currentTime)}
            </div>
          </button>
        </div>
      </motion.div>

      {/* Moon System Menu */}
      <AnimatePresence>
        {isMoonMenuOpen && (
          <motion.div
            className="absolute bottom-12 left-2 w-80 bg-black/85 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search Section */}
            <div className="mb-4">
              <motion.button
                className="w-full p-2.5 bg-white/8 hover:bg-white/12 border border-white/15 rounded-lg flex items-center gap-2 transition-all group"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('nyx:toggle-command-palette'))
                  setIsMoonMenuOpen(false)
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Search apps, files, web..."
              >
                <Search className="w-4 h-4 text-white/60 group-hover:text-white/80 transition-colors" />
                <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                  Search
                </span>
                <kbd className="ml-auto text-xs text-white/40 px-2 py-1 rounded bg-white/5 border border-white/10 group-hover:border-white/15">
                  ⌘K
                </kbd>
              </motion.button>
            </div>

            {/* Quick Actions */}
            <h3 className="text-white/80 font-semibold text-xs mb-2 uppercase tracking-wider">System</h3>
            <div className="space-y-1 mb-4">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.label}
                    className="w-full p-2.5 bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-3 transition-all text-left"
                    onClick={() => {
                      action.action()
                      setIsMoonMenuOpen(false)
                    }}
                    whileHover={{ x: 4 }}
                  >
                    <Icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-xs text-white/80">{action.label}</span>
                  </motion.button>
                )
              })}
            </div>

            {/* Theme Toggle */}
            <div className="border-t border-white/10 pt-3 mt-3">
              <button
                className="w-full p-2.5 bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-3 transition-all text-left"
                onClick={() => {
                  setThemeMode(themeSettings.mode === 'dark' ? 'light' : 'dark')
                  setIsMoonMenuOpen(false)
                }}
              >
                {themeSettings.mode === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-xs text-white/80">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-blue-300 flex-shrink-0" />
                    <span className="text-xs text-white/80">Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Customize Desktop */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <button
                className="w-full p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-left text-xs text-white/80 transition-all"
                onClick={() => {
                  setEditMode(true)
                  setIsMoonMenuOpen(false)
                }}
              >
                Customize Desktop
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Center */}
      <AnimatePresence>
        {isNotificationOpen && (
          <motion.div
            className="absolute bottom-12 right-2 w-80 bg-black/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium text-sm">Notifications</h3>
              <button 
                className="text-xs text-purple-400 hover:text-purple-300"
                onClick={() => setSystemStats(prev => ({ ...prev, notifications: 0 }))}
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  className="p-3 bg-white/5 rounded-xl border border-white/10"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">{notification.title}</div>
                      <div className="text-xs text-white/70 mt-1">{notification.message}</div>
                    </div>
                    <span className="text-xs text-white/50 ml-2">{notification.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {notifications.length === 0 && (
              <div className="text-center py-8 text-white/60 text-sm">
                No new notifications
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {(isMoonMenuOpen || isNotificationOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsMoonMenuOpen(false)
            setIsNotificationOpen(false)
          }}
        />
      )}
    </div>
  )
}
