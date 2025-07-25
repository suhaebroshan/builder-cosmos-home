import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { WindowManager } from '@/components/window/WindowManager'
import { Taskbar } from '@/components/os/Taskbar'
import { Desktop } from '@/components/os/Desktop'
import { BootAnimation } from '@/components/os/BootAnimation'
import { SpaceWallpaper } from '@/components/os/SpaceWallpaper'
import { useSamStore } from '@/store/sam-store'

export const NyxOS: React.FC = () => {
  const { currentEmotion, emotionIntensity } = useSamStore()
  const [isBooted, setIsBooted] = useState(false)

  const handleBootComplete = () => {
    setIsBooted(true)
  }
  
  const getBackgroundGradient = () => {
    const intensity = emotionIntensity * 0.3
    switch (currentEmotion) {
      case 'happy':
        return `radial-gradient(circle at 20% 50%, rgba(34, 197, 94, ${intensity}) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, ${intensity * 0.5}) 0%, transparent 50%)`
      case 'sad':
        return `radial-gradient(circle at 30% 40%, rgba(59, 130, 246, ${intensity}) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(99, 102, 241, ${intensity * 0.5}) 0%, transparent 50%)`
      case 'excited':
        return `radial-gradient(circle at 50% 50%, rgba(251, 191, 36, ${intensity}) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(249, 115, 22, ${intensity * 0.7}) 0%, transparent 50%)`
      case 'annoyed':
        return `radial-gradient(circle at 60% 30%, rgba(239, 68, 68, ${intensity}) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(220, 38, 38, ${intensity * 0.6}) 0%, transparent 50%)`
      case 'focused':
        return `radial-gradient(circle at 40% 20%, rgba(168, 85, 247, ${intensity}) 0%, transparent 50%), radial-gradient(circle at 80% 60%, rgba(139, 92, 246, ${intensity * 0.8}) 0%, transparent 50%)`
      case 'confused':
        return `radial-gradient(circle at 50% 50%, rgba(156, 163, 175, ${intensity}) 0%, transparent 50%)`
      case 'tired':
        return `radial-gradient(circle at 30% 70%, rgba(75, 85, 99, ${intensity}) 0%, transparent 50%)`
      default:
        return `radial-gradient(circle at 50% 50%, rgba(71, 85, 105, ${intensity * 0.3}) 0%, transparent 50%)`
    }
  }
  
  if (!isBooted) {
    return <BootAnimation onComplete={handleBootComplete} />
  }

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Space Wallpaper */}
      <SpaceWallpaper />

      {/* Emotional Overlay */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out pointer-events-none"
        style={{
          background: getBackgroundGradient(),
        }}
      />

      {/* Emotion Indicator */}
      <motion.div
        className="absolute top-8 right-8 text-white/80 text-sm z-30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-xl border border-white/30 rounded-2xl px-4 py-2 shadow-lg shadow-black/20">
          <div
            className="w-3 h-3 rounded-full transition-all duration-300"
            style={{
              backgroundColor: currentEmotion === 'happy' ? '#22c55e' :
                             currentEmotion === 'sad' ? '#3b82f6' :
                             currentEmotion === 'excited' ? '#fbbf24' :
                             currentEmotion === 'annoyed' ? '#ef4444' :
                             currentEmotion === 'focused' ? '#a855f7' :
                             currentEmotion === 'confused' ? '#9ca3af' :
                             currentEmotion === 'tired' ? '#4b5563' : '#475569',
              boxShadow: `0 0 10px currentColor`,
            }}
          />
          <span className="capitalize">{currentEmotion}</span>
        </div>
      </motion.div>

      {/* Desktop with App Icons */}
      <Desktop />

      {/* Window Manager */}
      <WindowManager />

      {/* Taskbar */}
      <Taskbar />
    </motion.div>
  )
}
