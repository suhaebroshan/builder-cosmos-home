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
    const userAgent = navigator.userAgent.toLowerCase()

    // Check for mobile devices in user agent
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)

    // Phone: < 768px width OR mobile user agent with small screen
    if (width < 768 || (isMobileUA && width < 1024)) {
      return 'phone'
    }

    // Tablet: 768px - 1366px width and (touch device OR tablet user agent)
    if (width >= 768 && width <= 1366 && (isTouchDevice || /ipad|android/i.test(userAgent))) {
      return 'tablet'
    }

    // Desktop: > 1366px or no touch device and not mobile UA
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
          navigationStyle: 'buttons' as const, // Default to buttons
          appDrawer: true,
          notificationPanel: true,
          quickSettings: true,
          bouncyAnimations: true,
          statusBarHeight: 28,
          navigationBarHeight: 56,
          windowPadding: 0,
          maxViewportWidth: deviceInfo.screenWidth,
          maxViewportHeight: deviceInfo.screenHeight - 84 // Status bar + nav bar
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
          navigationStyle: 'buttons' as const, // Default to buttons
          appDrawer: true,
          notificationPanel: true,
          quickSettings: true,
          bouncyAnimations: true,
          statusBarHeight: 32,
          navigationBarHeight: 56,
          showMinimalTaskbar: true,  // 20% desktop feature
          windowPadding: 8,
          maxViewportWidth: deviceInfo.screenWidth - 16,
          maxViewportHeight: deviceInfo.screenHeight - 88 // Status bar + nav bar
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
          navigationBarHeight: 0,
          windowPadding: 20,
          maxViewportWidth: deviceInfo.screenWidth - 40,
          maxViewportHeight: deviceInfo.screenHeight - 80 // Taskbar space
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
