import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWindowStore } from '@/store/window-store'
import { useDesktopStore } from '@/store/desktop-store'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { useSamStore } from '@/store/sam-store'
import { cn } from '@/lib/utils'

export const CircularDesktop: React.FC = () => {
  const { openWindow } = useWindowStore()
  const { icons, selectedIcons, selectIcon, clearSelection } = useDesktopStore()
  const { addMessage } = useSamStore()
  const { isPhone, isTablet } = useDeviceDetection()

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

      // Moon diameter: 60% of the smaller viewport dimension
      const diameter = Math.min(availableHeight * 0.6, availableWidth * 0.6)
      setMoonSize(diameter)

      // Icon size: 8-10% of moon diameter, clamped between 60-120px
      const size = Math.max(60, Math.min(120, diameter * 0.08))
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
    const radius = moonSize / 2.2 // Slightly smaller than moon radius

    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)

    return { x, y, angle }
  }

  const handleIconClick = (icon: typeof icons[0]) => {
    openWindow({
      appId: icon.appId,
      title: icon.name,
      component: icon.component,
      position: icon.defaultPosition,
      size: icon.defaultSize,
      mode: 'windowed',
    })
    addMessage(`✨ Opening ${icon.name}`, 'sam', 'happy')
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
      {/* Moon circle background */}
      <motion.div
        className="absolute rounded-full border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-indigo-900/20 backdrop-blur-md"
        style={{
          width: moonSize,
          height: moonSize,
          boxShadow: '0 0 80px rgba(168, 85, 247, 0.15), inset 0 0 60px rgba(139, 92, 246, 0.1)',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
      />

      {/* Animated glow ring */}
      <motion.div
        className="absolute rounded-full border border-purple-400/20"
        style={{
          width: moonSize * 1.1,
          height: moonSize * 1.1,
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
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
                onDoubleClick={() => selectIcon(icon.appId)}
                className={cn(
                  'relative rounded-full flex items-center justify-center transition-all duration-200',
                  'bg-gradient-to-br hover:from-purple-500/30 hover:to-indigo-500/20',
                  'border border-purple-400/30 backdrop-blur-md',
                  'shadow-lg hover:shadow-purple-500/50',
                  isSelected && 'ring-2 ring-blue-400'
                )}
                style={{
                  width: iconSize,
                  height: iconSize,
                  transform: `rotate(${angle}rad)`,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={`${icon.name} - Double-click to select`}
              >
                {/* Icon content (rotated back to normal) */}
                <div style={{ transform: `rotate(${-angle}rad)` }}>
                  <Icon
                    className="text-white/90"
                    size={Math.max(24, iconSize * 0.5)}
                  />
                </div>

                {/* Crater glow effect */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-blue-400/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>

              {/* Label positioned around circle */}
              <motion.div
                className="absolute whitespace-nowrap text-xs font-medium text-white/80 pointer-events-none"
                style={{
                  left: '50%',
                  top: '100%',
                  transform: `translateX(-50%) translateY(${iconSize * 0.3}px)`,
                }}
              >
                {icon.name}
              </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Center moon crater (decorative) */}
      <motion.div
        className="absolute rounded-full bg-gradient-to-br from-purple-600/40 to-indigo-600/30 backdrop-blur-md border border-purple-400/30"
        style={{
          width: moonSize * 0.15,
          height: moonSize * 0.15,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle surface texture */}
      <div
        className="absolute rounded-full opacity-10"
        style={{
          width: moonSize,
          height: moonSize,
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2), transparent 50%)`,
        }}
      />
    </div>
  )
}
