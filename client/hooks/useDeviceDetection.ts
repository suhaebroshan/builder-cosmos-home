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
          maxWindows: 3,
          defaultWindowMode: 'fullscreen' as const,
          taskbarPosition: 'bottom' as const,
          showAppSwitcher: true,
          useSwipeGestures: true
        }
      case 'tablet':
        return {
          hasWindowControls: true,
          allowWindowResize: true,
          allowWindowMove: true,
          useGestures: true,
          supportsSplitScreen: true,
          supportsFloatingWindows: true,
          maxWindows: 6,
          defaultWindowMode: 'windowed' as const,
          taskbarPosition: 'bottom' as const,
          showAppSwitcher: true,
          useSwipeGestures: true
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
          maxWindows: 10,
          defaultWindowMode: 'windowed' as const,
          taskbarPosition: 'bottom' as const,
          showAppSwitcher: false,
          useSwipeGestures: false
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
