import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Stars, Sparkles, Heart, Zap } from 'lucide-react'

interface User {
  id: string
  username: string
  displayName: string
  password: string
  avatar?: string
}

interface IntroCutsceneProps {
  user: User
  onComplete: () => void
}

export const IntroCutscene: React.FC<IntroCutsceneProps> = ({ user, onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState<'welcome' | 'personalized' | 'complete'>('welcome')
  
  useEffect(() => {
    const timeline = async () => {
      // Phase 1: Welcome message (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000))
      setCurrentPhase('personalized')
      
      // Phase 2: Personalized message (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000))
      setCurrentPhase('complete')
      
      // Phase 3: Completion (1 second)
      await new Promise(resolve => setTimeout(resolve, 1000))
      onComplete()
    }
    
    timeline()
  }, [onComplete])

  const getPersonalizedMessage = () => {
    switch (user.username) {
      case 'suhaeb':
        return {
          message: "Welcome back, Chief! Ready to build something insane today?",
          icon: <Zap className="w-8 h-8 text-yellow-400" />,
          gradient: "from-purple-500 via-violet-500 to-purple-600"
        }
      case 'shreya':
        return {
          message: "Hey Shreya! Your pinkish-purple vibe is loading... ✨",
          icon: <Heart className="w-8 h-8 text-pink-400" />,
          gradient: "from-pink-400 via-purple-500 to-pink-600"
        }
      case 'raheel':
        return {
          message: "What's good, Raheel! Time to code like a beast! 🔥",
          icon: <Sparkles className="w-8 h-8 text-blue-400" />,
          gradient: "from-blue-500 via-purple-500 to-violet-600"
        }
      default:
        return {
          message: `Welcome to your digital kingdom, ${user.displayName}!`,
          icon: <Stars className="w-8 h-8 text-purple-400" />,
          gradient: "from-purple-500 via-violet-500 to-purple-600"
        }
    }
  }

  const personalizedContent = getPersonalizedMessage()

  if (currentPhase === 'complete') return null

  return (
    <motion.div
      className="fixed inset-0 z-[400] bg-black flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative text-center z-10">
        <AnimatePresence mode="wait">
          {currentPhase === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* User avatar */}
              <motion.div
                className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-600 to-violet-700 rounded-full flex items-center justify-center text-6xl shadow-2xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              >
                {user.avatar}
              </motion.div>

              {/* Welcome text */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
                  Welcome!
                </h1>
                <p className="text-2xl text-purple-300 tracking-wide">
                  Initializing your Nyx OS experience...
                </p>
              </motion.div>

              {/* Loading animation */}
              <motion.div
                className="flex justify-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-purple-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {currentPhase === 'personalized' && (
            <motion.div
              key="personalized"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Personalized icon */}
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
              >
                {personalizedContent.icon}
              </motion.div>

              {/* Personalized message */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <h2 className={`text-4xl font-bold bg-gradient-to-r ${personalizedContent.gradient} bg-clip-text text-transparent mb-4`}>
                  Hey {user.displayName}!
                </h2>
                <p className="text-xl text-purple-200 max-w-2xl mx-auto leading-relaxed">
                  {personalizedContent.message}
                </p>
              </motion.div>

              {/* Sparkle animation */}
              <motion.div
                className="flex justify-center space-x-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="text-2xl"
                    animate={{
                      rotate: [0, 180, 360],
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut"
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent" />
    </motion.div>
  )
}
