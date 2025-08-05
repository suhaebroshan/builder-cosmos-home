import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, Tablet, Monitor, ArrowRight, Plus, Lock, Grid3x3 } from 'lucide-react'
import { useDeviceDetection, DeviceType } from '@/hooks/useDeviceDetection'

interface User {
  id: string
  username: string
  displayName: string
  avatar?: string
  passcode?: string
  pattern?: number[]
  authMethod: 'none' | 'passcode' | 'pattern'
}

interface DeviceSetupProps {
  onComplete: (user: User, deviceType: DeviceType) => void
}

const defaultUsers: User[] = [
  {
    id: 'user1',
    username: 'suhaeb',
    displayName: 'Suhaeb',
    avatar: '👤',
    authMethod: 'none'
  },
  {
    id: 'user2',
    username: 'sloka',
    displayName: 'Sloka',
    avatar: '👩‍💻',
    authMethod: 'none'
  }
]

export const DeviceSetupScreen: React.FC<DeviceSetupProps> = ({ onComplete }) => {
  const { deviceInfo } = useDeviceDetection()
  const [step, setStep] = useState<'device' | 'user' | 'auth' | 'complete'>('device')
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop')
  const [users, setUsers] = useState<User[]>(defaultUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserForm, setShowUserForm] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', username: '', avatar: '👤' })
  const [authMethod, setAuthMethod] = useState<'none' | 'passcode' | 'pattern'>('none')
  const [passcode, setPasscode] = useState('')
  const [confirmPasscode, setConfirmPasscode] = useState('')
  const [pattern, setPattern] = useState<number[]>([])
  const [isConfirmingPattern, setIsConfirmingPattern] = useState(false)
  const [confirmPattern, setConfirmPattern] = useState<number[]>([])

  const deviceOptions = [
    {
      type: 'phone' as DeviceType,
      name: 'Mobile Phone',
      description: 'Android-style experience with gestures and smooth animations',
      icon: Smartphone,
      features: ['Gesture Navigation', 'App Drawer', 'Quick Settings', 'Notification Panel']
    },
    {
      type: 'tablet' as DeviceType,
      name: 'Tablet',
      description: '80% mobile + 20% desktop features for the best of both worlds',
      icon: Tablet,
      features: ['Split Screen', 'Floating Apps', 'Desktop Widgets', 'Pen Support']
    },
    {
      type: 'desktop' as DeviceType,
      name: 'Desktop/Laptop',
      description: 'Full desktop experience with windows, multitasking, and shortcuts',
      icon: Monitor,
      features: ['Multiple Windows', 'Keyboard Shortcuts', 'Desktop Icons', 'Taskbar']
    }
  ]

  const patternGrid = Array.from({ length: 9 }, (_, i) => i)

  const handleDeviceSelect = (deviceType: DeviceType) => {
    setSelectedDevice(deviceType)
    setStep('user')
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    if (selectedDevice === 'phone' || selectedDevice === 'tablet') {
      setStep('auth')
    } else {
      onComplete(user, selectedDevice)
    }
  }

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.username) return
    
    const user: User = {
      id: `user-${Date.now()}`,
      username: newUser.username,
      displayName: newUser.name,
      avatar: newUser.avatar,
      authMethod: 'none'
    }
    
    setUsers([...users, user])
    setSelectedUser(user)
    setShowUserForm(false)
    setNewUser({ name: '', username: '', avatar: '👤' })
    
    if (selectedDevice === 'phone' || selectedDevice === 'tablet') {
      setStep('auth')
    } else {
      onComplete(user, selectedDevice)
    }
  }

  const handleAuthSetup = () => {
    if (!selectedUser) return

    let updatedUser = { ...selectedUser, authMethod }

    if (authMethod === 'passcode' && passcode === confirmPasscode && passcode.length >= 4) {
      updatedUser.passcode = passcode
    } else if (authMethod === 'pattern' && pattern.length >= 4) {
      updatedUser.pattern = pattern
    }

    onComplete(updatedUser, selectedDevice)
  }

  const handlePatternDot = (dotIndex: number) => {
    if (isConfirmingPattern) {
      if (!confirmPattern.includes(dotIndex)) {
        setConfirmPattern([...confirmPattern, dotIndex])
      }
    } else {
      if (!pattern.includes(dotIndex)) {
        setPattern([...pattern, dotIndex])
      }
    }
  }

  const completePattern = () => {
    if (!isConfirmingPattern) {
      setIsConfirmingPattern(true)
      setConfirmPattern([])
    } else {
      if (JSON.stringify(pattern) === JSON.stringify(confirmPattern)) {
        setAuthMethod('pattern')
      } else {
        setPattern([])
        setConfirmPattern([])
        setIsConfirmingPattern(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[300] bg-gradient-to-br from-purple-950 via-black to-violet-950 flex items-center justify-center">
      {/* Background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl w-full mx-4">
        <AnimatePresence mode="wait">
          {step === 'device' && (
            <motion.div
              key="device"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="text-center"
            >
              <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-4">
                  Welcome to Nyx OS
                </h1>
                <p className="text-purple-300/70 text-lg">
                  Choose your device type to optimize your experience
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {deviceOptions.map((option) => (
                  <motion.button
                    key={option.type}
                    onClick={() => handleDeviceSelect(option.type)}
                    className="liquid-glass-window rounded-2xl p-6 hover:bg-white/10 transition-all border border-white/10 text-left group"
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <option.icon className="w-12 h-12 text-purple-400 mb-4 group-hover:text-purple-300 transition-colors" />
                    <h3 className="text-white font-semibold text-lg mb-2">{option.name}</h3>
                    <p className="text-purple-300/70 text-sm mb-4">{option.description}</p>
                    <div className="space-y-1">
                      {option.features.map((feature) => (
                        <div key={feature} className="text-purple-200/60 text-xs flex items-center gap-2">
                          <div className="w-1 h-1 bg-purple-400 rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'user' && (
            <motion.div
              key="user"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Select User</h2>
                <p className="text-purple-300/70">Choose your account or create a new one</p>
              </div>

              <div className="grid gap-4 mb-6">
                {users.map((user) => (
                  <motion.button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="liquid-glass-window rounded-xl p-4 hover:bg-white/10 transition-all flex items-center gap-4 group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-700 rounded-full flex items-center justify-center text-2xl">
                      {user.avatar}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium">{user.displayName}</div>
                      <div className="text-purple-300/70 text-sm">@{user.username}</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={() => setShowUserForm(true)}
                className="w-full liquid-glass-window rounded-xl p-4 hover:bg-white/10 transition-all flex items-center justify-center gap-2 border-dashed border-2 border-purple-400/50"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Plus className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300">Create New User</span>
              </motion.button>

              {showUserForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                >
                  <div className="liquid-glass-window rounded-2xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-white font-semibold text-lg mb-4">Create New User</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-purple-300 text-sm mb-2 block">Display Name</label>
                        <input
                          type="text"
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <label className="text-purple-300 text-sm mb-2 block">Username</label>
                        <input
                          type="text"
                          value={newUser.username}
                          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                          className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                          placeholder="Enter username"
                        />
                      </div>
                      <div>
                        <label className="text-purple-300 text-sm mb-2 block">Avatar</label>
                        <div className="flex gap-2">
                          {['👤', '👩‍💻', '👨‍💻', '🧑‍🎨', '👩‍🔬', '👨‍🚀', '🧙‍♀️', '🧙‍♂️'].map((avatar) => (
                            <button
                              key={avatar}
                              onClick={() => setNewUser({ ...newUser, avatar })}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                newUser.avatar === avatar ? 'bg-purple-500/30 border border-purple-400' : 'bg-black/40 hover:bg-purple-500/20'
                              }`}
                            >
                              {avatar}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <button
                          onClick={() => setShowUserForm(false)}
                          className="flex-1 py-2 bg-gray-500/20 text-white rounded-lg hover:bg-gray-500/30 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateUser}
                          className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 'auth' && selectedUser && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Setup Security</h2>
                <p className="text-purple-300/70">Choose how you want to secure your device</p>
              </div>

              <div className="space-y-4 mb-6">
                <button
                  onClick={() => setAuthMethod('none')}
                  className={`w-full p-4 rounded-xl transition-all ${
                    authMethod === 'none'
                      ? 'bg-purple-500/30 border border-purple-400'
                      : 'bg-black/40 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-white font-medium">No Security</div>
                  <div className="text-purple-300/70 text-sm">Quick access without protection</div>
                </button>

                <button
                  onClick={() => setAuthMethod('passcode')}
                  className={`w-full p-4 rounded-xl transition-all ${
                    authMethod === 'passcode'
                      ? 'bg-purple-500/30 border border-purple-400'
                      : 'bg-black/40 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-white font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Passcode
                  </div>
                  <div className="text-purple-300/70 text-sm">4-6 digit numeric code</div>
                </button>

                <button
                  onClick={() => setAuthMethod('pattern')}
                  className={`w-full p-4 rounded-xl transition-all ${
                    authMethod === 'pattern'
                      ? 'bg-purple-500/30 border border-purple-400'
                      : 'bg-black/40 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-white font-medium flex items-center gap-2">
                    <Grid3x3 className="w-4 h-4" />
                    Pattern
                  </div>
                  <div className="text-purple-300/70 text-sm">Draw a pattern to unlock</div>
                </button>
              </div>

              {authMethod === 'passcode' && (
                <div className="space-y-4">
                  <div>
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white text-center text-lg tracking-widest"
                      placeholder="Enter passcode"
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={confirmPasscode}
                      onChange={(e) => setConfirmPasscode(e.target.value)}
                      className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white text-center text-lg tracking-widest"
                      placeholder="Confirm passcode"
                      maxLength={6}
                    />
                  </div>
                </div>
              )}

              {authMethod === 'pattern' && (
                <div className="text-center">
                  <p className="text-purple-300/70 text-sm mb-4">
                    {isConfirmingPattern ? 'Confirm your pattern' : 'Draw your unlock pattern'}
                  </p>
                  <div className="grid grid-cols-3 gap-4 max-w-48 mx-auto mb-4">
                    {patternGrid.map((dot) => (
                      <button
                        key={dot}
                        onClick={() => handlePatternDot(dot)}
                        className={`w-12 h-12 rounded-full border-2 transition-all ${
                          (isConfirmingPattern ? confirmPattern : pattern).includes(dot)
                            ? 'bg-purple-500 border-purple-400'
                            : 'border-purple-500/30 hover:border-purple-400'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPattern([])
                        setConfirmPattern([])
                        setIsConfirmingPattern(false)
                      }}
                      className="flex-1 py-2 bg-gray-500/20 text-white rounded-lg hover:bg-gray-500/30 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={completePattern}
                      disabled={pattern.length < 4}
                      className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {isConfirmingPattern ? 'Confirm' : 'Next'}
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleAuthSetup}
                disabled={
                  authMethod === 'passcode' && (passcode !== confirmPasscode || passcode.length < 4) ||
                  authMethod === 'pattern' && pattern.length < 4 && !isConfirmingPattern
                }
                className="w-full mt-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Nyx OS
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
