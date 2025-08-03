import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '@/store/theme-store'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  life: number
  maxLife: number
}

interface FloatingObject {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  scale: number
  emoji: string
  opacity: number
}

export const StableLiveWallpaper: React.FC = () => {
  const { settings } = useThemeStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [particles, setParticles] = useState<Particle[]>([])
  const [floatingObjects, setFloatingObjects] = useState<FloatingObject[]>([])
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight })

  // Theme-aware emojis and colors
  const nightEmojis = ['🌙', '⭐', '✨', '🌟', '💫', '🌌', '🦇', '🔮', '🌠', '🪐']
  const dayEmojis = ['☀️', '🌤️', '⛅', '🌈', '🦋', '🌸', '🌺', '🍃', '🐝', '🌻']

  const darkColors = [
    'rgba(139, 69, 19, 0.6)',   // Dark blue
    'rgba(75, 0, 130, 0.8)',    // Indigo
    'rgba(138, 43, 226, 0.7)',  // Blue violet
    'rgba(72, 61, 139, 0.6)',   // Dark slate blue
    'rgba(123, 104, 238, 0.5)',  // Medium slate blue
    'rgba(147, 112, 219, 0.4)',  // Medium purple
  ]

  const lightColors = [
    'rgba(59, 130, 246, 0.4)',   // Blue
    'rgba(168, 85, 247, 0.5)',   // Purple
    'rgba(236, 72, 153, 0.4)',   // Pink
    'rgba(34, 197, 94, 0.3)',    // Green
    'rgba(251, 191, 36, 0.4)',   // Yellow
    'rgba(249, 115, 22, 0.3)',   // Orange
  ]

  const emojis = settings.mode === 'dark' ? nightEmojis : dayEmojis
  const colors = settings.mode === 'dark' ? darkColors : lightColors

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Initialize particles
    const newParticles: Particle[] = []
    for (let i = 0; i < 50; i++) {
      newParticles.push(createParticle(i))
    }
    setParticles(newParticles)

    // Initialize floating objects
    const newObjects: FloatingObject[] = []
    for (let i = 0; i < 8; i++) {
      newObjects.push(createFloatingObject(i))
    }
    setFloatingObjects(newObjects)
  }, [dimensions])

  const createParticle = (id: number): Particle => ({
    id,
    x: Math.random() * dimensions.width,
    y: Math.random() * dimensions.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 3 + 1,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: Math.random() * 0.8 + 0.2,
    life: 0,
    maxLife: Math.random() * 500 + 500
  })

  const createFloatingObject = (id: number): FloatingObject => ({
    id,
    x: Math.random() * dimensions.width,
    y: Math.random() * dimensions.height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 2,
    scale: Math.random() * 0.5 + 0.5,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    opacity: Math.random() * 0.6 + 0.3
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height

    let lastTime = 0
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      // Clear canvas with night gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height)
      gradient.addColorStop(0, 'rgba(10, 10, 35, 1)')
      gradient.addColorStop(0.5, 'rgba(20, 20, 60, 1)')
      gradient.addColorStop(1, 'rgba(5, 5, 25, 1)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, dimensions.width, dimensions.height)

      // Update and draw particles
      setParticles(prev => prev.map(particle => {
        const newParticle = { ...particle }
        
        // Update position
        newParticle.x += newParticle.vx
        newParticle.y += newParticle.vy
        newParticle.life += deltaTime

        // Fade based on life
        const lifeRatio = newParticle.life / newParticle.maxLife
        newParticle.opacity = Math.max(0, 1 - lifeRatio)

        // Wrap around screen
        if (newParticle.x < 0) newParticle.x = dimensions.width
        if (newParticle.x > dimensions.width) newParticle.x = 0
        if (newParticle.y < 0) newParticle.y = dimensions.height
        if (newParticle.y > dimensions.height) newParticle.y = 0

        // Reset particle if dead
        if (newParticle.life >= newParticle.maxLife) {
          return createParticle(newParticle.id)
        }

        // Draw particle
        ctx.save()
        ctx.globalAlpha = newParticle.opacity
        ctx.fillStyle = newParticle.color
        ctx.beginPath()
        ctx.arc(newParticle.x, newParticle.y, newParticle.size, 0, Math.PI * 2)
        ctx.fill()
        
        // Add glow effect
        ctx.shadowBlur = 15
        ctx.shadowColor = newParticle.color
        ctx.fill()
        ctx.restore()

        return newParticle
      }))

      // Update floating objects
      setFloatingObjects(prev => prev.map(obj => {
        const newObj = { ...obj }
        
        newObj.x += newObj.vx
        newObj.y += newObj.vy
        newObj.rotation += newObj.rotationSpeed

        // Bounce off edges
        if (newObj.x <= 0 || newObj.x >= dimensions.width) newObj.vx *= -1
        if (newObj.y <= 0 || newObj.y >= dimensions.height) newObj.vy *= -1

        // Keep in bounds
        newObj.x = Math.max(0, Math.min(dimensions.width, newObj.x))
        newObj.y = Math.max(0, Math.min(dimensions.height, newObj.y))

        return newObj
      }))

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions, particles.length])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Stable gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Animated canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-80"
        style={{ mixBlendMode: 'normal' }}
      />

      {/* Floating emoji objects */}
      {floatingObjects.map(obj => (
        <motion.div
          key={obj.id}
          className="absolute text-2xl pointer-events-none select-none"
          style={{
            left: obj.x,
            top: obj.y,
            opacity: obj.opacity,
            transform: `scale(${obj.scale}) rotate(${obj.rotation}deg)`,
          }}
          animate={{
            x: obj.x,
            y: obj.y,
            rotate: obj.rotation,
          }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 20,
            mass: 1,
          }}
        >
          {obj.emoji}
        </motion.div>
      ))}

      {/* Subtle overlay patterns */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(75, 0, 130, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 60%, rgba(138, 43, 226, 0.1) 0%, transparent 50%)
            `
          }}
        />
      </div>

      {/* Constellation lines */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <defs>
          <linearGradient id="constellation" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(138, 43, 226, 0.5)" />
            <stop offset="100%" stopColor="rgba(75, 0, 130, 0.5)" />
          </linearGradient>
        </defs>
        {Array.from({ length: 15 }, (_, i) => {
          const x1 = Math.random() * dimensions.width
          const y1 = Math.random() * dimensions.height
          const x2 = x1 + (Math.random() - 0.5) * 200
          const y2 = y1 + (Math.random() - 0.5) * 200
          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#constellation)"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          )
        })}
      </svg>
    </div>
  )
}
