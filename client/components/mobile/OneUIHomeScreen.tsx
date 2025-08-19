import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Phone, Camera, MessageSquare, Chrome, Settings, Calculator,
  Music, Image, Clock, Weather, Calendar, Mail, FileText,
  Video, Mic, MapPin, ShoppingBag, Gamepad2, Heart,
  Search, Wifi, Battery, Signal, MoreHorizontal,
  ArrowUp, ArrowDown, Home, Square, Triangle
} from 'lucide-react'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { usePerformanceManager } from '@/hooks/usePerformanceManager'
import { useWindowStore } from '@/store/window-store'
import { useSamStore } from '@/store/sam-store'
import { cn } from '@/lib/utils'

// One UI 7 App definitions
const oneUIApps = [
  { id: 'phone', name: 'Phone', icon: Phone, color: '#2563eb', category: 'communication' },
  { id: 'camera', name: 'Camera', icon: Camera, color: '#dc2626', category: 'media' },
  { id: 'messages', name: 'Messages', icon: MessageSquare, color: '#16a34a', category: 'communication' },
  { id: 'browser', name: 'Internet', icon: Chrome, color: '#ea580c', category: 'tools' },
  { id: 'gallery', name: 'Gallery', icon: Image, color: '#7c3aed', category: 'media' },
  { id: 'music', name: 'Music', icon: Music, color: '#c2410c', category: 'media' },
  { id: 'calendar', name: 'Calendar', icon: Calendar, color: '#0891b2', category: 'productivity' },
  { id: 'clock', name: 'Clock', icon: Clock, color: '#4f46e5', category: 'tools' },
  { id: 'weather', name: 'Weather', icon: Weather, color: '#0369a1', category: 'tools' },
  { id: 'mail', name: 'Email', icon: Mail, color: '#dc2626', category: 'communication' },
  { id: 'notes', name: 'Notes', icon: FileText, color: '#ca8a04', category: 'productivity' },
  { id: 'calculator', name: 'Calculator', icon: Calculator, color: '#059669', category: 'tools' },
  { id: 'video', name: 'Video Player', icon: Video, color: '#b91c1c', category: 'media' },
  { id: 'recorder', name: 'Voice Recorder', icon: Mic, color: '#be123c', category: 'tools' },
  { id: 'maps', name: 'Maps', icon: MapPin, color: '#16a34a', category: 'tools' },
  { id: 'store', name: 'Galaxy Store', icon: ShoppingBag, color: '#7c3aed', category: 'tools' },
  { id: 'games', name: 'Game Hub', icon: Gamepad2, color: '#dc2626', category: 'entertainment' },
  { id: 'health', name: 'Samsung Health', icon: Heart, color: '#e11d48', category: 'health' },
  { id: 'settings', name: 'Settings', icon: Settings, color: '#6b7280', category: 'system' },
]

export const OneUIHomeScreen: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [time, setTime] = useState(new Date())
  const [showAppDrawer, setShowAppDrawer] = useState(false)
  const [notificationPanel, setNotificationPanel] = useState(false)
  
  const { isPhone, isTablet } = useDeviceDetection()
  const { profile } = usePerformanceManager()
  const { openWindow } = useWindowStore()
  const { addMessage } = useSamStore()

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Status bar info
  const statusInfo = {
    time: time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    battery: 87,
    signal: 4,
    wifi: true,
  }

  // App grid configuration
  const appsPerPage = isPhone ? 20 : 24
  const pages = Math.ceil(oneUIApps.length / appsPerPage)
  const currentApps = oneUIApps.slice(
    currentPage * appsPerPage,
    (currentPage + 1) * appsPerPage
  )

  // Filtered apps for search
  const filteredApps = searchQuery
    ? oneUIApps.filter(app => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentApps

  const handleAppOpen = (app: typeof oneUIApps[0]) => {
    // Import and open the app component dynamically
    switch (app.id) {
      case 'camera':
        import('@/components/apps/CameraApp').then(({ CameraApp }) => {
          openWindow({
            title: app.name,
            component: CameraApp,
            position: { x: 0, y: 0 },
            size: { width: window.innerWidth, height: window.innerHeight },
            isFullscreen: true,
          })
        })
        break
      case 'phone':
        openWindow({
          title: 'Call Sam',
          component: () => import('@/components/apps/CallSam').then(m => m.CallSam),
          position: { x: 0, y: 0 },
          size: { width: window.innerWidth, height: window.innerHeight },
          isFullscreen: true,
        })
        break
      case 'recorder':
        import('@/components/apps/VoiceRecorder').then(({ VoiceRecorder }) => {
          openWindow({
            title: app.name,
            component: VoiceRecorder,
            position: { x: 0, y: 0 },
            size: { width: window.innerWidth, height: window.innerHeight },
            isFullscreen: true,
          })
        })
        break
      case 'notes':
        openWindow({
          title: 'Notepad',
          component: () => import('@/components/apps/Notepad').then(m => m.Notepad),
          position: { x: 0, y: 0 },
          size: { width: window.innerWidth, height: window.innerHeight },
          isFullscreen: true,
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
          })
        })
        break
      case 'browser':
        openWindow({
          title: 'Nyx Browse',
          component: () => import('@/components/apps/NyxBrowser').then(m => m.NyxBrowser),
          position: { x: 0, y: 0 },
          size: { width: window.innerWidth, height: window.innerHeight },
          isFullscreen: true,
        })
        break
      case 'calculator':
        openWindow({
          title: 'Calculator',
          component: () => import('@/components/apps/Calculator').then(m => m.Calculator),
          position: { x: 50, y: 50 },
          size: { width: 350, height: 500 },
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
          })
        })
        break
      default:
        addMessage(`Opening ${app.name}... This is a demo app.`, 'system', 'neutral')
    }
    
    setShowAppDrawer(false)
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Status Bar - One UI 7 Style */}
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
        onTouchStart={() => setNotificationPanel(true)}
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
          
          {/* WiFi */}
          {statusInfo.wifi && <Wifi size={12} />}
          
          {/* Battery */}
          <div className="flex items-center gap-1">
            <div className="w-6 h-3 border border-current rounded-sm relative">
              <div 
                className="h-full bg-current rounded-sm"
                style={{ width: `${statusInfo.battery}%` }}
              />
              <div className="absolute -right-0.5 top-0.5 w-0.5 h-2 bg-current rounded-r-sm" />
            </div>
            <span className="text-xs">{statusInfo.battery}%</span>
          </div>
        </div>
      </motion.div>

      {/* Notification Panel */}
      <AnimatePresence>
        {notificationPanel && (
          <motion.div
            className="absolute top-0 left-0 right-0 z-40 bg-white/20 dark:bg-black/20 backdrop-blur-2xl"
            initial={{ y: -300 }}
            animate={{ y: 0 }}
            exit={{ y: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{ height: '300px' }}
            onTouchEnd={() => setNotificationPanel(false)}
          >
            <div className="p-6 pt-12">
              <div className="text-white/90 text-lg font-medium mb-4">Notifications</div>
              <div className="space-y-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="font-medium">Nyx OS Demo</div>
                  <div className="text-sm opacity-80">This is a prototype interface</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="font-medium">System Performance</div>
                  <div className="text-sm opacity-80">Running in {profile.name} mode</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Home Screen Content */}
      <div className="pt-10 pb-20 px-4 h-full">
        {/* Time and Date Widget - One UI 7 Style */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-6xl font-thin text-black dark:text-white mb-2">
            {time.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
          </div>
          <div className="text-lg text-black/70 dark:text-white/70">
            {time.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div 
            className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-4 flex items-center gap-3"
            onClick={() => setShowSearch(true)}
          >
            <Search size={20} className="text-black/60 dark:text-white/60" />
            <input
              type="text"
              placeholder="Search apps, contacts, web..."
              className="flex-1 bg-transparent border-none outline-none text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
            />
          </div>
        </motion.div>

        {/* Quick Actions - One UI 7 Style */}
        <motion.div
          className="grid grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {oneUIApps.slice(0, 4).map((app, index) => {
            const Icon = app.icon
            return (
              <motion.button
                key={app.id}
                className="aspect-square bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-4 flex flex-col items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                onClick={() => handleAppOpen(app)}
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

        {/* Recent Apps Section */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-lg font-medium text-black dark:text-white mb-3">Recent</div>
          <div className="flex gap-3 overflow-x-auto">
            {oneUIApps.slice(4, 8).map((app, index) => {
              const Icon = app.icon
              return (
                <motion.button
                  key={app.id}
                  className="flex-shrink-0 w-20 h-20 bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  onClick={() => handleAppOpen(app)}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: app.color }}
                  >
                    <Icon size={20} />
                  </div>
                </motion.button>
              )
            })}
          </div>
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
                <div className="text-2xl font-medium text-black dark:text-white">Apps</div>
                <button
                  className="w-10 h-10 rounded-full bg-white/20 dark:bg-white/10 flex items-center justify-center"
                  onClick={() => setShowAppDrawer(false)}
                >
                  <ArrowDown size={20} className="text-black dark:text-white" />
                </button>
              </div>

              {/* Apps Grid */}
              <div className="grid grid-cols-4 gap-6 overflow-y-auto">
                {filteredApps.map((app, index) => {
                  const Icon = app.icon
                  return (
                    <motion.button
                      key={app.id}
                      className="flex flex-col items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleAppOpen(app)}
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

      {/* Navigation Bar - One UI 7 Style */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-20 z-40"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-center h-full gap-8">
          {/* Navigation Buttons */}
          <motion.button
            className="w-12 h-12 rounded-2xl bg-white/20 dark:bg-white/10 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Square size={20} className="text-black dark:text-white" />
          </motion.button>
          
          <motion.button
            className="w-14 h-14 rounded-2xl bg-white/30 dark:bg-white/15 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAppDrawer(false)}
          >
            <Home size={24} className="text-black dark:text-white" />
          </motion.button>
          
          <motion.button
            className="w-12 h-12 rounded-2xl bg-white/20 dark:bg-white/10 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Triangle size={20} className="text-black dark:text-white" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
