import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWindowStore } from '@/store/window-store'
import { useSamStore } from '@/store/sam-store'
import { useDesktopStore } from '@/store/desktop-store'
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
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const NyxTaskbar: React.FC = () => {
  const { windows, focusedWindowId, minimizeWindow, focusWindow, openWindow } = useWindowStore()
  const { currentEmotion, emotionIntensity } = useSamStore()
  const { setEditMode } = useDesktopStore()
  
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLauncherOpen, setIsLauncherOpen] = useState(false)
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
    { icon: Settings, label: 'Settings', action: () => window.dispatchEvent(new CustomEvent('nyx:open-settings')) },
    { icon: Monitor, label: 'Display', action: () => {} },
    { icon: systemStats.wifi ? Wifi : WifiOff, label: 'Network', action: () => {} },
    { icon: systemStats.bluetooth ? Bluetooth : BluetoothOff, label: 'Bluetooth', action: () => {} },
    { icon: Power, label: 'Power', action: () => {} },
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

      {/* Main Taskbar */}
      <motion.div
        className="h-12 liquid-glass-dark border-t border-purple-500/20 flex items-center px-2 liquid-reflection"
        style={{ boxShadow: getEmotionGlow() }}
        initial={{ y: 48 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        {/* Nyx Logo / Start Button */}
        <motion.button
          className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 flex items-center justify-center transition-all duration-200 mr-2"
          onClick={() => setIsLauncherOpen(!isLauncherOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-5 h-5 text-white" />
        </motion.button>

        {/* Window Tasks */}
        <div className="flex items-center gap-1 flex-1 mx-2">
          {windows.map((window) => {
            const isActive = focusedWindowId === window.id
            const isMinimized = window.isMinimized
            
            return (
              <motion.button
                key={window.id}
                className={cn(
                  "h-8 px-3 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-2 max-w-48",
                  isActive 
                    ? "bg-purple-600/30 text-purple-200 border border-purple-400/30" 
                    : "bg-white/5 text-white/70 hover:bg-white/10 border border-transparent",
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
                <div className="truncate">{window.title}</div>
                {isMinimized && <Minimize2 className="w-3 h-3 flex-shrink-0" />}
              </motion.button>
            )
          })}
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-1">
          {/* Connectivity Icons */}
          <div className="flex items-center gap-1 px-2">
            {systemStats.wifi ? (
              <Wifi className="w-4 h-4 text-green-400" title="Network: Connected" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" title="Network: Offline" />
            )}

            {systemStats.bluetooth ? (
              <Bluetooth className="w-4 h-4 text-blue-400" title="Bluetooth: Available" />
            ) : (
              <BluetoothOff className="w-4 h-4 text-gray-500" title="Bluetooth: Unavailable" />
            )}
            
            {systemStats.volume > 0 ? (
              <Volume2 className="w-4 h-4 text-white/70" title={`Volume: ${Math.round(systemStats.volume * 100)}%`} />
            ) : (
              <VolumeX className="w-4 h-4 text-red-400" title="Volume: Muted" />
            )}
          </div>

          {/* Battery */}
          <div className="flex items-center gap-1 px-2" title={`Battery: ${Math.round(systemStats.batteryLevel * 100)}%${systemStats.batteryCharging ? ' (Charging)' : ''}`}>
            {React.createElement(getBatteryIcon(), { className: cn('w-4 h-4', getBatteryColor()) })}
            <span className="text-xs text-white/70">
              {Math.round(systemStats.batteryLevel * 100)}%
              {systemStats.batteryCharging && ' ⚡'}
            </span>
          </div>

          {/* Notifications */}
          <motion.button
            className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            whileHover={{ scale: 1.05 }}
          >
            {systemStats.notifications > 0 ? (
              <>
                <Bell className="w-4 h-4 text-white/70" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {systemStats.notifications}
                </span>
              </>
            ) : (
              <BellOff className="w-4 h-4 text-white/70" />
            )}
          </motion.button>

          {/* Date & Time */}
          <button
            className="text-right px-3 border-l border-white/10 ml-2 hover:bg-white/10 rounded transition-colors"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            title="Click for system information"
          >
            <div className="text-xs text-white/90 font-medium leading-tight">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs text-white/60 leading-tight">
              {formatDate(currentTime)}
            </div>
          </button>
        </div>
      </motion.div>

      {/* App Launcher */}
      <AnimatePresence>
        {isLauncherOpen && (
          <motion.div
            className="absolute bottom-12 left-2 w-80 bg-black/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-white font-medium mb-3 text-sm">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.label}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 flex flex-col items-center gap-1"
                    onClick={action.action}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Icon className="w-5 h-5 text-purple-400" />
                    <span className="text-xs text-white/70">{action.label}</span>
                  </motion.button>
                )
              })}
            </div>
            
            <div className="border-t border-white/10 pt-3">
              <button
                className="w-full p-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                onClick={() => setEditMode(true)}
              >
                Customize Desktop
              </button>
              <button
                className="w-full p-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                onClick={() => window.dispatchEvent(new CustomEvent('nyx:open-browser'))}
              >
                Open Browser
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
      {(isLauncherOpen || isNotificationOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsLauncherOpen(false)
            setIsNotificationOpen(false)
          }}
        />
      )}
    </div>
  )
}
