import { useState, useEffect } from 'react'

export type DeviceType = 'phone' | 'tablet' | 'desktop'

export interface DeviceInfo {
  type: DeviceType
  isTouchDevice: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
  platform: string
  supportsHover: boolean
}

export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    isTouchDevice: false,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    platform: navigator.platform,
    supportsHover: window.matchMedia('(hover: hover)').matches
  })

  const detectDevice = (): DeviceType => {
    const width = window.innerWidth
    const height = window.innerHeight
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    // Phone: < 768px width in any orientation
    if (width < 768) {
      return 'phone'
    }

    // Tablet: 768px - 1200px width and touch device OR portrait orientation with touch
    if ((width >= 768 && width <= 1200 && isTouchDevice) || (height > width && width < 1200 && isTouchDevice)) {
      return 'tablet'
    }

    // Desktop: > 1200px or no touch device
    return 'desktop'
  }

  const updateDeviceInfo = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const supportsHover = window.matchMedia('(hover: hover)').matches
    
    setDeviceInfo({
      type: detectDevice(),
      isTouchDevice,
      screenWidth: width,
      screenHeight: height,
      orientation: width > height ? 'landscape' : 'portrait',
      platform: navigator.platform,
      supportsHover
    })
  }

  useEffect(() => {
    updateDeviceInfo()
    
    const handleResize = () => updateDeviceInfo()
    const handleOrientationChange = () => {
      setTimeout(updateDeviceInfo, 100) // Delay for orientation change
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  // Platform-specific UI configurations
  const getUIConfig = () => {
    switch (deviceInfo.type) {
      case 'phone':
        return {
          hasWindowControls: false,
          allowWindowResize: false,
          allowWindowMove: false,
          useGestures: true,
          supportsSplitScreen: true,
          supportsFloatingWindows: true,
          maxWindows: 8,
          defaultWindowMode: 'fullscreen' as const,
          taskbarPosition: 'hidden' as const,
          showAppSwitcher: true,
          useSwipeGestures: true,
          androidStyle: true,
          showNavigationBar: true,
          navigationStyle: 'gestures' as const, // or 'buttons'
          appDrawer: true,
          notificationPanel: true,
          quickSettings: true,
          bouncyAnimations: true,
          statusBarHeight: 24,
          navigationBarHeight: 48
        }
      case 'tablet':
        return {
          hasWindowControls: false, // 80% phone-like
          allowWindowResize: true,  // 20% desktop-like
          allowWindowMove: true,    // 20% desktop-like
          useGestures: true,        // 80% phone-like
          supportsSplitScreen: true,
          supportsFloatingWindows: true,
          maxWindows: 12,
          defaultWindowMode: 'fullscreen' as const, // 80% phone-like
          taskbarPosition: 'bottom' as const, // 20% desktop-like
          showAppSwitcher: true,
          useSwipeGestures: true,
          androidStyle: true,       // 80% phone-like
          showNavigationBar: true,
          navigationStyle: 'gestures' as const,
          appDrawer: true,
          notificationPanel: true,
          quickSettings: true,
          bouncyAnimations: true,
          statusBarHeight: 28,
          navigationBarHeight: 52,
          showMinimalTaskbar: true  // 20% desktop feature
        }
      case 'desktop':
      default:
        return {
          hasWindowControls: true,
          allowWindowResize: true,
          allowWindowMove: true,
          useGestures: false,
          supportsSplitScreen: false,
          supportsFloatingWindows: false,
          maxWindows: 20,
          defaultWindowMode: 'windowed' as const,
          taskbarPosition: 'bottom' as const,
          showAppSwitcher: false,
          useSwipeGestures: false,
          androidStyle: false,
          showNavigationBar: false,
          appDrawer: false,
          notificationPanel: false,
          quickSettings: false,
          bouncyAnimations: false,
          statusBarHeight: 0,
          navigationBarHeight: 0
        }
    }
  }

  return {
    deviceInfo,
    uiConfig: getUIConfig(),
    isPhone: deviceInfo.type === 'phone',
    isTablet: deviceInfo.type === 'tablet',
    isDesktop: deviceInfo.type === 'desktop',
    isMobile: deviceInfo.type === 'phone' || deviceInfo.type === 'tablet'
  }
}
