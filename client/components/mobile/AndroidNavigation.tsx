import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { useWindowStore } from '@/store/window-store'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { useSamStore } from '@/store/sam-store'
import { useDeviceAuthStore } from '@/store/device-auth-store'
import { AndroidStatusBar } from './AndroidStatusBar'
import { QuickSettingsPanel, useQuickSettings } from './QuickSettingsPanel'
import {
  Home,
  ArrowLeft,
  Square,
  Triangle,
  MoreHorizontal,
  Wifi,
  Battery,
  Signal,
  Bell,
  Settings,
  Search,
  Grid3x3
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AndroidNavigationProps {
  navigationStyle?: 'gestures' | 'buttons'
  onNavigationStyleChange?: (style: 'gestures' | 'buttons') => void
  showStatusBarControls?: boolean
}

export const AndroidNavigation: React.FC<AndroidNavigationProps> = ({
  navigationStyle,
  onNavigationStyleChange
}) => {
  const { windows, focusedWindowId, closeWindow, openWindow } = useWindowStore()
  const { deviceInfo, uiConfig } = useDeviceDetection()
  const { addMessage } = useSamStore()
  const { showStatusBar, deviceType } = useDeviceAuthStore()
  const quickSettings = useQuickSettings()
  const [showRecentApps, setShowRecentApps] = useState(false)
  const [showAppDrawer, setShowAppDrawer] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleBack = () => {
    if (focusedWindowId) {
      // For now, just close the current app. In a real implementation,
      // this would handle proper back navigation within apps
      closeWindow(focusedWindowId)
      addMessage("Going back! Android-style navigation is smooth as butter.", 'sam', 'happy')
    }
  }

  const handleHome = () => {
    // Close all non-pinned windows and show home screen
    windows.forEach(window => {
      if (!window.isPinned) {
        closeWindow(window.id)
      }
    })
    setShowRecentApps(false)
    setShowAppDrawer(false)
    addMessage("Welcome home! Your Android-style desktop is ready.", 'sam', 'happy')
  }

  const handleRecentApps = () => {
    setShowRecentApps(!showRecentApps)
  }

  const handleSwipeUp = (event: any, info: PanInfo) => {
    if (info.offset.y < -100) {
      if (info.point.y > deviceInfo.screenHeight * 0.8) {
        // Swipe up from bottom - show app drawer
        setShowAppDrawer(true)
      } else {
        // Swipe up from anywhere else - show recent apps
        setShowRecentApps(true)
      }
    }
  }

  const handleSwipeDown = (event: any, info: PanInfo) => {
    if (info.offset.y > 100 && info.point.y < 100) {
      // Swipe down from top - show notifications/quick settings
      if (info.point.x > deviceInfo.screenWidth * 0.7) {
        quickSettings.open()
      } else {
        setShowNotifications(true)
      }
    }
  }

  return (
    <>
      {/* Android Status Bar */}
      {showStatusBar && uiConfig.androidStyle && (
        <AndroidStatusBar
          onNotificationsPull={() => setShowNotifications(true)}
          onQuickSettingsPull={quickSettings.open}
        />
      )}

      {/* Gesture Area */}
      {navigationStyle === 'gestures' && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-10"
          onPan={(event, info) => {
            if (info.velocity.y < -500) handleSwipeUp(event, info)
            if (info.velocity.y > 500) handleSwipeDown(event, info)
          }}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Gesture Indicator */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
        </motion.div>
      )}

      {/* Button Navigation */}
      {navigationStyle === 'buttons' && uiConfig.showNavigationBar && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 h-12 bg-black/80 backdrop-blur-sm border-t border-white/10 flex items-center justify-around z-40"
          initial={{ y: 48 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <motion.button
            onClick={handleBack}
            className="p-3 rounded-full hover:bg-white/10 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <Triangle className="w-5 h-5 text-white rotate-180" />
          </motion.button>

          <motion.button
            onClick={handleHome}
            className="p-3 rounded-full hover:bg-white/10 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <Home className="w-5 h-5 text-white" />
          </motion.button>

          <motion.button
            onClick={handleRecentApps}
            className="p-3 rounded-full hover:bg-white/10 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <Square className="w-5 h-5 text-white" />
          </motion.button>
        </motion.div>
      )}

      {/* Recent Apps Screen */}
      <AnimatePresence>
        {showRecentApps && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRecentApps(false)}
          >
            <motion.div
              className={cn(
                "flex flex-col h-full",
                showStatusBarControls ? "pt-20 pb-16" : "pt-16 pb-20"
              )}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="text-center mb-6">
                <h2 className={cn(
                  "text-white font-semibold",
                  deviceInfo.type === 'phone' ? "text-lg" : "text-xl"
                )}>Recent Apps</h2>
                <p className="text-white/60 text-sm mt-1">
                  {windows.length} {windows.length === 1 ? 'app' : 'apps'} running
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-4">
                <div className="space-y-4">
                  {windows.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-white/60 text-lg mb-2">No recent apps</div>
                      <div className="text-white/40 text-sm">Open some apps to see them here</div>
                    </div>
                  ) : (
                    windows.map((window) => (
                      <motion.div
                        key={window.id}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowRecentApps(false)
                          // Focus window logic here
                        }}
                        layout
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-white font-medium">{window.title}</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              closeWindow(window.id)
                            }}
                            className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center"
                          >
                            <span className="text-red-400 text-xs">×</span>
                          </button>
                        </div>
                        
                        {/* App preview */}
                        <div className="h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-white/10 flex items-center justify-center">
                          <div className="text-white/40 text-sm">App Preview</div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              <div className="px-4">
                <button
                  onClick={() => setShowRecentApps(false)}
                  className="w-full py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Drawer */}
      <AnimatePresence>
        {showAppDrawer && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAppDrawer(false)}
          >
            <motion.div
              className="flex flex-col h-full pt-16"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between px-4 mb-6">
                <h2 className="text-white text-xl font-semibold">All Apps</h2>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4">
                <div className="grid grid-cols-4 gap-4">
                  {/* App icons would be rendered here */}
                  {Array.from({ length: 16 }, (_, i) => (
                    <motion.div
                      key={i}
                      className="flex flex-col items-center p-3 rounded-2xl hover:bg-white/10 transition-colors"
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-2 flex items-center justify-center">
                        <Grid3x3 className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-xs text-center">App {i + 1}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNotifications(false)}
          >
            <motion.div
              className="bg-black/80 backdrop-blur-sm border-b border-white/10 p-4"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Notifications</h3>
                <button className="text-purple-400 text-sm">Clear all</button>
              </div>

              <div className="space-y-3">
                <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-purple-400" />
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">Nyx OS</div>
                      <div className="text-white/70 text-xs">Welcome to your new quantum OS!</div>
                    </div>
                    <div className="text-white/50 text-xs">now</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Old quick settings removed - now using QuickSettingsPanel component */}

      {/* Quick Settings Panel */}
      <QuickSettingsPanel
        isOpen={quickSettings.isOpen}
        onClose={quickSettings.close}
      />
    </>
  )
}
