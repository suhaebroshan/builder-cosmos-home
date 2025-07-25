import React, { useRef, useState, useEffect } from 'react'
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
  
  const isFocused = focusedWindowId === window.id
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const minX = -safeSize.width + 100 // Allow some window to go off-screen but keep 100px visible
    const maxX = viewportWidth - 100 // Keep at least 100px of window visible
    const minY = 0 // Don't allow window to go above screen
    const maxY = viewportHeight - 40 // Keep title bar visible

    const newX = Math.max(minX, Math.min(safePosition.x + info.offset.x, maxX))
    const newY = Math.max(minY, Math.min(safePosition.y + info.offset.y, maxY))

    updateWindowPosition(window.id, { x: newX, y: newY })
  }
  
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

  // Ensure valid position and size values
  const safePosition = {
    x: isNaN(window.position.x) ? 100 : window.position.x,
    y: isNaN(window.position.y) ? 100 : window.position.y,
  }

  const safeSize = {
    width: isNaN(window.size.width) ? 400 : window.size.width,
    height: isNaN(window.size.height) ? 300 : window.size.height,
  }
  
  return (
    <motion.div
      ref={windowRef}
      className={cn(
        "absolute rounded-2xl overflow-hidden shadow-2xl",
        "backdrop-blur-xl bg-black/20 border border-white/30",
        isFocused && "ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/20"
      )}
      style={{
        zIndex: window.zIndex,
        borderColor: getEmotionBorderColor(),
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        left: window.isMaximized ? 0 : safePosition.x,
        top: window.isMaximized ? 0 : safePosition.y,
        width: window.isMaximized ? '100vw' : safeSize.width,
        height: window.isMaximized ? '100vh' : safeSize.height,
      }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        layout: { duration: 0.3, ease: "easeInOut" }
      }}
      layout
      onClick={() => focusWindow(window.id)}
    >
      {/* Window Header */}
      <motion.div
        className="flex items-center justify-between p-3 bg-black/30 backdrop-blur-xl border-b border-white/20 cursor-move select-none hover:bg-black/40 transition-colors"
        drag={!window.isMaximized}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        dragElastic={0.1}
        dragConstraints={{
          left: -safeSize.width + 100,
          right: viewportWidth - 100,
          top: 0,
          bottom: viewportHeight - 40,
        }}
        whileDrag={{
          scale: 1.02,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          cursor: "grabbing"
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
      </motion.div>
      
      {/* Window Content */}
      <div className="h-full overflow-hidden">
        {children}
      </div>
      
      {/* Resize Handles */}
      {!window.isMaximized && (
        <>
          {/* Bottom-right corner resize */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => {
              e.preventDefault()
              setIsResizing(true)
              setResizeHandle('se')
            }}
          >
            <div className="w-full h-full bg-white/30 rounded-tl-md" />
          </div>
        </>
      )}
    </motion.div>
  )
}
