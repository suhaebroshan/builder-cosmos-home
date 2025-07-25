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
  
  const isFocused = focusedWindowId === window.id
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const newX = Math.max(0, Math.min(window.position.x + info.offset.x, window.innerWidth - window.size.width))
    const newY = Math.max(0, Math.min(window.position.y + info.offset.y, window.innerHeight - window.size.height))
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
  
  if (window.isMinimized) return null
  
  return (
    <motion.div
      ref={windowRef}
      className={cn(
        "absolute rounded-xl overflow-hidden shadow-2xl",
        "backdrop-blur-md bg-white/10 border border-white/20",
        isFocused && "ring-2 ring-white/30"
      )}
      style={{
        left: window.position.x,
        top: window.position.y,
        width: window.isMaximized ? '100vw' : window.size.width,
        height: window.isMaximized ? '100vh' : window.size.height,
        zIndex: window.zIndex,
        borderColor: getEmotionBorderColor(),
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={() => focusWindow(window.id)}
    >
      {/* Window Header */}
      <motion.div
        className="flex items-center justify-between p-3 bg-black/20 backdrop-blur-sm border-b border-white/10 cursor-move select-none"
        drag={!window.isMaximized}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        dragElastic={0}
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
