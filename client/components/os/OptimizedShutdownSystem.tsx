import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Power, RotateCcw, Loader2, Moon, Sun, Zap, Battery } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePerformanceManager } from '@/hooks/usePerformanceManager'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'

interface OptimizedShutdownSystemProps {
  children: React.ReactNode
}

type SystemState = 'running' | 'shutting-down' | 'shutdown' | 'starting-up'

export const OptimizedShutdownSystem: React.FC<OptimizedShutdownSystemProps> = ({ children }) => {
  const [systemState, setSystemState] = useState<SystemState>('running')
  const [shutdownProgress, setShutdownProgress] = useState(0)
  const [startupProgress, setStartupProgress] = useState(0)
  const [keyPressCount, setKeyPressCount] = useState(0)
  const [clickCount, setClickCount] = useState(0)
  const [lastKeyPress, setLastKeyPress] = useState(0)
  const [lastClick, setLastClick] = useState(0)
  const [shutdownMessage, setShutdownMessage] = useState('Saving your universe...')
  
  const { profile, performanceStats, optimizeMemory } = usePerformanceManager()
  const { isPhone, isTablet } = useDeviceDetection()

  const getShutdownMessages = () => {
    const baseMessages = [
      'Saving your universe...',
      'Optimizing memory usage...',
      'Closing applications...',
      'Securing system state...',
    ]

    if (profile.memoryOptimization) {
      return [
        ...baseMessages,
        'Cleaning up memory...',
        'Optimizing performance...',
        'Preparing for sleep mode...',
        'Nyx is resting...'
      ]
    }

    return [
      ...baseMessages,
      'Closing cosmic portals...',
      'Backing up quantum memories...',
      'Powering down stellar engines...',
      'Synchronizing with the void...',
      'Nyx is going to sleep...'
    ]
  }

  const getStartupMessages = () => {
    const baseMessages = [
      'Awakening from the void...',
      'Loading system components...',
      'Restoring session state...',
      'Initializing applications...',
    ]

    if (profile.memoryOptimization) {
      return [
        ...baseMessages,
        'Optimizing memory allocation...',
        'Loading performance profile...',
        'System ready!',
        'Welcome back!'
      ]
    }

    return [
      ...baseMessages,
      'Establishing stellar connections...',
      'Activating AI consciousness...',
      'Opening portals to infinity...',
      'Nyx is awakening...',
      'Welcome back to the universe!'
    ]
  }

  const shutdownMessages = getShutdownMessages()
  const startupMessages = getStartupMessages()

  // Cool shutdown animation with system optimization
  const initiateShutdown = useCallback(() => {
    if (systemState !== 'running') return
    
    // Pre-shutdown optimization
    optimizeMemory()
    
    setSystemState('shutting-down')
    setShutdownProgress(0)
    
    const shutdownSequence = async () => {
      const duration = profile.useReducedMotion ? 3000 : 4000
      const steps = 100
      const stepDuration = duration / steps
      
      for (let i = 0; i <= 100; i++) {
        await new Promise(resolve => setTimeout(resolve, stepDuration))
        setShutdownProgress(i)
        
        // Update message at intervals
        const messageIndex = Math.floor((i / 100) * (shutdownMessages.length - 1))
        setShutdownMessage(shutdownMessages[messageIndex])
        
        // Simulate system tasks
        if (i === 25) {
          window.dispatchEvent(new CustomEvent('nyx:save-state'))
        }
        if (i === 50) {
          window.dispatchEvent(new CustomEvent('nyx:close-apps'))
        }
        if (i === 75) {
          window.dispatchEvent(new CustomEvent('nyx:cleanup-memory'))
        }
      }
      
      setTimeout(() => {
        setSystemState('shutdown')
        setKeyPressCount(0)
        setClickCount(0)
      }, 500)
    }
    
    shutdownSequence()
  }, [systemState, optimizeMemory, profile.useReducedMotion, shutdownMessages])

  // Optimized startup with performance profiling
  const initiateStartup = useCallback(() => {
    if (systemState !== 'shutdown') return
    
    setSystemState('starting-up')
    setStartupProgress(0)
    
    const startupSequence = async () => {
      const duration = profile.useReducedMotion ? 2000 : 3000
      const steps = 100
      const stepDuration = duration / steps
      
      for (let i = 0; i <= 100; i++) {
        await new Promise(resolve => setTimeout(resolve, stepDuration))
        setStartupProgress(i)
        
        // Update message at intervals
        const messageIndex = Math.floor((i / 100) * (startupMessages.length - 1))
        
        // System initialization tasks
        if (i === 20) {
          window.dispatchEvent(new CustomEvent('nyx:detect-performance'))
        }
        if (i === 40) {
          window.dispatchEvent(new CustomEvent('nyx:load-profile'))
        }
        if (i === 60) {
          window.dispatchEvent(new CustomEvent('nyx:restore-state'))
        }
        if (i === 80) {
          window.dispatchEvent(new CustomEvent('nyx:optimize-memory'))
        }
      }
      
      setTimeout(() => {
        setSystemState('running')
        setKeyPressCount(0)
        setClickCount(0)
      }, 500)
    }
    
    startupSequence()
  }, [systemState, profile.useReducedMotion, startupMessages])

  // Wake-up detection (optimized for touch devices)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (systemState === 'shutdown' && e.code === 'Space') {
        const now = Date.now()
        
        if (now - lastKeyPress > 2000) {
          setKeyPressCount(1)
        } else {
          setKeyPressCount(prev => prev + 1)
        }
        
        setLastKeyPress(now)
        
        if (keyPressCount >= 2) {
          initiateStartup()
        }
      }
    }

    const handleClick = () => {
      if (systemState === 'shutdown') {
        const now = Date.now()
        
        if (now - lastClick > 2000) {
          setClickCount(1)
        } else {
          setClickCount(prev => prev + 1)
        }
        
        setLastClick(now)
        
        if (clickCount >= 2) {
          initiateStartup()
        }
      }
    }

    // Touch handling for mobile devices
    const handleTouch = () => {
      if (systemState === 'shutdown') {
        handleClick()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    document.addEventListener('click', handleClick)
    document.addEventListener('touchstart', handleTouch)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('touchstart', handleTouch)
    }
  }, [systemState, keyPressCount, clickCount, lastKeyPress, lastClick, initiateStartup])

  // Listen for shutdown events
  useEffect(() => {
    const handleShutdown = () => initiateShutdown()
    window.addEventListener('nyx:shutdown', handleShutdown)
    return () => window.removeEventListener('nyx:shutdown', handleShutdown)
  }, [initiateShutdown])

  // Auto-reset counters
  useEffect(() => {
    if (systemState === 'shutdown') {
      const resetTimer = setTimeout(() => {
        setKeyPressCount(0)
        setClickCount(0)
      }, 3000)
      
      return () => clearTimeout(resetTimer)
    }
  }, [keyPressCount, clickCount, systemState])

  if (systemState === 'running') {
    return <>{children}</>
  }

  const getStarCount = () => {
    if (!profile.enableParticles) return 20
    if (profile.name === 'ultra') return 150
    if (profile.name === 'high') return 100
    if (profile.name === 'medium') return 60
    if (profile.name === 'low') return 30
    return 15
  }

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Shutting Down Animation */}
        {systemState === 'shutting-down' && (
          <motion.div
            key="shutdown"
            className="absolute inset-0 bg-black flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: profile.useReducedMotion ? 0.2 : 0.5 }}
          >
            {/* Adaptive Starfield */}
            {profile.enableParticles && (
              <div className="absolute inset-0">
                {Array.from({ length: getStarCount() }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-0.5 h-0.5 bg-white rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={profile.useReducedMotion ? {} : {\n                      opacity: [1, 0.3, 1, 0],\n                      scale: [1, 0.5, 1, 0],\n                    }}\n                    transition={{\n                      duration: 4,\n                      delay: Math.random() * 2,\n                      ease: 'easeInOut'\n                    }}\n                  />\n                ))}\n              </div>\n            )}\n\n            {/* Main shutdown interface */}\n            <motion.div\n              className=\"text-center z-10\"\n              initial={{ scale: 0.8, opacity: 0 }}\n              animate={{ scale: 1, opacity: 1 }}\n              transition={{ \n                delay: profile.useReducedMotion ? 0.1 : 0.3, \n                duration: profile.animationDuration / 1000 * 0.8 \n              }}\n            >\n              {/* Animated power icon */}\n              <motion.div\n                className=\"mb-8 relative\"\n                animate={profile.useReducedMotion ? {} : { rotate: 360 }}\n                transition={{ \n                  duration: profile.useReducedMotion ? 1 : 3, \n                  repeat: Infinity, \n                  ease: 'linear' \n                }}\n              >\n                <div className=\"w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center relative\">\n                  <Power className=\"w-12 h-12 text-white\" />\n                  {profile.enableAdvancedEffects && (\n                    <>\n                      <div className=\"absolute inset-0 rounded-full bg-red-500/20 animate-pulse\" />\n                      <div className=\"absolute inset-0 rounded-full bg-gradient-to-br from-red-400/40 to-transparent\" />\n                    </>\n                  )}\n                </div>\n              </motion.div>\n\n              <motion.h1\n                className=\"text-4xl font-bold text-white mb-4\"\n                initial={{ y: profile.useReducedMotion ? 10 : 20, opacity: 0 }}\n                animate={{ y: 0, opacity: 1 }}\n                transition={{ delay: profile.useReducedMotion ? 0.2 : 0.6 }}\n              >\n                Shutting Down\n              </motion.h1>\n\n              {/* Performance info */}\n              <motion.div\n                className=\"flex items-center justify-center gap-4 mb-4 text-sm text-gray-400\"\n                initial={{ opacity: 0 }}\n                animate={{ opacity: 1 }}\n                transition={{ delay: 0.4 }}\n              >\n                <div className=\"flex items-center gap-1\">\n                  <Zap className=\"w-4 h-4\" />\n                  <span>{profile.name}</span>\n                </div>\n                <div className=\"flex items-center gap-1\">\n                  <Battery className=\"w-4 h-4\" />\n                  <span>{performanceStats.batteryLevel}%</span>\n                </div>\n                {performanceStats.fps > 0 && (\n                  <div className=\"flex items-center gap-1\">\n                    <span>{performanceStats.fps} FPS</span>\n                  </div>\n                )}\n              </motion.div>\n\n              <motion.p\n                className=\"text-lg text-gray-300 mb-8\"\n                key={shutdownMessage}\n                initial={{ opacity: 0 }}\n                animate={{ opacity: 1 }}\n                transition={{ duration: 0.5 }}\n              >\n                {shutdownMessage}\n              </motion.p>\n\n              {/* Optimized progress bar */}\n              <div className=\"w-96 mx-auto\">\n                <div className=\"flex justify-between text-sm text-gray-400 mb-2\">\n                  <span>Progress</span>\n                  <span>{Math.round(shutdownProgress)}%</span>\n                </div>\n                <div className=\"w-full bg-gray-800 rounded-full h-2 overflow-hidden\">\n                  <motion.div\n                    className=\"h-full bg-gradient-to-r from-red-500 to-orange-500 relative\"\n                    style={{ width: `${shutdownProgress}%` }}\n                    transition={{ duration: 0.1 }}\n                  >\n                    {profile.enableAdvancedEffects && (\n                      <motion.div\n                        className=\"absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent\"\n                        animate={{ x: ['-100%', '100%'] }}\n                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}\n                      />\n                    )}\n                  </motion.div>\n                </div>\n              </div>\n            </motion.div>\n\n            {/* Performance-based particles */}\n            {profile.enableParticles && (\n              <div className=\"absolute inset-0 pointer-events-none\">\n                {Array.from({ length: Math.min(profile.particleCount / 5, 20) }).map((_, i) => (\n                  <motion.div\n                    key={`shutdown-particle-${i}`}\n                    className=\"absolute w-2 h-2 bg-red-400/60 rounded-full\"\n                    style={{\n                      left: `${Math.random() * 100}%`,\n                      top: `${Math.random() * 100}%`,\n                    }}\n                    animate={profile.useReducedMotion ? {} : {\n                      y: [0, -100, -200],\n                      opacity: [0.8, 0.4, 0],\n                      scale: [1, 0.5, 0],\n                    }}\n                    transition={{\n                      duration: 3,\n                      repeat: Infinity,\n                      delay: Math.random() * 2,\n                      ease: 'easeOut',\n                    }}\n                  />\n                ))}\n              </div>\n            )}\n          </motion.div>\n        )}\n\n        {/* Shutdown Screen */}\n        {systemState === 'shutdown' && (\n          <motion.div\n            key=\"shutdown-screen\"\n            className={cn(\n              \"absolute inset-0 bg-black flex flex-col items-center justify-center\",\n              (isPhone || isTablet) ? \"cursor-default\" : \"cursor-pointer\"\n            )}\n            initial={{ opacity: 0 }}\n            animate={{ opacity: 1 }}\n            transition={{ duration: 1 }}\n          >\n            {/* Minimal starfield */}\n            {profile.enableParticles && (\n              <div className=\"absolute inset-0\">\n                {Array.from({ length: Math.min(getStarCount() / 3, 30) }).map((_, i) => (\n                  <motion.div\n                    key={i}\n                    className=\"absolute w-0.5 h-0.5 bg-white/30 rounded-full\"\n                    style={{\n                      left: `${Math.random() * 100}%`,\n                      top: `${Math.random() * 100}%`,\n                    }}\n                    animate={{\n                      opacity: [0.3, 0.7, 0.3],\n                    }}\n                    transition={{\n                      duration: 4 + Math.random() * 2,\n                      repeat: Infinity,\n                      delay: Math.random() * 2,\n                    }}\n                  />\n                ))}\n              </div>\n            )}\n\n            <motion.div\n              className=\"text-center\"\n              initial={{ scale: 0.8, opacity: 0 }}\n              animate={{ scale: 1, opacity: 1 }}\n              transition={{ delay: 0.5, duration: 1 }}\n            >\n              {/* Sleeping moon with performance-aware animation */}\n              <motion.div\n                className=\"mb-8\"\n                animate={profile.useReducedMotion ? {} : { \n                  y: [0, -10, 0],\n                  rotate: [0, 5, 0, -5, 0]\n                }}\n                transition={{ \n                  duration: 6, \n                  repeat: Infinity, \n                  ease: 'easeInOut' \n                }}\n              >\n                <div className=\"w-32 h-32 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 relative overflow-hidden mx-auto\">\n                  {/* Simplified craters for performance */}\n                  <div className=\"absolute top-6 left-8 w-6 h-6 rounded-full bg-gray-600/60\" />\n                  <div className=\"absolute top-16 right-12 w-4 h-4 rounded-full bg-gray-700/50\" />\n                  <div className=\"absolute bottom-8 left-16 w-8 h-8 rounded-full bg-gray-600/70\" />\n                  <div className=\"absolute bottom-12 right-16 w-3 h-3 rounded-full bg-gray-800/60\" />\n                  \n                  {/* Sleeping face */}\n                  <div className=\"absolute inset-0 flex items-center justify-center\">\n                    <div className=\"text-center\">\n                      <div className=\"flex gap-3 mb-2\">\n                        <div className=\"w-2 h-1 bg-gray-700 rounded-full\" />\n                        <div className=\"w-2 h-1 bg-gray-700 rounded-full\" />\n                      </div>\n                      <div className=\"w-4 h-2 border-2 border-gray-700 border-t-0 rounded-b-full\" />\n                    </div>\n                  </div>\n                  \n                  {profile.shadowQuality !== 'none' && (\n                    <div className=\"absolute inset-0 rounded-full shadow-[inset_0_0_50px_rgba(0,0,0,0.3)]\" />\n                  )}\n                </div>\n              </motion.div>\n\n              <h1 className=\"text-3xl font-bold text-white mb-4\">\n                Nyx OS is sleeping\n              </h1>\n              \n              <p className=\"text-gray-400 mb-2\">\n                Running in {profile.name} mode - {performanceStats.batteryLevel}% battery\n              </p>\n\n              <motion.div\n                className=\"text-sm text-gray-500\"\n                animate={profile.useReducedMotion ? {} : { opacity: [0.5, 1, 0.5] }}\n                transition={{ duration: 2, repeat: Infinity }}\n              >\n                {isPhone || isTablet ? 'Tap 3 times to wake up' : 'Press spacebar 3 times or click 3 times to wake up'}\n              </motion.div>\n\n              {/* Wake up progress */}\n              {(keyPressCount > 0 || clickCount > 0) && (\n                <motion.div\n                  className=\"mt-6\"\n                  initial={{ opacity: 0, y: 10 }}\n                  animate={{ opacity: 1, y: 0 }}\n                >\n                  <div className=\"flex justify-center gap-2\">\n                    {Array.from({ length: 3 }).map((_, i) => (\n                      <motion.div\n                        key={i}\n                        className={cn(\n                          \"w-3 h-3 rounded-full\",\n                          i < Math.max(keyPressCount, clickCount)\n                            ? \"bg-purple-400\"\n                            : \"bg-gray-700\"\n                        )}\n                        animate={!profile.useReducedMotion && i < Math.max(keyPressCount, clickCount) ? {\n                          scale: [1, 1.2, 1],\n                          opacity: [1, 0.7, 1]\n                        } : {}}\n                        transition={{ duration: 0.3 }}\n                      />\n                    ))}\n                  </div>\n                  <p className=\"text-xs text-purple-400 mt-2\">\n                    {Math.max(keyPressCount, clickCount)}/3 - Nyx is stirring...\n                  </p>\n                </motion.div>\n              )}\n            </motion.div>\n          </motion.div>\n        )}\n\n        {/* Starting Up Animation */}\n        {systemState === 'starting-up' && (\n          <motion.div\n            key=\"startup\"\n            className=\"absolute inset-0 bg-black flex flex-col items-center justify-center\"\n            initial={{ opacity: 0 }}\n            animate={{ opacity: 1 }}\n            exit={{ opacity: 0 }}\n            transition={{ duration: profile.useReducedMotion ? 0.2 : 0.5 }}\n          >\n            {/* Dynamic starfield */}\n            {profile.enableParticles && (\n              <div className=\"absolute inset-0\">\n                {Array.from({ length: getStarCount() }).map((_, i) => (\n                  <motion.div\n                    key={i}\n                    className=\"absolute w-0.5 h-0.5 bg-white rounded-full\"\n                    style={{\n                      left: `${Math.random() * 100}%`,\n                      top: `${Math.random() * 100}%`,\n                    }}\n                    animate={profile.useReducedMotion ? {} : {\n                      opacity: [0, 1, 0.5, 1],\n                      scale: [0, 1, 0.8, 1.2],\n                    }}\n                    transition={{\n                      duration: 2,\n                      delay: Math.random() * 3,\n                      repeat: Infinity,\n                      ease: 'easeInOut'\n                    }}\n                  />\n                ))}\n              </div>\n            )}\n\n            <motion.div\n              className=\"text-center z-10\"\n              initial={{ scale: 0.8, opacity: 0 }}\n              animate={{ scale: 1, opacity: 1 }}\n              transition={{ \n                delay: profile.useReducedMotion ? 0.1 : 0.2, \n                duration: profile.animationDuration / 1000 * 0.8 \n              }}\n            >\n              {/* Awakening icon */}\n              <motion.div\n                className=\"mb-8 relative\"\n                animate={profile.useReducedMotion ? {} : { \n                  rotate: [0, 10, -10, 0],\n                  y: [0, -5, 0]\n                }}\n                transition={{ \n                  duration: 2, \n                  repeat: Infinity, \n                  ease: 'easeInOut' \n                }}\n              >\n                <div className=\"w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center relative\">\n                  <motion.div\n                    animate={profile.useReducedMotion ? {} : { rotate: 360 }}\n                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}\n                  >\n                    <RotateCcw className=\"w-12 h-12 text-white\" />\n                  </motion.div>\n                  \n                  {profile.enableAdvancedEffects && (\n                    <>\n                      <div className=\"absolute inset-0 rounded-full bg-purple-400/30 animate-ping\" />\n                      <div className=\"absolute inset-0 rounded-full bg-gradient-to-br from-purple-300/60 to-transparent\" />\n                    </>\n                  )}\n                </div>\n              </motion.div>\n\n              <motion.h1\n                className=\"text-4xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-4\"\n                initial={{ y: profile.useReducedMotion ? 10 : 20, opacity: 0 }}\n                animate={{ y: 0, opacity: 1 }}\n                transition={{ delay: profile.useReducedMotion ? 0.2 : 0.5 }}\n              >\n                Awakening Nyx\n              </motion.h1>\n\n              {/* Performance info */}\n              <motion.div\n                className=\"flex items-center justify-center gap-4 mb-4 text-sm text-purple-300\"\n                initial={{ opacity: 0 }}\n                animate={{ opacity: 1 }}\n                transition={{ delay: 0.4 }}\n              >\n                <div className=\"flex items-center gap-1\">\n                  <Zap className=\"w-4 h-4\" />\n                  <span>{profile.name} mode</span>\n                </div>\n                {performanceStats.fps > 0 && (\n                  <div className=\"flex items-center gap-1\">\n                    <span>{performanceStats.fps} FPS</span>\n                  </div>\n                )}\n              </motion.div>\n\n              <motion.p\n                className=\"text-lg text-purple-300 mb-8\"\n                initial={{ opacity: 0 }}\n                animate={{ opacity: 1 }}\n                transition={{ delay: profile.useReducedMotion ? 0.3 : 0.7 }}\n              >\n                {startupMessages[Math.floor(startupProgress / 12.5)] || startupMessages[0]}\n              </motion.p>\n\n              {/* Progress bar */}\n              <div className=\"w-96 mx-auto\">\n                <div className=\"flex justify-between text-sm text-purple-400 mb-2\">\n                  <span>Initialization</span>\n                  <span>{Math.round(startupProgress)}%</span>\n                </div>\n                <div className=\"w-full bg-gray-800 rounded-full h-2 overflow-hidden\">\n                  <motion.div\n                    className=\"h-full bg-gradient-to-r from-purple-500 to-violet-400 relative\"\n                    style={{ width: `${startupProgress}%` }}\n                    transition={{ duration: 0.1 }}\n                  >\n                    {profile.enableAdvancedEffects && (\n                      <motion.div\n                        className=\"absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent\"\n                        animate={{ x: ['-100%', '100%'] }}\n                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}\n                      />\n                    )}\n                  </motion.div>\n                </div>\n              </div>\n            </motion.div>\n\n            {/* Energy particles */}\n            {profile.enableParticles && (\n              <div className=\"absolute inset-0 pointer-events-none\">\n                {Array.from({ length: Math.min(profile.particleCount / 3, 30) }).map((_, i) => (\n                  <motion.div\n                    key={`startup-particle-${i}`}\n                    className=\"absolute w-2 h-2 bg-purple-400/80 rounded-full\"\n                    style={{\n                      left: `${Math.random() * 100}%`,\n                      top: `${Math.random() * 100}%`,\n                    }}\n                    animate={profile.useReducedMotion ? {} : {\n                      y: [100, -100],\n                      x: [0, Math.random() * 200 - 100],\n                      opacity: [0, 1, 0],\n                      scale: [0, 1, 0.5],\n                    }}\n                    transition={{\n                      duration: 3,\n                      repeat: Infinity,\n                      delay: Math.random() * 2,\n                      ease: 'easeOut',\n                    }}\n                  />\n                ))}\n              </div>\n            )}\n          </motion.div>\n        )}\n      </AnimatePresence>\n    </div>\n  )\n}\n\n// Hook to trigger shutdown\nexport const useShutdown = () => {\n  const { optimizeMemory } = usePerformanceManager()\n  \n  const shutdown = useCallback(() => {\n    optimizeMemory()\n    window.dispatchEvent(new CustomEvent('nyx:shutdown'))\n  }, [optimizeMemory])\n\n  return { shutdown }\n}"