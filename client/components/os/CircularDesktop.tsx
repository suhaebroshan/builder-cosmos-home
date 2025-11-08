import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWindowStore } from '@/store/window-store'
import { useDesktopStore } from '@/store/desktop-store'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { useSamStore } from '@/store/sam-store'
import { cn } from '@/lib/utils'
import { AppErrorBoundary } from '@/components/apps/AppErrorBoundary'

export const CircularDesktop: React.FC = () => {
  const { openWindow } = useWindowStore()
  const { icons, selectedIcons, selectIcon, clearSelection, updateIconPosition } = useDesktopStore()
  const { addMessage, setEmotion } = useSamStore()
  const { isPhone, isTablet, uiConfig, deviceInfo } = useDeviceDetection()

  const [moonSize, setMoonSize] = useState(0)
  const [iconSize, setIconSize] = useState(0)
  const [craterIcons, setCraterIcons] = useState<typeof icons>([])

  // Calculate sizes dynamically based on viewport
  useEffect(() => {
    const calculateSizes = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight

      // Safe area: leave 80px for taskbar
      const availableHeight = vh - 80
      const availableWidth = vw

      // Moon diameter: 50% of the smaller viewport dimension
      const diameter = Math.min(availableHeight * 0.5, availableWidth * 0.5)
      setMoonSize(diameter)

      // Icon size: 9-12% of moon diameter, clamped between 70-130px
      const size = Math.max(70, Math.min(130, diameter * 0.1))
      setIconSize(size)

      // Take first 12 icons for crater display
      setCraterIcons(icons.slice(0, 12))
    }

    calculateSizes()
    window.addEventListener('resize', calculateSizes)
    return () => window.removeEventListener('resize', calculateSizes)
  }, [icons])

  // Center position of the moon
  const centerX = window.innerWidth / 2
  const centerY = (window.innerHeight - 80) / 2

  // Calculate position of each icon in a circle
  const getIconPosition = (index: number, total: number) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2 // Start from top
    const radius = moonSize / 2.3 // Slightly smaller than moon radius

    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)

    return { x, y, angle }
  }

  const handleIconClick = (icon: typeof icons[0]) => {
    const appWindows = useWindowStore.getState().getWindowsByApp(icon.appId)
    if (isPhone && appWindows.length >= (uiConfig.maxWindows || 3)) {
      addMessage("Window limit reached for mobile mode. Close some apps first!", 'sam', 'annoyed')
      return
    }

    // Determine window mode based on device
    let windowMode: 'windowed' | 'fullscreen' = 'windowed'
    let windowSize = icon.defaultSize
    let windowPosition = icon.defaultPosition

    if (isPhone) {
      windowMode = 'fullscreen'
      windowSize = {
        width: uiConfig.maxViewportWidth || deviceInfo.screenWidth,
        height: uiConfig.maxViewportHeight || (deviceInfo.screenHeight - 84)
      }
      windowPosition = { x: 0, y: uiConfig.statusBarHeight || 28 }
    } else if (isTablet) {
      windowMode = 'fullscreen'
      windowSize = {
        width: uiConfig.maxViewportWidth || (deviceInfo.screenWidth - 16),
        height: uiConfig.maxViewportHeight || (deviceInfo.screenHeight - 88)
      }
      windowPosition = { x: uiConfig.windowPadding || 8, y: uiConfig.statusBarHeight || 32 }
    }

    // Wrap component with error boundary
    const WrappedComponent = (props: any) => (
      <AppErrorBoundary appName={icon.name}>
        <icon.component {...props} />
      </AppErrorBoundary>
    )

    openWindow({
      appId: icon.appId,
      title: icon.name,
      component: WrappedComponent,
      position: windowPosition,
      size: windowSize,
      mode: windowMode,
    })

    // Sam reacts to app opening
    setEmotion('happy', 0.7)
    addMessage(`✨ Opening ${icon.name}`, 'sam', 'happy')
  }

  const handleIconDoubleClick = (iconId: string) => {
    selectIcon(iconId)
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
      {/* Moon circle background */}
      <motion.div
        className="absolute rounded-full border-2 backdrop-blur-xl"
        style={{
          width: moonSize,
          height: moonSize,
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 25%, rgba(126, 103, 214, 0.08) 50%, rgba(147, 112, 219, 0.12) 100%)',
          borderColor: 'rgba(168, 85, 247, 0.4)',
          boxShadow: '0 0 80px rgba(168, 85, 247, 0.2), inset 0 0 60px rgba(139, 92, 246, 0.15), 0 0 40px rgba(126, 103, 214, 0.1)',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
      />

      {/* Animated glow ring */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: moonSize * 1.12,
          height: moonSize * 1.12,
          borderColor: 'rgba(168, 85, 247, 0.25)',
        }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Crater icons in circle */}
      <AnimatePresence>
        {craterIcons.map((icon, index) => {
          const { x, y, angle } = getIconPosition(index, craterIcons.length)
          const isSelected = selectedIcons.includes(icon.appId)
          const Icon = icon.icon

          return (
            <motion.div
              key={icon.appId}
              className="absolute"
              style={{
                left: x - iconSize / 2,
                top: y - iconSize / 2,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                delay: index * 0.05,
                type: 'spring',
                stiffness: 400,
                damping: 30,
              }}
            >
              <motion.button
                onClick={() => handleIconClick(icon)}
                onDoubleClick={() => handleIconDoubleClick(icon.appId)}
                className={cn(
                  'relative rounded-full flex items-center justify-center transition-all duration-200',
                  'glass-purple hover:shadow-purple-500/60',
                  'hover:scale-110 active:scale-95',
                  'group cursor-pointer',
                  isSelected && 'ring-2 ring-purple-400 shadow-lg shadow-purple-500/40'
                )}
                style={{
                  width: iconSize,
                  height: iconSize,
                }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
                title={`${icon.name} - Double-click to select`}
              >
                {/* Icon content */}
                <div className="relative z-10 flex items-center justify-center">
                  <Icon
                    className="text-white/95 group-hover:text-white transition-colors"
                    size={Math.max(28, iconSize * 0.55)}
                  />
                </div>

                {/* Crater inner glow */}
                <motion.div
                  className="absolute inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15), transparent)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Selection glow effect */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3), transparent)',
                    }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* Hover outer ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border border-purple-300/0 group-hover:border-purple-300/30 transition-colors duration-200"
                  style={{ pointerEvents: 'none' }}
                />
              </motion.button>

              {/* Label positioned below icon */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-white/85 pointer-events-none text-center"
                style={{
                  top: '100%',
                  marginTop: Math.max(8, iconSize * 0.25),
                  maxWidth: iconSize * 2,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.3 }}
              >
                {icon.name}
              </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Center moon crater (decorative) */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: moonSize * 0.12,
          height: moonSize * 0.12,
          background: 'radial-gradient(circle at 35% 35%, rgba(168, 85, 247, 0.4), rgba(126, 103, 214, 0.3))',
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(168, 85, 247, 0.2)',
          border: '1px solid rgba(168, 85, 247, 0.25)',
        }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle surface texture */}
      <div
        className="absolute rounded-full opacity-15"
        style={{
          width: moonSize,
          height: moonSize,
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3), transparent 40%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.2), transparent 40%)`,
        }}
      />

      {/* Additional ambient glow */}
      <motion.div
        className="absolute rounded-full blur-3xl opacity-20"
        style={{
          width: moonSize * 1.3,
          height: moonSize * 1.3,
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3), transparent)',
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
