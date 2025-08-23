import React, { useEffect, useRef, useCallback, useState } from 'react'
import { usePerformanceManager } from '@/hooks/usePerformanceManager'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { useThemeStore } from '@/store/theme-store'

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
  type: 'orb' | 'star' | 'wave' | 'spiral' | 'comet'
}

interface WavePoint {
  x: number
  y: number
  baseY: number
  amplitude: number
  frequency: number
  phase: number
}

interface EnhancedLiveWallpaperProps {
  className?: string
}

export const EnhancedLiveWallpaper: React.FC<EnhancedLiveWallpaperProps> = ({ 
  className = "" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const wavesRef = useRef<WavePoint[]>([])
  const lastFrameTime = useRef(0)
  const timeAccumulator = useRef(0)
  const [isVisible, setIsVisible] = useState(true)
  
  const { profile, performanceStats } = usePerformanceManager()
  const { deviceInfo, isPhone, isTablet, isDesktop } = useDeviceDetection()
  const { settings: themeSettings } = useThemeStore()

  // Theme-based configuration
  const getThemeConfig = useCallback(() => {
    const isDark = themeSettings.mode === 'dark'
    
    if (isDark) {
      return {
        // Dark mode - cosmic/space theme
        backgroundColor: 'rgba(15, 23, 42, 1)', // slate-900
        gradientStops: [
          'rgba(30, 27, 75, 0.8)',   // deep purple
          'rgba(88, 28, 135, 0.6)',  // purple-800
          'rgba(15, 23, 42, 1)'      // slate-900
        ],
        particleColors: [
          'rgba(139, 92, 246, ',  // purple-500
          'rgba(168, 85, 247, ',  // purple-400
          'rgba(236, 72, 153, ',  // pink-500
          'rgba(59, 130, 246, ',  // blue-500
          'rgba(16, 185, 129, ',  // emerald-500
          'rgba(245, 158, 11, ',  // amber-500
        ],
        glowIntensity: 0.8,
        waveColor: 'rgba(139, 92, 246, 0.3)',
        starField: true,
        nebula: true,
        aurora: true
      }
    } else {
      return {
        // Light mode - nature/day theme
        backgroundColor: 'rgba(241, 245, 249, 1)', // slate-100
        gradientStops: [
          'rgba(219, 234, 254, 0.8)', // blue-100
          'rgba(254, 240, 138, 0.6)', // yellow-200
          'rgba(241, 245, 249, 1)'    // slate-100
        ],
        particleColors: [
          'rgba(59, 130, 246, ',   // blue-500
          'rgba(16, 185, 129, ',   // emerald-500
          'rgba(245, 158, 11, ',   // amber-500
          'rgba(239, 68, 68, ',    // red-500
          'rgba(168, 85, 247, ',   // purple-400
          'rgba(34, 197, 94, ',    // green-500
        ],
        glowIntensity: 0.4,
        waveColor: 'rgba(59, 130, 246, 0.2)',
        starField: false,
        nebula: false,
        aurora: false,
        sunRays: true,
        clouds: true,
        butterflies: true
      }
    }
  }, [themeSettings.mode])

  // Device and performance-based configuration
  const getConfig = useCallback(() => {
    const themeConfig = getThemeConfig()

    // Device-specific performance scaling
    let deviceMultiplier = 1
    let maxParticles = profile.particleCount * 2
    let targetFPS = profile.frameRateTarget

    if (isPhone) {
      deviceMultiplier = 0.6 // Reduce particles on phones
      maxParticles = Math.min(maxParticles, 50)
      targetFPS = Math.min(targetFPS, 30)
    } else if (isTablet) {
      deviceMultiplier = 0.8 // Moderate reduction on tablets
      maxParticles = Math.min(maxParticles, 100)
      targetFPS = Math.min(targetFPS, 45)
    }

    const baseConfig = {
      particleCount: Math.floor(profile.particleCount * deviceMultiplier),
      maxParticles,
      targetFPS,
      enableBlur: profile.blurIntensity > 0 && !isPhone, // Disable blur on phones for performance
      enableGlow: profile.enableAdvancedEffects && !isPhone,
      animationSpeed: isPhone ? 0.7 : 1,
      cleanup: profile.memoryOptimization || isPhone,
      wavePoints: Math.min(Math.floor((profile.particleCount * deviceMultiplier) / 2), isPhone ? 20 : 50),
      deviceType: isPhone ? 'phone' : isTablet ? 'tablet' : 'desktop',
      ...themeConfig
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
        wavePoints: 10,
        starField: false,
        nebula: false,
        aurora: false,
        sunRays: false,
        clouds: false,
      }
    }

    // Adjust for performance
    if (performanceStats.fps < 30) {
      return {
        ...baseConfig,
        particleCount: Math.max(baseConfig.particleCount / 2, 10),
        enableBlur: false,
        enableGlow: false,
        wavePoints: 20,
      }
    }

    return baseConfig
  }, [profile, performanceStats, getThemeConfig])

  // Initialize waves
  const initializeWaves = useCallback((canvas: HTMLCanvasElement, config: any) => {
    const waves: WavePoint[] = []
    const waveCount = config.wavePoints
    
    for (let i = 0; i < waveCount; i++) {
      waves.push({
        x: (canvas.width / waveCount) * i,
        y: canvas.height * 0.7,
        baseY: canvas.height * 0.7,
        amplitude: Math.random() * 50 + 20,
        frequency: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2,
      })
    }
    
    wavesRef.current = waves
  }, [])

  // Particle creation with types
  const createParticle = useCallback((canvas: HTMLCanvasElement, config: any): Particle => {
    const types: Particle['type'][] = ['orb', 'star', 'wave', 'spiral', 'comet']
    const isDark = themeSettings.mode === 'dark'
    
    // Different particle distributions for themes
    let type: Particle['type']
    if (isDark) {
      type = types[Math.floor(Math.random() * types.length)]
    } else {
      // Light mode favors more natural particles
      const lightTypes: Particle['type'][] = ['orb', 'wave', 'star']
      type = lightTypes[Math.floor(Math.random() * lightTypes.length)]
    }

    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 3 - 1,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.8 + 0.2,
      life: 0,
      maxLife: Math.random() * 300 + 200,
      color: config.particleColors[Math.floor(Math.random() * config.particleColors.length)],
      type
    }
  }, [themeSettings.mode])

  // Enhanced particle update with physics
  const updateParticle = useCallback((particle: Particle, deltaTime: number, config: any, canvas: HTMLCanvasElement): boolean => {
    particle.life += deltaTime * config.animationSpeed
    
    // Type-specific movement
    switch (particle.type) {
      case 'spiral':
        const spiralTime = particle.life * 0.01
        particle.x += Math.cos(spiralTime) * 2
        particle.y += particle.vy * deltaTime * 0.1
        break
      case 'comet':
        particle.x += particle.vx * deltaTime * 0.15
        particle.y += particle.vy * deltaTime * 0.12
        break
      case 'wave':
        particle.x += Math.sin(particle.life * 0.01) * 1
        particle.y += particle.vy * deltaTime * 0.08
        break
      default:
        particle.x += particle.vx * deltaTime * 0.1 * config.animationSpeed
        particle.y += particle.vy * deltaTime * 0.1 * config.animationSpeed
    }

    // Fade out over lifetime
    const lifeFactor = 1 - (particle.life / particle.maxLife)
    particle.opacity = lifeFactor * 0.9

    // Apply physics
    particle.vy += 0.005 * deltaTime // reduced gravity
    particle.vx *= 0.995 // reduced air resistance

    // Boundary wrapping for x-axis
    if (particle.x < 0) particle.x = canvas.width
    if (particle.x > canvas.width) particle.x = 0

    return particle.life < particle.maxLife && particle.y > -100
  }, [])

  // Enhanced rendering with multiple effects
  const render = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, time: number) => {
    const config = getConfig()
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    config.gradientStops.forEach((stop, index) => {
      gradient.addColorStop(index / (config.gradientStops.length - 1), stop)
    })
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Theme-specific background effects
    if (config.starField && themeSettings.mode === 'dark') {
      renderStarField(ctx, canvas, time)
    }
    
    if (config.nebula && themeSettings.mode === 'dark') {
      renderNebula(ctx, canvas, time, config)
    }

    if (config.sunRays && themeSettings.mode === 'light') {
      renderSunRays(ctx, canvas, time)
    }

    if (config.clouds && themeSettings.mode === 'light') {
      renderClouds(ctx, canvas, time)
    }

    // Animated waves
    if (config.wavePoints > 0) {
      renderWaves(ctx, canvas, time, config)
    }

    // Aurora effect for dark mode
    if (config.aurora && themeSettings.mode === 'dark' && config.enableGlow) {
      renderAurora(ctx, canvas, time, config)
    }

    // Render particles
    particlesRef.current.forEach((particle) => {
      renderParticle(ctx, particle, config)
    })
  }, [getConfig, themeSettings.mode])

  // Star field rendering
  const renderStarField = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    const starCount = 100
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    
    for (let i = 0; i < starCount; i++) {
      const x = (i * 1234.5) % canvas.width
      const y = (i * 2345.6) % canvas.height
      const twinkle = Math.sin(time * 0.002 + i) * 0.5 + 0.5
      const size = Math.random() * 2 + 0.5
      
      ctx.globalAlpha = twinkle * 0.8
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  // Nebula rendering
  const renderNebula = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, config: any) => {
    const gradient = ctx.createRadialGradient(
      canvas.width * 0.3, canvas.height * 0.4, 0,
      canvas.width * 0.3, canvas.height * 0.4, canvas.width * 0.8
    )
    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.1)')
    gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)')
    gradient.addColorStop(1, 'transparent')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // Sun rays for light mode
  const renderSunRays = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    const rayCount = 20
    const centerX = canvas.width * 0.8
    const centerY = canvas.height * 0.2
    
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.1)'
    ctx.lineWidth = 2
    
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + time * 0.0005
      const length = canvas.width * 0.6
      
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(
        centerX + Math.cos(angle) * length,
        centerY + Math.sin(angle) * length
      )
      ctx.stroke()
    }
  }

  // Cloud rendering for light mode
  const renderClouds = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    const cloudCount = 5
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    
    for (let i = 0; i < cloudCount; i++) {
      const x = ((time * 0.02 + i * 200) % (canvas.width + 200)) - 100
      const y = canvas.height * 0.3 + Math.sin(time * 0.001 + i) * 50
      const size = 80 + i * 20
      
      // Simple cloud shape
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.arc(x + size * 0.5, y, size * 0.8, 0, Math.PI * 2)
      ctx.arc(x - size * 0.5, y, size * 0.8, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Wave rendering
  const renderWaves = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, config: any) => {
    if (wavesRef.current.length === 0) return

    // Update wave positions
    wavesRef.current.forEach(wave => {
      wave.y = wave.baseY + Math.sin(time * wave.frequency + wave.phase) * wave.amplitude
    })

    ctx.strokeStyle = config.waveColor
    ctx.lineWidth = 3
    ctx.beginPath()
    
    // Draw smooth wave
    ctx.moveTo(0, wavesRef.current[0].y)
    for (let i = 1; i < wavesRef.current.length; i++) {
      const prevWave = wavesRef.current[i - 1]
      const currentWave = wavesRef.current[i]
      const cpX = (prevWave.x + currentWave.x) / 2
      
      ctx.quadraticCurveTo(cpX, prevWave.y, currentWave.x, currentWave.y)
    }
    
    ctx.stroke()
  }

  // Aurora effect
  const renderAurora = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number, config: any) => {
    const auroraHeight = canvas.height * 0.6
    const gradient = ctx.createLinearGradient(0, 0, 0, auroraHeight)
    
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.1)')
    gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)')
    gradient.addColorStop(1, 'transparent')
    
    ctx.fillStyle = gradient
    
    // Wavy aurora bands
    ctx.beginPath()
    for (let x = 0; x <= canvas.width; x += 10) {
      const y = Math.sin((x + time * 0.01) * 0.01) * 50 + auroraHeight * 0.3
      if (x === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.lineTo(canvas.width, auroraHeight)
    ctx.lineTo(0, auroraHeight)
    ctx.closePath()
    ctx.fill()
  }

  // Enhanced particle rendering
  const renderParticle = (ctx: CanvasRenderingContext2D, particle: Particle, config: any) => {
    ctx.save()
    ctx.globalAlpha = particle.opacity

    switch (particle.type) {
      case 'star':
        renderStar(ctx, particle)
        break
      case 'spiral':
        renderSpiral(ctx, particle, config)
        break
      case 'comet':
        renderComet(ctx, particle, config)
        break
      case 'wave':
        renderWaveParticle(ctx, particle, config)
        break
      default:
        renderOrb(ctx, particle, config)
    }

    ctx.restore()
  }

  const renderOrb = (ctx: CanvasRenderingContext2D, particle: Particle, config: any) => {
    if (config.enableGlow) {
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 3
      )
      gradient.addColorStop(0, particle.color + particle.opacity + ')')
      gradient.addColorStop(0.5, particle.color + (particle.opacity * 0.5) + ')')
      gradient.addColorStop(1, particle.color + '0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.fillStyle = particle.color + particle.opacity + ')'
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    ctx.fill()
  }

  const renderStar = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    const spikes = 5
    const outerRadius = particle.size
    const innerRadius = particle.size * 0.5
    
    ctx.fillStyle = particle.color + particle.opacity + ')'
    ctx.beginPath()
    
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (i * Math.PI) / spikes
      const x = particle.x + Math.cos(angle) * radius
      const y = particle.y + Math.sin(angle) * radius
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.closePath()
    ctx.fill()
  }

  const renderSpiral = (ctx: CanvasRenderingContext2D, particle: Particle, config: any) => {
    const segments = 20
    ctx.strokeStyle = particle.color + particle.opacity + ')'
    ctx.lineWidth = particle.size * 0.5
    ctx.beginPath()
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 4 + particle.life * 0.01
      const radius = (i / segments) * particle.size * 2
      const x = particle.x + Math.cos(angle) * radius
      const y = particle.y + Math.sin(angle) * radius
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.stroke()
  }

  const renderComet = (ctx: CanvasRenderingContext2D, particle: Particle, config: any) => {
    // Comet head
    ctx.fillStyle = particle.color + particle.opacity + ')'
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    ctx.fill()
    
    // Comet tail
    const tailLength = particle.size * 4
    const gradient = ctx.createLinearGradient(
      particle.x, particle.y,
      particle.x - particle.vx * tailLength, particle.y - particle.vy * tailLength
    )
    gradient.addColorStop(0, particle.color + particle.opacity + ')')
    gradient.addColorStop(1, particle.color + '0)')
    
    ctx.strokeStyle = gradient
    ctx.lineWidth = particle.size
    ctx.beginPath()
    ctx.moveTo(particle.x, particle.y)
    ctx.lineTo(
      particle.x - particle.vx * tailLength,
      particle.y - particle.vy * tailLength
    )
    ctx.stroke()
  }

  const renderWaveParticle = (ctx: CanvasRenderingContext2D, particle: Particle, config: any) => {
    const waveLength = particle.size * 2
    ctx.strokeStyle = particle.color + particle.opacity + ')'
    ctx.lineWidth = particle.size * 0.3
    ctx.beginPath()
    
    for (let i = 0; i < 20; i++) {
      const x = particle.x + (i - 10) * 2
      const y = particle.y + Math.sin(i * 0.5 + particle.life * 0.02) * waveLength
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.stroke()
  }

  // Main animation loop
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

    if (deltaTime < targetFrameTime) {
      animationRef.current = requestAnimationFrame(animate)
      return
    }

    lastFrameTime.current = currentTime
    timeAccumulator.current = currentTime

    // Initialize waves if needed
    if (wavesRef.current.length === 0 && config.wavePoints > 0) {
      initializeWaves(canvas, config)
    }

    // Particle management
    const particles = particlesRef.current
    
    for (let i = particles.length - 1; i >= 0; i--) {
      if (!updateParticle(particles[i], deltaTime, config, canvas)) {
        particles.splice(i, 1)
      }
    }

    // Add new particles
    if (particles.length < config.particleCount && Math.random() < 0.05) {
      particles.push(createParticle(canvas, config))
    }

    // Memory cleanup
    if (config.cleanup && particles.length > config.maxParticles) {
      particles.splice(0, particles.length - config.particleCount)
    }

    // Render everything
    render(canvas, ctx, timeAccumulator.current)

    animationRef.current = requestAnimationFrame(animate)
  }, [isVisible, profile.enableWallpaperAnimations, getConfig, updateParticle, createParticle, render, initializeWaves])

  // Canvas setup and resize handling
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
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
      
      // Reset waves when canvas resizes
      wavesRef.current = []
    }

    updateCanvasSize()

    const resizeObserver = new ResizeObserver(updateCanvasSize)
    resizeObserver.observe(canvas)

    return () => {
      resizeObserver.disconnect()
    }
  }, [profile.enableGPUAcceleration])

  // Visibility observer
  useEffect(() => {
    if (!profile.enableWallpaperAnimations) {
      setIsVisible(false)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )

    const canvas = canvasRef.current
    if (canvas) {
      observer.observe(canvas)
    }

    return () => {
      if (canvas) observer.unobserve(canvas)
    }
  }, [profile.enableWallpaperAnimations])

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

  // Theme change cleanup
  useEffect(() => {
    // Reset particles and waves when theme changes
    particlesRef.current = []
    wavesRef.current = []
  }, [themeSettings.mode])

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      particlesRef.current = []
      wavesRef.current = []
    }
  }, [])

  // Memory cleanup listener
  useEffect(() => {
    const handleMemoryCleanup = () => {
      particlesRef.current = []
      wavesRef.current = []
    }

    window.addEventListener('nyx:cleanup-memory', handleMemoryCleanup)
    return () => window.removeEventListener('nyx:cleanup-memory', handleMemoryCleanup)
  }, [])

  const config = getConfig()

  if (!profile.enableWallpaperAnimations) {
    return (
      <div 
        className={`fixed inset-0 ${className}`}
        style={{ 
          zIndex: -1,
          background: config.backgroundColor
        }}
      />
    )
  }

  return (
    <>
      {/* Static background with device-responsive gradients */}
      <div
        className={cn(
          "fixed inset-0",
          className,
          isPhone && "bg-gradient-to-b from-slate-900 via-purple-900 to-indigo-900 dark:from-black dark:via-gray-900 dark:to-slate-900",
          isTablet && "bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900",
          isDesktop && "bg-gradient-to-br"
        )}
        style={{
          zIndex: -1,
          background: isDesktop ? config.backgroundColor : undefined,
          // Add device-specific background patterns
          backgroundSize: isPhone ? 'cover' : isTablet ? '200% 200%' : 'auto',
          backgroundPosition: isTablet ? '0% 0%' : 'center',
        }}
      />

      {/* Animated canvas overlay */}
      <canvas
        ref={canvasRef}
        className={cn(
          "fixed inset-0 pointer-events-none",
          className,
          // Optimize rendering for different devices
          isPhone && "transform-gpu",
          isTablet && "will-change-transform",
          isDesktop && "will-change-auto"
        )}
        style={{
          zIndex: -1,
          opacity: isVisible ? 1 : 0,
          transition: isPhone ? 'opacity 0.3s ease' : 'opacity 0.5s ease',
          willChange: profile.enableGPUAcceleration && !isPhone ? 'transform' : 'auto',
          // Ensure proper layering on mobile
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Mobile-specific overlay for better performance */}
      {isPhone && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: -1,
            background: themeSettings.mode === 'dark'
              ? 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            opacity: 0.6
          }}
        />
      )}
    </>
  )
}
