import React from 'react'
import { motion } from 'framer-motion'
import { useWindowStore } from '@/store/window-store'
import { useSamStore } from '@/store/sam-store'
import { SamChat } from '@/components/apps/SamChat'
import { CallSam } from '@/components/apps/CallSam'
import { AppForge } from '@/components/apps/AppForge'
import { Files } from '@/components/apps/Files'
import { Calendar } from '@/components/apps/Calendar'
import {
  MessageCircle,
  Phone,
  Folder,
  Wrench,
  Calendar as CalendarIcon,
  Settings,
  Minimize2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Taskbar: React.FC = () => {
  const { openWindow, windows, minimizeWindow, focusWindow } = useWindowStore()
  const { currentEmotion, emotionIntensity } = useSamStore()
  
  const apps = [
    {
      id: 'sam-chat',
      name: 'Sam',
      icon: MessageCircle,
      component: SamChat,
      defaultSize: { width: 400, height: 600 },
      defaultPosition: { x: 100, y: 100 },
    },
    {
      id: 'call-sam',
      name: 'Call Sam',
      icon: Phone,
      component: CallSam,
      defaultSize: { width: 500, height: 600 },
      defaultPosition: { x: 200, y: 100 },
    },
    {
      id: 'files',
      name: 'Files',
      icon: Folder,
      component: Files,
      defaultSize: { width: 700, height: 500 },
      defaultPosition: { x: 150, y: 120 },
    },
    {
      id: 'app-forge',
      name: 'App Forge',
      icon: Wrench,
      component: AppForge,
      defaultSize: { width: 800, height: 600 },
      defaultPosition: { x: 250, y: 80 },
    },
    {
      id: 'calendar',
      name: 'Chrono',
      icon: CalendarIcon,
      component: Calendar,
      defaultSize: { width: 900, height: 600 },
      defaultPosition: { x: 200, y: 50 },
    },
  ]
  
  const openApp = (app: typeof apps[0]) => {
    // Check if app is already open
    const existingWindow = windows.find(w => w.title === app.name)
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        minimizeWindow(existingWindow.id)
      }
      focusWindow(existingWindow.id)
      return
    }
    
    openWindow({
      title: app.name,
      component: app.component,
      position: app.defaultPosition,
      size: app.defaultSize,
    })
  }
  
  const getEmotionGlow = () => {
    const intensity = emotionIntensity * 0.3
    switch (currentEmotion) {
      case 'happy':
        return `0 0 20px rgba(34, 197, 94, ${intensity})`
      case 'sad':
        return `0 0 20px rgba(59, 130, 246, ${intensity})`
      case 'excited':
        return `0 0 20px rgba(251, 191, 36, ${intensity})`
      case 'annoyed':
        return `0 0 20px rgba(239, 68, 68, ${intensity})`
      case 'focused':
        return `0 0 20px rgba(168, 85, 247, ${intensity})`
      default:
        return `0 0 20px rgba(71, 85, 105, ${intensity})`
    }
  }
  
  return (
    <motion.div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <div
        className="flex items-center gap-2 p-3 bg-black/40 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl shadow-black/30"
        style={{ boxShadow: getEmotionGlow() }}
      >
        {apps.map((app) => {
          const Icon = app.icon
          const isOpen = windows.some(w => w.title === app.name && !w.isMinimized)
          
          return (
            <motion.button
              key={app.id}
              onClick={() => openApp(app)}
              className={cn(
                "p-3 rounded-xl transition-all duration-200",
                "hover:bg-white/20 active:scale-95",
                isOpen && "bg-blue-500/30 ring-2 ring-blue-400/30"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon className="w-5 h-5 text-white/90" />
            </motion.button>
          )
        })}
        
        <div className="w-px h-8 bg-white/20 mx-1" />
        
        {/* Minimized windows */}
        {windows
          .filter(w => w.isMinimized)
          .map((window) => (
            <motion.button
              key={window.id}
              onClick={() => minimizeWindow(window.id)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <Minimize2 className="w-4 h-4 text-white/70" />
            </motion.button>
          ))}
      </div>
    </motion.div>
  )
}
