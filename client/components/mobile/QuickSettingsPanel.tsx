import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wifi, 
  WifiOff, 
  Bluetooth, 
  BluetoothOff,
  Volume2, 
  VolumeX,
  Flashlight,
  FlashlightOff,
  Sun,
  Moon,
  Plane,
  AirplayIcon,
  RotateCcw,
  RotateCw,
  BellOff,
  Bell,
  Smartphone,
  SmartphoneNfc,
  MapPin,
  MapPinOff,
  Battery,
  BatteryLow,
  Edit3,
  Settings,
  Power,
  ChevronDown,
  Minus,
  Plus
} from 'lucide-react'
import { useDeviceAuthStore, triggerHaptic } from '@/store/device-auth-store'
import { useThemeStore } from '@/store/theme-store'
import { cn } from '@/lib/utils'

interface QuickSettingsTile {
  id: string
  icon: React.ComponentType<any>
  activeIcon?: React.ComponentType<any>
  label: string
  active: boolean
  toggle: () => void
  hasSlider?: boolean
  value?: number
  onValueChange?: (value: number) => void
  description?: string
}

interface QuickSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export const QuickSettingsPanel: React.FC<QuickSettingsPanelProps> = ({
  isOpen,
  onClose,
  className
}) => {
  const { 
    quickSettingsTiles, 
    setQuickSettings,
    deviceType,
    enableHapticFeedback 
  } = useDeviceAuthStore()
  const { settings: themeSettings, setThemeMode } = useThemeStore()
  
  const [editMode, setEditMode] = useState(false)
  const [brightness, setBrightness] = useState(80)
  const [volume, setVolume] = useState(70)
  const [systemStates, setSystemStates] = useState({
    wifi: true,
    bluetooth: true,
    airplane: false,
    flashlight: false,
    autoRotate: true,
    doNotDisturb: false,
    hotspot: false,
    location: true,
    nfc: true,
    batterySaver: false
  })

  // Available tiles configuration
  const availableTiles: Record<string, Omit<QuickSettingsTile, 'active' | 'toggle'>> = {
    wifi: {
      id: 'wifi',
      icon: systemStates.wifi ? Wifi : WifiOff,
      label: 'Wi-Fi',
      description: systemStates.wifi ? 'Connected to NyxNet' : 'Disconnected'
    },
    bluetooth: {
      id: 'bluetooth',
      icon: systemStates.bluetooth ? Bluetooth : BluetoothOff,
      label: 'Bluetooth',
      description: systemStates.bluetooth ? 'On' : 'Off'
    },
    airplane: {
      id: 'airplane',
      icon: Airplane,
      label: 'Airplane',
      description: systemStates.airplane ? 'On' : 'Off'
    },
    brightness: {
      id: 'brightness',
      icon: Sun,
      label: 'Brightness',
      hasSlider: true,
      value: brightness,
      onValueChange: setBrightness,
      description: `${brightness}%`
    },
    volume: {
      id: 'volume',
      icon: volume > 0 ? Volume2 : VolumeX,
      label: 'Volume',
      hasSlider: true,
      value: volume,
      onValueChange: setVolume,
      description: volume > 0 ? `${Math.round(volume)}%` : 'Muted'
    },
    battery_saver: {
      id: 'battery_saver',
      icon: systemStates.batterySaver ? BatteryLow : Battery,
      label: 'Battery Saver',
      description: systemStates.batterySaver ? 'On' : 'Off'
    },
    do_not_disturb: {
      id: 'do_not_disturb',
      icon: systemStates.doNotDisturb ? BellOff : Bell,
      label: 'Do Not Disturb',
      description: systemStates.doNotDisturb ? 'On' : 'Off'
    },
    hotspot: {
      id: 'hotspot',
      icon: Smartphone,
      label: 'Hotspot',
      description: systemStates.hotspot ? 'On' : 'Off'
    },
    location: {
      id: 'location',
      icon: systemStates.location ? MapPin : MapPinOff,
      label: 'Location',
      description: systemStates.location ? 'On' : 'Off'
    },
    auto_rotate: {
      id: 'auto_rotate',
      icon: systemStates.autoRotate ? RotateCw : RotateCcw,
      label: 'Auto Rotate',
      description: systemStates.autoRotate ? 'On' : 'Off'
    },
    flashlight: {
      id: 'flashlight',
      icon: systemStates.flashlight ? Flashlight : FlashlightOff,
      label: 'Flashlight',
      description: systemStates.flashlight ? 'On' : 'Off'
    },
    dark_mode: {
      id: 'dark_mode',
      icon: themeSettings.mode === 'dark' ? Moon : Sun,
      label: 'Dark Mode',
      description: themeSettings.mode === 'dark' ? 'On' : 'Off'
    }
  }

  // Toggle functions for each tile
  const toggleFunctions = {
    wifi: () => setSystemStates(prev => ({ ...prev, wifi: !prev.wifi })),
    bluetooth: () => setSystemStates(prev => ({ ...prev, bluetooth: !prev.bluetooth })),
    airplane: () => setSystemStates(prev => ({ ...prev, airplane: !prev.airplane })),
    battery_saver: () => setSystemStates(prev => ({ ...prev, batterySaver: !prev.batterySaver })),
    do_not_disturb: () => setSystemStates(prev => ({ ...prev, doNotDisturb: !prev.doNotDisturb })),
    hotspot: () => setSystemStates(prev => ({ ...prev, hotspot: !prev.hotspot })),
    location: () => setSystemStates(prev => ({ ...prev, location: !prev.location })),
    auto_rotate: () => setSystemStates(prev => ({ ...prev, autoRotate: !prev.autoRotate })),
    flashlight: () => setSystemStates(prev => ({ ...prev, flashlight: !prev.flashlight })),
    dark_mode: () => setThemeMode(themeSettings.mode === 'dark' ? 'light' : 'dark'),
    brightness: () => {}, // Handled by slider
    volume: () => setVolume(prev => prev > 0 ? 0 : 70)
  }

  // Get active tiles
  const activeTiles = quickSettingsTiles.map(tileId => {
    const tile = availableTiles[tileId]
    if (!tile) return null
    
    const isActive = (() => {
      switch (tileId) {
        case 'dark_mode': return themeSettings.mode === 'dark'
        case 'brightness': case 'volume': return true // Always "active" for sliders
        default: return systemStates[tileId as keyof typeof systemStates] as boolean
      }
    })()

    return {
      ...tile,
      active: isActive,
      toggle: toggleFunctions[tileId as keyof typeof toggleFunctions]
    }
  }).filter(Boolean) as QuickSettingsTile[]

  // Handle tile tap
  const handleTileTap = (tile: QuickSettingsTile) => {
    if (enableHapticFeedback) triggerHaptic('light')
    tile.toggle()
  }

  // Handle brightness change (also affects screen)
  useEffect(() => {
    document.documentElement.style.filter = `brightness(${brightness / 100})`
    return () => {
      document.documentElement.style.filter = ''
    }
  }, [brightness])

  const isDark = themeSettings.mode === 'dark'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "fixed inset-0 z-50",
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              "absolute top-0 left-0 right-0 max-h-[80vh] overflow-hidden",
              "backdrop-blur-xl border-b shadow-2xl",
              isDark 
                ? "bg-gray-900/95 border-gray-700" 
                : "bg-white/95 border-gray-200"
            )}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className={cn(
              "flex items-center justify-between p-4 border-b",
              isDark ? "border-gray-700" : "border-gray-200"
            )}>
              <h2 className={cn(
                "text-lg font-semibold",
                isDark ? "text-white" : "text-gray-900"
              )}>
                Quick Settings
              </h2>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    editMode
                      ? "bg-blue-500 text-white"
                      : isDark 
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  )}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={onClose}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isDark 
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  )}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Settings Grid */}
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3 mb-6">
                {activeTiles.map((tile) => (
                  <motion.div
                    key={tile.id}
                    layout
                    className={cn(
                      "relative rounded-2xl p-4 transition-all duration-200",
                      "flex flex-col items-start justify-between min-h-[80px]",
                      tile.active
                        ? "bg-blue-500 text-white shadow-lg"
                        : isDark
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                      editMode && "animate-pulse"
                    )}
                    onClick={() => !editMode && handleTileTap(tile)}
                    whileTap={{ scale: 0.95 }}
                  >
                    <tile.icon className="w-6 h-6 mb-2" />
                    
                    <div className="w-full">
                      <div className="text-sm font-medium">
                        {tile.label}
                      </div>
                      {tile.description && (
                        <div className="text-xs opacity-70 mt-1">
                          {tile.description}
                        </div>
                      )}
                      
                      {/* Slider for brightness/volume */}
                      {tile.hasSlider && tile.value !== undefined && tile.onValueChange && (
                        <div className="mt-3 w-full">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                tile.onValueChange!(Math.max(0, tile.value! - 10))
                              }}
                              className="p-1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            
                            <div className="flex-1 relative">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={tile.value}
                                onChange={(e) => tile.onValueChange!(Number(e.target.value))}
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                  "w-full h-1 rounded-full appearance-none cursor-pointer",
                                  tile.active
                                    ? "bg-white/30"
                                    : isDark
                                      ? "bg-gray-600"
                                      : "bg-gray-300"
                                )}
                              />
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                tile.onValueChange!(Math.min(100, tile.value! + 10))
                              }}
                              className="p-1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Additional Controls */}
              <div className="space-y-4">
                {/* Power Options */}
                <div className={cn(
                  "rounded-2xl p-4",
                  isDark ? "bg-gray-800" : "bg-gray-100"
                )}>
                  <h3 className={cn(
                    "text-sm font-medium mb-3",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    Power Options
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-colors",
                        isDark 
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300" 
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      )}
                      onClick={() => {
                        triggerHaptic('medium')
                        // Implement restart logic
                        console.log('Restart system')
                      }}
                    >
                      <RotateCw className="w-5 h-5" />
                      <span className="text-sm">Restart</span>
                    </button>
                    
                    <button
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-colors",
                        "bg-red-500 hover:bg-red-600 text-white"
                      )}
                      onClick={() => {
                        triggerHaptic('heavy')
                        // Implement shutdown logic
                        console.log('Shutdown system')
                      }}
                    >
                      <Power className="w-5 h-5" />
                      <span className="text-sm">Shutdown</span>
                    </button>
                  </div>
                </div>

                {/* Settings Access */}
                <button
                  className={cn(
                    "w-full rounded-2xl p-4 transition-colors",
                    "flex items-center justify-between",
                    isDark 
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-300" 
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  )}
                  onClick={() => {
                    triggerHaptic('light')
                    onClose()
                    // Open Settings app
                    window.dispatchEvent(new CustomEvent('nyx:open-settings'))
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5" />
                    <span className="text-sm font-medium">Open Settings</span>
                  </div>
                  <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for quick settings
export const useQuickSettings = () => {
  const [isOpen, setIsOpen] = useState(false)
  
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(prev => !prev)
  
  return { isOpen, open, close, toggle }
}
