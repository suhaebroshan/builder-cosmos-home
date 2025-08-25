import { useEffect, useState, useCallback } from 'react'
import TauriAPI, { SystemInfo, AppInfo, PerformanceInfo } from '@/lib/tauri-api'

interface TauriState {
  isNative: boolean
  systemInfo: SystemInfo | null
  availableApps: AppInfo[]
  performanceInfo: PerformanceInfo | null
  isLoading: boolean
}

export const useTauriIntegration = () => {
  const [state, setState] = useState<TauriState>({
    isNative: false,
    systemInfo: null,
    availableApps: [],
    performanceInfo: null,
    isLoading: true
  })

  // Initialize Tauri integration
  useEffect(() => {
    const initTauri = async () => {
      const isNative = TauriAPI.isTauri()
      
      setState(prev => ({ ...prev, isNative, isLoading: true }))
      
      if (isNative) {
        try {
          // Initialize NYX window for native experience
          await TauriAPI.initializeNyxWindow()
          
          // Get system information
          const systemInfo = await TauriAPI.getSystemInfo()
          
          // Get available desktop apps
          const availableApps = await TauriAPI.getDesktopApps()
          
          // Get initial performance info
          const performanceInfo = await TauriAPI.getPerformanceInfo()
          
          setState(prev => ({
            ...prev,
            systemInfo,
            availableApps,
            performanceInfo,
            isLoading: false
          }))
          
          // Show welcome notification for native app
          await TauriAPI.showNotification(
            'Welcome to NYX OS',
            'Your native NYX OS experience is ready!'
          )
          
        } catch (error) {
          console.error('Failed to initialize Tauri:', error)
          setState(prev => ({ ...prev, isLoading: false }))
        }
      } else {
        // Web fallback
        const systemInfo = await TauriAPI.getSystemInfo()
        const availableApps = await TauriAPI.getDesktopApps()
        
        setState(prev => ({
          ...prev,
          systemInfo,
          availableApps,
          isLoading: false
        }))
      }
    }
    
    initTauri()
  }, [])

  // Performance monitoring
  useEffect(() => {
    if (!state.isNative) return

    const interval = setInterval(async () => {
      try {
        const performanceInfo = await TauriAPI.getPerformanceInfo()
        setState(prev => ({ ...prev, performanceInfo }))
      } catch (error) {
        console.error('Failed to get performance info:', error)
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [state.isNative])

  // Window management functions
  const windowControls = {
    minimize: useCallback(async () => {
      await TauriAPI.minimizeWindow()
    }, []),
    
    maximize: useCallback(async () => {
      await TauriAPI.maximizeWindow()
    }, []),
    
    toggleFullscreen: useCallback(async (fullscreen: boolean) => {
      await TauriAPI.setWindowFullscreen(fullscreen)
    }, []),
    
    hide: useCallback(async () => {
      await TauriAPI.hideWindow()
    }, []),
    
    show: useCallback(async () => {
      await TauriAPI.showWindow()
    }, []),
    
    setAlwaysOnTop: useCallback(async (alwaysOnTop: boolean) => {
      await TauriAPI.setWindowAlwaysOnTop(alwaysOnTop)
    }, [])
  }

  // App management functions
  const appControls = {
    launchApp: useCallback(async (appPath: string) => {
      await TauriAPI.launchExternalApp(appPath)
    }, []),
    
    refreshApps: useCallback(async () => {
      try {
        const availableApps = await TauriAPI.getDesktopApps()
        setState(prev => ({ ...prev, availableApps }))
      } catch (error) {
        console.error('Failed to refresh apps:', error)
      }
    }, [])
  }

  // System functions
  const systemControls = {
    showNotification: useCallback(async (title: string, body: string) => {
      await TauriAPI.showNotification(title, body)
    }, []),
    
    enableAutoStartup: useCallback(async () => {
      await TauriAPI.enableAutoStartup()
    }, []),
    
    refreshSystemInfo: useCallback(async () => {
      try {
        const systemInfo = await TauriAPI.getSystemInfo()
        setState(prev => ({ ...prev, systemInfo }))
      } catch (error) {
        console.error('Failed to refresh system info:', error)
      }
    }, [])
  }

  return {
    ...state,
    windowControls,
    appControls,
    systemControls
  }
}

export default useTauriIntegration
