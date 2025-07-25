import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Eye, EyeOff, Users } from 'lucide-react'

interface User {
  id: string
  username: string
  displayName: string
  password: string
  avatar?: string
}

interface LoginScreenProps {
  onLogin: (user: User) => void
}

const defaultUsers: User[] = [
  {
    id: 'user1',
    username: 'suhaeb',
    displayName: 'Suhaeb',
    password: 'Suhaeb_1',
    avatar: '👤'
  },
  {
    id: 'user2', 
    username: 'sloka',
    displayName: 'Sloka',
    password: 'slayka@0',
    avatar: '👩‍💻'
  }
]

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState(defaultUsers[0])
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState('')
  const [showUserSwitcher, setShowUserSwitcher] = useState(false)

  const handleLogin = async () => {
    if (password === selectedUser.password) {
      setIsLoggingIn(true)
      setError('')
      
      // Simulate login process
      setTimeout(() => {
        onLogin(selectedUser)
      }, 1500)
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="fixed inset-0 z-[300] bg-gradient-to-br from-purple-950 via-black to-violet-950 flex items-center justify-center">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            NYX OS
          </motion.div>
          <motion.div
            className="text-purple-300/70 text-sm tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            QUANTUM AUTHENTICATION
          </motion.div>
        </div>

        {!isLoggingIn ? (
          <>
            {/* User Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-purple-600 to-violet-700 rounded-full flex items-center justify-center text-2xl cursor-pointer"
                    onClick={() => setShowUserSwitcher(!showUserSwitcher)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {selectedUser.avatar}
                  </motion.div>
                  
                  <button
                    onClick={() => setShowUserSwitcher(!showUserSwitcher)}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors"
                  >
                    <Users className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-white text-xl font-medium">{selectedUser.displayName}</h2>
                <p className="text-purple-300/70 text-sm">@{selectedUser.username}</p>
              </div>

              {/* User Switcher */}
              <AnimatePresence>
                {showUserSwitcher && (
                  <motion.div
                    className="absolute top-full left-0 right-0 bg-black/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 mt-2 z-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <h3 className="text-purple-300 text-sm font-medium mb-3">Switch User</h3>
                    <div className="space-y-2">
                      {defaultUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            setSelectedUser(user)
                            setPassword('')
                            setError('')
                            setShowUserSwitcher(false)
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-purple-800/20 rounded-lg transition-colors text-left"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-700 rounded-full flex items-center justify-center">
                            {user.avatar}
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium">{user.displayName}</div>
                            <div className="text-purple-300/70 text-xs">@{user.username}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Password Input */}
            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter password"
                  maxLength={8}
                  className="w-full bg-black/30 border border-purple-500/30 rounded-xl pl-12 pr-12 py-3 text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none transition-all"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <motion.div
                  className="text-red-400 text-sm text-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                onClick={handleLogin}
                disabled={!password}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all"
                whileHover={{ scale: password ? 1.02 : 1 }}
                whileTap={{ scale: password ? 0.98 : 1 }}
              >
                Sign In
              </motion.button>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-purple-300/60 text-xs">
                Demo: suhaeb/Suhaeb_1 or sloka/slayka@0
              </p>
            </div>
          </>
        ) : (
          /* Login Progress */
          <div className="text-center py-8">
            <motion.div
              className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <div className="text-white font-medium mb-2">
              Authenticating {selectedUser.displayName}...
            </div>
            <div className="text-purple-300/70 text-sm">
              Initializing quantum encryption
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
