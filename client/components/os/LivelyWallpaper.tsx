import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

interface LivelyWallpaperProps {
  theme: 'light' | 'dark'
}

export const LivelyWallpaper: React.FC<LivelyWallpaperProps> = ({ theme }) => {
  const [showBird, setShowBird] = useState(false)
  const [showPlane, setShowPlane] = useState(false)
  const [showUFO, setShowUFO] = useState(false)
  const [showBatSignal, setShowBatSignal] = useState(false)

  // Generate static stars that won't change
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 70,
      size: 0.5 + Math.random() * 1.5,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3
    }))
  }, [])

  // Animation triggers for day theme
  useEffect(() => {
    if (theme === 'light') {
      const birdTimer = setInterval(() => {
        setShowBird(true)
        setTimeout(() => setShowBird(false), 5000)
      }, 15000 + Math.random() * 10000)

      const planeTimer = setInterval(() => {
        setShowPlane(true)
        setTimeout(() => setShowPlane(false), 8000)
      }, 20000 + Math.random() * 15000)

      return () => {
        clearInterval(birdTimer)
        clearInterval(planeTimer)
      }
    }
  }, [theme])

  // Animation triggers for dark theme
  useEffect(() => {
    if (theme === 'dark') {
      const ufoTimer = setInterval(() => {
        setShowUFO(true)
        setTimeout(() => setShowUFO(false), 12000)
      }, 25000 + Math.random() * 20000)

      const batSignalTimer = setInterval(() => {
        setShowBatSignal(true)
        setTimeout(() => setShowBatSignal(false), 8000)
      }, 30000 + Math.random() * 25000)

      return () => {
        clearInterval(ufoTimer)
        clearInterval(batSignalTimer)
      }
    }
  }, [theme])

  const DayWallpaper = () => (
    <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-green-100">
      {/* Sun */}
      <motion.div
        className="absolute top-8 right-8 w-16 h-16 bg-yellow-300 rounded-full shadow-lg"
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: [
            '0 0 20px rgba(251, 191, 36, 0.5)',
            '0 0 40px rgba(251, 191, 36, 0.8)',
            '0 0 20px rgba(251, 191, 36, 0.5)'
          ]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        {/* Sun rays */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-6 bg-yellow-400 rounded-full"
            style={{
              left: '50%',
              top: -12,
              transformOrigin: '50% 44px',
              transform: `rotate(${i * 45}deg)`
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </motion.div>

      {/* Clouds */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-20 h-12 bg-white/80 rounded-full"
          style={{
            left: `${20 + i * 25}%`,
            top: `${15 + (i % 2) * 10}%`,
          }}
          animate={{
            x: [0, 50, 0],
          }}
          transition={{
            duration: 30 + i * 10,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          <div className="absolute -left-4 top-2 w-8 h-8 bg-white/80 rounded-full" />
          <div className="absolute -right-4 top-2 w-8 h-8 bg-white/80 rounded-full" />
        </motion.div>
      ))}

      {/* Flying Bird */}
      <AnimatePresence>
        {showBird && (
          <motion.div
            className="absolute top-1/4 text-2xl"
            initial={{ x: -50, y: 0 }}
            animate={{ 
              x: window.innerWidth + 50,
              y: [0, -20, 10, -15, 5]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 5, ease: 'linear' }}
          >
            🦅
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flying Plane */}
      <AnimatePresence>
        {showPlane && (
          <motion.div
            className="absolute top-1/5 text-xl"
            initial={{ x: window.innerWidth + 50 }}
            animate={{ 
              x: -50,
              y: [0, -10, 5, -8, 2]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 8, ease: 'linear' }}
          >
            ✈️
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grass/Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-400 to-green-200" />
    </div>
  )

  const NightWallpaper = () => (
    <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-black">
      {/* Moon */}
      <motion.div
        className="absolute top-8 left-8 w-20 h-20 bg-gray-200 rounded-full relative overflow-hidden"
        animate={{
          boxShadow: [
            '0 0 30px rgba(229, 231, 235, 0.5)',
            '0 0 50px rgba(229, 231, 235, 0.8)',
            '0 0 30px rgba(229, 231, 235, 0.5)'
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {/* Moon craters */}
        <div className="absolute top-3 left-4 w-2 h-2 bg-gray-400 rounded-full" />
        <div className="absolute top-8 right-3 w-1.5 h-1.5 bg-gray-400 rounded-full" />
        <div className="absolute bottom-4 left-6 w-3 h-3 bg-gray-400 rounded-full" />
        
        {/* Bat Signal */}
        <AnimatePresence>
          {showBatSignal && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.7, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 8 }}
            >
              <div className="text-black text-lg">🦇</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Static Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      {/* UFO with Beam */}
      <AnimatePresence>
        {showUFO && (
          <motion.div
            className="absolute top-1/3"
            initial={{ x: -100 }}
            animate={{ x: window.innerWidth + 100 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 12, ease: 'linear' }}
          >
            <div className="relative">
              {/* UFO */}
              <motion.div
                className="text-3xl"
                animate={{ 
                  y: [0, -5, 5, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🛸
              </motion.div>
              
              {/* Beam */}
              <motion.div
                className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[30px] border-r-[30px] border-t-[40px] border-l-transparent border-r-transparent border-t-yellow-300/30"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              
              {/* Cow being abducted */}
              <motion.div
                className="absolute top-16 left-1/2 transform -translate-x-1/2 text-lg"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🐄
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-800 to-gray-600" />
    </div>
  )

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        {theme === 'light' ? (
          <motion.div
            key="day"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <DayWallpaper />
          </motion.div>
        ) : (
          <motion.div
            key="night"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <NightWallpaper />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
