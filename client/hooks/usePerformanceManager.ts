import { useState, useEffect, useCallback } from 'react'
import { useDeviceDetection } from './useDeviceDetection'

export interface PerformanceProfile {
  name: 'ultra' | 'high' | 'medium' | 'low' | 'potato'
  animationDuration: number
  particleCount: number
  blurIntensity: number
  shadowQuality: 'high' | 'medium' | 'low' | 'none'
  enableAdvancedEffects: boolean
  enableParticles: boolean
  enableWallpaperAnimations: boolean
  maxWindows: number
  frameRateTarget: number
  useReducedMotion: boolean
  enableGPUAcceleration: boolean
  memoryOptimization: boolean
}

const PERFORMANCE_PROFILES: Record<PerformanceProfile['name'], PerformanceProfile> = {
  ultra: {
    name: 'ultra',
    animationDuration: 1000,
    particleCount: 100,
    blurIntensity: 20,
    shadowQuality: 'high',
    enableAdvancedEffects: true,
    enableParticles: true,
    enableWallpaperAnimations: true,
    maxWindows: 20,
    frameRateTarget: 120,
    useReducedMotion: false,
    enableGPUAcceleration: true,
    memoryOptimization: false,
  },
  high: {
    name: 'high',
    animationDuration: 800,
    particleCount: 75,
    blurIntensity: 16,
    shadowQuality: 'high',
    enableAdvancedEffects: true,
    enableParticles: true,
    enableWallpaperAnimations: true,
    maxWindows: 15,
    frameRateTarget: 60,
    useReducedMotion: false,
    enableGPUAcceleration: true,
    memoryOptimization: false,
  },
  medium: {
    name: 'medium',
    animationDuration: 600,
    particleCount: 50,
    blurIntensity: 12,
    shadowQuality: 'medium',
    enableAdvancedEffects: true,
    enableParticles: true,
    enableWallpaperAnimations: true,
    maxWindows: 12,
    frameRateTarget: 60,
    useReducedMotion: false,
    enableGPUAcceleration: true,
    memoryOptimization: true,
  },
  low: {
    name: 'low',
    animationDuration: 400,
    particleCount: 25,
    blurIntensity: 8,
    shadowQuality: 'low',
    enableAdvancedEffects: false,
    enableParticles: true,
    enableWallpaperAnimations: false,
    maxWindows: 8,
    frameRateTarget: 30,
    useReducedMotion: false,
    enableGPUAcceleration: true,
    memoryOptimization: true,
  },
  potato: {
    name: 'potato',
    animationDuration: 200,
    particleCount: 10,
    blurIntensity: 4,
    shadowQuality: 'none',
    enableAdvancedEffects: false,
    enableParticles: false,
    enableWallpaperAnimations: false,
    maxWindows: 5,
    frameRateTarget: 30,
    useReducedMotion: true,
    enableGPUAcceleration: false,
    memoryOptimization: true,
  },
}

export const usePerformanceManager = () => {
  const { deviceInfo, isPhone, isTablet, isDesktop } = useDeviceDetection()
  const [currentProfile, setCurrentProfile] = useState<PerformanceProfile['name']>('high')
  const [performanceStats, setPerformanceStats] = useState({
    fps: 60,
    memoryUsage: 0,
    cpuUsage: 0,
    batteryLevel: 100,
    isLowPowerMode: false,
  })
  const [autoOptimize, setAutoOptimize] = useState(true)

  // Detect device capabilities and set initial profile
  const detectOptimalProfile = useCallback((): PerformanceProfile['name'] => {
    const memory = (navigator as any).deviceMemory || 4
    const cores = navigator.hardwareConcurrency || 4
    const connection = (navigator as any).connection
    const effectiveType = connection?.effectiveType || '4g'
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return 'low'

    // Battery API check
    const battery = (navigator as any).getBattery?.()
    const isLowBattery = battery?.level < 0.2 || battery?.charging === false

    // Device-specific optimization
    if (isPhone) {
      if (memory >= 8 && cores >= 8 && !isLowBattery) return 'high'
      if (memory >= 6 && cores >= 6) return 'medium'
      if (memory >= 4) return 'low'
      return 'potato'
    }

    if (isTablet) {
      if (memory >= 8 && cores >= 8 && !isLowBattery) return 'high'
      if (memory >= 6) return 'medium'
      return 'low'
    }

    // Desktop
    if (memory >= 16 && cores >= 8) return 'ultra'
    if (memory >= 8 && cores >= 6) return 'high'
    if (memory >= 4) return 'medium'
    return 'low'
  }, [isPhone, isTablet, isDesktop])

  // Monitor performance metrics
  useEffect(() => {
    let animationFrameId: number
    let frameCount = 0
    let lastTime = performance.now()
    
    const measurePerformance = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        
        setPerformanceStats(prev => ({
          ...prev,
          fps,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        }))
        
        frameCount = 0
        lastTime = currentTime
        
        // Auto-optimize based on performance
        if (autoOptimize) {
          if (fps < 30 && currentProfile !== 'potato') {
            const profiles: PerformanceProfile['name'][] = ['ultra', 'high', 'medium', 'low', 'potato']
            const currentIndex = profiles.indexOf(currentProfile)
            if (currentIndex < profiles.length - 1) {
              setCurrentProfile(profiles[currentIndex + 1])
            }
          } else if (fps > 55 && currentProfile !== 'ultra') {
            const profiles: PerformanceProfile['name'][] = ['potato', 'low', 'medium', 'high', 'ultra']
            const currentIndex = profiles.indexOf(currentProfile)
            if (currentIndex < profiles.length - 1) {
              setCurrentProfile(profiles[currentIndex + 1])
            }
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(measurePerformance)
    }
    
    measurePerformance()
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [autoOptimize, currentProfile])

  // Battery monitoring
  useEffect(() => {
    const monitorBattery = async () => {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery()
        
        const updateBatteryInfo = () => {
          setPerformanceStats(prev => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            isLowPowerMode: battery.level < 0.2 && !battery.charging,
          }))
          
          // Auto-reduce quality on low battery
          if (autoOptimize && battery.level < 0.15 && !battery.charging) {
            setCurrentProfile('potato')
          }
        }
        
        battery.addEventListener('levelchange', updateBatteryInfo)
        battery.addEventListener('chargingchange', updateBatteryInfo)
        updateBatteryInfo()
        
        return () => {
          battery.removeEventListener('levelchange', updateBatteryInfo)
          battery.removeEventListener('chargingchange', updateBatteryInfo)
        }
      }
    }
    
    monitorBattery()
  }, [autoOptimize])

  // Initialize optimal profile
  useEffect(() => {
    if (autoOptimize) {
      setCurrentProfile(detectOptimalProfile())
    }
  }, [detectOptimalProfile, autoOptimize])

  // Memory cleanup utilities
  const optimizeMemory = useCallback(() => {
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc()
    }
    
    // Clear any cached resources
    const caches = document.querySelectorAll('img, video, canvas')
    caches.forEach(element => {
      if (element instanceof HTMLImageElement && !element.complete) {
        element.src = ''
      }
    })
    
    // Clear any unused event listeners
    window.dispatchEvent(new CustomEvent('nyx:cleanup-memory'))
  }, [])

  // Get current performance profile
  const profile = PERFORMANCE_PROFILES[currentProfile]

  // Quality-specific CSS variables
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--animation-duration', `${profile.animationDuration}ms`)
    root.style.setProperty('--blur-intensity', `${profile.blurIntensity}px`)
    root.style.setProperty('--particle-count', profile.particleCount.toString())
    root.style.setProperty('--frame-rate-target', profile.frameRateTarget.toString())
    
    // Performance optimizations
    if (profile.enableGPUAcceleration) {
      root.style.setProperty('--gpu-acceleration', 'translateZ(0)')
    } else {
      root.style.setProperty('--gpu-acceleration', 'none')
    }
    
    if (profile.useReducedMotion) {
      root.style.setProperty('--reduced-motion', 'reduce')
    } else {
      root.style.setProperty('--reduced-motion', 'no-preference')
    }
  }, [profile])

  return {
    profile,
    currentProfile,
    setCurrentProfile,
    performanceStats,
    autoOptimize,
    setAutoOptimize,
    optimizeMemory,
    isLowPerformance: currentProfile === 'low' || currentProfile === 'potato',
    isHighPerformance: currentProfile === 'ultra' || currentProfile === 'high',
  }
}
