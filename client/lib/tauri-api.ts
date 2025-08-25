import { invoke } from '@tauri-apps/api/tauri'
import { appWindow } from '@tauri-apps/api/window'
import { platform, arch, hostname } from '@tauri-apps/api/os'
import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/api/notification'

export interface SystemInfo {
  platform: string
  arch: string
  cpu_count: number
  hostname: string
}

export interface AppInfo {
  name: string
  path: string
  icon: string
}

export interface PerformanceInfo {
  memory_usage: string
  cpu_usage: string
  timestamp: number
}

// Check if running in Tauri
export const isTauri = () => {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined
}

// System Information
export const getSystemInfo = async (): Promise<SystemInfo> => {
  if (!isTauri()) {
    // Fallback for web version
    return {
      platform: 'web',
      arch: 'unknown',
      cpu_count: navigator.hardwareConcurrency || 4,
      hostname: 'localhost'
    }
  }
  
  return await invoke<SystemInfo>('get_system_info')
}

// Window Management
export const setWindowAlwaysOnTop = async (alwaysOnTop: boolean): Promise<void> => {
  if (!isTauri()) return

  await appWindow.setAlwaysOnTop(alwaysOnTop)
}

export const setWindowFullscreen = async (fullscreen: boolean): Promise<void> => {
  if (!isTauri()) return

  await appWindow.setFullscreen(fullscreen)
}

export const minimizeWindow = async (): Promise<void> => {
  if (!isTauri()) return

  await appWindow.minimize()
}

export const maximizeWindow = async (): Promise<void> => {
  if (!isTauri()) return

  await appWindow.maximize()
}

export const hideWindow = async (): Promise<void> => {
  if (!isTauri()) return

  await appWindow.hide()
}

export const showWindow = async (): Promise<void> => {
  if (!isTauri()) return

  await appWindow.show()
}

// App Management
export const launchExternalApp = async (appPath: string): Promise<void> => {
  if (!isTauri()) {
    // Fallback: open in web
    window.open(appPath, '_blank')
    return
  }
  
  await invoke('launch_external_app', { appPath })
}

export const getDesktopApps = async (): Promise<AppInfo[]> => {
  if (!isTauri()) {
    // Fallback web apps
    return [
      { name: 'File Manager', path: '#', icon: 'folder' },
      { name: 'Terminal', path: '#', icon: 'terminal' },
      { name: 'Web Browser', path: '#', icon: 'globe' }
    ]
  }
  
  return await invoke<AppInfo[]>('get_desktop_apps')
}

// Performance Monitoring
export const getPerformanceInfo = async (): Promise<PerformanceInfo> => {
  if (!isTauri()) {
    // Web fallback with basic info
    const memory = (performance as any).memory
    return {
      memory_usage: memory ? `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB` : 'Unknown',
      cpu_usage: 'Unknown',
      timestamp: Date.now()
    }
  }
  
  return await invoke<PerformanceInfo>('get_performance_info')
}

// Notifications
export const showNotification = async (title: string, body: string): Promise<void> => {
  if (!isTauri()) {
    // Web notification fallback
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body })
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          new Notification(title, { body })
        }
      }
    }
    return
  }
  
  let permissionGranted = await isPermissionGranted()
  if (!permissionGranted) {
    const permission = await requestPermission()
    permissionGranted = permission === 'granted'
  }
  
  if (permissionGranted) {
    await sendNotification({ title, body })
  }
}

// Platform-specific utilities
export const getPlatformInfo = async () => {
  if (!isTauri()) {
    return {
      platform: 'web',
      arch: 'unknown',
      hostname: 'localhost'
    }
  }
  
  return {
    platform: await platform(),
    arch: await arch(),
    hostname: await hostname()
  }
}

// Window state management for NYX OS
export const initializeNyxWindow = async () => {
  if (!isTauri()) return
  
  const window = getCurrentWindow()
  
  // Set up window for NYX OS experience
  await window.setTitle('NYX OS')
  await window.setFullscreen(true)
  await window.center()
  
  // Listen for window events
  window.listen('tauri://close-requested', () => {
    // Instead of closing, hide to system tray
    hideWindow()
  })
}

// Auto-startup functionality
export const enableAutoStartup = async (): Promise<void> => {
  if (!isTauri()) return
  
  // This would require additional Tauri plugins for auto-startup
  // For now, it's a placeholder
  console.log('Auto-startup enabled (requires additional configuration)')
}

export default {
  isTauri,
  getSystemInfo,
  setWindowAlwaysOnTop,
  setWindowFullscreen,
  minimizeWindow,
  maximizeWindow,
  hideWindow,
  showWindow,
  launchExternalApp,
  getDesktopApps,
  getPerformanceInfo,
  showNotification,
  getPlatformInfo,
  initializeNyxWindow,
  enableAutoStartup
}
