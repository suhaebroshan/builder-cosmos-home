import React from 'react'
import { motion } from 'framer-motion'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { useWindowStore } from '@/store/window-store'
import { useThemeStore } from '@/store/theme-store'
import { cn } from '@/lib/utils'

export const MobileHomeScreen: React.FC = () => {
  const { isPhone, isTablet } = useDeviceDetection()
  const { windows } = useWindowStore()
  const { settings } = useThemeStore()

  // Only show on mobile when no fullscreen apps are running
  if (!isPhone && !isTablet) return null
  if (windows.some(w => w.mode === 'fullscreen' && !w.isMinimized)) return null
  
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
          <div className="flex flex-col items-center gap-2 text-white/60">
            <div className="w-1 h-1 bg-white/50 rounded-full" />
            <div className="text-xs text-center">
              Swipe up for apps
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Status bar for mobile */}
      {(isPhone || isTablet) && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-8 bg-black/20 backdrop-blur-sm flex items-center justify-between px-4 text-white/60 text-xs z-40"
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
