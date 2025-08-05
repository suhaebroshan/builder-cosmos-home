import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AuthMethod = 'none' | 'swipe' | 'passcode' | 'pattern'
export type DeviceType = 'phone' | 'tablet' | 'desktop'

interface DeviceAuthState {
  // Authentication preferences
  authMethod: AuthMethod
  passcode: string
  pattern: number[]
  biometricEnabled: boolean
  autoLockTimeout: number // minutes
  
  // Device preferences
  deviceType: DeviceType
  navigationStyle: 'gestures' | 'buttons'
  
  // UI preferences
  showStatusBar: boolean
  statusBarStyle: 'light' | 'dark' | 'auto'
  showNotificationDots: boolean
  enableHapticFeedback: boolean
  animationSpeed: 'slow' | 'normal' | 'fast'
  
  // Quick Settings
  quickSettingsEnabled: boolean
  quickSettingsTiles: string[]
  
  // Lock screen
  isLocked: boolean
  lockTime: number | null
  failedAttempts: number
  maxFailedAttempts: number
  
  // Actions
  setAuthMethod: (method: AuthMethod) => void
  setPasscode: (passcode: string) => void
  setPattern: (pattern: number[]) => void
  setBiometric: (enabled: boolean) => void
  setAutoLockTimeout: (minutes: number) => void
  setDeviceType: (type: DeviceType) => void
  setNavigationStyle: (style: 'gestures' | 'buttons') => void
  setStatusBarPreferences: (showStatusBar: boolean, style: 'light' | 'dark' | 'auto') => void
  setNotificationDots: (enabled: boolean) => void
  setHapticFeedback: (enabled: boolean) => void
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void
  setQuickSettings: (enabled: boolean, tiles: string[]) => void
  
  // Lock/Unlock
  lockDevice: () => void
  unlockDevice: () => void
  attemptUnlock: (input: string | number[]) => boolean
  resetFailedAttempts: () => void
  incrementFailedAttempts: () => void
  
  // Utility
  shouldAutoLock: () => boolean
  getAnimationDuration: () => number
}

export const useDeviceAuthStore = create<DeviceAuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      authMethod: 'swipe',
      passcode: '',
      pattern: [],
      biometricEnabled: false,
      autoLockTimeout: 5, // 5 minutes
      
      deviceType: 'desktop',
      navigationStyle: 'gestures',
      
      showStatusBar: true,
      statusBarStyle: 'auto',
      showNotificationDots: true,
      enableHapticFeedback: true,
      animationSpeed: 'normal',
      
      quickSettingsEnabled: true,
      quickSettingsTiles: [
        'wifi', 
        'bluetooth', 
        'airplane', 
        'brightness', 
        'volume', 
        'battery_saver',
        'do_not_disturb',
        'hotspot',
        'location',
        'auto_rotate',
        'flashlight',
        'dark_mode'
      ],
      
      isLocked: false,
      lockTime: null,
      failedAttempts: 0,
      maxFailedAttempts: 5,
      
      // Actions
      setAuthMethod: (method) => set({ authMethod: method }),
      
      setPasscode: (passcode) => set({ passcode }),
      
      setPattern: (pattern) => set({ pattern }),
      
      setBiometric: (enabled) => set({ biometricEnabled: enabled }),
      
      setAutoLockTimeout: (minutes) => set({ autoLockTimeout: minutes }),
      
      setDeviceType: (type) => set({ deviceType: type }),
      
      setNavigationStyle: (style) => set({ navigationStyle: style }),
      
      setStatusBarPreferences: (showStatusBar, style) => 
        set({ showStatusBar, statusBarStyle: style }),
      
      setNotificationDots: (enabled) => set({ showNotificationDots: enabled }),
      
      setHapticFeedback: (enabled) => set({ enableHapticFeedback: enabled }),
      
      setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
      
      setQuickSettings: (enabled, tiles) => 
        set({ quickSettingsEnabled: enabled, quickSettingsTiles: tiles }),
      
      lockDevice: () => set({ 
        isLocked: true, 
        lockTime: Date.now(),
        failedAttempts: 0 
      }),
      
      unlockDevice: () => set({ 
        isLocked: false, 
        lockTime: null,
        failedAttempts: 0 
      }),
      
      attemptUnlock: (input) => {
        const state = get()
        
        if (state.authMethod === 'swipe') {
          get().unlockDevice()
          return true
        }
        
        if (state.authMethod === 'passcode') {
          if (typeof input === 'string' && input === state.passcode) {
            get().unlockDevice()
            return true
          }
        }
        
        if (state.authMethod === 'pattern') {
          if (Array.isArray(input) && 
              input.length === state.pattern.length &&
              input.every((val, idx) => val === state.pattern[idx])) {
            get().unlockDevice()
            return true
          }
        }
        
        get().incrementFailedAttempts()
        return false
      },
      
      resetFailedAttempts: () => set({ failedAttempts: 0 }),
      
      incrementFailedAttempts: () => {
        const currentAttempts = get().failedAttempts + 1
        set({ failedAttempts: currentAttempts })
        
        // Auto-lock for extended time if max attempts reached
        if (currentAttempts >= get().maxFailedAttempts) {
          // Could implement temporary lockout here
          console.warn('Maximum failed attempts reached')
        }
      },
      
      shouldAutoLock: () => {
        const state = get()
        if (!state.lockTime || state.isLocked || state.autoLockTimeout === 0) {
          return false
        }
        
        const timeSinceLock = Date.now() - state.lockTime
        const timeoutMs = state.autoLockTimeout * 60 * 1000
        
        return timeSinceLock > timeoutMs
      },
      
      getAnimationDuration: () => {
        const speed = get().animationSpeed
        switch (speed) {
          case 'slow': return 0.6
          case 'fast': return 0.2
          default: return 0.3
        }
      }
    }),
    {
      name: 'nyx-device-auth-storage',
      partialize: (state) => ({
        authMethod: state.authMethod,
        passcode: state.passcode,
        pattern: state.pattern,
        biometricEnabled: state.biometricEnabled,
        autoLockTimeout: state.autoLockTimeout,
        deviceType: state.deviceType,
        navigationStyle: state.navigationStyle,
        showStatusBar: state.showStatusBar,
        statusBarStyle: state.statusBarStyle,
        showNotificationDots: state.showNotificationDots,
        enableHapticFeedback: state.enableHapticFeedback,
        animationSpeed: state.animationSpeed,
        quickSettingsEnabled: state.quickSettingsEnabled,
        quickSettingsTiles: state.quickSettingsTiles,
        maxFailedAttempts: state.maxFailedAttempts,
      }),
    }
  )
)

// Haptic feedback utility
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  const state = useDeviceAuthStore.getState()
  if (!state.enableHapticFeedback) return
  
  // For web, we can use vibration API if available
  if ('vibrator' in navigator || 'vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50]
    }
    navigator.vibrate?.(patterns[type])
  }
}

// Animation spring config based on user preference
export const getSpringConfig = () => {
  const speed = useDeviceAuthStore.getState().animationSpeed
  const configs = {
    slow: { tension: 200, friction: 20 },
    normal: { tension: 300, friction: 25 },
    fast: { tension: 500, friction: 30 }
  }
  return configs[speed]
}
