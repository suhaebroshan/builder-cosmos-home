import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, Camera, Chrome, Settings, Calculator,
  Image, Clock, Cloud, Calendar, FileText,
  Mic, MapPin, Search, Wifi, Battery, Signal,
  ArrowUp, Home, Square, Triangle, WifiOff
} from 'lucide-react'
import { useWindowStore } from '@/store/window-store'
import { useSamStore } from '@/store/sam-store'
import { useDeviceInfo } from '@/hooks/useDeviceInfo'
import { cn } from '@/lib/utils'

// Nyx OS Mobile Apps - Clean and Essential
const nyxApps = [
  // Core Nyx OS Apps
  { id: 'call-sam', name: 'Call Sam', icon: Phone, color: '#8b5cf6', category: 'nyx' },
  { id: 'camera', name: 'Camera', icon: Camera, color: '#dc2626', category: 'media' },
  { id: 'gallery', name: 'Gallery', icon: Image, color: '#7c3aed', category: 'media' },
  { id: 'notes', name: 'Notepad', icon: FileText, color: '#ca8a04', category: 'nyx' },
  { id: 'browser', name: 'Nyx Browse', icon: Chrome, color: '#ea580c', category: 'nyx' },
  { id: 'voice-recorder', name: 'Voice Recorder', icon: Mic, color: '#be123c', category: 'nyx' },
  { id: 'settings', name: 'Settings', icon: Settings, color: '#6b7280', category: 'system' },
  { id: 'calculator', name: 'Calculator', icon: Calculator, color: '#059669', category: 'tools' },
  
  // Essential Mobile Apps
  { id: 'maps', name: 'Maps', icon: MapPin, color: '#16a34a', category: 'tools' },
  { id: 'calendar', name: 'Calendar', icon: Calendar, color: '#0891b2', category: 'productivity' },
  { id: 'clock', name: 'Clock', icon: Clock, color: '#4f46e5', category: 'tools' },
  { id: 'weather', name: 'Weather', icon: Cloud, color: '#0369a1', category: 'tools' },
]

export const NyxMobileHomeScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAppDrawer, setShowAppDrawer] = useState(false)
  const iconRefs = useRef<Record<string, HTMLElement | null>>({})

  const { openWindow } = useWindowStore()
  const { addMessage } = useSamStore()
  const {
    deviceInfo,
    getBatteryPercentage,
    getNetworkType,
    getSignalStrength,
    formatTime
  } = useDeviceInfo()

  // Real device status info
  const statusInfo = {
    time: formatTime('24h'),
    battery: getBatteryPercentage(),
    signal: getSignalStrength(),
    wifi: deviceInfo.network.online && deviceInfo.network.type === 'wifi',
    charging: deviceInfo.battery.charging,
    networkType: getNetworkType(),
    isOnline: deviceInfo.isOnline,
  }

  // Filtered apps for search
  const filteredApps = searchQuery
    ? nyxApps.filter(app => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : nyxApps

  const handleAppOpen = (app: typeof nyxApps[0], event?: React.MouseEvent) => {
    // Get icon position for animation
    const iconElement = iconRefs.current[app.id]
    let iconPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

    if (iconElement) {
      const rect = iconElement.getBoundingClientRect()
      iconPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
    }

    // Import and open the app component dynamically
    switch (app.id) {
      case 'camera':
        import('@/components/apps/EnhancedCameraApp').then(({ EnhancedCameraApp }) => {
          openWindow({
            title: app.name,
            component: EnhancedCameraApp,
            position: { x: 0, y: 0 },
            size: { width: window.innerWidth, height: window.innerHeight },
            isFullscreen: true,
            animationOrigin: iconPosition,
          })
        })
        break
      case 'call-sam':
        import('@/components/apps/EnhancedCallSam').then(({ EnhancedCallSam }) => {
          openWindow({
            title: 'Call Sam',
            component: EnhancedCallSam,
            position: { x: 0, y: 0 },
            size: { width: window.innerWidth, height: window.innerHeight },
            isFullscreen: true,
            animationOrigin: iconPosition,
          })
        })
        break
      case 'voice-recorder':
        import('@/components/apps/VoiceRecorder').then(({ VoiceRecorder }) => {
          openWindow({
            title: app.name,
            component: VoiceRecorder,
            position: { x: 0, y: 0 },
            size: { width: window.innerWidth, height: window.innerHeight },
            isFullscreen: true,
            animationOrigin: iconPosition,
          })
        })
        break
      case 'notes':
        import('@/components/apps/EnhancedNotepad').then(({ EnhancedNotepad }) => {
          openWindow({
            title: 'Notepad',
            component: EnhancedNotepad,
            position: { x: 0, y: 0 },
            size: { width: window.innerWidth, height: window.innerHeight },
            isFullscreen: true,
            animationOrigin: iconPosition,
          })
        })
        break
      case 'gallery':
        import('@/components/apps/Gallery').then(({ Gallery }) => {
          openWindow({
            title: app.name,
            component: Gallery,
            position: { x: 0, y: 0 },
            size: { width: window.innerWidth, height: window.innerHeight },
            isFullscreen: true,
            animationOrigin: iconPosition,
          })
        })
        break
      case 'browser':
        import('@/components/apps/NyxBrowser').then(({ NyxBrowser }) => {
          openWindow({
            title: 'Nyx Browse',
            component: NyxBrowser,
            position: { x: 0, y: 0 },
            size: { width: window.innerWidth, height: window.innerHeight },
            isFullscreen: true,
            animationOrigin: iconPosition,
          })
        })
        break
      case 'calculator':
        import('@/components/apps/Calculator').then(({ Calculator }) => {
          openWindow({
            title: 'Calculator',
            component: Calculator,
            position: { x: 50, y: 50 },
            size: { width: 350, height: 500 },
            animationOrigin: iconPosition,
          })
        })
        break
      case 'settings':
        import('@/components/apps/Settings').then(({ Settings }) => {
          openWindow({
            title: 'Settings',
            component: Settings,
            position: { x: 0, y: 0 },
            size: { width: window.innerWidth, height: window.innerHeight },
            isFullscreen: true,
            animationOrigin: iconPosition,
          })
        })
        break
      default:
        addMessage(`${app.name} - Demo app opening soon!`, 'system', 'neutral')
    }
    
    setShowAppDrawer(false)
  }

  return (
    <div className="fixed inset-0 z-10 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Status Bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-50 h-8 px-4 flex items-center justify-between text-black dark:text-white text-sm font-medium"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        initial={{ y: -32 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono">{statusInfo.time}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Signal strength */}
          <div className="flex gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-sm",
                  i < statusInfo.signal ? "bg-current" : "bg-current opacity-30"
                )}
                style={{ height: `${(i + 1) * 2 + 2}px` }}
              />
            ))}
          </div>
          
          {/* WiFi/Network */}
          {statusInfo.isOnline ? (
            statusInfo.wifi ? (
              <Wifi size={12} className="text-blue-500" />
            ) : (
              <div className="flex items-center gap-1">
                <Signal size={12} />
                <span className="text-xs">{statusInfo.networkType}</span>
              </div>
            )
          ) : (
            <WifiOff size={12} className="text-red-500" />
          )}

          {/* Battery */}
          <div className="flex items-center gap-1">
            <div className={cn(
              "w-6 h-3 border border-current rounded-sm relative",
              statusInfo.charging ? "border-green-500" :
              statusInfo.battery < 20 ? "border-red-500" : "border-current"
            )}>
              <div
                className={cn(
                  "h-full rounded-sm",
                  statusInfo.charging ? "bg-green-500" :
                  statusInfo.battery < 20 ? "bg-red-500" :
                  statusInfo.battery < 50 ? "bg-yellow-500" : "bg-current"
                )}
                style={{ width: `${Math.max(statusInfo.battery, 5)}%` }}
              />
              <div className="absolute -right-0.5 top-0.5 w-0.5 h-2 bg-current rounded-r-sm" />
              {statusInfo.charging && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                </div>
              )}
            </div>
            <span className={cn(
              "text-xs",
              statusInfo.charging ? "text-green-600" :
              statusInfo.battery < 20 ? "text-red-600" : ""
            )}>
              {statusInfo.battery}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Home Screen Content */}
      <div className="pt-10 pb-20 px-4 h-full">
        {/* Time and Date Widget */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-6xl font-thin text-black dark:text-white mb-2">
            {formatTime('24h')}
          </div>
          <div className="text-lg text-black/70 dark:text-white/70">
            {deviceInfo.time.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          {/* Network Status Indicator */}
          <div className="flex items-center gap-2 mt-2 text-sm text-black/50 dark:text-white/50">
            <span className="text-xs">{statusInfo.networkType}</span>
            {statusInfo.charging && (
              <span className="text-xs text-green-600 dark:text-green-400">Charging</span>
            )}
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-4 flex items-center gap-3">
            <Search size={20} className="text-black/60 dark:text-white/60" />
            <input
              type="text"
              placeholder="Search apps..."
              className="flex-1 bg-transparent border-none outline-none text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Main Apps Grid */}
        <motion.div
          className="grid grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {nyxApps.slice(0, 8).map((app, index) => {
            const Icon = app.icon
            return (
              <motion.button
                key={app.id}
                ref={(el) => { iconRefs.current[app.id] = el }}
                className="aspect-square bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-4 flex flex-col items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                onClick={(e) => handleAppOpen(app, e)}
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                  style={{ backgroundColor: app.color }}
                >
                  <Icon size={24} />
                </div>
                <span className="text-xs text-black dark:text-white font-medium">
                  {app.name}
                </span>
              </motion.button>
            )
          })}
        </motion.div>

        {/* App Drawer Button */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <motion.button
            className="w-12 h-12 bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAppDrawer(true)}
          >
            <ArrowUp size={20} className="text-black dark:text-white" />
          </motion.button>
        </motion.div>
      </div>

      {/* App Drawer */}
      <AnimatePresence>
        {showAppDrawer && (
          <motion.div
            className="absolute inset-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="h-full pt-16 pb-20 px-4">
              {/* App Drawer Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-2xl font-medium text-black dark:text-white">All Apps</div>
                <button
                  className="w-10 h-10 rounded-full bg-white/20 dark:bg-white/10 flex items-center justify-center"
                  onClick={() => setShowAppDrawer(false)}
                >
                  <ArrowUp size={20} className="text-black dark:text-white rotate-180" />
                </button>
              </div>

              {/* Apps Grid */}
              <div className="grid grid-cols-4 gap-6 overflow-y-auto">
                {filteredApps.map((app, index) => {
                  const Icon = app.icon
                  return (
                    <motion.button
                      key={app.id}
                      ref={(el) => { iconRefs.current[`drawer-${app.id}`] = el }}
                      className="flex flex-col items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={(e) => handleAppOpen(app, e)}
                    >
                      <div 
                        className="w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-lg"
                        style={{ backgroundColor: app.color }}
                      >
                        <Icon size={28} />
                      </div>
                      <span className="text-xs text-black dark:text-white font-medium text-center">
                        {app.name}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-16 z-40"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        initial={{ y: 64 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-center h-full gap-8">
          {/* Navigation Buttons */}
          <motion.button
            className="w-10 h-10 rounded-xl bg-white/20 dark:bg-white/10 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Triangle size={18} className="text-black dark:text-white rotate-180" />
          </motion.button>
          
          <motion.button
            className="w-12 h-12 rounded-xl bg-white/30 dark:bg-white/15 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAppDrawer(false)}
          >
            <Home size={20} className="text-black dark:text-white" />
          </motion.button>
          
          <motion.button
            className="w-10 h-10 rounded-xl bg-white/20 dark:bg-white/10 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Square size={18} className="text-black dark:text-white" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
