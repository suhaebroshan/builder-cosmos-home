import { invoke } from '@tauri-apps/api/tauri'
import { appWindow } from '@tauri-apps/api/window'
import { platform, arch, hostname } from '@tauri-apps/api/os'
import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/api/notification'
import { listen, UnlistenFn } from '@tauri-apps/api/event'

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

  // Set up window for NYX OS experience
  await appWindow.setTitle('NYX OS')
  await appWindow.setFullscreen(true)
  await appWindow.center()

  // Listen for window events
  await appWindow.listen('tauri://close-requested', () => {
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

// New: Global shortcut and native window helpers
export const registerGlobalShortcut = async (accelerator: string): Promise<void> => {
  if (!isTauri()) return
  await invoke('register_global_shortcut', { accelerator })
}

export const unregisterGlobalShortcut = async (accelerator: string): Promise<void> => {
  if (!isTauri()) return
  await invoke('unregister_global_shortcut', { accelerator })
}

export const listenGlobalShortcuts = async (handler: (payload: any) => void): Promise<UnlistenFn | undefined> => {
  if (!isTauri()) return undefined
  const unlisten = await listen('nyx:global-shortcut', (event) => {
    handler(event.payload)
  })
  return unlisten
}

export const listenNativeWindowCreated = async (handler: (label: string) => void): Promise<UnlistenFn | undefined> => {
  if (!isTauri()) return undefined
  const unlisten = await listen('nyx:native-window-created', (event) => {
    handler(event.payload as string)
  })
  return unlisten
}

export const createNativeWindow = async (label: string, title: string, width?: number, height?: number): Promise<void> => {
  if (!isTauri()) return
  await invoke('create_native_window', { label, title, width, height })
}

export const focusNativeWindow = async (label: string): Promise<void> => {
  if (!isTauri()) return
  await invoke('focus_native_window', { label })
}

export const closeNativeWindow = async (label: string): Promise<void> => {
  if (!isTauri()) return
  await invoke('close_native_window', { label })
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
  enableAutoStartup,
  registerGlobalShortcut,
  unregisterGlobalShortcut,
  listenGlobalShortcuts,
  listenNativeWindowCreated,
  createNativeWindow,
  focusNativeWindow,
  closeNativeWindow,
}
