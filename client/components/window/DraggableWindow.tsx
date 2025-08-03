import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { useWindowStore, Window } from '@/store/window-store'
import { useSamStore } from '@/store/sam-store'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { FloatingWindowControls } from '@/components/mobile/MobileGestureSystem'
import { X, Minimize2, Maximize2, Pin, PinOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DraggableWindowProps {
  window: Window
  children: React.ReactNode
}

export const DraggableWindow: React.FC<DraggableWindowProps> = ({ window, children }) => {
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
    togglePin,
    focusedWindowId,
  } = useWindowStore()

  const { currentEmotion, emotionIntensity } = useSamStore()
  const { deviceInfo, uiConfig, isPhone, isTablet } = useDeviceDetection()
  const windowRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragTimeout, setDragTimeout] = useState<NodeJS.Timeout | null>(null)

  const isFocused = focusedWindowId === window.id

  // Ensure valid position and size values
  const safePosition = {
    x: isNaN(window.position.x) ? 100 : window.position.x,
    y: isNaN(window.position.y) ? 100 : window.position.y,
  }

  const safeSize = {
    width: isNaN(window.size.width) ? 400 : window.size.width,
    height: isNaN(window.size.height) ? 300 : window.size.height,
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const minX = -safeSize.width + 100 // Allow some window to go off-screen but keep 100px visible
    const maxX = viewportWidth - 100 // Keep at least 100px of window visible
    const minY = 0 // Don't allow window to go above screen
    const maxY = viewportHeight - 40 // Keep title bar visible

    const newX = Math.max(minX, Math.min(safePosition.x + info.offset.x, maxX))
    const newY = Math.max(minY, Math.min(safePosition.y + info.offset.y, maxY))

    updateWindowPosition(window.id, { x: newX, y: newY })
  }

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    setResizeHandle(direction)

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = safeSize.width
    const startHeight = safeSize.height
    const startPosX = safePosition.x
    const startPosY = safePosition.y

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      let newWidth = startWidth
      let newHeight = startHeight
      let newX = startPosX
      let newY = startPosY

      // Handle different resize directions
      if (direction.includes('e')) newWidth = Math.max(200, startWidth + deltaX)
      if (direction.includes('w')) {
        newWidth = Math.max(200, startWidth - deltaX)
        newX = startPosX + deltaX
      }
      if (direction.includes('s')) newHeight = Math.max(150, startHeight + deltaY)
      if (direction.includes('n')) {
        newHeight = Math.max(150, startHeight - deltaY)
        newY = startPosY + deltaY
      }

      updateWindowSize(window.id, { width: newWidth, height: newHeight })
      if (direction.includes('w') || direction.includes('n')) {
        updateWindowPosition(window.id, { x: newX, y: newY })
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeHandle(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [window.id, safeSize, safePosition, updateWindowSize, updateWindowPosition])
  
  const getEmotionBorderColor = () => {
    const intensity = emotionIntensity
    switch (currentEmotion) {
      case 'happy':
        return `rgba(34, 197, 94, ${intensity * 0.6})`
      case 'sad':
        return `rgba(59, 130, 246, ${intensity * 0.6})`
      case 'excited':
        return `rgba(251, 191, 36, ${intensity * 0.6})`
      case 'annoyed':
        return `rgba(239, 68, 68, ${intensity * 0.6})`
      case 'focused':
        return `rgba(168, 85, 247, ${intensity * 0.6})`
      case 'confused':
        return `rgba(156, 163, 175, ${intensity * 0.6})`
      case 'tired':
        return `rgba(75, 85, 99, ${intensity * 0.6})`
      default:
        return `rgba(71, 85, 105, ${intensity * 0.4})`
    }
  }
  
  useEffect(() => {
    if (window.isMaximized || !window.isMaximized) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [window.isMaximized])

  if (window.isMinimized) {
    return (
      <motion.div
        className="fixed bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 0.1, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    )
  }

  // Get viewport dimensions for window constraints
  const viewportWidth = typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1200
  const viewportHeight = typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight - (isPhone ? 0 : 80) : 720 // No taskbar on phone

  // Mobile/tablet specific positioning and sizing
  const getMobileWindowConfig = () => {
    if (isPhone) {
      if (window.mode === 'split-left') {
        return {
          x: 0,
          y: 0,
          width: viewportWidth / 2,
          height: viewportHeight
        }
      } else if (window.mode === 'split-right') {
        return {
          x: viewportWidth / 2,
          y: 0,
          width: viewportWidth / 2,
          height: viewportHeight
        }
      } else if (window.mode === 'floating') {
        return {
          x: safePosition.x,
          y: safePosition.y,
          width: Math.min(safeSize.width, viewportWidth * 0.8),
          height: Math.min(safeSize.height, viewportHeight * 0.6)
        }
      } else {
        // Fullscreen mode for phones
        return {
          x: 0,
          y: 0,
          width: viewportWidth,
          height: viewportHeight
        }
      }
    } else if (isTablet) {
      // Tablet: 80% phone-like (fullscreen default) + 20% desktop features
      if (window.mode === 'split-left') {
        return {
          x: 0,
          y: 0,
          width: viewportWidth / 2,
          height: viewportHeight
        }
      } else if (window.mode === 'split-right') {
        return {
          x: viewportWidth / 2,
          y: 0,
          width: viewportWidth / 2,
          height: viewportHeight
        }
      } else if (window.mode === 'floating') {
        return {
          x: safePosition.x,
          y: safePosition.y,
          width: Math.min(safeSize.width, viewportWidth * 0.7),
          height: Math.min(safeSize.height, viewportHeight * 0.6)
        }
      } else {
        // Default to fullscreen like phone (80% phone behavior)
        return {
          x: 0,
          y: 0,
          width: viewportWidth,
          height: viewportHeight
        }
      }
    } else {
      // Desktop mode
      return {
        x: window.isMaximized ? 0 : safePosition.x,
        y: window.isMaximized ? 0 : safePosition.y,
        width: window.isMaximized ? viewportWidth : safeSize.width,
        height: window.isMaximized ? viewportHeight : safeSize.height
      }
    }
  }

  const windowConfig = getMobileWindowConfig()
  
  return (
    <motion.div
      ref={windowRef}
      className={cn(
        "absolute overflow-hidden",
        isPhone ? "rounded-none bg-black/40 backdrop-blur-sm" : isTablet ? "rounded-xl liquid-glass-window" : "rounded-2xl liquid-glass-window liquid-reflection liquid-bubble",
        !isPhone && "cursor-move",
        isFocused && !isPhone && "ring-2 ring-purple-400/50 shadow-xl shadow-purple-500/30"
      )}
      style={{
        zIndex: window.zIndex,
        borderColor: getEmotionBorderColor(),
        opacity: window.opacity || 1,
      }}
      initial={{ scale: 0.8, opacity: 0, x: windowConfig.x, y: windowConfig.y, width: windowConfig.width, height: windowConfig.height }}
      animate={{
        scale: 1,
        opacity: window.opacity || 1,
        x: windowConfig.x,
        y: windowConfig.y,
        width: windowConfig.width,
        height: windowConfig.height,
      }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.4
      }}
      onClick={() => focusWindow(window.id)}
    >
      {/* Window Header */}
      <div
        className={cn(
          "flex items-center justify-between select-none transition-all duration-300",
          isPhone ? "p-2 bg-black/60 backdrop-blur-sm border-b border-white/5" :
          isTablet ? "p-2.5 liquid-glass-dark border-b border-white/10" :
          "p-3 liquid-glass-dark border-b border-white/10 hover:bg-white/10 liquid-reflection liquid-bubble",
          !isPhone && "cursor-grab",
          isDragging && "cursor-grabbing",
          isPhone && "cursor-default"
        )}
        onMouseDown={(e) => {
          if (window.isMaximized || isPhone || !uiConfig.allowWindowMove) return

          // Don't start dragging if clicking on buttons
          const target = e.target as HTMLElement
          if (target.closest('button')) {
            return
          }

          e.preventDefault()
          setIsDragging(true)

          const startX = e.clientX
          const startY = e.clientY
          const startPosX = safePosition.x
          const startPosY = safePosition.y

          const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY

            // Keep window partially visible
            const newX = Math.max(-safeSize.width + 100, Math.min(startPosX + deltaX, viewportWidth - 100))
            const newY = Math.max(0, Math.min(startPosY + deltaY, viewportHeight - 40))

            updateWindowPosition(window.id, { x: newX, y: newY })
          }

          const handleMouseUp = () => {
            setIsDragging(false)
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
          }

          document.addEventListener('mousemove', handleMouseMove)
          document.addEventListener('mouseup', handleMouseUp)
        }}
      >
        <div className="flex items-center gap-2">
          <div className="text-white/90 font-medium text-sm">{window.title}</div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Mobile floating controls */}
          {(isPhone || isTablet) && <FloatingWindowControls windowId={window.id} />}

          {uiConfig.hasWindowControls && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  togglePin(window.id)
                }}
                className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
              >
                {window.isPinned ? (
                  <PinOff className="w-3 h-3 text-white/70" />
                ) : (
                  <Pin className="w-3 h-3 text-white/70" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  minimizeWindow(window.id)
                }}
                className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
              >
                <Minimize2 className="w-3 h-3 text-white/70" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  maximizeWindow(window.id)
                }}
                className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
              >
                <Maximize2 className="w-3 h-3 text-white/70" />
              </button>
            </>
          )}

          {/* Close button always visible */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeWindow(window.id)
            }}
            className="p-1.5 rounded-md hover:bg-red-500/20 transition-colors"
          >
            <X className="w-3 h-3 text-white/70" />
          </button>
        </div>
      </div>
      
      {/* Window Content */}
      <div className="flex-1 overflow-hidden liquid-glass">
        {children}
      </div>
      
      {/* Resize Handles - Only on desktop/tablet */}
      {!window.isMaximized && uiConfig.allowWindowResize && (
        <>
          {/* Corner handles */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity z-20"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          >
            <div className="w-full h-full bg-white/30 rounded-tl-md" />
          </div>

          <div
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize opacity-0 hover:opacity-100 transition-opacity z-20"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          >
            <div className="w-full h-full bg-white/30 rounded-tr-md" />
          </div>

          <div
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize opacity-0 hover:opacity-100 transition-opacity z-20"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          >
            <div className="w-full h-full bg-white/30 rounded-bl-md" />
          </div>

          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize opacity-0 hover:opacity-100 transition-opacity z-20"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          >
            <div className="w-full h-full bg-white/30 rounded-br-md" />
          </div>

          {/* Edge handles */}
          <div
            className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize opacity-0 hover:opacity-100 transition-opacity z-20"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          >
            <div className="w-full h-full bg-white/20" />
          </div>

          <div
            className="absolute top-0 left-4 right-4 h-2 cursor-n-resize opacity-0 hover:opacity-100 transition-opacity z-20"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          >
            <div className="w-full h-full bg-white/20" />
          </div>

          <div
            className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize opacity-0 hover:opacity-100 transition-opacity z-20"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          >
            <div className="w-full h-full bg-white/20" />
          </div>

          <div
            className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize opacity-0 hover:opacity-100 transition-opacity z-20"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          >
            <div className="w-full h-full bg-white/20" />
          </div>
        </>
      )}
    </motion.div>
  )
}
