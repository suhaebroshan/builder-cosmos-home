import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Trophy, Star, Zap, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tile {
  id: string
  value: number
  row: number
  col: number
  isNew?: boolean
  isMerged?: boolean
}

interface GameState {
  board: (Tile | null)[][]
  score: number
  bestScore: number
  isGameOver: boolean
  isWon: boolean
  tiles: Tile[]
  moveCount: number
  canUndo: boolean
  previousState?: {
    board: (Tile | null)[][]
    score: number
    tiles: Tile[]
    moveCount: number
  }
}

const GRID_SIZE = 4
const TILE_COLORS = {
  2: { bg: 'from-slate-200 to-slate-300', text: 'text-slate-800' },
  4: { bg: 'from-slate-300 to-slate-400', text: 'text-slate-800' },
  8: { bg: 'from-orange-300 to-orange-400', text: 'text-white' },
  16: { bg: 'from-orange-400 to-orange-500', text: 'text-white' },
  32: { bg: 'from-red-400 to-red-500', text: 'text-white' },
  64: { bg: 'from-red-500 to-red-600', text: 'text-white' },
  128: { bg: 'from-yellow-400 to-yellow-500', text: 'text-white' },
  256: { bg: 'from-yellow-500 to-yellow-600', text: 'text-white' },
  512: { bg: 'from-green-400 to-green-500', text: 'text-white' },
  1024: { bg: 'from-blue-400 to-blue-500', text: 'text-white' },
  2048: { bg: 'from-purple-500 to-purple-600', text: 'text-white' },
  4096: { bg: 'from-pink-500 to-pink-600', text: 'text-white' },
  8192: { bg: 'from-indigo-500 to-indigo-600', text: 'text-white' },
}

export const Game2048: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null)
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('nyx-2048-game')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          ...parsed,
          bestScore: localStorage.getItem('nyx-2048-best') ? parseInt(localStorage.getItem('nyx-2048-best')!) : 0
        }
      } catch {
        // Fall through to default state
      }
    }
    
    return {
      board: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)),
      score: 0,
      bestScore: localStorage.getItem('nyx-2048-best') ? parseInt(localStorage.getItem('nyx-2048-best')!) : 0,
      isGameOver: false,
      isWon: false,
      tiles: [],
      moveCount: 0,
      canUndo: false
    }
  })

  const [showWinModal, setShowWinModal] = useState(false)
  const [particles, setParticles] = useState<Array<{
    id: string
    x: number
    y: number
    value: number
    timestamp: number
  }>>([])

  // Initialize game with two random tiles
  useEffect(() => {
    if (gameState.tiles.length === 0) {
      addRandomTile()
      setTimeout(() => addRandomTile(), 100)
    }
  }, [])

  // Save game state
  useEffect(() => {
    localStorage.setItem('nyx-2048-game', JSON.stringify(gameState))
    if (gameState.score > gameState.bestScore) {
      localStorage.setItem('nyx-2048-best', gameState.score.toString())
    }
  }, [gameState])

  const createEmptyBoard = (): (Tile | null)[][] => {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  }

  const getEmptyCells = (board: (Tile | null)[][]): [number, number][] => {
    const empty: [number, number][] = []
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!board[row][col]) {
          empty.push([row, col])
        }
      }
    }
    return empty
  }

  const addRandomTile = useCallback(() => {
    setGameState(prev => {
      const newBoard = prev.board.map(row => [...row])
      const emptyCells = getEmptyCells(newBoard)
      
      if (emptyCells.length === 0) return prev

      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      const value = Math.random() < 0.9 ? 2 : 4
      const newTile: Tile = {
        id: `tile-${Date.now()}-${Math.random()}`,
        value,
        row,
        col,
        isNew: true
      }

      newBoard[row][col] = newTile
      const newTiles = [...prev.tiles.filter(t => !(t.row === row && t.col === col)), newTile]

      return {
        ...prev,
        board: newBoard,
        tiles: newTiles
      }
    })
  }, [])

  const moveTiles = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setGameState(prev => {
      const newBoard = createEmptyBoard()
      const newTiles: Tile[] = []
      let newScore = prev.score
      let hasMoved = false
      const mergedPositions = new Set<string>()

      // Save previous state for undo
      const previousState = {
        board: prev.board.map(row => [...row]),
        score: prev.score,
        tiles: [...prev.tiles],
        moveCount: prev.moveCount
      }

      // Process each row/column based on direction
      for (let i = 0; i < GRID_SIZE; i++) {
        const line: (Tile | null)[] = []
        
        // Extract line based on direction
        for (let j = 0; j < GRID_SIZE; j++) {
          switch (direction) {
            case 'left':
              line.push(prev.board[i][j])
              break
            case 'right':
              line.push(prev.board[i][GRID_SIZE - 1 - j])
              break
            case 'up':
              line.push(prev.board[j][i])
              break
            case 'down':
              line.push(prev.board[GRID_SIZE - 1 - j][i])
              break
          }
        }

        // Filter out null values and process merges
        const nonEmptyTiles = line.filter(tile => tile !== null) as Tile[]
        const processedLine: Tile[] = []
        let j = 0

        while (j < nonEmptyTiles.length) {
          const currentTile = nonEmptyTiles[j]
          const nextTile = nonEmptyTiles[j + 1]

          if (nextTile && currentTile.value === nextTile.value) {
            // Merge tiles
            const mergedTile: Tile = {
              id: `merged-${Date.now()}-${Math.random()}`,
              value: currentTile.value * 2,
              row: 0, // Will be set below
              col: 0, // Will be set below
              isMerged: true
            }
            processedLine.push(mergedTile)
            newScore += mergedTile.value

            // Add particle effect
            setParticles(prev => [...prev, {
              id: `particle-${Date.now()}`,
              x: (direction === 'left' || direction === 'right') ? i : processedLine.length - 1,
              y: (direction === 'left' || direction === 'right') ? processedLine.length - 1 : i,
              value: mergedTile.value,
              timestamp: Date.now()
            }])

            j += 2 // Skip next tile as it's merged
          } else {
            processedLine.push({ ...currentTile })
            j++
          }
        }

        // Place tiles back on board
        for (let k = 0; k < GRID_SIZE; k++) {
          const tile = processedLine[k] || null
          let row: number, col: number

          switch (direction) {
            case 'left':
              row = i
              col = k
              break
            case 'right':
              row = i
              col = GRID_SIZE - 1 - k
              break
            case 'up':
              row = k
              col = i
              break
            case 'down':
              row = GRID_SIZE - 1 - k
              col = i
              break
          }

          if (tile) {
            const originalPos = `${tile.row}-${tile.col}`
            const newPos = `${row}-${col}`
            
            if (originalPos !== newPos) {
              hasMoved = true
            }

            tile.row = row
            tile.col = col
            tile.isNew = false
            newBoard[row][col] = tile
            newTiles.push(tile)
          }
        }
      }

      if (!hasMoved) return prev

      // Check for win condition (2048)
      const hasWon = newTiles.some(tile => tile.value >= 2048)
      
      return {
        ...prev,
        board: newBoard,
        tiles: newTiles,
        score: newScore,
        bestScore: Math.max(prev.bestScore, newScore),
        moveCount: prev.moveCount + 1,
        canUndo: true,
        previousState,
        isWon: hasWon && !prev.isWon ? true : prev.isWon
      }
    })

    // Add new tile after a brief delay
    setTimeout(addRandomTile, 150)
  }, [addRandomTile])

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      board: createEmptyBoard(),
      score: 0,
      bestScore: prev.bestScore,
      isGameOver: false,
      isWon: false,
      tiles: [],
      moveCount: 0,
      canUndo: false
    }))
    setShowWinModal(false)
    setParticles([])
    
    // Add initial tiles
    setTimeout(() => {
      addRandomTile()
      setTimeout(() => addRandomTile(), 100)
    }, 100)
  }, [addRandomTile])

  const undoMove = useCallback(() => {
    setGameState(prev => {
      if (!prev.canUndo || !prev.previousState) return prev
      
      return {
        ...prev.previousState,
        bestScore: prev.bestScore,
        canUndo: false,
        isWon: prev.isWon
      }
    })
  }, [])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          moveTiles('up')
          break
        case 'ArrowDown':
          e.preventDefault()
          moveTiles('down')
          break
        case 'ArrowLeft':
          e.preventDefault()
          moveTiles('left')
          break
        case 'ArrowRight':
          e.preventDefault()
          moveTiles('right')
          break
        case 'r':
        case 'R':
          e.preventDefault()
          resetGame()
          break
        case 'u':
        case 'U':
          e.preventDefault()
          if (gameState.canUndo) undoMove()
          break
      }
    }

    if (gameRef.current) {
      gameRef.current.addEventListener('keydown', handleKeyPress)
      gameRef.current.focus()
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.removeEventListener('keydown', handleKeyPress)
      }
    }
  }, [moveTiles, resetGame, undoMove, gameState.canUndo])

  // Touch controls
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y
    const threshold = 50

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > threshold) {
        moveTiles(deltaX > 0 ? 'right' : 'left')
      }
    } else {
      if (Math.abs(deltaY) > threshold) {
        moveTiles(deltaY > 0 ? 'down' : 'up')
      }
    }

    setTouchStart(null)
  }

  // Clean up particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.filter(p => Date.now() - p.timestamp < 1000))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Check game over
  useEffect(() => {
    const checkGameOver = () => {
      const emptyCells = getEmptyCells(gameState.board)
      if (emptyCells.length > 0) return false

      // Check for possible merges
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const current = gameState.board[row][col]
          if (!current) continue

          // Check right neighbor
          if (col < GRID_SIZE - 1) {
            const right = gameState.board[row][col + 1]
            if (right && current.value === right.value) return false
          }

          // Check bottom neighbor
          if (row < GRID_SIZE - 1) {
            const bottom = gameState.board[row + 1][col]
            if (bottom && current.value === bottom.value) return false
          }
        }
      }

      return true
    }

    if (checkGameOver()) {
      setGameState(prev => ({ ...prev, isGameOver: true }))
    }
  }, [gameState.board])

  const getTileColor = (value: number) => {
    return TILE_COLORS[value as keyof typeof TILE_COLORS] || { 
      bg: 'from-gray-800 to-gray-900', 
      text: 'text-white' 
    }
  }

  return (
    <div 
      ref={gameRef}
      className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 focus:outline-none"
      tabIndex={0}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Nyx 2048
          </h1>
          <p className="text-slate-400 text-sm">Join the tiles, reach 2048!</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-slate-400 text-xs uppercase tracking-wide">Score</div>
            <motion.div 
              key={gameState.score}
              className="text-2xl font-bold text-white"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {gameState.score.toLocaleString()}
            </motion.div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 text-xs uppercase tracking-wide">Best</div>
            <div className="text-2xl font-bold text-yellow-400">
              {gameState.bestScore.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white text-sm flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          New Game
        </button>
        {gameState.canUndo && (
          <button
            onClick={undoMove}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm"
          >
            Undo
          </button>
        )}
        <div className="ml-auto text-slate-400 text-sm flex items-center gap-4">
          <span>Moves: {gameState.moveCount}</span>
          <span className="hidden md:inline">Use arrow keys or swipe</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Grid Background */}
          <div className="grid grid-cols-4 gap-3 p-4 bg-slate-800 rounded-xl">
            {Array(16).fill(0).map((_, i) => (
              <div
                key={i}
                className="w-20 h-20 bg-slate-700 rounded-lg"
              />
            ))}
          </div>

          {/* Tiles */}
          <div className="absolute inset-0 p-4">
            <AnimatePresence>
              {gameState.tiles.map((tile) => {
                const colors = getTileColor(tile.value)
                return (
                  <motion.div
                    key={tile.id}
                    className={cn(
                      "absolute w-20 h-20 rounded-lg flex items-center justify-center font-bold text-lg",
                      "bg-gradient-to-br shadow-lg",
                      colors.bg,
                      colors.text
                    )}
                    style={{
                      left: tile.col * 92 + 16, // 80px tile + 12px gap + 4px padding
                      top: tile.row * 92 + 16,
                    }}
                    initial={tile.isNew ? { scale: 0, rotate: 0 } : false}
                    animate={{ 
                      scale: tile.isMerged ? [1, 1.2, 1] : 1,
                      rotate: tile.isMerged ? [0, 5, 0] : 0
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 25,
                      duration: tile.isMerged ? 0.3 : 0.2
                    }}
                  >
                    {tile.value.toLocaleString()}
                    {tile.isMerged && (
                      <motion.div
                        className="absolute inset-0 bg-yellow-400 rounded-lg opacity-30"
                        initial={{ scale: 0.8, opacity: 0.6 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Particles */}
            <AnimatePresence>
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute text-yellow-400 font-bold text-sm pointer-events-none"
                  style={{
                    left: particle.y * 92 + 50,
                    top: particle.x * 92 + 40,
                  }}
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -30, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                >
                  +{particle.value}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameState.isGameOver && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-800 rounded-2xl p-8 text-center max-w-md mx-4"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <div className="text-6xl mb-4">😢</div>
              <h2 className="text-2xl font-bold text-white mb-2">Game Over!</h2>
              <p className="text-slate-400 mb-4">No more moves available</p>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white">{gameState.score.toLocaleString()}</div>
                <div className="text-slate-400">Final Score</div>
                {gameState.score === gameState.bestScore && (
                  <div className="text-yellow-400 text-sm flex items-center justify-center gap-1 mt-2">
                    <Trophy className="w-4 h-4" />
                    New Best Score!
                  </div>
                )}
              </div>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white font-medium"
              >
                Try Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Win Modal */}
      <AnimatePresence>
        {gameState.isWon && !showWinModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => setShowWinModal(true)}
          >
            <motion.div
              className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 text-center max-w-md mx-4"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-black mb-2">You Win!</h2>
              <p className="text-black/80 mb-4">You reached 2048!</p>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-black">{gameState.score.toLocaleString()}</div>
                <div className="text-black/80">Your Score</div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWinModal(true)}
                  className="flex-1 px-4 py-3 bg-black/20 hover:bg-black/30 rounded-lg transition-colors text-black font-medium"
                >
                  Keep Playing
                </button>
                <button
                  onClick={resetGame}
                  className="flex-1 px-4 py-3 bg-black/80 hover:bg-black/90 rounded-lg transition-colors text-white font-medium"
                >
                  New Game
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="text-center text-slate-500 text-sm mt-4">
        <p className="md:hidden">Swipe to move tiles</p>
        <p className="hidden md:block">Use arrow keys to move tiles • Press R to restart • Press U to undo</p>
      </div>
    </div>
  )
}
