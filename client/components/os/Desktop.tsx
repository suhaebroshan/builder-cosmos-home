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
} from 'lucide-react'

export const Desktop: React.FC = () => {
  const { openWindow, windows, minimizeWindow, focusWindow } = useWindowStore()
  const { setEmotion, addMessage } = useSamStore()
  
  const apps = [
    {
      id: 'sam-chat',
      name: 'Sam',
      icon: MessageCircle,
      component: SamChat,
      defaultSize: { width: 400, height: 600 },
      defaultPosition: { x: 100, y: 100 },
      description: 'Chat with Sam AI'
    },
    {
      id: 'call-sam',
      name: 'Call Sam',
      icon: Phone,
      component: CallSam,
      defaultSize: { width: 500, height: 600 },
      defaultPosition: { x: 200, y: 100 },
      description: 'Voice chat with Sam'
    },
    {
      id: 'files',
      name: 'Files',
      icon: Folder,
      component: Files,
      defaultSize: { width: 700, height: 500 },
      defaultPosition: { x: 150, y: 120 },
      description: 'File manager'
    },
    {
      id: 'app-forge',
      name: 'App Forge',
      icon: Wrench,
      component: AppForge,
      defaultSize: { width: 800, height: 600 },
      defaultPosition: { x: 250, y: 80 },
      description: 'AI-powered app builder'
    },
    {
      id: 'calendar',
      name: 'Chrono',
      icon: CalendarIcon,
      component: Calendar,
      defaultSize: { width: 900, height: 600 },
      defaultPosition: { x: 200, y: 50 },
      description: 'Calendar & scheduling'
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
    
    // Sam reacts to app opening
    if (app.id === 'sam-chat') {
      setTimeout(() => {
        setEmotion('happy', 0.8)
        addMessage("Hey there! Welcome to Nyx OS, bruv. What's good?", 'sam', 'happy')
      }, 500)
    }
  }
  
  return (
    <div className="absolute inset-0 p-8">
      {/* App Grid */}
      <div className="grid grid-cols-6 gap-8 max-w-4xl">
        {apps.map((app, index) => {
          const Icon = app.icon
          const isOpen = windows.some(w => w.title === app.name && !w.isMinimized)
          
          return (
            <motion.div
              key={app.id}
              className="flex flex-col items-center group cursor-pointer"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.1 + 0.5, 
                duration: 0.6,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onDoubleClick={() => openApp(app)}
            >
              {/* App Icon */}
              <motion.div
                className={`relative w-16 h-16 rounded-2xl backdrop-blur-md border border-white/20 flex items-center justify-center mb-3 transition-all duration-200 ${
                  isOpen 
                    ? 'bg-blue-500/30 border-blue-400/50 shadow-lg shadow-blue-500/25' 
                    : 'bg-white/10 hover:bg-white/20 hover:border-white/30'
                }`}
                whileHover={{ 
                  boxShadow: "0 10px 30px rgba(255, 255, 255, 0.1)",
                }}
              >
                <Icon className="w-8 h-8 text-white/90" />
                
                {/* Running indicator */}
                {isOpen && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                )}
                
                {/* Hover glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  whileHover={{ opacity: 1 }}
                />
              </motion.div>
              
              {/* App Name */}
              <motion.div
                className="text-white/90 text-sm font-medium text-center px-2 py-1 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                initial={{ opacity: 0, y: 5 }}
                whileHover={{ opacity: 1, y: 0 }}
              >
                {app.name}
              </motion.div>
              
              {/* App Description Tooltip */}
              <motion.div
                className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 delay-300 pointer-events-none whitespace-nowrap z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
              >
                {app.description}
              </motion.div>
            </motion.div>
          )
        })}
      </div>
      
      {/* Welcome Message */}
      <motion.div
        className="absolute bottom-8 left-8 max-w-md"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-4">
          <h3 className="text-white font-medium mb-2">Welcome to Nyx OS</h3>
          <p className="text-white/70 text-sm">
            Double-click any app to open it. Sam is ready to help you build, chat, and explore this sentient operating system.
          </p>
        </div>
      </motion.div>
      
      {/* System Info */}
      <motion.div
        className="absolute bottom-8 right-8"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-4 text-right">
          <div className="text-white/90 font-medium">Nyx OS v1.0</div>
          <div className="text-white/60 text-sm">Sentient Operating System</div>
          <div className="text-white/40 text-xs mt-1">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
