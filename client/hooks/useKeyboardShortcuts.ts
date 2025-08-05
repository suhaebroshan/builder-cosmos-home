import { useEffect, useCallback } from 'react'
import { useWindowStore } from '@/store/window-store'
import { useDesktopStore } from '@/store/desktop-store'
import { useSamStore } from '@/store/sam-store'

export const useKeyboardShortcuts = (enabled: boolean = true) => {
  const { 
    windows, 
    focusedWindowId, 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    focusWindow,
    openWindow 
  } = useWindowStore()
  
  const { 
    setEditMode, 
    isEditMode, 
    selectedIcons, 
    clearSelection,
    duplicateIcon,
    removeIcon,
    createFolder
  } = useDesktopStore()
  
  const { addMessage, setEmotion } = useSamStore()

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Return early if shortcuts are disabled
    if (!enabled) return

    const { key, ctrlKey, metaKey, altKey, shiftKey } = event
    const cmdKey = ctrlKey || metaKey // Support both Ctrl (Windows/Linux) and Cmd (Mac)

    // Prevent default for our handled shortcuts
    const preventDefault = () => {
      event.preventDefault()
      event.stopPropagation()
    }

    // Global shortcuts
    if (cmdKey && key === 'w') {
      // Close focused window
      preventDefault()
      if (focusedWindowId) {
        closeWindow(focusedWindowId)
        addMessage("Window closed with Cmd+W, just like a browser tab!", 'sam', 'neutral')
      }
      return
    }

    if (cmdKey && key === 'm') {
      // Minimize focused window
      preventDefault()
      if (focusedWindowId) {
        minimizeWindow(focusedWindowId)
        addMessage("Window minimized. Nice keyboard skills, bruv!", 'sam', 'happy')
      }
      return
    }

    if (cmdKey && shiftKey && key === 'M') {
      // Maximize focused window
      preventDefault()
      if (focusedWindowId) {
        maximizeWindow(focusedWindowId)
      }
      return
    }

    if (altKey && key === 'Tab') {
      // Alt+Tab window switching
      preventDefault()
      const visibleWindows = windows.filter(w => !w.isMinimized)
      if (visibleWindows.length > 1) {
        const currentIndex = visibleWindows.findIndex(w => w.id === focusedWindowId)
        const nextIndex = (currentIndex + 1) % visibleWindows.length
        focusWindow(visibleWindows[nextIndex].id)
        addMessage("Switched windows with Alt+Tab. Classic move!", 'sam', 'focused')
      }
      return
    }

    if (key === 'Escape') {
      // Exit edit mode or clear selections
      preventDefault()
      if (isEditMode) {
        setEditMode(false)
        addMessage("Edit mode disabled. Back to normal operation.", 'sam', 'neutral')
      } else if (selectedIcons.length > 0) {
        clearSelection()
      }
      return
    }

    if (key === 'F2' || (cmdKey && key === 'r')) {
      // Enter edit mode
      preventDefault()
      setEditMode(true)
      setEmotion('focused', 0.8)
      addMessage("Edit mode activated! Use arrow keys to navigate icons.", 'sam', 'focused')
      return
    }

    // Edit mode shortcuts
    if (isEditMode) {
      if (cmdKey && key === 'd') {
        // Duplicate selected icons
        preventDefault()
        selectedIcons.forEach(iconId => duplicateIcon(iconId))
        addMessage(`Duplicated ${selectedIcons.length} icon(s). Efficiency at its finest!`, 'sam', 'excited')
        return
      }

      if (key === 'Delete' || key === 'Backspace') {
        // Delete selected icons
        preventDefault()
        selectedIcons.forEach(iconId => removeIcon(iconId))
        addMessage(`Deleted ${selectedIcons.length} icon(s). Clean desktop!`, 'sam', 'neutral')
        return
      }

      if (cmdKey && key === 'g') {
        // Group selected icons into folder
        preventDefault()
        if (selectedIcons.length >= 2) {
          const firstIcon = useDesktopStore.getState().icons.find(i => i.id === selectedIcons[0])
          if (firstIcon) {
            createFolder(selectedIcons, firstIcon.position, 'New Folder')
            addMessage("Created folder from selected icons. Organization level up!", 'sam', 'excited')
          }
        }
        return
      }
    }

    // App launch shortcuts
    if (cmdKey && key === '1') {
      preventDefault()
      // Launch Sam Chat
      addMessage("Opening Sam Chat with keyboard shortcut!", 'sam', 'happy')
      // This would need to be implemented with the actual app launching logic
      return
    }

    if (cmdKey && key === '2') {
      preventDefault()
      // Launch Call Sam
      addMessage("Starting Call Sam via shortcut!", 'sam', 'excited')
      return
    }

    if (cmdKey && key === '3') {
      preventDefault()
      // Launch Files
      addMessage("Files app opened with shortcut!", 'sam', 'neutral')
      return
    }

    if (cmdKey && key === '4') {
      preventDefault()
      // Launch App Forge
      addMessage("App Forge ready for creation!", 'sam', 'focused')
      return
    }

    if (cmdKey && key === '5') {
      preventDefault()
      // Launch Calendar
      addMessage("Calendar opened. Time to get organized!", 'sam', 'neutral')
      return
    }

    if (cmdKey && key === ',') {
      // Open Settings
      preventDefault()
      addMessage("Settings opened. Customize away!", 'sam', 'neutral')
      return
    }

    // Developer shortcuts
    if (cmdKey && shiftKey && key === 'I') {
      // Don't prevent default - allow dev tools
      addMessage("Opening dev tools. Getting technical, I see!", 'sam', 'focused')
      return
    }

  }, [
    enabled,
    windows,
    focusedWindowId,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    isEditMode,
    setEditMode,
    selectedIcons,
    clearSelection,
    duplicateIcon,
    removeIcon,
    createFolder,
    addMessage,
    setEmotion
  ])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Return keyboard shortcuts info for help display
  return {
    shortcuts: {
      'Cmd/Ctrl + W': 'Close window',
      'Cmd/Ctrl + M': 'Minimize window',
      'Cmd/Ctrl + Shift + M': 'Maximize window',
      'Alt + Tab': 'Switch between windows',
      'F2 or Cmd/Ctrl + R': 'Enter edit mode',
      'Escape': 'Exit edit mode / Clear selection',
      'Cmd/Ctrl + 1-5': 'Launch apps',
      'Cmd/Ctrl + ,': 'Open Settings',
      'In Edit Mode:': '',
      '  Cmd/Ctrl + D': 'Duplicate icons',
      '  Delete/Backspace': 'Delete icons',
      '  Cmd/Ctrl + G': 'Group into folder',
    }
  }
}
