import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BootAnimationProps {
  onComplete: () => void
}

export const BootAnimation: React.FC<BootAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'fade-in' | 'zoom-in' | 'fade-out' | 'complete'>('fade-in')
  
  useEffect(() => {
    const timeline = async () => {
      // Phase 1: Moon fades in (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setPhase('zoom-in')
      
      // Phase 2: Zoom into moon and show text (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setPhase('fade-out')
      
      // Phase 3: Fade out (1 second)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPhase('complete')
      onComplete()
    }
    
    timeline()
  }, [onComplete])
  
  if (phase === 'complete') return null
  
  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'fade-out' ? 0 : 1 }}
      transition={{ duration: phase === 'fade-out' ? 1 : 0 }}
    >
      <div className="relative">
        {/* Moon */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{
            opacity: phase === 'fade-in' ? 1 : phase === 'zoom-in' ? 1 : 0,
            scale: phase === 'fade-in' ? 1 : phase === 'zoom-in' ? 3 : 3,
          }}
          transition={{
            duration: phase === 'fade-in' ? 2 : phase === 'zoom-in' ? 2 : 1,
            ease: "easeInOut"
          }}
        >
          {/* Moon circle with craters */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 relative overflow-hidden shadow-2xl">
            {/* Moon surface texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-300/20 to-gray-500/30" />
            
            {/* Craters */}
            <div className="absolute top-4 left-6 w-3 h-3 rounded-full bg-gray-500/40" />
            <div className="absolute top-8 right-5 w-2 h-2 rounded-full bg-gray-600/30" />
            <div className="absolute bottom-6 left-8 w-4 h-4 rounded-full bg-gray-500/50" />
            <div className="absolute bottom-8 right-8 w-2 h-2 rounded-full bg-gray-600/40" />
            <div className="absolute top-12 left-12 w-1.5 h-1.5 rounded-full bg-gray-700/30" />
            
            {/* Moon glow */}
            <div className="absolute inset-0 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.3)]" />
          </div>
          
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-white/10 blur-xl scale-150" />
        </motion.div>
        
        {/* Nyx OS Text */}
        <AnimatePresence>
          {phase === 'zoom-in' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-4xl font-bold text-gray-800 mb-2 tracking-wider"
                  initial={{ letterSpacing: "0.1em" }}
                  animate={{ letterSpacing: "0.2em" }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  NYX OS
                </motion.div>
                <motion.div
                  className="text-sm text-gray-700 tracking-widest uppercase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  Sentient Operating System
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Stars in background */}
        <div className="fixed inset-0 -z-10">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.3, 1, 0.5] }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
