import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoginScreen } from './LoginScreen'
import { usePerformanceManager } from '@/hooks/usePerformanceManager'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'

interface User {
  id: string
  username: string
  displayName: string
  password: string
  avatar?: string
}

interface OptimizedBootAnimationProps {
  onComplete: (user: User) => void
}

export const OptimizedBootAnimation: React.FC<OptimizedBootAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'moon-drop' | 'logo-fade' | 'boot-sequence' | 'login' | 'complete'>('moon-drop')
  const [progress, setProgress] = useState(0)
  const [currentFact, setCurrentFact] = useState(0)
  const { profile, isLowPerformance } = usePerformanceManager()
  const { isPhone, isTablet } = useDeviceDetection()

  // Adaptive facts based on device
  const getNyxFacts = () => {
    const baseFacts = [
      "Nyx OS adapts to your device for optimal performance ⚡",
      "Smart memory management keeps everything running smoothly 🧠",
      "Dynamic quality scaling ensures 60fps on any device 🎯",
      "Progressive loading optimizes startup time 🚀",
    ]

    if (isPhone) {
      return [
        ...baseFacts,
        "Mobile-optimized animations for smooth touch interactions 📱",
        "Battery-aware performance scaling extends device life 🔋",
        "Gesture-based navigation feels natural and responsive 👆",
      ]
    }

    if (isTablet) {
      return [
        ...baseFacts,
        "Hybrid interface combines mobile fluidity with desktop power 💪",
        "Multi-window support optimized for tablet workflows 📋",
        "Touch and cursor inputs work seamlessly together ✨",
      ]
    }

    return [
      ...baseFacts,
      "Full desktop experience with advanced multitasking 🖥️",
      "Professional window management with snapping and tiling 📐",
      "Keyboard shortcuts for power user productivity ⌨️",
      "Multiple instances of apps for advanced workflows 🔄",
    ]
  }

  const nyxFacts = getNyxFacts()
  
  useEffect(() => {
    const timeline = async () => {
      // Phase 1: Moon drops (faster on low-end devices)
      const moonDuration = isLowPerformance ? 2000 : 3500
      await new Promise(resolve => setTimeout(resolve, moonDuration))
      setPhase('logo-fade')
      
      // Phase 2: Logo fades in (faster on low-end)
      const logoFadeDuration = isLowPerformance ? 1000 : 2000
      await new Promise(resolve => setTimeout(resolve, logoFadeDuration))
      setPhase('boot-sequence')
      
      // Phase 3: Boot sequence with optimized timing
      const bootDuration = isLowPerformance ? 2000 : 3000
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            setTimeout(() => setPhase('login'), 500)
            return 100
          }
          return prev + (100 / (bootDuration / 50)) // Smooth increment to exactly 100%
        })
      }, 50)

      // Cycle through facts (slower on low-end to reduce animation overhead)
      const factInterval = setInterval(() => {
        setCurrentFact(prev => (prev + 1) % nyxFacts.length)
      }, isLowPerformance ? 2000 : 1200)

      // Clear intervals
      setTimeout(() => {
        clearInterval(factInterval)
      }, bootDuration + 500)
    }
    
    timeline()
  }, [isLowPerformance, nyxFacts.length])
  
  const handleLogin = (user: User) => {
    setPhase('complete')
    setTimeout(() => onComplete(user), 1000)
  }
  
  if (phase === 'complete') return null
  
  if (phase === 'login') {
    return <LoginScreen onLogin={handleLogin} />
  }
  
  // Adaptive particle count based on performance
  const starCount = profile.enableParticles ? Math.min(profile.particleCount, 50) : 20
  const particleCount = profile.enableParticles ? Math.min(profile.particleCount / 5, 20) : 10
  
  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'complete' ? 0 : 1 }}
      transition={{ duration: profile.useReducedMotion ? 0.2 : 0.5 }}
    >
      {/* Adaptive Starfield */}
      {profile.enableParticles && (
        <div className="absolute inset-0">
          {Array.from({ length: starCount }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={profile.useReducedMotion ? {} : {
                opacity: [0, 1, 0.3, 1, 0.5],
                scale: [0.5, 1, 0.8, 1.2, 0.7],
              }}
              transition={{
                duration: profile.useReducedMotion ? 2 : 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Moon Drop Phase */}
      <AnimatePresence>
        {phase === 'moon-drop' && (
          <motion.div
            className="relative"
            initial={{ y: isLowPerformance ? -200 : -300, opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              duration: profile.animationDuration / 1000 * 3.5,
              ease: profile.useReducedMotion ? 'easeOut' : [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-300/30 to-gray-500/40" />
                
                {/* Simplified craters for performance */}
                <div className="absolute top-6 left-8 w-4 h-4 rounded-full bg-gray-500/60" />
                <div className="absolute top-12 right-10 w-3 h-3 rounded-full bg-gray-600/50" />
                <div className="absolute bottom-8 left-12 w-6 h-6 rounded-full bg-gray-500/70" />
                <div className="absolute bottom-10 right-12 w-2 h-2 rounded-full bg-gray-700/60" />
                
                {profile.shadowQuality !== 'none' && (
                  <div className="absolute inset-0 rounded-full shadow-[0_0_80px_rgba(255,255,255,0.4)]" />
                )}
              </div>
              
              {profile.enableAdvancedEffects && (
                <>
                  <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl scale-150" />
                  <div className="absolute inset-0 rounded-full bg-purple-400/20 blur-xl scale-125" />
                </>
              )}
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
            transition={{ duration: profile.animationDuration / 1000 }}
          >
            <div className="text-center">
              <motion.div
                className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600 bg-clip-text text-transparent mb-4 tracking-wider"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: profile.animationDuration / 1000, 
                  delay: profile.useReducedMotion ? 0.1 : 0.3 
                }}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                NYX OS
              </motion.div>
              <motion.div
                className="text-lg text-purple-300/80 tracking-[0.3em] uppercase font-light"
                initial={{ opacity: 0, y: profile.useReducedMotion ? 10 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: profile.useReducedMotion ? 0.3 : 0.8, 
                  duration: profile.animationDuration / 1000 * 0.8 
                }}
              >
                {profile.name.toUpperCase()} Performance Mode
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
                OPTIMIZING FOR {profile.name.toUpperCase()} PERFORMANCE
              </div>
            </div>
            
            {/* Optimized Progress Bar */}
            <div className="w-96 mb-8">
              <div className="flex justify-between text-xs text-purple-300/70 mb-3">
                <span>System initialization...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-purple-900/30 rounded-full h-2 overflow-hidden border border-purple-500/30">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-violet-400 to-purple-400 relative"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                >
                  {/* Shimmer effect (only on high performance) */}
                  {profile.enableAdvancedEffects && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </motion.div>
              </div>
            </div>
            
            {/* System status messages - Adaptive based on progress */}
            <div className="space-y-2 text-xs text-purple-300/60 font-mono text-center mb-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 20 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ✓ Device capabilities: Detected ({profile.name})
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 40 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ✓ Performance profile: Configured
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 60 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ✓ Memory optimization: {profile.memoryOptimization ? 'Enabled' : 'Disabled'}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 80 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ✓ GPU acceleration: {profile.enableGPUAcceleration ? 'Active' : 'Disabled'}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: progress >= 100 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ✓ System ready - Awaiting authentication
              </motion.div>
            </div>

            {/* Adaptive Facts Display */}
            <div className="max-w-2xl mx-auto px-8">
              <div className="text-center">
                <div className="text-xs text-purple-400/80 uppercase tracking-widest mb-3 font-semibold">
                  Optimization Info
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFact}
                    className="text-sm text-purple-200/90 leading-relaxed min-h-[3rem] flex items-center justify-center"
                    initial={{ opacity: 0, y: profile.useReducedMotion ? 5 : 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: profile.useReducedMotion ? -5 : -20 }}
                    transition={{ 
                      duration: profile.useReducedMotion ? 0.3 : 0.6, 
                      ease: "easeOut" 
                    }}
                  >
                    {nyxFacts[currentFact]}
                  </motion.div>
                </AnimatePresence>

                {/* Fact indicators - Only show on high performance */}
                {profile.enableAdvancedEffects && (
                  <div className="flex justify-center gap-2 mt-4">
                    {nyxFacts.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                          index === currentFact ? 'bg-purple-400' : 'bg-purple-700/50'
                        }`}
                        animate={!profile.useReducedMotion && index === currentFact ? {
                          scale: 1.2,
                        } : {}}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient particles - Only on high performance */}
      {profile.enableParticles && profile.enableAdvancedEffects && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: particleCount }).map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={profile.useReducedMotion ? {} : {
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
      )}
    </motion.div>
  )
}
