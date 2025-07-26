import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Trophy, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Pipe {
  x: number
  topHeight: number
  bottomY: number
  passed: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

interface GameState {
  birdY: number
  birdVelocity: number
  pipes: Pipe[]
  particles: Particle[]
  score: number
  isGameOver: boolean
  isPaused: boolean
  isPlaying: boolean
  difficulty: 'easy' | 'medium' | 'hard'
}

export const FlappyGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  
  const [gameState, setGameState] = useState<GameState>({
    birdY: 200,
    birdVelocity: 0,
    pipes: [],
    particles: [],
    score: 0,
    isGameOver: false,
    isPaused: false,
    isPlaying: false,
    difficulty: 'medium'
  })
  
  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem('nyx-flappy-scores')
    return saved ? JSON.parse(saved) : { easy: 0, medium: 0, hard: 0 }
  })
  
  const birdSize = 30
  const pipeWidth = 80
  const gravity = 0.6
  const jumpPower = -12
  const pipeSpeed = 3
  
  const getDifficultySettings = useCallback(() => {
    switch (gameState.difficulty) {
      case 'easy':
        return { gapSize: 180, pipeFrequency: 180 }
      case 'medium':
        return { gapSize: 150, pipeFrequency: 160 }
      case 'hard':
        return { gapSize: 120, pipeFrequency: 140 }
    }
  }, [gameState.difficulty])

  const createParticles = useCallback((x: number, y: number, count: number = 5) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30,
        color: `hsl(${Math.random() * 60 + 40}, 70%, 60%)`
      })
    }
    return newParticles
  }, [])

  const generatePipe = useCallback((x: number): Pipe => {
    const { gapSize } = getDifficultySettings()
    const minHeight = 50
    const maxHeight = 250
    const topHeight = minHeight + Math.random() * (maxHeight - minHeight)
    
    return {
      x,
      topHeight,
      bottomY: topHeight + gapSize,
      passed: false
    }
  }, [getDifficultySettings])

  const resetGame = useCallback(() => {
    setGameState({
      birdY: 200,
      birdVelocity: 0,
      pipes: [],
      particles: [],
      score: 0,
      isGameOver: false,
      isPaused: false,
      isPlaying: false,
      difficulty: gameState.difficulty
    })
  }, [gameState.difficulty])

  const startGame = useCallback(() => {
    const { pipeFrequency } = getDifficultySettings()
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      pipes: [generatePipe(400), generatePipe(400 + pipeFrequency)]
    }))
  }, [getDifficultySettings, generatePipe])

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }))
  }, [])

  const flap = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return
    
    setGameState(prev => ({
      ...prev,
      birdVelocity: jumpPower,
      particles: [...prev.particles, ...createParticles(100, prev.birdY, 3)]
    }))
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, createParticles])

  const checkCollisions = useCallback((state: GameState): GameState => {
    const birdRect = {
      x: 100 - birdSize / 2,
      y: state.birdY - birdSize / 2,
      width: birdSize,
      height: birdSize
    }

    // Check ground and ceiling collision
    if (state.birdY <= birdSize / 2 || state.birdY >= 400 - birdSize / 2) {
      const newState = { ...state, isGameOver: true }
      
      // Update high score
      if (state.score > highScores[state.difficulty]) {
        const newHighScores = { ...highScores, [state.difficulty]: state.score }
        setHighScores(newHighScores)
        localStorage.setItem('nyx-flappy-scores', JSON.stringify(newHighScores))
      }
      
      return newState
    }

    // Check pipe collisions
    for (const pipe of state.pipes) {
      if (
        birdRect.x < pipe.x + pipeWidth &&
        birdRect.x + birdRect.width > pipe.x &&
        (birdRect.y < pipe.topHeight || birdRect.y + birdRect.height > pipe.bottomY)
      ) {
        const newState = { ...state, isGameOver: true }
        
        // Update high score
        if (state.score > highScores[state.difficulty]) {
          const newHighScores = { ...highScores, [state.difficulty]: state.score }
          setHighScores(newHighScores)
          localStorage.setItem('nyx-flappy-scores', JSON.stringify(newHighScores))
        }
        
        return newState
      }
    }

    return state
  }, [highScores])

  const updateGame = useCallback((deltaTime: number) => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return

    setGameState(prevState => {
      let newState = { ...prevState }
      const { pipeFrequency } = getDifficultySettings()

      // Update bird physics
      newState.birdVelocity += gravity
      newState.birdY += newState.birdVelocity

      // Update pipes
      newState.pipes = newState.pipes
        .map(pipe => ({ ...pipe, x: pipe.x - pipeSpeed }))
        .filter(pipe => pipe.x > -pipeWidth)

      // Check for score updates
      newState.pipes.forEach(pipe => {
        if (!pipe.passed && pipe.x + pipeWidth < 100) {
          pipe.passed = true
          newState.score += 1
          newState.particles = [...newState.particles, ...createParticles(100, newState.birdY, 5)]
        }
      })

      // Generate new pipes
      const lastPipe = newState.pipes[newState.pipes.length - 1]
      if (!lastPipe || lastPipe.x < 400 - pipeFrequency) {
        newState.pipes.push(generatePipe(400))
      }

      // Update particles
      newState.particles = newState.particles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.2,
          life: particle.life - 1
        }))
        .filter(particle => particle.life > 0)

      // Check collisions
      newState = checkCollisions(newState)

      return newState
    })
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, getDifficultySettings, createParticles, generatePipe, checkCollisions])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#0f0f23')
    gradient.addColorStop(0.5, '#1e1b4b')
    gradient.addColorStop(1, '#312e81')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw background stars
    ctx.fillStyle = '#ffffff'
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % canvas.width
      const y = (i * 71) % canvas.height
      ctx.beginPath()
      ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw pipes
    gameState.pipes.forEach(pipe => {
      // Top pipe
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight)
      
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY)
      
      // Pipe highlights
      ctx.fillStyle = '#16a34a'
      ctx.fillRect(pipe.x, 0, 5, pipe.topHeight)
      ctx.fillRect(pipe.x, pipe.bottomY, 5, canvas.height - pipe.bottomY)
    })

    // Draw particles
    gameState.particles.forEach(particle => {
      ctx.fillStyle = particle.color
      ctx.globalAlpha = particle.life / 30
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1

    // Draw bird with rotation based on velocity
    ctx.save()
    ctx.translate(100, gameState.birdY)
    ctx.rotate(Math.min(Math.max(gameState.birdVelocity * 0.1, -0.5), 0.5))
    
    // Bird body
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(0, 0, birdSize / 2, 0, Math.PI * 2)
    ctx.fill()
    
    // Bird eye
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(5, -5, 6, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(7, -3, 3, 0, Math.PI * 2)
    ctx.fill()
    
    // Bird beak
    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.moveTo(15, 0)
    ctx.lineTo(25, -3)
    ctx.lineTo(25, 3)
    ctx.closePath()
    ctx.fill()
    
    ctx.restore()

    // Draw UI
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`${gameState.score}`, canvas.width / 2, 50)
    
    ctx.font = '14px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`Difficulty: ${gameState.difficulty.toUpperCase()}`, 10, 25)
    ctx.fillText(`High Score: ${highScores[gameState.difficulty]}`, 10, 45)

  }, [gameState, highScores])

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
        flap()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [flap])

  const changeDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    setGameState(prev => ({ ...prev, difficulty }))
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-950 via-black to-violet-950 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
          Nyx Flap
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => changeDifficulty(diff)}
                className={cn(
                  "px-3 py-1 rounded text-xs transition-colors",
                  gameState.difficulty === diff
                    ? "bg-purple-500 text-white"
                    : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/40"
                )}
              >
                {diff.toUpperCase()}
              </button>
            ))}
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
          className="w-full h-full border border-purple-500/30 rounded-lg"
          onClick={flap}
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
                <h3 className="text-xl font-bold text-white mb-2">Ready to Flap?</h3>
                <p className="text-purple-300 mb-4">Press SPACE or click to flap your wings!</p>
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
                  <p>Difficulty: {gameState.difficulty.toUpperCase()}</p>
                  {gameState.score > highScores[gameState.difficulty] && (
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
        <p>Use SPACE or click to flap • Navigate through the pipes • Set new high scores!</p>
      </div>
    </div>
  )
}
