import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Power, RotateCcw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShutdownSystemProps {
  children: React.ReactNode
}

type SystemState = 'running' | 'shutting-down' | 'shutdown' | 'starting-up'

export const ShutdownSystem: React.FC<ShutdownSystemProps> = ({ children }) => {
  const [systemState, setSystemState] = useState<SystemState>('running')
  const [shutdownProgress, setShutdownProgress] = useState(0)
  const [startupProgress, setStartupProgress] = useState(0)
  const [keyPressCount, setKeyPressCount] = useState(0)
  const [clickCount, setClickCount] = useState(0)
  const [lastKeyPress, setLastKeyPress] = useState(0)
  const [lastClick, setLastClick] = useState(0)
  const [shutdownMessage, setShutdownMessage] = useState('Saving your universe...')

  const shutdownMessages = [
    'Saving your universe...',
    'Closing cosmic portals...',
    'Backing up quantum memories...',
    'Securing AI consciousness...',
    'Powering down stellar engines...',
    'Archiving night dreams...',
    'Synchronizing with the void...',
    'Nyx is going to sleep...'
  ]

  const startupMessages = [
    'Awakening from the void...',
    'Initializing quantum processors...',
    'Loading cosmic memories...',
    'Establishing stellar connections...',
    'Activating AI consciousness...',
    'Opening portals to infinity...',
    'Nyx is awakening...',
    'Welcome back to the universe!'
  ]

  // Shutdown system
  const initiateShutdown = useCallback(() => {
    if (systemState !== 'running') return
    
    setSystemState('shutting-down')
    setShutdownProgress(0)
    
    // Shutdown sequence
    const shutdownSequence = async () => {
      for (let i = 0; i <= 100; i += 2) {
        await new Promise(resolve => setTimeout(resolve, 80))
        setShutdownProgress(i)
        
        // Change message every 25%
        if (i % 25 === 0 && i > 0) {
          const messageIndex = Math.floor(i / 25) - 1
          if (messageIndex < shutdownMessages.length) {
            setShutdownMessage(shutdownMessages[messageIndex])
          }
        }
      }
      
      // Final shutdown
      setTimeout(() => {
        setSystemState('shutdown')
        setKeyPressCount(0)
        setClickCount(0)
      }, 500)
    }
    
    shutdownSequence()
  }, [systemState])

  // Startup system
  const initiateStartup = useCallback(() => {
    if (systemState !== 'shutdown') return
    
    setSystemState('starting-up')
    setStartupProgress(0)
    
    // Startup sequence
    const startupSequence = async () => {
      for (let i = 0; i <= 100; i += 3) {
        await new Promise(resolve => setTimeout(resolve, 60))
        setStartupProgress(i)
      }
      
      setTimeout(() => {
        setSystemState('running')
        setKeyPressCount(0)
        setClickCount(0)
      }, 500)
    }
    
    startupSequence()
  }, [systemState])

  // Listen for spacebar presses
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (systemState === 'shutdown' && e.code === 'Space') {
        const now = Date.now()
        
        // Reset counter if more than 2 seconds between presses
        if (now - lastKeyPress > 2000) {
          setKeyPressCount(1)
        } else {
          setKeyPressCount(prev => prev + 1)
        }
        
        setLastKeyPress(now)
        
        // Start up after 3 presses
        if (keyPressCount >= 2) {
          initiateStartup()
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [systemState, keyPressCount, lastKeyPress, initiateStartup])

  // Listen for clicks
  useEffect(() => {
    const handleClick = () => {
      if (systemState === 'shutdown') {
        const now = Date.now()
        
        // Reset counter if more than 2 seconds between clicks
        if (now - lastClick > 2000) {
          setClickCount(1)
        } else {
          setClickCount(prev => prev + 1)
        }
        
        setLastClick(now)
        
        // Start up after 3 clicks
        if (clickCount >= 2) {
          initiateStartup()
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [systemState, clickCount, lastClick, initiateStartup])

  // Listen for shutdown events
  useEffect(() => {
    const handleShutdown = () => {
      initiateShutdown()
    }

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
            transition={{ duration: 0.5 }}
          >
            {/* Starfield background */}
            <div className="absolute inset-0">
              {Array.from({ length: 100 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-0.5 h-0.5 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [1, 0.3, 1, 0],
                    scale: [1, 0.5, 1, 0],
                  }}
                  transition={{
                    duration: 4,
                    delay: Math.random() * 2,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </div>

            {/* Main shutdown interface */}
            <motion.div
              className="text-center z-10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {/* Power icon with spinning effect */}
              <motion.div
                className="mb-8 relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center relative">
                  <Power className="w-12 h-12 text-white" />
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400/40 to-transparent" />
                </div>
              </motion.div>

              <motion.h1
                className="text-4xl font-bold text-white mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Shutting Down
              </motion.h1>

              <motion.p
                className="text-lg text-gray-300 mb-8"
                key={shutdownMessage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {shutdownMessage}
              </motion.p>

              {/* Progress bar */}
              <div className="w-96 mx-auto">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{shutdownProgress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 relative"
                    style={{ width: `${shutdownProgress}%` }}
                    transition={{ duration: 0.1 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={`shutdown-particle-${i}`}
                  className="absolute w-2 h-2 bg-red-400/60 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -100, -200],
                    opacity: [0.8, 0.4, 0],
                    scale: [1, 0.5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Shutdown Screen */}
        {systemState === 'shutdown' && (
          <motion.div
            key="shutdown-screen"
            className="absolute inset-0 bg-black flex flex-col items-center justify-center cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Minimal starfield */}
            <div className="absolute inset-0">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-0.5 h-0.5 bg-white/30 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              {/* Sleeping moon */}
              <motion.div
                className="mb-8"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 relative overflow-hidden mx-auto">
                  {/* Craters */}
                  <div className="absolute top-6 left-8 w-6 h-6 rounded-full bg-gray-600/60" />
                  <div className="absolute top-16 right-12 w-4 h-4 rounded-full bg-gray-700/50" />
                  <div className="absolute bottom-8 left-16 w-8 h-8 rounded-full bg-gray-600/70" />
                  <div className="absolute bottom-12 right-16 w-3 h-3 rounded-full bg-gray-800/60" />
                  
                  {/* Sleeping face */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex gap-3 mb-2">
                        <div className="w-2 h-1 bg-gray-700 rounded-full" />
                        <div className="w-2 h-1 bg-gray-700 rounded-full" />
                      </div>
                      <div className="w-4 h-2 border-2 border-gray-700 border-t-0 rounded-b-full" />
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_0_50px_rgba(0,0,0,0.3)]" />
                </div>
              </motion.div>

              <h1 className="text-3xl font-bold text-white mb-4">
                Nyx OS is sleeping
              </h1>
              
              <p className="text-gray-400 mb-2">
                The goddess of night is resting
              </p>

              <motion.div
                className="text-sm text-gray-500"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Press spacebar 3 times or click 3 times to wake up
              </motion.div>

              {/* Wake up progress */}
              {(keyPressCount > 0 || clickCount > 0) && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className={cn(
                          "w-3 h-3 rounded-full",
                          i < Math.max(keyPressCount, clickCount)
                            ? "bg-purple-400"
                            : "bg-gray-700"
                        )}
                        animate={i < Math.max(keyPressCount, clickCount) ? {
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.7, 1]
                        } : {}}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-purple-400 mt-2">
                    {Math.max(keyPressCount, clickCount)}/3 - Nyx is stirring...
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Starting Up Animation */}
        {systemState === 'starting-up' && (
          <motion.div
            key="startup"
            className="absolute inset-0 bg-black flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Dynamic starfield */}
            <div className="absolute inset-0">
              {Array.from({ length: 150 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-0.5 h-0.5 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0.5, 1],
                    scale: [0, 1, 0.8, 1.2],
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </div>

            <motion.div
              className="text-center z-10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {/* Awakening moon */}
              <motion.div
                className="mb-8 relative"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  y: [0, -5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    <RotateCcw className="w-12 h-12 text-white" />
                  </motion.div>
                  
                  <div className="absolute inset-0 rounded-full bg-purple-400/30 animate-ping" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-300/60 to-transparent" />
                </div>
              </motion.div>

              <motion.h1
                className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Awakening Nyx
              </motion.h1>

              <motion.p
                className="text-lg text-purple-300 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {startupMessages[Math.floor(startupProgress / 12.5)] || startupMessages[0]}
              </motion.p>

              {/* Progress bar */}
              <div className="w-96 mx-auto">
                <div className="flex justify-between text-sm text-purple-400 mb-2">
                  <span>Initialization</span>
                  <span>{startupProgress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-violet-400 relative"
                    style={{ width: `${startupProgress}%` }}
                    transition={{ duration: 0.1 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Energy particles */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={`startup-particle-${i}`}
                  className="absolute w-2 h-2 bg-purple-400/80 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [100, -100],
                    x: [0, Math.random() * 200 - 100],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Hook to trigger shutdown
export const useShutdown = () => {
  const shutdown = useCallback(() => {
    window.dispatchEvent(new CustomEvent('nyx:shutdown'))
  }, [])

  return { shutdown }
}
