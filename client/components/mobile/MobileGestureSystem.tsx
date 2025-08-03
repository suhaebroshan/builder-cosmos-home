import React, { useRef, useState, useEffect } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { useWindowStore } from '@/store/window-store'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'

interface SwipeGestureProps {
  children: React.ReactNode
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export const SwipeGesture: React.FC<SwipeGestureProps> = ({
  children,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50
}) => {
  const [isGesturing, setIsGesturing] = useState(false)
  
  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info
    
    // Require minimum velocity for gesture recognition
    const minVelocity = 300
    
    if (Math.abs(velocity.y) > Math.abs(velocity.x)) {
      // Vertical swipe
      if (offset.y < -threshold && velocity.y < -minVelocity && onSwipeUp) {
        onSwipeUp()
      } else if (offset.y > threshold && velocity.y > minVelocity && onSwipeDown) {
        onSwipeDown()
      }
    } else {
      // Horizontal swipe
      if (offset.x < -threshold && velocity.x < -minVelocity && onSwipeLeft) {
        onSwipeLeft()
      } else if (offset.x > threshold && velocity.x > minVelocity && onSwipeRight) {
        onSwipeRight()
      }
    }
    
    setIsGesturing(false)
  }
  
  return (
    <motion.div
      className="w-full h-full"
      onPanStart={() => setIsGesturing(true)}
      onPanEnd={handlePanEnd}
      style={{
        touchAction: 'none'
      }}
    >
      {children}
    </motion.div>
  )
}

interface AppSwitcherProps {
  isVisible: boolean
  onClose: () => void
}

export const AppSwitcher: React.FC<AppSwitcherProps> = ({ isVisible, onClose }) => {
  const { windows, focusWindow, closeWindow, recentApps } = useWindowStore()
  const { isPhone } = useDeviceDetection()
  
  if (!isVisible || !isPhone) return null
  
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="flex flex-col h-full pt-20 pb-10 px-4">
        <div className="text-white text-xl font-semibold mb-6 text-center">
          Recent Apps
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {windows.map((window) => (
              <motion.div
                key={window.id}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation()
                  focusWindow(window.id)
                  onClose()
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-white font-medium">{window.title}</div>
                    <div className="text-white/60 text-sm">
                      {window.mode === 'fullscreen' ? 'Fullscreen' : 'Windowed'}
                    </div>
                  </div>
                  
                  <button
                    className="ml-4 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeWindow(window.id)
                    }}
                  >
                    <span className="text-red-400 text-sm">×</span>
                  </button>
                </div>
                
                {/* App preview placeholder */}
                <div className="mt-3 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-white/10 flex items-center justify-center">
                  <div className="text-white/40 text-sm">App Preview</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <button
            className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  )
}

interface FloatingWindowControlsProps {
  windowId: string
}

export const FloatingWindowControls: React.FC<FloatingWindowControlsProps> = ({ windowId }) => {
  const { getWindow, makeFloating, setWindowOpacity, setSplitScreen } = useWindowStore()
  const [isVisible, setIsVisible] = useState(false)
  const window = getWindow(windowId)
  
  if (!window) return null
  
  return (
    <>
      {/* Floating controls trigger */}
      <motion.button
        className="absolute top-2 right-2 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center z-10"
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsVisible(!isVisible)}
      >
        <span className="text-white text-xs">⚙️</span>
      </motion.button>
      
      {/* Floating controls panel */}
      {isVisible && (
        <motion.div
          className="absolute top-12 right-2 bg-black/80 backdrop-blur-sm rounded-xl p-3 border border-white/20 z-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="space-y-2">
            <button
              className="w-full px-3 py-2 text-xs text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              onClick={() => {
                makeFloating(windowId, !window.isFloating)
                setIsVisible(false)
              }}
            >
              {window.isFloating ? 'Unfloat' : 'Float'}
            </button>
            
            <button
              className="w-full px-3 py-2 text-xs text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              onClick={() => {
                setWindowOpacity(windowId, window.opacity === 1 ? 0.7 : 1)
                setIsVisible(false)
              }}
            >
              {window.opacity === 1 ? 'Transparent' : 'Opaque'}
            </button>
            
            <button
              className="w-full px-3 py-2 text-xs text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              onClick={() => {
                setSplitScreen(windowId)
                setIsVisible(false)
              }}
            >
              Split Screen
            </button>
          </div>
        </motion.div>
      )}
    </>
  )
}

interface MobileNavigationProps {
  children: React.ReactNode
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ children }) => {
  const [showAppSwitcher, setShowAppSwitcher] = useState(false)
  const { isPhone } = useDeviceDetection()

  if (!isPhone) {
    return <>{children}</>
  }

  const handleSwipeUp = () => {
    setShowAppSwitcher(true)
  }

  const handleSwipeDown = () => {
    // Go back or minimize current app
    if (window.history.length > 1) {
      window.history.back()
    }
  }

  return (
    <>
      <SwipeGesture
        onSwipeUp={handleSwipeUp}
        onSwipeDown={handleSwipeDown}
        threshold={80}
      >
        <div className="h-full w-full relative">
          {children}

          {/* Bottom gesture indicator - More visible on phone */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-white/50 rounded-full pointer-events-none z-50" />
        </div>
      </SwipeGesture>

      <AppSwitcher
        isVisible={showAppSwitcher}
        onClose={() => setShowAppSwitcher(false)}
      />
    </>
  )
}

export default MobileNavigation
