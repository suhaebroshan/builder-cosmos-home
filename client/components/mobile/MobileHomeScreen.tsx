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
    <div className="absolute inset-0 pointer-events-none">
      {/* Phone home indicator */}
      {isPhone && (
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={cn(
            "flex flex-col items-center gap-2",
            settings.mode === 'dark' ? "text-white/60" : "text-gray-800/70"
          )}>
            <div className={cn(
              "w-1 h-1 rounded-full",
              settings.mode === 'dark' ? "bg-white/50" : "bg-gray-600/50"
            )} />
            <div className="text-xs text-center">
              Swipe up for apps
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Status bar for mobile */}
      {(isPhone || isTablet) && (
        <motion.div
          className={cn(
            "absolute top-0 left-0 right-0 h-8 backdrop-blur-sm flex items-center justify-between px-4 text-xs z-40",
            settings.mode === 'dark'
              ? "bg-black/20 text-white/60"
              : "bg-white/30 text-gray-700/70"
          )}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-green-400 rounded-full" />
            <span>Nyx OS</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <div className="w-6 h-3 border border-white/40 rounded-sm relative">
              <div className="w-4 h-1.5 bg-green-400 rounded-sm absolute top-0.5 left-0.5" />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
