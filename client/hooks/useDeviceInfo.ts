import { useState, useEffect, useCallback } from 'react'

interface NetworkInfo {
  online: boolean
  type: 'wifi' | 'cellular' | 'bluetooth' | 'ethernet' | 'none' | 'unknown'
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g' | 'unknown'
  downlink: number
  rtt: number
  saveData: boolean
}

interface BatteryInfo {
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
}

interface DeviceSystemInfo {
  battery: BatteryInfo
  network: NetworkInfo
  time: Date
  timeZone: string
  userAgent: string
  language: string
  platform: string
  memory: number
  cpuCores: number
  isOnline: boolean
}

export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceSystemInfo>({
    battery: {
      level: 0.87, // Fallback values
      charging: false,
      chargingTime: Infinity,
      dischargingTime: Infinity,
    },
    network: {
      online: navigator.onLine,
      type: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      saveData: false,
    },
    time: new Date(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    memory: (navigator as any).deviceMemory || 4,
    cpuCores: navigator.hardwareConcurrency || 4,
    isOnline: navigator.onLine,
  })

  const [isSupported, setIsSupported] = useState({
    battery: false,
    connection: false,
  })

  // Update time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setDeviceInfo(prev => ({
        ...prev,
        time: new Date(),
      }))
    }, 1000)

    return () => clearInterval(timeInterval)
  }, [])

  // Initialize battery information
  useEffect(() => {
    const initBattery = async () => {
      try {
        // Check if Battery API is supported
        if ('getBattery' in navigator) {
          const battery = await (navigator as any).getBattery()
          setIsSupported(prev => ({ ...prev, battery: true }))

          const updateBatteryInfo = () => {
            setDeviceInfo(prev => ({
              ...prev,
              battery: {
                level: battery.level,
                charging: battery.charging,
                chargingTime: battery.chargingTime,
                dischargingTime: battery.dischargingTime,
              },
            }))
          }

          // Initial update
          updateBatteryInfo()

          // Listen for battery events
          battery.addEventListener('chargingchange', updateBatteryInfo)
          battery.addEventListener('levelchange', updateBatteryInfo)
          battery.addEventListener('chargingtimechange', updateBatteryInfo)
          battery.addEventListener('dischargingtimechange', updateBatteryInfo)

          return () => {
            battery.removeEventListener('chargingchange', updateBatteryInfo)
            battery.removeEventListener('levelchange', updateBatteryInfo)
            battery.removeEventListener('chargingtimechange', updateBatteryInfo)
            battery.removeEventListener('dischargingtimechange', updateBatteryInfo)
          }
        }
      } catch (error) {
        console.warn('Battery API not supported or permission denied')
        // Use simulated battery data
        const simulateBattery = () => {
          setDeviceInfo(prev => {
            const newLevel = Math.max(0.1, prev.battery.level - (Math.random() * 0.001))
            const charging = newLevel < 0.2 ? Math.random() > 0.7 : Math.random() > 0.9
            
            return {
              ...prev,
              battery: {
                ...prev.battery,
                level: charging ? Math.min(1, prev.battery.level + 0.002) : newLevel,
                charging,
              },
            }
          })
        }

        const batterySimInterval = setInterval(simulateBattery, 10000)
        return () => clearInterval(batterySimInterval)
      }
    }

    initBattery()
  }, [])

  // Initialize network information
  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection

      if (connection) {
        setIsSupported(prev => ({ ...prev, connection: true }))
        setDeviceInfo(prev => ({
          ...prev,
          network: {
            online: navigator.onLine,
            type: connection.type || 'unknown',
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink || 0,
            rtt: connection.rtt || 0,
            saveData: connection.saveData || false,
          },
        }))
      } else {
        // Fallback for browsers without Network Information API
        setDeviceInfo(prev => ({
          ...prev,
          network: {
            online: navigator.onLine,
            type: navigator.onLine ? 'wifi' : 'none',
            effectiveType: navigator.onLine ? '4g' : 'unknown',
            downlink: navigator.onLine ? 10 : 0,
            rtt: navigator.onLine ? 50 : 0,
            saveData: false,
          },
        }))
      }

      setDeviceInfo(prev => ({
        ...prev,
        isOnline: navigator.onLine,
      }))
    }

    // Initial update
    updateNetworkInfo()

    // Listen for online/offline events
    const handleOnline = () => updateNetworkInfo()
    const handleOffline = () => updateNetworkInfo()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for connection changes
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  // Helper functions
  const getBatteryPercentage = useCallback(() => {
    return Math.round(deviceInfo.battery.level * 100)
  }, [deviceInfo.battery.level])

  const getNetworkType = useCallback(() => {
    if (!deviceInfo.network.online) return 'No Signal'
    
    switch (deviceInfo.network.effectiveType) {
      case 'slow-2g':
      case '2g':
        return '2G'
      case '3g':
        return '3G'
      case '4g':
        return deviceInfo.network.type === 'wifi' ? 'WiFi' : 'LTE'
      default:
        return deviceInfo.network.type === 'wifi' ? 'WiFi' : 'LTE'
    }
  }, [deviceInfo.network])

  const getSignalStrength = useCallback(() => {
    if (!deviceInfo.network.online) return 0
    
    // Estimate signal strength based on RTT and downlink
    const rtt = deviceInfo.network.rtt
    const downlink = deviceInfo.network.downlink
    
    if (rtt === 0 && downlink === 0) return 3 // Default when no data available
    
    // Lower RTT = better signal, higher downlink = better signal
    let strength = 4
    if (rtt > 200 || downlink < 1) strength = 1
    else if (rtt > 100 || downlink < 5) strength = 2
    else if (rtt > 50 || downlink < 10) strength = 3
    
    return strength
  }, [deviceInfo.network])

  const formatTime = useCallback((format: '12h' | '24h' = '24h') => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: format === '12h',
    }
    return deviceInfo.time.toLocaleTimeString([], options)
  }, [deviceInfo.time])

  const formatDate = useCallback(() => {
    return deviceInfo.time.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [deviceInfo.time])

  const getDeviceSpecs = useCallback(() => {
    return {
      memory: `${deviceInfo.memory}GB RAM`,
      cpu: `${deviceInfo.cpuCores} cores`,
      platform: deviceInfo.platform,
      language: deviceInfo.language,
      timezone: deviceInfo.timeZone,
    }
  }, [deviceInfo])

  return {
    deviceInfo,
    isSupported,
    getBatteryPercentage,
    getNetworkType,
    getSignalStrength,
    formatTime,
    formatDate,
    getDeviceSpecs,
  }
}

// Hook for monitoring performance metrics
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memory: 0,
    loadTime: 0,
    paintTime: 0,
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime)),
        }))
        frameCount = 0
        lastTime = currentTime
      }
      
      animationId = requestAnimationFrame(measureFPS)
    }

    animationId = requestAnimationFrame(measureFPS)

    // Memory usage (if supported)
    if ('memory' in performance) {
      const updateMemory = () => {
        const memoryInfo = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memory: memoryInfo.usedJSHeapSize / (1024 * 1024), // MB
        }))
      }
      
      const memoryInterval = setInterval(updateMemory, 2000)
      
      return () => {
        cancelAnimationFrame(animationId)
        clearInterval(memoryInterval)
      }
    }

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return metrics
}
