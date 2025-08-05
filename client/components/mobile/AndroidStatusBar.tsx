import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wifi, 
  WifiOff, 
  Battery, 
  Bluetooth, 
  Volume2, 
  VolumeX,
  Signal,
  Airplane,
  MoreHorizontal,
  BellOff,
  RotateCcw,
  Flashlight,
  Smartphone
} from 'lucide-react'
import { useDeviceAuthStore } from '@/store/device-auth-store'
import { useThemeStore } from '@/store/theme-store'
import { cn } from '@/lib/utils'

interface StatusBarState {
  time: string
  battery: number
  charging: boolean
  wifi: boolean
  wifiStrength: number
  bluetooth: boolean
  volume: number
  muted: boolean
  airplaneMode: boolean
  doNotDisturb: boolean
  location: boolean
  hotspot: boolean
  notifications: number
  networkType: 'LTE' | '5G' | 'WiFi' | 'No Signal'
}

interface AndroidStatusBarProps {
  onNotificationsPull: () => void
  onQuickSettingsPull: () => void
  className?: string
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  onNotificationsPull,
  onQuickSettingsPull,
  className
}) => {
  const { statusBarStyle, showNotificationDots, deviceType } = useDeviceAuthStore()
  const { settings: themeSettings } = useThemeStore()
  
  const [statusState, setStatusState] = useState<StatusBarState>({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    battery: 85,
    charging: false,
    wifi: true,
    wifiStrength: 3,
    bluetooth: true,
    volume: 70,
    muted: false,
    airplaneMode: false,
    doNotDisturb: false,
    location: true,
    hotspot: false,
    notifications: 3,
    networkType: 'LTE'
  })

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusState(prev => ({
        ...prev,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Simulate real system data updates
  useEffect(() => {
    const updateSystemData = () => {
      // Simulate battery drain
      setStatusState(prev => ({
        ...prev,
        battery: Math.max(0, prev.battery - Math.random() * 0.1),
        charging: Math.random() > 0.7,
        wifi: Math.random() > 0.1,
        wifiStrength: Math.floor(Math.random() * 4),
        bluetooth: Math.random() > 0.3,
        volume: 30 + Math.random() * 70,
        networkType: Math.random() > 0.5 ? 'LTE' : '5G' as 'LTE' | '5G'
      }))
    }

    const interval = setInterval(updateSystemData, 5000)
    return () => clearInterval(interval)
  }, [])

  // Get battery color based on level
  const getBatteryColor = () => {
    if (statusState.charging) return 'text-green-400'
    if (statusState.battery < 20) return 'text-red-400'
    if (statusState.battery < 50) return 'text-yellow-400'
    return 'text-white'
  }

  // Get signal strength bars
  const getSignalBars = () => {
    const bars = []
    for (let i = 0; i < 4; i++) {
      bars.push(
        <div
          key={i}
          className={cn(
            "w-1 bg-current transition-opacity",
            i < statusState.wifiStrength ? "opacity-100" : "opacity-30"
          )}
          style={{ height: `${(i + 1) * 3}px` }}
        />
      )
    }
    return bars
  }

  // Status bar theme
  const isDark = statusBarStyle === 'dark' || 
    (statusBarStyle === 'auto' && themeSettings.mode === 'dark')

  const statusBarClass = cn(
    "fixed top-0 left-0 right-0 z-50 px-4 py-1",
    "flex items-center justify-between",
    "backdrop-blur-md transition-all duration-300",
    isDark 
      ? "bg-black/80 text-white border-b border-white/10" 
      : "bg-white/80 text-black border-b border-black/10",
    deviceType === 'phone' ? "h-7 text-xs" : "h-8 text-sm",
    className
  )

  const iconSize = deviceType === 'phone' ? "w-3 h-3" : "w-4 h-4"

  return (
    <motion.div
      className={statusBarClass}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Left Side - Time and Network */}
      <div className="flex items-center gap-2">
        <span className="font-medium tracking-wide">
          {statusState.time}
        </span>
        
        {/* Network Type */}
        <span className="text-xs opacity-70">
          {statusState.networkType}
        </span>
        
        {/* Signal Strength */}
        <div className="flex items-end gap-px">
          {getSignalBars()}
        </div>
      </div>

      {/* Center - Notifications Indicator */}
      <div className="flex items-center gap-1">
        {/* Active Status Icons */}
        {statusState.airplaneMode && (
          <Airplane className={cn(iconSize, "text-orange-400")} />
        )}
        
        {statusState.doNotDisturb && (
          <BellOff className={cn(iconSize, "text-purple-400")} />
        )}
        
        {statusState.hotspot && (
          <Smartphone className={cn(iconSize, "text-blue-400")} />
        )}
        
        {/* Notification dots */}
        {showNotificationDots && statusState.notifications > 0 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(statusState.notifications, 3) }).map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
            {statusState.notifications > 3 && (
              <span className="text-xs text-blue-400 ml-1">
                +{statusState.notifications - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right Side - System Icons */}
      <div className="flex items-center gap-2">
        {/* Volume */}
        {statusState.muted ? (
          <VolumeX className={cn(iconSize, "text-red-400")} />
        ) : (
          <Volume2 className={cn(iconSize)} />
        )}
        
        {/* Bluetooth */}
        {statusState.bluetooth && (
          <Bluetooth className={cn(iconSize, "text-blue-400")} />
        )}
        
        {/* WiFi */}
        {statusState.wifi ? (
          <Wifi className={cn(iconSize, "text-white")} />
        ) : (
          <WifiOff className={cn(iconSize, "text-red-400")} />
        )}
        
        {/* Battery */}
        <div className="flex items-center gap-1">
          <Battery className={cn(iconSize, getBatteryColor())} />
          <span className={cn("text-xs font-medium", getBatteryColor())}>
            {Math.round(statusState.battery)}%
          </span>
          {statusState.charging && (
            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
          )}
        </div>
      </div>

      {/* Touch Zones for Gestures */}
      <div
        className="absolute inset-0 w-1/3 left-0"
        onTouchEnd={(e) => {
          // Left third - might be used for specific gestures in future
          e.stopPropagation()
        }}
      />
      
      <div
        className="absolute inset-0 w-1/3 left-1/3"
        onTouchEnd={(e) => {
          // Center third - notifications
          e.stopPropagation()
          onNotificationsPull()
        }}
      />
      
      <div
        className="absolute inset-0 w-1/3 right-0"
        onTouchEnd={(e) => {
          // Right third - quick settings
          e.stopPropagation()
          onQuickSettingsPull()
        }}
      />
    </motion.div>
  )
}

// Status Bar Provider for global state management
export const StatusBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Register global status bar events
    const handleWifiChange = () => {
      console.log('WiFi status changed')
    }
    
    const handleBatteryChange = () => {
      console.log('Battery status changed')
    }

    // Listen for system events (if available)
    if ('connection' in navigator) {
      navigator.connection?.addEventListener('change', handleWifiChange)
    }
    
    if ('getBattery' in navigator) {
      // @ts-ignore - Battery API
      navigator.getBattery?.().then((battery: any) => {
        battery.addEventListener('chargingchange', handleBatteryChange)
        battery.addEventListener('levelchange', handleBatteryChange)
      })
    }

    return () => {
      if ('connection' in navigator) {
        navigator.connection?.removeEventListener('change', handleWifiChange)
      }
    }
  }, [])

  return <>{children}</>
}

// Hook for status bar interactions
export const useStatusBar = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [pullingDown, setPullingDown] = useState(false)

  const hide = () => setIsVisible(false)
  const show = () => setIsVisible(true)
  const toggle = () => setIsVisible(prev => !prev)

  const startPull = () => setPullingDown(true)
  const endPull = () => setPullingDown(false)

  return {
    isVisible,
    pullingDown,
    hide,
    show,
    toggle,
    startPull,
    endPull
  }
}
