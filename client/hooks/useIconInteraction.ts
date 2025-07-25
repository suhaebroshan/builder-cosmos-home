import { useRef, useCallback } from 'react'

interface UseIconInteractionOptions {
  onSingleClick?: () => void
  onDoubleClick?: () => void
  onLongPress?: () => void
  onMultipleClick?: (clickCount: number) => void
  longPressDelay?: number
  multipleClickDelay?: number
  maxClicks?: number
}

export const useIconInteraction = (options: UseIconInteractionOptions = {}) => {
  const {
    onSingleClick,
    onDoubleClick,
    onLongPress,
    onMultipleClick,
    longPressDelay = 500,
    multipleClickDelay = 300,
    maxClicks = 4
  } = options

  const clickCountRef = useRef(0)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressRef = useRef(false)
  const lastClickTimeRef = useRef(0)

  const resetClickCount = useCallback(() => {
    clickCountRef.current = 0
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }
  }, [])

  const resetLongPress = useCallback(() => {
    isLongPressRef.current = false
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current)
      longPressTimeoutRef.current = null
    }
  }, [])

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    
    // Start long press detection
    isLongPressRef.current = false
    longPressTimeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true
      onLongPress?.()
      resetClickCount()
    }, longPressDelay)

  }, [onLongPress, longPressDelay, resetClickCount])

  const handleMouseUp = useCallback(() => {
    resetLongPress()
  }, [resetLongPress])

  const handleMouseLeave = useCallback(() => {
    resetLongPress()
  }, [resetLongPress])

  const handleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    
    // If this was a long press, don't process click
    if (isLongPressRef.current) {
      return
    }

    const currentTime = Date.now()
    const timeSinceLastClick = currentTime - lastClickTimeRef.current
    
    // Reset click count if too much time has passed
    if (timeSinceLastClick > multipleClickDelay * 2) {
      clickCountRef.current = 0
    }
    
    clickCountRef.current++
    lastClickTimeRef.current = currentTime
    
    // Clear existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }
    
    const currentClickCount = clickCountRef.current
    
    // Special handling for double click
    if (currentClickCount === 2 && onDoubleClick) {
      onDoubleClick()
      resetClickCount()
      return
    }
    
    // Check for multiple clicks (including 4 clicks)
    if (currentClickCount >= maxClicks && onMultipleClick) {
      onMultipleClick(currentClickCount)
      resetClickCount()
      return
    }
    
    // Set timeout for single click or to check for more clicks
    clickTimeoutRef.current = setTimeout(() => {
      if (currentClickCount === 1 && onSingleClick) {
        onSingleClick()
      } else if (currentClickCount > 2 && onMultipleClick) {
        onMultipleClick(currentClickCount)
      }
      resetClickCount()
    }, multipleClickDelay)
    
  }, [onSingleClick, onDoubleClick, onMultipleClick, multipleClickDelay, maxClicks, resetClickCount])

  // Touch events for mobile
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    // Start long press detection for touch
    isLongPressRef.current = false
    longPressTimeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true
      onLongPress?.()
      resetClickCount()
    }, longPressDelay)
  }, [onLongPress, longPressDelay, resetClickCount])

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    resetLongPress()
    
    // Convert touch end to click for consistency
    if (!isLongPressRef.current) {
      handleClick(event as any)
    }
  }, [resetLongPress, handleClick])

  const handleTouchCancel = useCallback(() => {
    resetLongPress()
  }, [resetLongPress])

  return {
    interactionProps: {
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onClick: handleClick,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
    resetInteraction: () => {
      resetClickCount()
      resetLongPress()
    }
  }
}
