import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Trophy, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Obstacle {
  x: number
  y: number
  width: number
  height: number
  type: 'ground' | 'air' | 'spike'
}

interface Collectible {
  x: number
  y: number
  type: 'coin' | 'power'
  collected: boolean
}

interface GameState {
  playerY: number
  playerVelocity: number
  obstacles: Obstacle[]
  collectibles: Collectible[]
  score: number
  distance: number
  gameSpeed: number
  isGameOver: boolean
  isPaused: boolean
  isPlaying: boolean
  lives: number
  powerUpActive: boolean
  powerUpTimer: number
}

export const InfiniteRunner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  
  const [gameState, setGameState] = useState<GameState>({
    playerY: 300,
    playerVelocity: 0,
    obstacles: [],
    collectibles: [],
    score: 0,
    distance: 0,
    gameSpeed: 3,
    isGameOver: false,
    isPaused: false,
    isPlaying: false,
    lives: 3,
    powerUpActive: false,
    powerUpTimer: 0
  })
  
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('nyx-runner-highscore') || '0')
  })
  
  const playerWidth = 40
  const playerHeight = 40
  const gravity = 0.8
  const jumpPower = -15
  const groundLevel = 350

  const generateObstacle = useCallback((x: number): Obstacle => {
    const types: Obstacle['type'][] = ['ground', 'air', 'spike']
    const type = types[Math.floor(Math.random() * types.length)]
    
    switch (type) {
      case 'ground':
        return { x, y: groundLevel, width: 30, height: 40, type }
      case 'air':
        return { x, y: 200, width: 25, height: 25, type }
      case 'spike':
        return { x, y: groundLevel - 20, width: 20, height: 20, type }
      default:
        return { x, y: groundLevel, width: 30, height: 40, type: 'ground' }
    }
  }, [])
  
  const generateCollectible = useCallback((x: number): Collectible => {
    const type = Math.random() > 0.8 ? 'power' : 'coin'
    const y = type === 'power' ? 180 : 250 + Math.random() * 100
    
    return { x, y, type, collected: false }
  }, [])

  const resetGame = useCallback(() => {
    setGameState({
      playerY: 300,
      playerVelocity: 0,
      obstacles: [],
      collectibles: [],
      score: 0,
      distance: 0,
      gameSpeed: 3,
      isGameOver: false,
      isPaused: false,
      isPlaying: false,
      lives: 3,
      powerUpActive: false,
      powerUpTimer: 0
    })
  }, [])

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false
    }))
  }, [])

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }))
  }, [])

  const jump = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return
    
    setGameState(prev => ({
      ...prev,
      playerVelocity: jumpPower
    }))
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver])

  const checkCollisions = useCallback((state: GameState): GameState => {
    const playerRect = {
      x: 100,
      y: state.playerY,
      width: playerWidth,
      height: playerHeight
    }

    let newState = { ...state }

    // Check obstacle collisions
    for (const obstacle of state.obstacles) {
      if (
        playerRect.x < obstacle.x + obstacle.width &&
        playerRect.x + playerRect.width > obstacle.x &&
        playerRect.y < obstacle.y + obstacle.height &&
        playerRect.y + playerRect.height > obstacle.y
      ) {
        if (state.powerUpActive) {
          // Power-up protects from collision
          continue
        }
        
        newState.lives -= 1
        if (newState.lives <= 0) {
          newState.isGameOver = true
          if (newState.score > highScore) {
            setHighScore(newState.score)
            localStorage.setItem('nyx-runner-highscore', newState.score.toString())
          }
        }
        break
      }
    }

    // Check collectible collisions
    newState.collectibles = state.collectibles.map(collectible => {
      if (
        !collectible.collected &&
        playerRect.x < collectible.x + 20 &&
        playerRect.x + playerRect.width > collectible.x &&
        playerRect.y < collectible.y + 20 &&
        playerRect.y + playerRect.height > collectible.y
      ) {
        if (collectible.type === 'coin') {
          newState.score += 10
        } else if (collectible.type === 'power') {
          newState.powerUpActive = true
          newState.powerUpTimer = 300 // 5 seconds at 60fps
          newState.score += 50
        }
        return { ...collectible, collected: true }
      }
      return collectible
    })

    return newState
  }, [highScore])

  const updateGame = useCallback((deltaTime: number) => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return

    setGameState(prevState => {
      let newState = { ...prevState }

      // Update player physics
      newState.playerVelocity += gravity
      newState.playerY += newState.playerVelocity

      // Ground collision
      if (newState.playerY > groundLevel) {
        newState.playerY = groundLevel
        newState.playerVelocity = 0
      }

      // Ceiling collision
      if (newState.playerY < 50) {
        newState.playerY = 50
        newState.playerVelocity = 0
      }

      // Update distance and speed
      newState.distance += newState.gameSpeed
      newState.gameSpeed = Math.min(8, 3 + Math.floor(newState.distance / 1000) * 0.5)

      // Update power-up timer
      if (newState.powerUpActive) {
        newState.powerUpTimer -= 1
        if (newState.powerUpTimer <= 0) {
          newState.powerUpActive = false
        }
      }

      // Move obstacles
      newState.obstacles = newState.obstacles
        .map(obs => ({ ...obs, x: obs.x - newState.gameSpeed }))
        .filter(obs => obs.x > -obs.width)

      // Move collectibles
      newState.collectibles = newState.collectibles
        .map(col => ({ ...col, x: col.x - newState.gameSpeed }))
        .filter(col => col.x > -20)

      // Generate new obstacles
      if (newState.obstacles.length === 0 || newState.obstacles[newState.obstacles.length - 1].x < 600) {
        const lastObstacle = newState.obstacles[newState.obstacles.length - 1]
        const minDistance = 200 + Math.random() * 200
        const newX = lastObstacle ? lastObstacle.x + minDistance : 800
        newState.obstacles.push(generateObstacle(newX))
      }

      // Generate new collectibles
      if (Math.random() < 0.02) {
        newState.collectibles.push(generateCollectible(800 + Math.random() * 200))
      }

      // Check collisions
      newState = checkCollisions(newState)

      return newState
    })
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, generateObstacle, generateCollectible, checkCollisions])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = 'linear-gradient(to bottom, #1e1b4b, #312e81)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#1e1b4b')
    gradient.addColorStop(1, '#312e81')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw ground
    ctx.fillStyle = '#4c1d95'
    ctx.fillRect(0, groundLevel + 40, canvas.width, canvas.height - groundLevel - 40)

    // Draw player with power-up effect
    if (gameState.powerUpActive) {
      ctx.shadowColor = '#fbbf24'
      ctx.shadowBlur = 20
    }
    
    ctx.fillStyle = gameState.powerUpActive ? '#fbbf24' : '#8b5cf6'
    ctx.fillRect(100, gameState.playerY, playerWidth, playerHeight)
    
    if (gameState.powerUpActive) {
      ctx.shadowBlur = 0
    }

    // Draw obstacles
    gameState.obstacles.forEach(obstacle => {
      switch (obstacle.type) {
        case 'ground':
          ctx.fillStyle = '#dc2626'
          break
        case 'air':
          ctx.fillStyle = '#059669'
          break
        case 'spike':
          ctx.fillStyle = '#ea580c'
          break
      }
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
    })

    // Draw collectibles
    gameState.collectibles.forEach(collectible => {
      if (collectible.collected) return
      
      if (collectible.type === 'coin') {
        ctx.fillStyle = '#fbbf24'
        ctx.beginPath()
        ctx.arc(collectible.x + 10, collectible.y + 10, 10, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillStyle = '#10b981'
        ctx.fillRect(collectible.x, collectible.y, 20, 20)
      }
    })

    // Draw UI elements
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px monospace'
    ctx.fillText(`Score: ${gameState.score}`, 20, 30)
    ctx.fillText(`Distance: ${Math.floor(gameState.distance)}m`, 20, 50)
    ctx.fillText(`Lives: ${gameState.lives}`, 20, 70)
    
    if (gameState.powerUpActive) {
      ctx.fillStyle = '#fbbf24'
      ctx.fillText(`POWER UP: ${Math.ceil(gameState.powerUpTimer / 60)}s`, 200, 30)
    }

  }, [gameState])

  const gameLoop = useCallback((currentTime: number) => {
    const deltaTime = currentTime - lastTimeRef.current
    
    if (deltaTime >= 16.67) { // 60 FPS
      updateGame(deltaTime)
      draw()
      lastTimeRef.current = currentTime
    }
    
    animationRef.current = requestAnimationFrame(gameLoop)
  }, [updateGame, draw])

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver) {
      animationRef.current = requestAnimationFrame(gameLoop)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameLoop])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [jump])

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-950 via-black to-violet-950 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
          Nyx Runner
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-purple-300 text-sm">
            High Score: {highScore}
          </div>
          <div className="flex gap-2">
            {!gameState.isPlaying ? (
              <button
                onClick={startGame}
                className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg transition-colors"
              >
                <Play className="w-4 h-4 text-green-400" />
              </button>
            ) : (
              <button
                onClick={pauseGame}
                className="p-2 bg-yellow-500/20 hover:bg-yellow-500/40 rounded-lg transition-colors"
              >
                <Pause className="w-4 h-4 text-yellow-400" />
              </button>
            )}
            <button
              onClick={resetGame}
              className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full border border-purple-500/30 rounded-lg bg-gradient-to-b from-purple-900/20 to-black/40"
          onClick={jump}
        />
        
        <AnimatePresence>
          {!gameState.isPlaying && !gameState.isGameOver && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Ready to Run?</h3>
                <p className="text-purple-300 mb-4">Press SPACE or click to jump!</p>
                <button
                  onClick={startGame}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-colors"
                >
                  Start Game
                </button>
              </div>
            </motion.div>
          )}
          
          {gameState.isPaused && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">Paused</h3>
                <button
                  onClick={pauseGame}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-colors"
                >
                  Resume
                </button>
              </div>
            </motion.div>
          )}
          
          {gameState.isGameOver && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Game Over!</h3>
                <div className="text-purple-300 mb-4">
                  <p>Score: {gameState.score}</p>
                  <p>Distance: {Math.floor(gameState.distance)}m</p>
                  {gameState.score > highScore && (
                    <p className="text-yellow-400 flex items-center justify-center gap-2 mt-2">
                      <Trophy className="w-4 h-4" />
                      New High Score!
                    </p>
                  )}
                </div>
                <button
                  onClick={resetGame}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-colors"
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 text-center text-purple-300 text-sm">
        <p>Use SPACE or click to jump • Collect coins and power-ups • Avoid obstacles!</p>
      </div>
    </div>
  )
}
