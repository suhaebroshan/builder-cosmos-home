import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { useWindowStore, Window } from '@/store/window-store'
import { useSamStore } from '@/store/sam-store'
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

  if (window.isMinimized) return null

  // Get viewport dimensions for window constraints
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  
  return (
    <motion.div
      ref={windowRef}
      className={cn(
        "absolute rounded-2xl overflow-hidden shadow-2xl cursor-move",
        "backdrop-blur-2xl bg-black/10 border border-white/20",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none",
        isFocused && "ring-2 ring-purple-400/50 shadow-xl shadow-purple-500/30"
      )}
      style={{
        zIndex: window.zIndex,
        borderColor: getEmotionBorderColor(),
        left: window.isMaximized ? 0 : safePosition.x,
        top: window.isMaximized ? 0 : safePosition.y,
        width: window.isMaximized ? '100vw' : safeSize.width,
        height: window.isMaximized ? '100vh' : safeSize.height,
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      onClick={() => focusWindow(window.id)}
    >
      {/* Window Header */}
      <div
        className={cn(
          "flex items-center justify-between p-3 bg-black/20 backdrop-blur-2xl border-b border-white/10 select-none hover:bg-black/30 transition-colors cursor-grab",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={(e) => {
          if (window.isMaximized) return

          // Don't start dragging if clicking on buttons
          const target = e.target as HTMLElement
          if (target.closest('button')) {
            return
          }

          e.preventDefault()

          // Start long press timer
          const timeout = setTimeout(() => {
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
          }, 300) // 300ms long press delay

          setDragTimeout(timeout)

          // Clear timeout if mouse is released quickly
          const handleQuickRelease = () => {
            if (timeout) {
              clearTimeout(timeout)
              setDragTimeout(null)
            }
            document.removeEventListener('mouseup', handleQuickRelease)
          }

          document.addEventListener('mouseup', handleQuickRelease)
        }}
        onMouseLeave={() => {
          // Cancel drag if mouse leaves header
          if (dragTimeout) {
            clearTimeout(dragTimeout)
            setDragTimeout(null)
          }
        }}
      >
        <div className="flex items-center gap-2">
          <div className="text-white/90 font-medium text-sm">{window.title}</div>
        </div>
        
        <div className="flex items-center gap-1">
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
      <div className="flex-1 overflow-hidden bg-black/5 backdrop-blur-sm">
        {children}
      </div>
      
      {/* Resize Handles */}
      {!window.isMaximized && (
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
