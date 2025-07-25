import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useFocusable } from '@/hooks/useFocusable'
import { useWindowStore } from '@/store/window-store'
import { useDesktopStore } from '@/store/desktop-store'
import { useSamStore } from '@/store/sam-store'
import { SamChat } from '@/components/apps/SamChat'
import { CallSam } from '@/components/apps/CallSam'
import { AppForge } from '@/components/apps/AppForge'
import { Files } from '@/components/apps/Files'
import { Calendar } from '@/components/apps/Calendar'
import { Settings } from '@/components/apps/Settings'
import { 
  MessageCircle, 
  Phone, 
  Folder, 
  Wrench, 
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  FolderPlus,
  Copy,
  Trash2,
  Edit,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const EnhancedDesktop: React.FC = () => {
  const { openWindow, windows, minimizeWindow, focusWindow } = useWindowStore()
  const { 
    icons, 
    folders, 
    isEditMode, 
    selectedIcons, 
    setEditMode, 
    addIcon, 
    updateIconPosition, 
    updateIconSize, 
    selectIcon, 
    clearSelection, 
    duplicateIcon, 
    removeIcon, 
    createFolder,
    getFreeIcons 
  } = useDesktopStore()
  const { setEmotion, addMessage } = useSamStore()
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; iconId?: string } | null>(null)
  const [editModeTimeout, setEditModeTimeout] = useState<NodeJS.Timeout | null>(null)
  const desktopRef = useRef<HTMLDivElement>(null)
  
  // Initialize default apps if none exist
  useEffect(() => {
    if (icons.length === 0) {
      const defaultApps = [
        {
          appId: 'sam-chat',
          name: 'Sam',
          icon: MessageCircle,
          component: SamChat,
          defaultSize: { width: 400, height: 600 },
          defaultPosition: { x: 100, y: 100 },
          description: 'Chat with Sam AI',
          position: { x: 100, y: 100 },
          size: { width: 64, height: 64 }
        },
        {
          appId: 'call-sam',
          name: 'Call Sam',
          icon: Phone,
          component: CallSam,
          defaultSize: { width: 500, height: 600 },
          defaultPosition: { x: 200, y: 100 },
          description: 'Voice chat with Sam',
          position: { x: 200, y: 100 },
          size: { width: 64, height: 64 }
        },
        {
          appId: 'files',
          name: 'Files',
          icon: Folder,
          component: Files,
          defaultSize: { width: 700, height: 500 },
          defaultPosition: { x: 150, y: 120 },
          description: 'File manager',
          position: { x: 300, y: 100 },
          size: { width: 64, height: 64 }
        },
        {
          appId: 'app-forge',
          name: 'App Forge',
          icon: Wrench,
          component: AppForge,
          defaultSize: { width: 800, height: 600 },
          defaultPosition: { x: 250, y: 80 },
          description: 'AI-powered app builder',
          position: { x: 100, y: 200 },
          size: { width: 64, height: 64 }
        },
        {
          appId: 'calendar',
          name: 'Chrono',
          icon: CalendarIcon,
          component: Calendar,
          defaultSize: { width: 900, height: 600 },
          defaultPosition: { x: 200, y: 50 },
          description: 'Calendar & scheduling',
          position: { x: 200, y: 200 },
          size: { width: 64, height: 64 }
        },
        {
          appId: 'settings',
          name: 'Settings',
          icon: SettingsIcon,
          component: Settings,
          defaultSize: { width: 800, height: 600 },
          defaultPosition: { x: 300, y: 100 },
          description: 'System settings & customization',
          position: { x: 300, y: 200 },
          size: { width: 64, height: 64 }
        }
      ]
      
      defaultApps.forEach(app => addIcon(app))
    }
  }, [icons.length, addIcon])
  
  const handleDesktopClick = (e: React.MouseEvent) => {
    // Clear context menu
    setContextMenu(null)
    
    // Clear selection if clicking empty space
    if (e.target === e.currentTarget) {
      clearSelection()
    }
  }
  
  const handleDesktopLongPress = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setEditMode(true)
      setEmotion('focused', 0.8)
      addMessage("Edit mode activated! You can now move, resize, and organize your apps, bruv.", 'sam', 'focused')
    }
  }
  
  const handleDesktopRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (e.target === e.currentTarget) {
      setContextMenu({ x: e.clientX, y: e.clientY })
    }
  }
  
  const openApp = (icon: any) => {
    // Check if app is already open
    const existingWindow = windows.find(w => w.title === icon.name)
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        minimizeWindow(existingWindow.id)
      }
      focusWindow(existingWindow.id)
      return
    }
    
    openWindow({
      title: icon.name,
      component: icon.component,
      position: icon.defaultPosition,
      size: icon.defaultSize,
    })
    
    // Sam reacts to app opening
    if (icon.appId === 'sam-chat') {
      setTimeout(() => {
        setEmotion('happy', 0.8)
        addMessage("Hey there! Welcome to Nyx OS, bruv. What's good?", 'sam', 'happy')
      }, 500)
    }
  }
  
  const handleIconDragEnd = (iconId: string, info: PanInfo) => {
    const icon = icons.find(i => i.id === iconId)
    if (!icon) return
    
    const newX = Math.max(0, icon.position.x + info.offset.x)
    const newY = Math.max(0, icon.position.y + info.offset.y)
    
    updateIconPosition(iconId, { x: newX, y: newY })
  }
  
  const handleCreateFolder = () => {
    if (selectedIcons.length >= 2) {
      const firstIcon = icons.find(i => i.id === selectedIcons[0])
      if (firstIcon) {
        createFolder(selectedIcons, firstIcon.position, 'New Folder')
        clearSelection()
        setEmotion('excited', 0.7)
        addMessage("Folder created! Nice organization skills, my man.", 'sam', 'excited')
      }
    }
    setContextMenu(null)
  }
  
  const handleDuplicateIcon = (iconId: string) => {
    duplicateIcon(iconId)
    setEmotion('happy', 0.6)
    addMessage("Icon duplicated! More is more, right?", 'sam', 'happy')
    setContextMenu(null)
  }
  
  const handleDeleteIcon = (iconId: string) => {
    removeIcon(iconId)
    setEmotion('neutral', 0.5)
    addMessage("Icon removed. Keeping things clean, I see.", 'sam', 'neutral')
    setContextMenu(null)
  }
  
  const freeIcons = getFreeIcons()
  
  return (
    <div 
      ref={desktopRef}
      className="absolute inset-0 p-8 select-none"
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopRightClick}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          const timeout = setTimeout(() => handleDesktopLongPress(e), 500)
          setEditModeTimeout(timeout)
        }
      }}
      onMouseUp={() => {
        if (editModeTimeout) {
          clearTimeout(editModeTimeout)
          setEditModeTimeout(null)
        }
      }}
    >
      {/* Free Icons */}
      <AnimatePresence>
        {freeIcons.map((icon, index) => {
          const Icon = icon.icon
          const isSelected = selectedIcons.includes(icon.id)
          const isOpen = windows.some(w => w.title === icon.name && !w.isMinimized)
          
          return (
            <motion.div
              key={icon.id}
              className={cn(
                "absolute cursor-pointer group",
                isEditMode && "z-20"
              )}
              style={{
                left: icon.position.x,
                top: icon.position.y,
                width: icon.size.width,
                height: icon.size.height + 20, // Extra space for label
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              drag={isEditMode}
              dragMomentum={false}
              onDragEnd={(_, info) => handleIconDragEnd(icon.id, info)}
              onClick={(e) => {
                e.stopPropagation()
                if (isEditMode) {
                  selectIcon(icon.id, e.ctrlKey || e.metaKey)
                } else {
                  openApp(icon)
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation()
                if (!isEditMode) {
                  openApp(icon)
                }
              }}
              whileHover={{ scale: isEditMode ? 1.1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Selection indicator */}
              {isEditMode && isSelected && (
                <motion.div
                  className="absolute -inset-2 rounded-2xl border-2 border-blue-400 bg-blue-500/10"
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
                  isEditMode && 'ring-2 ring-white/30'
                )}
                style={{
                  width: icon.size.width,
                  height: icon.size.height,
                }}
              >
                <Icon className="w-8 h-8 text-white/90" />
                
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
                  <motion.div
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteIcon(icon.id)
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
              
              {/* App Name */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-white/90 text-xs font-medium text-center px-2 py-1 rounded-lg bg-black/40 backdrop-blur-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200">
                {icon.name}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
      
      {/* Edit Mode Controls */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-black/60 backdrop-blur-xl border border-white/30 rounded-2xl px-4 py-2 flex items-center gap-3">
              <span className="text-white text-sm">Edit Mode</span>
              <div className="w-px h-6 bg-white/20" />
              
              {selectedIcons.length >= 2 && (
                <button
                  onClick={handleCreateFolder}
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/40 rounded-lg transition-colors"
                  title="Create Folder"
                >
                  <FolderPlus className="w-4 h-4 text-white" />
                </button>
              )}
              
              <button
                onClick={() => setEditMode(false)}
                className="px-3 py-1 bg-blue-500/80 hover:bg-blue-500 rounded-lg transition-colors text-white text-sm"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            className="fixed z-50 bg-black/80 backdrop-blur-xl border border-white/30 rounded-xl py-2 min-w-48"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {contextMenu.iconId ? (
              // Icon context menu
              <>
                <button
                  onClick={() => handleDuplicateIcon(contextMenu.iconId!)}
                  className="w-full px-4 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => handleDeleteIcon(contextMenu.iconId!)}
                  className="w-full px-4 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            ) : (
              // Desktop context menu
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="w-full px-4 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Mode
                </button>
                {selectedIcons.length >= 2 && (
                  <button
                    onClick={handleCreateFolder}
                    className="w-full px-4 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Create Folder
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Welcome Message */}
      <motion.div
        className="absolute bottom-8 left-8 max-w-md"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="bg-black/30 backdrop-blur-xl border border-white/30 rounded-2xl p-4 shadow-lg shadow-black/20">
          <h3 className="text-white font-medium mb-2">Welcome to Nyx OS</h3>
          <p className="text-white/70 text-sm">
            Double-click apps to open them. Long-press empty space to enter edit mode for customization.
          </p>
        </div>
      </motion.div>
      
      {/* System Info */}
      <motion.div
        className="absolute bottom-8 right-8"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <div className="bg-black/30 backdrop-blur-xl border border-white/30 rounded-2xl p-4 text-right shadow-lg shadow-black/20">
          <div className="text-white/90 font-medium">Nyx OS v1.0</div>
          <div className="text-white/60 text-sm">Sentient Operating System</div>
          <div className="text-white/40 text-xs mt-1">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
