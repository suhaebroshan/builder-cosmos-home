import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Cpu, MemoryStick, Battery, Zap, Gauge } from 'lucide-react'
import { usePerformanceManager } from '@/hooks/usePerformanceManager'
import { cn } from '@/lib/utils'

interface PerformanceMonitorProps {
  className?: string
  showDetailed?: boolean
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className = "",
  showDetailed = false
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetailed)
  const [memoryHistory, setMemoryHistory] = useState<number[]>([])
  const [fpsHistory, setFpsHistory] = useState<number[]>([])
  const [bubble, setBubble] = useState(false)
  const [pos, setPos] = useState<{x:number;y:number}>({ x: 16, y: 16 })
  
  const { 
    profile, 
    currentProfile, 
    performanceStats, 
    autoOptimize, 
    setCurrentProfile,
    setAutoOptimize,
    optimizeMemory,
    isLowPerformance,
    isHighPerformance
  } = usePerformanceManager()

  // Update performance history
  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryHistory(prev => {
        const newHistory = [...prev, performanceStats.memoryUsage].slice(-20)
        return newHistory
      })

      setFpsHistory(prev => {
        const newHistory = [...prev, performanceStats.fps].slice(-20)
        return newHistory
      })
    }, 1000)

    const onKey = (e: KeyboardEvent) => {
      const cmd = e.ctrlKey || e.metaKey
      if (cmd && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setBubble((b) => !b)
      }
    }
    window.addEventListener('keydown', onKey)

    return () => {
      clearInterval(interval)
      window.removeEventListener('keydown', onKey)
    }
  }, [performanceStats])

  const getProfileColor = (profileName: string) => {
    switch (profileName) {
      case 'ultra': return 'text-green-400 bg-green-500/20'
      case 'high': return 'text-blue-400 bg-blue-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-orange-400 bg-orange-500/20'
      case 'potato': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const formatMemory = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <motion.div
      className={cn(
        "fixed top-4 right-4 z-50",
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      {/* Compact View */}
      {!isExpanded && (
        <motion.button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "apple-control-panel p-3 text-white/80 hover:text-white transition-all duration-200",
            "flex items-center gap-2"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className={cn(
            "w-2 h-2 rounded-full",
            performanceStats.fps > 50 ? "bg-green-400" : 
            performanceStats.fps > 30 ? "bg-yellow-400" : "bg-red-400"
          )} />
          <span className="text-sm font-medium">
            {performanceStats.fps} FPS
          </span>
          <div className={cn(
            "px-2 py-1 rounded-lg text-xs font-medium",
            getProfileColor(currentProfile)
          )}>
            {currentProfile.toUpperCase()}
          </div>
        </motion.button>
      )}

      {/* Detailed View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="apple-control-panel p-4 min-w-80"
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-white/80" />
                <h3 className="text-white font-medium">Performance Monitor</h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white/60 hover:text-white/80 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Current Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="apple-button p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="w-4 h-4 text-blue-400" />
                  <span className="text-white/80 text-sm">FPS</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {performanceStats.fps}
                </div>
                <div className="text-xs text-white/60">
                  Target: {profile.frameRateTarget}
                </div>
              </div>

              <div className="apple-button p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MemoryStick className="w-4 h-4 text-purple-400" />
                  <span className="text-white/80 text-sm">Memory</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {formatMemory(performanceStats.memoryUsage)}
                </div>
                <button
                  onClick={optimizeMemory}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Optimize
                </button>
              </div>

              <div className="apple-button p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Battery className="w-4 h-4 text-green-400" />
                  <span className="text-white/80 text-sm">Battery</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {performanceStats.batteryLevel}%
                </div>
                {performanceStats.isLowPowerMode && (
                  <div className="text-xs text-orange-400">
                    Low Power Mode
                  </div>
                )}
              </div>

              <div className="apple-button p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-white/80 text-sm">Profile</span>
                </div>
                <div className={cn(
                  "text-sm font-bold",
                  currentProfile === 'ultra' ? 'text-green-400' :
                  currentProfile === 'high' ? 'text-blue-400' :
                  currentProfile === 'medium' ? 'text-yellow-400' :
                  currentProfile === 'low' ? 'text-orange-400' :
                  'text-red-400'
                )}>
                  {currentProfile.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Performance Profile Selector */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Performance Mode</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">Auto</span>
                  <button
                    onClick={() => setAutoOptimize(!autoOptimize)}
                    className={cn(
                      "w-8 h-4 rounded-full transition-colors relative",
                      autoOptimize ? "bg-blue-500" : "bg-gray-600"
                    )}
                  >
                    <div className={cn(
                      "w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform",
                      autoOptimize ? "translate-x-4" : "translate-x-0.5"
                    )} />
                  </button>
                </div>
              </div>

              <div className="flex gap-1">
                {(['potato', 'low', 'medium', 'high', 'ultra'] as const).map((profileName) => (
                  <button
                    key={profileName}
                    onClick={() => setCurrentProfile(profileName)}
                    disabled={autoOptimize}
                    className={cn(
                      "flex-1 px-2 py-1 rounded-lg text-xs font-medium transition-all",
                      currentProfile === profileName 
                        ? getProfileColor(profileName)
                        : "text-white/60 bg-white/10 hover:bg-white/20",
                      autoOptimize && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {profileName}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/80">Animation Quality</span>
                  <span className="text-white/60">{profile.animationDuration}ms</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((profile.animationDuration / 1000) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/80">Particle Count</span>
                  <span className="text-white/60">{profile.particleCount}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-purple-400 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((profile.particleCount / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/80">Effects Quality</span>
                  <span className="text-white/60">
                    {profile.enableAdvancedEffects ? 'High' : 'Basic'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-green-400 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: profile.enableAdvancedEffects ? '100%' : '30%' }}
                  />
                </div>
              </div>
            </div>

            {/* Performance Tips */}
            {isLowPerformance && (
              <motion.div
                className="mt-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">Performance Tip</span>
                </div>
                <p className="text-white/80 text-xs">
                  Running in low performance mode. Consider closing unused apps or switching to a more powerful device for better experience.
                </p>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={optimizeMemory}
                className="flex-1 apple-button py-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                Optimize Memory
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('nyx:performance-reset'))}
                className="flex-1 apple-button py-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                Reset Stats
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
