import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { useWindowStore } from '@/store/window-store'
import { useThemeStore } from '@/store/theme-store'
import { cn } from '@/lib/utils'
import {
  MessageCircle,
  Phone,
  Folder,
  Wrench,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  Globe,
  Gamepad2,
  Crown,
  Zap,
  Brain,
  FileText,
  Calculator as CalculatorIcon,
  Chrome,
  Grid3x3,
  HelpCircle,
  Music,
  ChevronUp,
  Search
} from 'lucide-react'

export const MobileHomeScreen: React.FC = () => {
  const { isPhone, isTablet } = useDeviceDetection()
  const { windows, openWindow } = useWindowStore()
  const { settings } = useThemeStore()
  const [showAppDrawer, setShowAppDrawer] = useState(false)

  // Only show on mobile when no fullscreen apps are running
  if (!isPhone && !isTablet) return null
  if (windows.some(w => w.mode === 'fullscreen' && !w.isMinimized)) return null

  // Mobile app definitions
  const mobileApps = [
    {
      id: 'sam-chat',
      name: 'Sam Chat',
      icon: MessageCircle,
      color: 'bg-gradient-to-br from-purple-500 to-violet-600',
      component: () => import('@/components/apps/SamChat').then(m => m.SamChat)
    },
    {
      id: 'call-sam',
      name: 'Call Sam',
      icon: Phone,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      component: () => import('@/components/apps/CallSam').then(m => m.CallSam)
    },
    {
      id: 'files',
      name: 'Files',
      icon: Folder,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      component: () => import('@/components/apps/Files').then(m => m.Files)
    },
    {
      id: 'app-forge',
      name: 'App Forge',
      icon: Wrench,
      color: 'bg-gradient-to-br from-orange-500 to-red-600',
      component: () => import('@/components/apps/AppForge').then(m => m.AppForge)
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: CalendarIcon,
      color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      component: () => import('@/components/apps/Calendar').then(m => m.Calendar)
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: SettingsIcon,
      color: 'bg-gradient-to-br from-gray-500 to-slate-600',
      component: () => import('@/components/apps/Settings').then(m => m.Settings)
    },
    {
      id: 'nyx-browser',
      name: 'Browser',
      icon: Globe,
      color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      component: () => import('@/components/apps/NyxBrowser').then(m => m.NyxBrowser)
    },
    {
      id: 'calculator',
      name: 'Calculator',
      icon: CalculatorIcon,
      color: 'bg-gradient-to-br from-slate-600 to-gray-700',
      component: () => import('@/components/apps/Calculator').then(m => m.Calculator)
    },
    {
      id: 'notepad',
      name: 'Notepad',
      icon: FileText,
      color: 'bg-gradient-to-br from-yellow-500 to-amber-600',
      component: () => import('@/components/apps/Notepad').then(m => m.Notepad)
    },
    {
      id: 'chess',
      name: 'Chess',
      icon: Crown,
      color: 'bg-gradient-to-br from-amber-700 to-yellow-800',
      component: () => import('@/components/apps/ChessGame').then(m => m.ChessGame)
    },
    {
      id: 'flappy',
      name: 'Flappy',
      icon: Gamepad2,
      color: 'bg-gradient-to-br from-pink-500 to-rose-600',
      component: () => import('@/components/apps/FlappyGame').then(m => m.FlappyGame)
    },
    {
      id: 'manual',
      name: 'Manual',
      icon: HelpCircle,
      color: 'bg-gradient-to-br from-violet-500 to-purple-600',
      component: () => import('@/components/apps/NyxManual').then(m => m.NyxManual)
    },
    {
      id: 'resonyx',
      name: 'ResoNyx',
      icon: Music,
      color: 'bg-gradient-to-br from-purple-600 to-indigo-700',
      component: () => import('@/components/apps/ResoNyx').then(m => m.ResoNyx)
    }
  ]

  const handleAppLaunch = async (app: typeof mobileApps[0]) => {
    try {
      const AppComponent = await app.component()
      openWindow({
        appId: app.id,
        title: app.name,
        component: AppComponent,
        position: { x: 0, y: 0 },
        size: {
          width: isPhone ? window.innerWidth : window.innerWidth * 0.8,
          height: isPhone ? window.innerHeight : window.innerHeight * 0.8
        },
        mode: isPhone ? 'fullscreen' : 'windowed'
      })
      setShowAppDrawer(false)
    } catch (error) {
      console.error('Failed to load app:', error)
    }
  }
  
  return (
    <div className="absolute inset-0">
      {/* Main App Grid (visible on phones and tablets) */}
      <div className="p-6 pt-12">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {mobileApps.slice(0, isPhone ? 8 : 12).map((app) => (
            <motion.button
              key={app.id}
              onClick={() => handleAppLaunch(app)}
              className={cn(
                "aspect-square rounded-2xl p-4 flex flex-col items-center justify-center text-white shadow-lg",
                app.color,
                "hover:scale-105 active:scale-95 transition-transform pointer-events-auto"
              )}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              <app.icon className="w-8 h-8 mb-2" />
              <span className="text-xs font-medium text-center">{app.name}</span>
            </motion.button>
          ))}
        </div>

        {/* App Drawer Toggle for phones */}
        {isPhone && (
          <motion.button
            onClick={() => setShowAppDrawer(true)}
            className={cn(
              "w-full py-4 rounded-2xl backdrop-blur-md border flex items-center justify-center gap-2 pointer-events-auto",
              settings.mode === 'dark'
                ? "bg-black/40 border-white/10 text-white"
                : "bg-white/40 border-black/10 text-gray-800"
            )}
            whileTap={{ scale: 0.98 }}
          >
            <ChevronUp className="w-5 h-5" />
            <span className="text-sm font-medium">More Apps</span>
          </motion.button>
        )}
      </div>

      {/* App Drawer (slide up from bottom) */}
      <AnimatePresence>
        {showAppDrawer && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowAppDrawer(false)}
            />

            {/* Drawer */}
            <motion.div
              className={cn(
                "absolute bottom-0 left-0 right-0 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto",
                settings.mode === 'dark'
                  ? "bg-gray-900/95 backdrop-blur-xl"
                  : "bg-white/95 backdrop-blur-xl"
              )}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Handle */}
              <div className={cn(
                "w-12 h-1 rounded-full mx-auto mb-6",
                settings.mode === 'dark' ? "bg-white/30" : "bg-gray-400/50"
              )} />

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className={cn(
                  "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5",
                  settings.mode === 'dark' ? "text-gray-400" : "text-gray-500"
                )} />
                <input
                  type="text"
                  placeholder="Search apps..."
                  className={cn(
                    "w-full pl-12 pr-4 py-3 rounded-2xl border",
                    settings.mode === 'dark'
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      : "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500"
                  )}
                />
              </div>

              {/* All Apps Grid */}
              <div className="grid grid-cols-4 gap-4">
                {mobileApps.map((app) => (
                  <motion.button
                    key={app.id}
                    onClick={() => handleAppLaunch(app)}
                    className={cn(
                      "aspect-square rounded-2xl p-4 flex flex-col items-center justify-center text-white shadow-lg",
                      app.color
                    )}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <app.icon className="w-8 h-8 mb-2" />
                    <span className="text-xs font-medium text-center">{app.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
