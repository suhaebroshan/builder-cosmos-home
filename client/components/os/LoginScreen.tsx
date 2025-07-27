import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users } from 'lucide-react'

interface User {
  id: string
  username: string
  displayName: string
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
    avatar: '👤'
  },
  {
    id: 'user2',
    username: 'sloka',
    displayName: 'Sloka',
    avatar: '👩‍💻'
  }
]

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState(defaultUsers[0])
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showUserSwitcher, setShowUserSwitcher] = useState(false)

  const handleLogin = async () => {
    setIsLoggingIn(true)

    // Simulate login process
    setTimeout(() => {
      onLogin(selectedUser)
    }, 1500)
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

      {/* User Selection Menu - Bottom Left */}
      <div className="absolute bottom-8 left-8">
        <AnimatePresence>
          {showUserSwitcher && (
            <motion.div
              className="bg-black/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 mb-4 min-w-64"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <h3 className="text-purple-300 text-sm font-medium mb-3">Switch User</h3>
              <div className="space-y-2">
                {defaultUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user)
                      setShowUserSwitcher(false)
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      selectedUser.id === user.id
                        ? 'bg-purple-600/30 border border-purple-500/50'
                        : 'hover:bg-purple-800/20'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-700 rounded-full flex items-center justify-center text-lg">
                      {user.avatar}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{user.displayName}</div>
                      <div className="text-purple-300/70 text-xs">@{user.username}</div>
                    </div>
                    {selectedUser.id === user.id && (
                      <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current User Button */}
        <motion.button
          onClick={() => setShowUserSwitcher(!showUserSwitcher)}
          className="flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-3 hover:bg-black/70 transition-colors group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-700 rounded-full flex items-center justify-center text-lg">
            {selectedUser.avatar}
          </div>
          <div className="text-left">
            <div className="text-white text-sm font-medium">{selectedUser.displayName}</div>
            <div className="text-purple-300/70 text-xs">@{selectedUser.username}</div>
          </div>
          <Users className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
        </motion.button>
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
            {/* Current User Display */}
            <div className="mb-6 text-center">
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-purple-600 to-violet-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
              >
                {selectedUser.avatar}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-white text-xl font-medium mb-1">{selectedUser.displayName}</h2>
                <p className="text-purple-300/70 text-sm">@{selectedUser.username}</p>
              </motion.div>
            </div>

            {/* Sign In Button */}
            <div className="space-y-4">
              <motion.button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-medium py-4 rounded-xl transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign In as {selectedUser.displayName}
              </motion.button>
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
