import React, { useState, useRef } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { useIconInteraction } from '@/hooks/useIconInteraction'
import { useFocusable } from '@/hooks/useFocusable'
import { DesktopIcon as DesktopIconType } from '@/store/desktop-store'
import { 
  Trash2, 
  Copy, 
  Edit3, 
  RotateCw,
  Palette,
  Maximize2,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DesktopIconProps {
  icon: DesktopIconType
  index: number
  isSelected: boolean
  isOpen: boolean
  isEditMode: boolean
  isFocused: boolean
  onOpen: () => void
  onSelect: (multiSelect: boolean) => void
  onPositionUpdate: (info: PanInfo) => void
  onDelete: () => void
  onDuplicate: () => void
  onStartEdit: () => void
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  icon,
  index,
  isSelected,
  isOpen,
  isEditMode,
  isFocused,
  onOpen,
  onSelect,
  onPositionUpdate,
  onDelete,
  onDuplicate,
  onStartEdit
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [customSize, setCustomSize] = useState(icon.size.width)
  const [iconColor, setIconColor] = useState('#ffffff')
  const iconRef = useRef<HTMLDivElement>(null)
  
  const Icon = icon.icon
  
  // Handle icon interactions
  const iconInteraction = useIconInteraction({
    onSingleClick: () => {
      if (isEditMode) {
        onSelect(false)
      }
    },
    onDoubleClick: () => {
      if (!isEditMode) {
        onOpen()
      }
    },
    onLongPress: () => {
      onStartEdit()
    },
    onMultipleClick: (clickCount) => {
      if (clickCount >= 4) {
        onStartEdit()
        setIsCustomizing(true)
      }
    }
  })
  
  // Keyboard navigation
  const focusable = useFocusable({
    onEnter: () => isEditMode ? onSelect(true) : onOpen(),
    onSpace: () => isEditMode ? onSelect(true) : onOpen(),
    onEscape: () => setIsCustomizing(false)
  })
  
  const handleDragStart = () => {
    setIsDragging(true)
  }
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    onPositionUpdate(info)
  }
  
  const handleSizeChange = (newSize: number) => {
    setCustomSize(newSize)
    // Update icon size in store would be called here
  }
  
  const iconSizes = [32, 48, 64, 80, 96, 128]
  const iconColors = [
    '#ffffff', '#3b82f6', '#ef4444', '#10b981', 
    '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'
  ]
  
  return (
    <motion.div
      {...focusable.focusableProps}
      className={cn(
        "absolute cursor-pointer group select-none",
        isEditMode && "z-20",
        isFocused && "ring-2 ring-blue-400 ring-opacity-60"
      )}
      style={{
        left: icon.position.x,
        top: icon.position.y,
        width: customSize,
        height: customSize + 20, // Extra space for label
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: isDragging ? 1.1 : 1,
        rotate: isDragging ? 5 : 0
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ 
        delay: index * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      drag={isEditMode}
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: isEditMode ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.95 }}
      whileDrag={{
        scale: 1.1,
        rotate: 2,
        zIndex: 999,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
      }}
      {...iconInteraction.interactionProps}
    >
      {/* Selection indicator */}
      {isEditMode && isSelected && (
        <motion.div
          className="absolute -inset-2 rounded-2xl border-2 border-blue-400 bg-blue-500/10 backdrop-blur-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          layoutId={`selection-${icon.id}`}
        />
      )}
      
      {/* App Icon */}
      <div
        className={cn(
          "relative rounded-2xl backdrop-blur-xl border flex items-center justify-center transition-all duration-200",
          isOpen 
            ? 'bg-blue-500/20 border-blue-400/60 shadow-xl shadow-blue-500/30' 
            : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40 hover:shadow-lg hover:shadow-white/10',
          isEditMode && 'ring-2 ring-white/30',
          isDragging && 'shadow-2xl shadow-black/50'
        )}
        style={{
          width: customSize,
          height: customSize,
        }}
      >
        <Icon 
          className="text-white/90 transition-all duration-200" 
          size={customSize * 0.5}
          style={{ color: iconColor }}
        />
        
        {/* Running indicator */}
        {isOpen && (
          <motion.div
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          />
        )}
        
        {/* Edit mode controls */}
        {isEditMode && (
          <>
            {/* Delete button */}
            <motion.button
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="w-3 h-3 text-white" />
            </motion.button>
            
            {/* Customize button */}
            <motion.button
              className="absolute -top-2 -left-2 w-6 h-6 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                setIsCustomizing(!isCustomizing)
              }}
            >
              <Settings className="w-3 h-3 text-white" />
            </motion.button>
            
            {/* Duplicate button */}
            <motion.button
              className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate()
              }}
            >
              <Copy className="w-3 h-3 text-white" />
            </motion.button>
          </>
        )}
      </div>
      
      {/* App Name */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-white/90 text-xs font-medium text-center px-2 py-1 rounded-lg bg-black/40 backdrop-blur-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
        {icon.name}
      </div>
      
      {/* Customization Panel */}
      {isCustomizing && isEditMode && (
        <motion.div
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-black/80 backdrop-blur-xl border border-white/30 rounded-2xl p-4 min-w-64 z-50"
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
        >
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Customize {icon.name}
          </h3>
          
          {/* Size Control */}
          <div className="mb-4">
            <label className="text-white/80 text-sm block mb-2">Size</label>
            <div className="flex gap-2">
              {iconSizes.map(size => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={cn(
                    "w-8 h-8 rounded-lg border transition-all text-xs text-white",
                    customSize === size 
                      ? "bg-blue-500/30 border-blue-400/50" 
                      : "bg-white/10 border-white/20 hover:bg-white/20"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          {/* Color Control */}
          <div className="mb-4">
            <label className="text-white/80 text-sm block mb-2">Icon Color</label>
            <div className="flex gap-2 flex-wrap">
              {iconColors.map(color => (
                <button
                  key={color}
                  onClick={() => setIconColor(color)}
                  className={cn(
                    "w-6 h-6 rounded-lg border-2 transition-all",
                    iconColor === color ? "border-white" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsCustomizing(false)}
              className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors text-white text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsCustomizing(false)
                // Apply changes would be handled here
              }}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-white text-sm"
            >
              Apply
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Click/Long Press Instructions */}
      {!isEditMode && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white/40 text-xs text-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
          Long press or 4× click to customize
        </div>
      )}
    </motion.div>
  )
}
