import React, { useEffect, useRef, useCallback, useState } from 'react'
import { usePerformanceManager } from '@/hooks/usePerformanceManager'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
  maxLife: number
  color: string
}

interface OptimizedLiveWallpaperProps {
  className?: string
}

export const OptimizedLiveWallpaper: React.FC<OptimizedLiveWallpaperProps> = ({ 
  className = "" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const lastFrameTime = useRef(0)
  const fpsCounter = useRef(0)
  const lastFpsUpdate = useRef(0)
  const [isVisible, setIsVisible] = useState(true)
  
  const { profile, performanceStats } = usePerformanceManager()
  const { deviceInfo } = useDeviceDetection()

  // Performance-based configuration
  const getConfig = useCallback(() => {
    const baseConfig = {
      particleCount: profile.particleCount,
      maxParticles: profile.particleCount * 2,
      targetFPS: profile.frameRateTarget,
      enableBlur: profile.blurIntensity > 0,
      enableGlow: profile.enableAdvancedEffects,
      animationSpeed: 1,
      cleanup: profile.memoryOptimization,
    }

    // Adjust for battery
    if (performanceStats.isLowPowerMode) {
      return {
        ...baseConfig,
        particleCount: Math.max(baseConfig.particleCount / 4, 5),
        targetFPS: 30,
        enableBlur: false,
        enableGlow: false,
        animationSpeed: 0.5,
      }
    }

    // Adjust for performance
    if (performanceStats.fps < 30) {
      return {
        ...baseConfig,
        particleCount: Math.max(baseConfig.particleCount / 2, 10),
        enableBlur: false,
        enableGlow: false,
      }
    }

    return baseConfig
  }, [profile, performanceStats])

  // Visibility observer for performance
  useEffect(() => {
    if (!profile.enableWallpaperAnimations) {
      setIsVisible(false)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    const canvas = canvasRef.current
    if (canvas) {
      observer.observe(canvas)
    }

    return () => {
      if (canvas) {
        observer.unobserve(canvas)
      }
    }
  }, [profile.enableWallpaperAnimations])

  // Particle creation
  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    const colors = [
      'rgba(139, 92, 246, ', // purple-500
      'rgba(168, 85, 247, ', // purple-400
      'rgba(59, 130, 246, ',  // blue-500
      'rgba(147, 51, 234, ',  // purple-600
      'rgba(79, 70, 229, ',   // indigo-600
    ]

    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 3 - 1,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      life: 0,
      maxLife: Math.random() * 200 + 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    }
  }, [])

  // Particle update
  const updateParticle = useCallback((particle: Particle, deltaTime: number, config: any): boolean => {
    particle.life += deltaTime * config.animationSpeed
    particle.x += particle.vx * deltaTime * 0.1 * config.animationSpeed
    particle.y += particle.vy * deltaTime * 0.1 * config.animationSpeed

    // Fade out over lifetime
    const lifeFactor = 1 - (particle.life / particle.maxLife)
    particle.opacity = lifeFactor * 0.8

    // Apply physics
    particle.vy += 0.01 * deltaTime // gravity
    particle.vx *= 0.99 // air resistance

    return particle.life < particle.maxLife && particle.y > -50
  }, [])

  // Render function with performance optimizations
  const render = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const config = getConfig()
    
    // Clear canvas efficiently
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set composite operation for performance
    ctx.globalCompositeOperation = 'normal'

    particlesRef.current.forEach((particle, index) => {
      if (!particle) return

      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      
      // Performance-based rendering
      if (config.enableGlow && profile.enableAdvancedEffects) {
        // Glow effect for high performance
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        )
        gradient.addColorStop(0, particle.color + particle.opacity + ')')
        gradient.addColorStop(0.5, particle.color + (particle.opacity * 0.5) + ')')
        gradient.addColorStop(1, particle.color + '0)')
        ctx.fillStyle = gradient
      } else {
        // Simple fill for performance
        ctx.fillStyle = particle.color + particle.opacity + ')'
      }
      
      ctx.fill()
    })

    // Add subtle background gradient for depth
    if (profile.enableAdvancedEffects) {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, 'rgba(79, 70, 229, 0.02)')
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.01)')
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0.02)')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [getConfig, profile.enableAdvancedEffects])

  // Main animation loop with FPS control
  const animate = useCallback((currentTime: number) => {
    if (!isVisible || !profile.enableWallpaperAnimations) {
      animationRef.current = requestAnimationFrame(animate)
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) {
      animationRef.current = requestAnimationFrame(animate)
      return
    }

    const config = getConfig()
    const targetFrameTime = 1000 / config.targetFPS
    const deltaTime = currentTime - lastFrameTime.current

    // Frame rate limiting
    if (deltaTime < targetFrameTime) {
      animationRef.current = requestAnimationFrame(animate)
      return
    }

    lastFrameTime.current = currentTime

    // FPS monitoring
    fpsCounter.current++
    if (currentTime - lastFpsUpdate.current >= 1000) {
      lastFpsUpdate.current = currentTime
      fpsCounter.current = 0
    }

    // Particle management
    const particles = particlesRef.current
    
    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      if (!updateParticle(particle, deltaTime, config)) {
        particles.splice(i, 1)
      }
    }

    // Add new particles based on performance
    if (particles.length < config.particleCount && Math.random() < 0.1) {
      particles.push(createParticle(canvas))
    }

    // Memory cleanup
    if (config.cleanup && particles.length > config.maxParticles) {
      particles.splice(0, particles.length - config.particleCount)
    }

    // Render
    render(canvas, ctx)

    animationRef.current = requestAnimationFrame(animate)
  }, [isVisible, profile.enableWallpaperAnimations, getConfig, updateParticle, createParticle, render])

  // Canvas setup and resize handling
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true, // Performance optimization
    })
    if (!ctx) return

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = profile.enableGPUAcceleration ? (window.devicePixelRatio || 1) : 1
      
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      ctx.scale(dpr, dpr)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }

    updateCanvasSize()

    const resizeObserver = new ResizeObserver(updateCanvasSize)
    resizeObserver.observe(canvas)

    return () => {
      resizeObserver.disconnect()
    }
  }, [profile.enableGPUAcceleration])

  // Start animation
  useEffect(() => {
    if (profile.enableWallpaperAnimations && isVisible) {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, profile.enableWallpaperAnimations, isVisible])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      particlesRef.current = []
    }
  }, [])

  // Memory cleanup listener
  useEffect(() => {
    const handleMemoryCleanup = () => {
      particlesRef.current = []
    }

    window.addEventListener('nyx:cleanup-memory', handleMemoryCleanup)
    return () => window.removeEventListener('nyx:cleanup-memory', handleMemoryCleanup)
  }, [])

  if (!profile.enableWallpaperAnimations) {
    return (
      <div 
        className={`fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 ${className}`}
        style={{ zIndex: -1 }}
      />
    )
  }

  return (
    <>
      {/* Static background for when canvas is disabled */}
      <div 
        className={`fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 ${className}`}
        style={{ zIndex: -1 }}
      />
      
      {/* Animated canvas overlay */}
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none ${className}`}
        style={{ 
          zIndex: -1,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease',
          willChange: profile.enableGPUAcceleration ? 'transform' : 'auto',
        }}
      />
    </>
  )
}
