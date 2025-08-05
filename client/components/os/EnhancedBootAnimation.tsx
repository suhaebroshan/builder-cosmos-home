import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoginScreen } from './LoginScreen'

interface User {
  id: string
  username: string
  displayName: string
  password: string
  avatar?: string
}

interface EnhancedBootAnimationProps {
  onComplete: (user: User) => void
}

export const EnhancedBootAnimation: React.FC<EnhancedBootAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'moon-drop' | 'logo-fade' | 'boot-sequence' | 'login' | 'complete'>('moon-drop')
  const [progress, setProgress] = useState(0)
  const [currentFact, setCurrentFact] = useState(0)

  const nyxFacts = [
    "Nyx is the Greek goddess of night, making this OS perfect for late-night coding sessions 🌙",
    "This is the smoothest web-based operating system ever created, running at 120fps on modern devices ⚡",
    "Nyx OS features quantum-inspired animations that respond to your emotions and system state ���",
    "The entire OS is built with React 18, TypeScript, and Framer Motion for ultimate performance 🚀",
    "Nyx OS supports multiple instances of the same app - because sometimes you need 5 text editors open 📝",
    "The night theme isn't just aesthetic - it reduces eye strain and improves focus during extended use 👁️",
    "Nyx OS adapts to your device: desktop mode on PC, tablet mode on iPads, mobile mode on phones 📱",
    "Sam AI is powered by advanced language models and can actually help you be more productive 🤖",
    "Every animation in Nyx OS is physics-based for the most natural feel possible 🎯",
    "The live wallpaper features real astronomical data and night sky phenomena ⭐"
  ]
  
  useEffect(() => {
    const timeline = async () => {
      // Phase 1: Moon drops down slowly (3-4 seconds)
      await new Promise(resolve => setTimeout(resolve, 3500))
      setPhase('logo-fade')
      
      // Phase 2: Logo fades in (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setPhase('boot-sequence')
      
      // Phase 3: Boot sequence with progress bar (4 seconds to show more facts)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 1000) {
            clearInterval(progressInterval)
            setTimeout(() => setPhase('login'), 500)
            return 1000
          }
          return prev + 1 // Increment by 1 every 4ms (4000ms total)
        })
      }, 4)

      // Cycle through facts every 1.2 seconds during boot
      const factInterval = setInterval(() => {
        setCurrentFact(prev => (prev + 1) % nyxFacts.length)
      }, 1200)

      // Clear fact interval when boot is complete
      setTimeout(() => {
        clearInterval(factInterval)
      }, 4500)
    }
    
    timeline()
  }, [])
  
  const handleLogin = (user: User) => {
    setPhase('complete')
    setTimeout(() => onComplete(user), 1000)
  }
  
  if (phase === 'complete') return null
  
  if (phase === 'login') {
    return <LoginScreen onLogin={handleLogin} />
  }
  
  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'complete' ? 0 : 1 }}
      transition={{ duration: phase === 'complete' ? 0.5 : 0 }}
    >
      {/* Starfield background */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0.3, 1, 0.5],
              scale: [0.5, 1, 0.8, 1.2, 0.7],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Moon Drop Phase */}
      <AnimatePresence>
        {phase === 'moon-drop' && (
          <motion.div
            className="relative"
            initial={{ y: -300, opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              duration: 3.5, 
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-300/30 to-gray-500/40" />
                
                {/* Craters */}
                <div className="absolute top-6 left-8 w-4 h-4 rounded-full bg-gray-500/60" />
                <div className="absolute top-12 right-10 w-3 h-3 rounded-full bg-gray-600/50" />
                <div className="absolute bottom-8 left-12 w-6 h-6 rounded-full bg-gray-500/70" />
                <div className="absolute bottom-10 right-12 w-2 h-2 rounded-full bg-gray-700/60" />
                <div className="absolute top-16 left-16 w-2.5 h-2.5 rounded-full bg-gray-600/40" />
                
                <div className="absolute inset-0 rounded-full shadow-[0_0_80px_rgba(255,255,255,0.4)]" />
              </div>
              
              <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl scale-150" />
              <div className="absolute inset-0 rounded-full bg-purple-400/20 blur-xl scale-125" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo Fade Phase */}
      <AnimatePresence>
        {phase === 'logo-fade' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="text-center">
              <motion.div
                className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600 bg-clip-text text-transparent mb-4 tracking-wider"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                NYX OS
              </motion.div>
              <motion.div
                className="text-lg text-purple-300/80 tracking-[0.3em] uppercase font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                Quantum Operating System
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boot Sequence Phase */}
      <AnimatePresence>
        {phase === 'boot-sequence' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent mb-2">
                NYX OS
              </div>
              <div className="text-sm text-purple-300/60 tracking-widest">
                INITIALIZING QUANTUM SYSTEMS
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-96 mb-8">
              <div className="flex justify-between text-xs text-purple-300/70 mb-3">
                <span>System initialization...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-purple-900/30 rounded-full h-2 overflow-hidden border border-purple-500/30">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-violet-400 to-purple-400 relative"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                >
                  {/* Animated shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              </div>
            </div>
            
            {/* System status messages */}
            <div className="space-y-2 text-xs text-purple-300/60 font-mono text-center mb-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 20 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ✓ Quantum processors: Online
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 40 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ✓ Neural networks: Synchronized
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 60 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ✓ AI subsystems: Active
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 80 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ✓ Security protocols: Enabled
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: progress >= 100 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ✓ System ready - Awaiting authentication
              </motion.div>
            </div>

            {/* Nyx OS Facts */}
            <div className="max-w-2xl mx-auto px-8">
              <div className="text-center">
                <div className="text-xs text-purple-400/80 uppercase tracking-widest mb-3 font-semibold">
                  Did you know?
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFact}
                    className="text-sm text-purple-200/90 leading-relaxed min-h-[3rem] flex items-center justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    {nyxFacts[currentFact]}
                  </motion.div>
                </AnimatePresence>

                {/* Fact indicators */}
                <div className="flex justify-center gap-2 mt-4">
                  {nyxFacts.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                        index === currentFact ? 'bg-purple-400' : 'bg-purple-700/50'
                      }`}
                      animate={{
                        scale: index === currentFact ? 1.2 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
