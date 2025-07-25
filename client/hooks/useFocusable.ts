import { useRef, useEffect, useState } from 'react'

interface UseFocusableOptions {
  onEnter?: () => void
  onSpace?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onEscape?: () => void
  autoFocus?: boolean
  disabled?: boolean
}

export const useFocusable = (options: UseFocusableOptions = {}) => {
  const {
    onEnter,
    onSpace,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEscape,
    autoFocus = false,
    disabled = false
  } = options

  const ref = useRef<HTMLElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (autoFocus && ref.current && !disabled) {
      ref.current.focus()
    }
  }, [autoFocus, disabled])

  useEffect(() => {
    const element = ref.current
    if (!element || disabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          if (onEnter) {
            event.preventDefault()
            onEnter()
          }
          break
        case ' ':
          if (onSpace) {
            event.preventDefault()
            onSpace()
          }
          break
        case 'ArrowUp':
          if (onArrowUp) {
            event.preventDefault()
            onArrowUp()
          }
          break
        case 'ArrowDown':
          if (onArrowDown) {
            event.preventDefault()
            onArrowDown()
          }
          break
        case 'ArrowLeft':
          if (onArrowLeft) {
            event.preventDefault()
            onArrowLeft()
          }
          break
        case 'ArrowRight':
          if (onArrowRight) {
            event.preventDefault()
            onArrowRight()
          }
          break
        case 'Escape':
          if (onEscape) {
            event.preventDefault()
            onEscape()
          }
          break
      }
    }

    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => setIsFocused(false)

    element.addEventListener('keydown', handleKeyDown)
    element.addEventListener('focus', handleFocus)
    element.addEventListener('blur', handleBlur)

    return () => {
      element.removeEventListener('keydown', handleKeyDown)
      element.removeEventListener('focus', handleFocus)
      element.removeEventListener('blur', handleBlur)
    }
  }, [onEnter, onSpace, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEscape, disabled])

  const focusableProps = {
    ref,
    tabIndex: disabled ? -1 : 0,
    'data-focusable': true,
    style: {
      outline: isFocused ? '2px solid rgba(59, 130, 246, 0.6)' : 'none',
      outlineOffset: '2px',
      ...(!disabled && {
        cursor: 'pointer'
      })
    }
  }

  return {
    ref,
    isFocused,
    focusableProps,
    focus: () => ref.current?.focus(),
    blur: () => ref.current?.blur()
  }
}
