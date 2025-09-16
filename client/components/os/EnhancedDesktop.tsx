import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useFocusable } from '@/hooks/useFocusable'
import { useIconInteraction } from '@/hooks/useIconInteraction'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { useWindowStore } from '@/store/window-store'
import { useDesktopStore } from '@/store/desktop-store'
import { useSamStore } from '@/store/sam-store'
import { MobileNavigation } from '@/components/mobile/MobileGestureSystem'
import { SamChat } from '@/components/apps/SamChat'
import { CallSam } from '@/components/apps/CallSam'
import { AppForge } from '@/components/apps/AppForge'
import { Files } from '@/components/apps/Files'
import { Calendar } from '@/components/apps/Calendar'
import { Settings } from '@/components/apps/Settings'
import { NyxBrowser } from '@/components/apps/NyxBrowser'
import { InfiniteRunner } from '@/components/apps/InfiniteRunner'
import { FlappyGame } from '@/components/apps/FlappyGame'
import { ChessGame } from '@/components/apps/ChessGame'
import { MemoryAlarms } from '@/components/apps/MemoryAlarms'
import { Notepad } from '@/components/apps/Notepad'
import { Calculator } from '@/components/apps/Calculator'
import { WebBrowser } from '@/components/apps/WebBrowser'
import { Game2048 } from '@/components/apps/Game2048'
import { NyxManual } from '@/components/apps/NyxManual'
import { WindowsMediaPlayer } from '@/components/apps/WindowsMediaPlayer'
import { AppErrorBoundary } from '@/components/apps/AppErrorBoundary'
import {
  MessageCircle,
  Phone,
  Folder,
  Wrench,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  Globe,
  FolderPlus,
  Copy,
  Trash2,
  Edit,
  Plus,
  Gamepad2,
  Crown,
  Zap,
  Brain,
  FileText,
  Calculator as CalculatorIcon,
  Chrome,
  Grid3x3,
  HelpCircle,
  Music
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DesktopIcon } from './DesktopIcon'
import { CommandPalette } from './CommandPalette'

export const EnhancedDesktop: React.FC = () => {
  const { openWindow, windows, minimizeWindow, focusWindow, getWindowsByApp } = useWindowStore()
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
  const { deviceInfo, uiConfig, isPhone, isTablet, isDesktop } = useDeviceDetection()
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; iconId?: string } | null>(null)
  const [editModeTimeout, setEditModeTimeout] = useState<NodeJS.Timeout | null>(null)
  const [focusedIconIndex, setFocusedIconIndex] = useState(0)
  const desktopRef = useRef<HTMLDivElement>(null)

  // Enable global keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts()
  
  // Initialize default apps if none exist
  useEffect(() => {
    if (icons.length === 0) {
      // Calculate device-aware grid positions
      const gridSize = isPhone ? 90 : isTablet ? 85 : 80
      const padding = isPhone ? 20 : isTablet ? 30 : 40
      const iconsPerRow = Math.floor((window.innerWidth - padding * 2) / gridSize)
      const startX = padding
      const startY = isPhone ? 60 : padding // More top spacing on phone for status bar

      const getGridPosition = (index: number) => ({
        x: startX + (index % iconsPerRow) * gridSize,
        y: startY + Math.floor(index / iconsPerRow) * gridSize
      })

      const defaultApps = [
        {
          appId: 'sam-chat',
          name: 'Sam',
          icon: MessageCircle,
          component: SamChat,
          defaultSize: { width: 450, height: 650 },
          defaultPosition: { x: 100, y: 100 },
          description: 'Chat with Sam AI',
          position: getGridPosition(0),
          size: { width: 64, height: 64 }
        },
        {
          appId: 'call-sam',
          name: 'Call Sam',
          icon: Phone,
          component: CallSam,
          defaultSize: { width: 550, height: 700 },
          defaultPosition: { x: 200, y: 100 },
          description: 'Voice chat with Sam',
          position: getGridPosition(1),
          size: { width: 64, height: 64 }
        },
        {
          appId: 'files',
          name: 'Files',
          icon: Folder,
          component: Files,
          defaultSize: { width: 800, height: 600 },
          defaultPosition: { x: 150, y: 120 },
          description: 'File manager',
          position: getGridPosition(2),
          size: { width: 64, height: 64 }
        },
        {
          appId: 'app-forge',
          name: 'App Forge',
          icon: Wrench,
          component: AppForge,
          defaultSize: { width: 900, height: 700 },
          defaultPosition: { x: 250, y: 80 },
          description: 'AI-powered app builder',
          position: getGridPosition(3),
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
          position: getGridPosition(4),
          size: { width: 64, height: 64 }
        },
        {
          appId: 'settings',
          name: 'Settings',
          icon: SettingsIcon,
          component: Settings,
          defaultSize: { width: 1000, height: 700 },
          defaultPosition: { x: 300, y: 100 },
          description: 'System settings & customization',
          position: getGridPosition(5),
          size: { width: 64, height: 64 }
        },
        {
          appId: 'browser',
          name: 'Nyx Browse',
          icon: Globe,
          component: NyxBrowser,
          defaultSize: { width: 1000, height: 700 },
          defaultPosition: { x: 100, y: 50 },
          description: 'Quantum web browser',
          position: getGridPosition(6),
          size: { width: 64, height: 64 }
        },
        {
          appId: 'web-browser',
          name: 'Web Browser',
          icon: Chrome,
          component: WebBrowser,
          defaultSize: { width: 1200, height: 800 },
          defaultPosition: { x: 120, y: 40 },
          description: 'Full-featured web browser',
          position: getGridPosition(7),
          size: { width: 64, height: 64 }
        },
        {
          appId: 'runner-game',
          name: 'Nyx Runner',
          icon: Zap,
          component: InfiniteRunner,
          defaultSize: { width: 900, height: 600 },
          defaultPosition: { x: 120, y: 80 },
          description: '2D infinite runner game',
          position: getGridPosition(8),
          size: { width: 64, height: 64 }
        },
        {
          appId: 'flappy-game',
          name: 'Nyx Flap',
          icon: Gamepad2,
          component: FlappyGame,
          defaultSize: { width: 900, height: 600 },
          defaultPosition: { x: 140, y: 100 },
          description: 'Flappy bird inspired game',
          position: getGridPosition(9),
          size: { width: 64, height: 64 }
        },
        {
          appId: 'chess-game',
          name: 'Nyx Chess',
          icon: Crown,
          component: ChessGame,
          defaultSize: { width: 800, height: 700 },
          defaultPosition: { x: 160, y: 60 },
          description: 'Strategic chess game',
          position: getGridPosition(10),
          size: { width: 64, height: 64 }
        },
        {
          appId: 'memory-alarms',
          name: 'Memory',
          icon: Brain,
          component: MemoryAlarms,
          defaultSize: { width: 900, height: 700 },
          defaultPosition: { x: 180, y: 40 },
          description: 'Memory, alarms, and scheduling',
          position: getGridPosition(11),
          size: { width: 64, height: 64 }
        },
        {
          appId: 'notepad',
          name: 'Notepad',
          icon: FileText,
          component: Notepad,
          defaultSize: { width: 900, height: 700 },
          defaultPosition: { x: 200, y: 120 },
          description: 'Text editor with rich features',
          position: getGridPosition(12),
          size: { width: 64, height: 64 }
        },
        {
          appId: 'calculator',
          name: 'Calculator',
          icon: CalculatorIcon,
          component: Calculator,
          defaultSize: { width: 450, height: 700 },
          defaultPosition: { x: 220, y: 100 },
          description: 'Scientific calculator',
          position: getGridPosition(13),
          size: { width: 64, height: 64 }
        },
        {
          appId: '2048-game',
          name: '2048',
          icon: Grid3x3,
          component: Game2048,
          defaultSize: { width: 600, height: 700 },
          defaultPosition: { x: 240, y: 80 },
          description: 'Classic 2048 puzzle game',
          position: getGridPosition(14),
          size: { width: 64, height: 64 }
        },
        {
          appId: 'nyx-manual',
          name: 'Manual',
          icon: HelpCircle,
          component: NyxManual,
          defaultSize: { width: 1000, height: 700 },
          defaultPosition: { x: 260, y: 60 },
          description: 'Complete Nyx OS manual with shortcuts and tips',
          position: getGridPosition(15),
          size: { width: 64, height: 64 }
        },
        {
          appId: 'media-player',
          name: 'Media Player',
          icon: Music,
          component: WindowsMediaPlayer,
          defaultSize: { width: 1000, height: 700 },
          defaultPosition: { x: 180, y: 80 },
          description: 'Windows-style media player for all your audio needs',
          position: getGridPosition(16),
          size: { width: 64, height: 64 }
        }
      ]
      
      // Only add each app once to prevent duplicates
      defaultApps.forEach(app => {
        const existingIcon = icons.find(icon => icon.appId === app.appId)
        if (!existingIcon) {
          addIcon(app)
        }
      })
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
    // For mobile: check if we're at the window limit
    const appWindows = getWindowsByApp(icon.appId)
    if (isPhone && appWindows.length >= uiConfig.maxWindows) {
      addMessage("Window limit reached for mobile mode. Close some apps first!", 'sam', 'annoyed')
      return
    }

    // Determine window mode based on device with proper sizing
    let windowMode = uiConfig.defaultWindowMode
    let windowSize = icon.defaultSize
    let windowPosition = icon.defaultPosition

    if (isPhone) {
      windowMode = 'fullscreen'
      windowSize = {
        width: uiConfig.maxViewportWidth || deviceInfo.screenWidth,
        height: uiConfig.maxViewportHeight || (deviceInfo.screenHeight - 84) // Status + nav bars
      }
      windowPosition = { x: 0, y: uiConfig.statusBarHeight || 28 }
    } else if (isTablet) {
      // Tablet: fullscreen with proper spacing for status/nav bars
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
    if (icon.appId === 'sam-chat') {
      setTimeout(() => {
        setEmotion('happy', 0.8)
        addMessage("Hey there! Welcome to Nyx OS, bruv. What's good?", 'sam', 'happy')
      }, 500)
    } else if (icon.appId === 'runner-game' || icon.appId === 'flappy-game' || icon.appId === 'chess-game') {
      setTimeout(() => {
        setEmotion('excited', 0.7)
        addMessage(`Time to game! ${icon.name} is fucking sick, bro. Let's see what you got.`, 'sam', 'excited')
      }, 500)
    } else if (icon.appId === 'memory-alarms') {
      setTimeout(() => {
        setEmotion('focused', 0.8)
        addMessage("Memory time! I'll help you remember everything and keep you on schedule, my dude.", 'sam', 'focused')
      }, 500)
    } else if (icon.appId === 'web-browser') {
      setTimeout(() => {
        setEmotion('excited', 0.8)
        addMessage("New browser loaded! This one's got all the goods - tabs, bookmarks, history, the works!", 'sam', 'excited')
      }, 500)
    } else if (icon.appId === 'notepad') {
      setTimeout(() => {
        setEmotion('focused', 0.7)
        addMessage("Time to write! This notepad has everything - formatting, search, export. Write your masterpiece!", 'sam', 'focused')
      }, 500)
    } else if (icon.appId === 'calculator') {
      setTimeout(() => {
        setEmotion('focused', 0.6)
        addMessage("Calculator ready! Basic or scientific - I got you covered for all the math.", 'sam', 'focused')
      }, 500)
    } else if (icon.appId === '2048-game') {
      setTimeout(() => {
        setEmotion('excited', 0.8)
        addMessage("2048 time! This puzzle is addictive as hell, bro. Can you reach the magical 2048 tile?", 'sam', 'excited')
      }, 500)
    }
  }
  
  const snapToGrid = (x: number, y: number, iconSize: { width: number; height: number } = { width: 64, height: 64 }) => {
    // Calculate dynamic grid based on icon size + padding
    const gridSizeX = Math.max(80, iconSize.width + 24)
    const gridSizeY = Math.max(80, iconSize.height + 32) // Extra space for label

    return {
      x: Math.round(x / gridSizeX) * gridSizeX,
      y: Math.round(y / gridSizeY) * gridSizeY
    }
  }

  const handleIconDragEnd = (iconId: string, info: PanInfo) => {
    const icon = icons.find(i => i.id === iconId)
    if (!icon) return

    // Calculate new position with bounds checking
    const rawX = Math.max(0, icon.position.x + info.offset.x)
    const rawY = Math.max(0, icon.position.y + info.offset.y)

    // Snap to adaptive grid based on icon size
    const snapped = snapToGrid(rawX, rawY, icon.size)

    // Ensure icons stay within viewport bounds with margin
    const viewportWidth = window.innerWidth || 1200
    const viewportHeight = (window.innerHeight || 800) - 120 // Account for taskbar

    const maxX = viewportWidth - icon.size.width - 20
    const maxY = viewportHeight - icon.size.height - 40 // Extra space for icon label

    const finalX = Math.min(Math.max(20, snapped.x), maxX)
    const finalY = Math.min(Math.max(20, snapped.y), maxY)

    updateIconPosition(iconId, { x: finalX, y: finalY })
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

  // Keyboard navigation for icons
  const navigateIcons = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (freeIcons.length === 0) return

    const iconsPerRow = Math.floor((window.innerWidth - 100) / 120) // Estimate icons per row
    let newIndex = focusedIconIndex

    switch (direction) {
      case 'left':
        newIndex = Math.max(0, focusedIconIndex - 1)
        break
      case 'right':
        newIndex = Math.min(freeIcons.length - 1, focusedIconIndex + 1)
        break
      case 'up':
        newIndex = Math.max(0, focusedIconIndex - iconsPerRow)
        break
      case 'down':
        newIndex = Math.min(freeIcons.length - 1, focusedIconIndex + iconsPerRow)
        break
    }

    setFocusedIconIndex(newIndex)
    if (isEditMode) {
      selectIcon(freeIcons[newIndex].id, false)
    }
  }

  const activateFocusedIcon = () => {
    if (freeIcons[focusedIconIndex]) {
      if (isEditMode) {
        selectIcon(freeIcons[focusedIconIndex].id, true)
      } else {
        openApp(freeIcons[focusedIconIndex])
      }
    }
  }

  // Desktop focusable behavior
  const desktopFocusable = useFocusable({
    onArrowUp: () => navigateIcons('up'),
    onArrowDown: () => navigateIcons('down'),
    onArrowLeft: () => navigateIcons('left'),
    onArrowRight: () => navigateIcons('right'),
    onEnter: activateFocusedIcon,
    onSpace: activateFocusedIcon,
    onEscape: () => {
      if (isEditMode) {
        setEditMode(false)
      } else {
        clearSelection()
      }
    }
  })

  // Auto-focus desktop when edit mode changes
  useEffect(() => {
    if (isEditMode && desktopFocusable.ref.current) {
      desktopFocusable.ref.current.focus()
    }
  }, [isEditMode])

  return (
    <MobileNavigation>
      <div
        {...desktopFocusable.focusableProps}
        className={cn(
        "absolute inset-0 select-none focus:outline-none",
        isPhone ? "p-4 pt-12 pb-16" : isTablet ? "p-6 pt-14 pb-16" : "p-8"
      )}
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
          const isSelected = selectedIcons.includes(icon.id)
          const isOpen = windows.some(w => w.title === icon.name && !w.isMinimized)
          const isFocused = focusedIconIndex === index

          return (
            <DesktopIcon
              key={icon.id}
              icon={icon}
              index={index}
              isSelected={isSelected}
              isOpen={isOpen}
              isEditMode={isEditMode}
              isFocused={isFocused}
              onOpen={() => openApp(icon)}
              onSelect={(multiSelect) => selectIcon(icon.id, multiSelect)}
              onPositionUpdate={(info) => handleIconDragEnd(icon.id, info)}
              onDelete={() => handleDeleteIcon(icon.id)}
              onDuplicate={() => handleDuplicateIcon(icon.id)}
              onStartEdit={() => {
                setEditMode(true)
                setEmotion('focused', 0.8)
                addMessage("Icon edit mode activated! Customize away, bruv.", 'sam', 'focused')
              }}
            />
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
            <div className="apple-control-panel px-4 py-2 flex items-center gap-3">
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
            className="fixed z-50 apple-control-panel py-2 min-w-48"
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
      

      </div>
      <CommandPalette />
    </MobileNavigation>
  )
}
