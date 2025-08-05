import { useEffect, useRef, useCallback } from 'react'
import { useDeviceAuthStore, triggerHaptic } from '@/store/device-auth-store'

export interface TouchPoint {
  id: number
  x: number
  y: number
  timestamp: number
  pressure?: number
}

export interface GestureEvent {
  type: string
  startPoint: TouchPoint
  currentPoint: TouchPoint
  endPoint?: TouchPoint
  deltaX: number
  deltaY: number
  distance: number
  velocity: number
  direction: 'up' | 'down' | 'left' | 'right' | 'none'
  duration: number
  multiTouch?: boolean
  scale?: number
  rotation?: number
}

export interface GestureHandlers {
  onSwipeUp?: (event: GestureEvent) => void
  onSwipeDown?: (event: GestureEvent) => void
  onSwipeLeft?: (event: GestureEvent) => void
  onSwipeRight?: (event: GestureEvent) => void
  onTap?: (event: GestureEvent) => void
  onDoubleTap?: (event: GestureEvent) => void
  onLongPress?: (event: GestureEvent) => void
  onPinch?: (event: GestureEvent) => void
  onRotate?: (event: GestureEvent) => void
  onPan?: (event: GestureEvent) => void
  onEdgeSwipe?: (event: GestureEvent & { edge: 'left' | 'right' | 'top' | 'bottom' }) => void
}

const EDGE_THRESHOLD = 30 // pixels from edge
const SWIPE_THRESHOLD = 50 // minimum distance for swipe
const VELOCITY_THRESHOLD = 0.3 // minimum velocity for swipe
const LONG_PRESS_DURATION = 500 // milliseconds
const DOUBLE_TAP_DELAY = 300 // milliseconds
const PINCH_THRESHOLD = 10 // minimum distance change for pinch

export const useGestureEngine = (
  elementRef: React.RefObject<HTMLElement>,
  handlers: GestureHandlers,
  options: {
    enableEdgeSwipes?: boolean
    enablePinch?: boolean
    enableRotation?: boolean
    preventDefault?: boolean
    passive?: boolean
  } = {}
) => {
  const {
    enableEdgeSwipes = true,
    enablePinch = true,
    enableRotation = true,
    preventDefault = true,
    passive = false
  } = options

  const touchStart = useRef<TouchPoint | null>(null)
  const touchCurrent = useRef<TouchPoint | null>(null)
  const isLongPress = useRef(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const lastTap = useRef<number>(0)
  const touches = useRef<Map<number, TouchPoint>>(new Map())
  const initialDistance = useRef<number>(0)
  const initialRotation = useRef<number>(0)

  const createTouchPoint = useCallback((touch: Touch): TouchPoint => ({
    id: touch.identifier,
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now(),
    pressure: touch.force || 0
  }), [])

  const calculateDistance = useCallback((point1: TouchPoint, point2: TouchPoint): number => {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    )
  }, [])

  const calculateVelocity = useCallback((start: TouchPoint, end: TouchPoint): number => {
    const distance = calculateDistance(start, end)
    const time = (end.timestamp - start.timestamp) / 1000
    return time > 0 ? distance / time : 0
  }, [calculateDistance])

  const getDirection = useCallback((deltaX: number, deltaY: number): 'up' | 'down' | 'left' | 'right' | 'none' => {
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    
    if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD) return 'none'
    
    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }, [])

  const isEdgeSwipe = useCallback((point: TouchPoint): 'left' | 'right' | 'top' | 'bottom' | null => {
    if (!enableEdgeSwipes) return null
    
    const { innerWidth, innerHeight } = window
    
    if (point.x <= EDGE_THRESHOLD) return 'left'
    if (point.x >= innerWidth - EDGE_THRESHOLD) return 'right'
    if (point.y <= EDGE_THRESHOLD) return 'top'
    if (point.y >= innerHeight - EDGE_THRESHOLD) return 'bottom'
    
    return null
  }, [enableEdgeSwipes])

  const createGestureEvent = useCallback((
    type: string,
    start: TouchPoint,
    current: TouchPoint,
    end?: TouchPoint
  ): GestureEvent => {
    const deltaX = current.x - start.x
    const deltaY = current.y - start.y
    const distance = calculateDistance(start, current)
    const velocity = calculateVelocity(start, current)
    const direction = getDirection(deltaX, deltaY)
    const duration = current.timestamp - start.timestamp

    return {
      type,
      startPoint: start,
      currentPoint: current,
      endPoint: end,
      deltaX,
      deltaY,
      distance,
      velocity,
      direction,
      duration,
      multiTouch: touches.current.size > 1
    }
  }, [calculateDistance, calculateVelocity, getDirection])

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (preventDefault) event.preventDefault()
    
    const touch = event.touches[0]
    const touchPoint = createTouchPoint(touch)
    
    // Store all touch points for multi-touch gestures
    Array.from(event.touches).forEach(touch => {
      touches.current.set(touch.identifier, createTouchPoint(touch))
    })

    touchStart.current = touchPoint
    touchCurrent.current = touchPoint
    isLongPress.current = false

    // Setup long press detection
    longPressTimer.current = setTimeout(() => {
      if (touchStart.current && !isLongPress.current) {
        isLongPress.current = true
        const gestureEvent = createGestureEvent('longpress', touchStart.current, touchPoint)
        triggerHaptic('medium')
        handlers.onLongPress?.(gestureEvent)
      }
    }, LONG_PRESS_DURATION)

    // Multi-touch setup
    if (event.touches.length === 2 && enablePinch) {
      const touch1 = touches.current.get(event.touches[0].identifier)!
      const touch2 = touches.current.get(event.touches[1].identifier)!
      initialDistance.current = calculateDistance(touch1, touch2)
      
      if (enableRotation) {
        initialRotation.current = Math.atan2(
          touch2.y - touch1.y,
          touch2.x - touch1.x
        ) * 180 / Math.PI
      }
    }
  }, [
    preventDefault, createTouchPoint, createGestureEvent, handlers.onLongPress,
    enablePinch, enableRotation, calculateDistance
  ])

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (preventDefault) event.preventDefault()
    
    if (!touchStart.current) return
    
    const touch = event.touches[0]
    const touchPoint = createTouchPoint(touch)
    touchCurrent.current = touchPoint

    // Update all touch points
    Array.from(event.touches).forEach(touch => {
      touches.current.set(touch.identifier, createTouchPoint(touch))
    })

    // Clear long press if moved too much
    const distance = calculateDistance(touchStart.current, touchPoint)
    if (distance > 20 && longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    // Handle multi-touch gestures
    if (event.touches.length === 2 && enablePinch) {
      const touch1 = touches.current.get(event.touches[0].identifier)!
      const touch2 = touches.current.get(event.touches[1].identifier)!
      const currentDistance = calculateDistance(touch1, touch2)
      
      if (Math.abs(currentDistance - initialDistance.current) > PINCH_THRESHOLD) {
        const scale = currentDistance / initialDistance.current
        const gestureEvent = {
          ...createGestureEvent('pinch', touchStart.current, touchPoint),
          scale,
          multiTouch: true
        }
        handlers.onPinch?.(gestureEvent)
      }
      
      if (enableRotation) {
        const currentRotation = Math.atan2(
          touch2.y - touch1.y,
          touch2.x - touch1.x
        ) * 180 / Math.PI
        
        const rotation = currentRotation - initialRotation.current
        if (Math.abs(rotation) > 5) { // 5 degree threshold
          const gestureEvent = {
            ...createGestureEvent('rotate', touchStart.current, touchPoint),
            rotation,
            multiTouch: true
          }
          handlers.onRotate?.(gestureEvent)
        }
      }
    }

    // Handle pan gesture
    if (distance > 10) {
      const gestureEvent = createGestureEvent('pan', touchStart.current, touchPoint)
      handlers.onPan?.(gestureEvent)
    }
  }, [
    preventDefault, createTouchPoint, calculateDistance, createGestureEvent,
    enablePinch, enableRotation, handlers.onPinch, handlers.onRotate, handlers.onPan
  ])

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (preventDefault) event.preventDefault()
    
    if (!touchStart.current || !touchCurrent.current) return

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    const touchPoint = touchCurrent.current
    const distance = calculateDistance(touchStart.current, touchPoint)
    const velocity = calculateVelocity(touchStart.current, touchPoint)
    const gestureEvent = createGestureEvent('touchend', touchStart.current, touchPoint, touchPoint)

    // Handle tap gestures
    if (distance < 20 && !isLongPress.current) {
      const now = Date.now()
      const timeSinceLastTap = now - lastTap.current
      
      if (timeSinceLastTap < DOUBLE_TAP_DELAY && timeSinceLastTap > 50) {
        // Double tap
        triggerHaptic('light')
        handlers.onDoubleTap?.(gestureEvent)
        lastTap.current = 0
      } else {
        // Single tap (wait to see if double tap follows)
        lastTap.current = now
        setTimeout(() => {
          if (lastTap.current === now) {
            triggerHaptic('light')
            handlers.onTap?.(gestureEvent)
          }
        }, DOUBLE_TAP_DELAY)
      }
      return
    }

    // Handle swipe gestures
    if (distance >= SWIPE_THRESHOLD && velocity >= VELOCITY_THRESHOLD) {
      const direction = gestureEvent.direction
      
      // Check for edge swipes first
      const edge = isEdgeSwipe(touchStart.current)
      if (edge && enableEdgeSwipes) {
        triggerHaptic('medium')
        handlers.onEdgeSwipe?.({ ...gestureEvent, edge })
        return
      }

      // Regular swipe
      triggerHaptic('light')
      switch (direction) {
        case 'up':
          handlers.onSwipeUp?.(gestureEvent)
          break
        case 'down':
          handlers.onSwipeDown?.(gestureEvent)
          break
        case 'left':
          handlers.onSwipeLeft?.(gestureEvent)
          break
        case 'right':
          handlers.onSwipeRight?.(gestureEvent)
          break
      }
    }

    // Clean up
    touches.current.clear()
    touchStart.current = null
    touchCurrent.current = null
    isLongPress.current = false
    initialDistance.current = 0
    initialRotation.current = 0
  }, [
    preventDefault, calculateDistance, calculateVelocity, createGestureEvent,
    isEdgeSwipe, enableEdgeSwipes, handlers
  ])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const options = { passive, capture: true }
    
    element.addEventListener('touchstart', handleTouchStart, options)
    element.addEventListener('touchmove', handleTouchMove, options)
    element.addEventListener('touchend', handleTouchEnd, options)
    element.addEventListener('touchcancel', handleTouchEnd, options)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart, options)
      element.removeEventListener('touchmove', handleTouchMove, options)
      element.removeEventListener('touchend', handleTouchEnd, options)
      element.removeEventListener('touchcancel', handleTouchEnd, options)
    }
  }, [
    elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, passive
  ])

  // Return gesture engine state and utilities
  return {
    isGestureActive: touchStart.current !== null,
    currentGesture: touchCurrent.current ? {
      startPoint: touchStart.current!,
      currentPoint: touchCurrent.current,
      deltaX: touchCurrent.current.x - touchStart.current!.x,
      deltaY: touchCurrent.current.y - touchStart.current!.y,
      distance: calculateDistance(touchStart.current!, touchCurrent.current)
    } : null,
    touchCount: touches.current.size
  }
}

// Predefined gesture patterns for common UI interactions
export const GESTURE_PATTERNS = {
  // System gestures
  HOME: { direction: 'up', edge: 'bottom', minDistance: 100 },
  BACK: { direction: 'right', edge: 'left', minDistance: 50 },
  RECENTS: { direction: 'up', edge: 'bottom', minDistance: 50, hold: true },
  NOTIFICATIONS: { direction: 'down', edge: 'top', minDistance: 100 },
  QUICK_SETTINGS: { direction: 'down', edge: 'top', twoFingers: true },
  
  // App gestures
  CLOSE_APP: { direction: 'up', minDistance: 200, velocity: 0.5 },
  MINIMIZE: { direction: 'down', minDistance: 100 },
  SPLIT_SCREEN: { direction: 'up', hold: true, duration: 1000 },
  
  // Navigation gestures
  DRAWER: { direction: 'right', edge: 'left', minDistance: 80 },
  MENU: { direction: 'down', edge: 'top', minDistance: 60 },
  REFRESH: { direction: 'down', minDistance: 120, velocity: 0.3 }
} as const
