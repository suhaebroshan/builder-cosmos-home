import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Crown, Flag, Clock, User, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king'
type PieceColor = 'white' | 'black'

interface Piece {
  type: PieceType
  color: PieceColor
}

interface Position {
  row: number
  col: number
}

interface GameState {
  board: (Piece | null)[][]
  currentPlayer: PieceColor
  selectedPosition: Position | null
  possibleMoves: Position[]
  gameStatus: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw'
  moveHistory: string[]
  capturedPieces: { white: Piece[], black: Piece[] }
  isAIMode: boolean
  difficulty: 'easy' | 'medium' | 'hard'
}

const pieceSymbols: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
}

const initialBoard: (Piece | null)[][] = [
  [
    { type: 'rook', color: 'black' }, { type: 'knight', color: 'black' }, 
    { type: 'bishop', color: 'black' }, { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' }, { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' }, { type: 'rook', color: 'black' }
  ],
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' } as Piece)),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' } as Piece)),
  [
    { type: 'rook', color: 'white' }, { type: 'knight', color: 'white' }, 
    { type: 'bishop', color: 'white' }, { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' }, { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' }, { type: 'rook', color: 'white' }
  ]
]

export const ChessGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: initialBoard.map(row => [...row]),
    currentPlayer: 'white',
    selectedPosition: null,
    possibleMoves: [],
    gameStatus: 'playing',
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    isAIMode: false,
    difficulty: 'medium'
  })

  const isValidPosition = (row: number, col: number): boolean => {
    return row >= 0 && row < 8 && col >= 0 && col < 8
  }

  const getPossibleMoves = useCallback((position: Position, board: (Piece | null)[][]): Position[] => {
    const piece = board[position.row][position.col]
    if (!piece) return []

    const moves: Position[] = []
    const { row, col } = position
    const { type, color } = piece

    const addMove = (newRow: number, newCol: number) => {
      if (isValidPosition(newRow, newCol)) {
        const targetPiece = board[newRow][newCol]
        if (!targetPiece || targetPiece.color !== color) {
          moves.push({ row: newRow, col: newCol })
        }
        return !targetPiece // Can continue in this direction if no piece
      }
      return false
    }

    switch (type) {
      case 'pawn':
        const direction = color === 'white' ? -1 : 1
        const startRow = color === 'white' ? 6 : 1

        // Forward move
        if (isValidPosition(row + direction, col) && !board[row + direction][col]) {
          moves.push({ row: row + direction, col })
          
          // Double move from start
          if (row === startRow && !board[row + 2 * direction][col]) {
            moves.push({ row: row + 2 * direction, col })
          }
        }

        // Captures
        [-1, 1].forEach(dc => {
          if (isValidPosition(row + direction, col + dc)) {
            const targetPiece = board[row + direction][col + dc]
            if (targetPiece && targetPiece.color !== color) {
              moves.push({ row: row + direction, col: col + dc })
            }
          }
        })
        break

      case 'rook':
        // Horizontal and vertical moves
        [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
          for (let i = 1; i < 8; i++) {
            if (!addMove(row + dr * i, col + dc * i)) break
          }
        })
        break

      case 'bishop':
        // Diagonal moves
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
          for (let i = 1; i < 8; i++) {
            if (!addMove(row + dr * i, col + dc * i)) break
          }
        })
        break

      case 'queen':
        // Combination of rook and bishop
        [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
          for (let i = 1; i < 8; i++) {
            if (!addMove(row + dr * i, col + dc * i)) break
          }
        })
        break

      case 'knight':
        // L-shaped moves
        [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
          addMove(row + dr, col + dc)
        })
        break

      case 'king':
        // One square in any direction
        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => {
          addMove(row + dr, col + dc)
        })
        break
    }

    return moves
  }, [])

  const isInCheck = useCallback((board: (Piece | null)[][], color: PieceColor): boolean => {
    // Find the king
    let kingPosition: Position | null = null
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (piece && piece.type === 'king' && piece.color === color) {
          kingPosition = { row, col }
          break
        }
      }
      if (kingPosition) break
    }

    if (!kingPosition) return false

    // Check if any opponent piece can attack the king
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (piece && piece.color !== color) {
          const moves = getPossibleMoves({ row, col }, board)
          if (moves.some(move => move.row === kingPosition!.row && move.col === kingPosition!.col)) {
            return true
          }
        }
      }
    }

    return false
  }, [getPossibleMoves])

  const makeMove = useCallback((from: Position, to: Position) => {
    setGameState(prev => {
      const newBoard = prev.board.map(row => [...row])
      const piece = newBoard[from.row][from.col]
      const capturedPiece = newBoard[to.row][to.col]

      if (!piece) return prev

      // Make the move
      newBoard[to.row][to.col] = piece
      newBoard[from.row][from.col] = null

      // Check if move puts own king in check (invalid move)
      if (isInCheck(newBoard, piece.color)) {
        return prev // Invalid move
      }

      // Update captured pieces
      const newCapturedPieces = { ...prev.capturedPieces }
      if (capturedPiece) {
        newCapturedPieces[capturedPiece.color].push(capturedPiece)
      }

      // Check game status
      const opponentColor = piece.color === 'white' ? 'black' : 'white'
      const inCheck = isInCheck(newBoard, opponentColor)
      
      // Check for checkmate/stalemate (simplified)
      let hasValidMoves = false
      for (let row = 0; row < 8 && !hasValidMoves; row++) {
        for (let col = 0; col < 8 && !hasValidMoves; col++) {
          const opponentPiece = newBoard[row][col]
          if (opponentPiece && opponentPiece.color === opponentColor) {
            const moves = getPossibleMoves({ row, col }, newBoard)
            hasValidMoves = moves.length > 0
          }
        }
      }

      let gameStatus: GameState['gameStatus'] = 'playing'
      if (inCheck && !hasValidMoves) {
        gameStatus = 'checkmate'
      } else if (!inCheck && !hasValidMoves) {
        gameStatus = 'stalemate'
      } else if (inCheck) {
        gameStatus = 'check'
      }

      // Create move notation (simplified)
      const moveNotation = `${pieceSymbols[piece.color][piece.type]}${String.fromCharCode(97 + to.col)}${8 - to.row}`

      return {
        ...prev,
        board: newBoard,
        currentPlayer: opponentColor,
        selectedPosition: null,
        possibleMoves: [],
        gameStatus,
        moveHistory: [...prev.moveHistory, moveNotation],
        capturedPieces: newCapturedPieces
      }
    })
  }, [isInCheck, getPossibleMoves])

  const makeAIMove = useCallback(() => {
    if (gameState.currentPlayer !== 'black' || !gameState.isAIMode) return

    // Simple AI: random valid move
    const aiMoves: { from: Position, to: Position }[] = []
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState.board[row][col]
        if (piece && piece.color === 'black') {
          const moves = getPossibleMoves({ row, col }, gameState.board)
          moves.forEach(move => {
            aiMoves.push({ from: { row, col }, to: move })
          })
        }
      }
    }

    if (aiMoves.length > 0) {
      const randomMove = aiMoves[Math.floor(Math.random() * aiMoves.length)]
      setTimeout(() => {
        makeMove(randomMove.from, randomMove.to)
      }, 1000)
    }
  }, [gameState, getPossibleMoves, makeMove])

  useEffect(() => {
    if (gameState.isAIMode && gameState.currentPlayer === 'black' && gameState.gameStatus === 'playing') {
      makeAIMove()
    }
  }, [gameState.currentPlayer, gameState.isAIMode, gameState.gameStatus, makeAIMove])

  const handleSquareClick = (row: number, col: number) => {
    if (gameState.gameStatus !== 'playing' && gameState.gameStatus !== 'check') return
    if (gameState.isAIMode && gameState.currentPlayer === 'black') return

    const piece = gameState.board[row][col]
    const clickedPosition = { row, col }

    if (gameState.selectedPosition) {
      // Check if clicking on a possible move
      const isPossibleMove = gameState.possibleMoves.some(
        move => move.row === row && move.col === col
      )

      if (isPossibleMove) {
        makeMove(gameState.selectedPosition, clickedPosition)
      } else if (piece && piece.color === gameState.currentPlayer) {
        // Select new piece
        setGameState(prev => ({
          ...prev,
          selectedPosition: clickedPosition,
          possibleMoves: getPossibleMoves(clickedPosition, prev.board)
        }))
      } else {
        // Deselect
        setGameState(prev => ({
          ...prev,
          selectedPosition: null,
          possibleMoves: []
        }))
      }
    } else if (piece && piece.color === gameState.currentPlayer) {
      // Select piece
      setGameState(prev => ({
        ...prev,
        selectedPosition: clickedPosition,
        possibleMoves: getPossibleMoves(clickedPosition, prev.board)
      }))
    }
  }

  const resetGame = () => {
    setGameState({
      board: initialBoard.map(row => [...row]),
      currentPlayer: 'white',
      selectedPosition: null,
      possibleMoves: [],
      gameStatus: 'playing',
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      isAIMode: gameState.isAIMode,
      difficulty: gameState.difficulty
    })
  }

  const toggleAIMode = () => {
    setGameState(prev => ({ ...prev, isAIMode: !prev.isAIMode }))
  }

  return (
    <div className="flex h-full bg-gradient-to-br from-purple-950 via-black to-violet-950 p-4 gap-4">
      {/* Game Board */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-4 flex items-center justify-between w-full max-w-md">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            Nyx Chess
          </h1>
          <div className="flex gap-2">
            <button
              onClick={toggleAIMode}
              className={cn(
                "px-3 py-1 rounded text-sm transition-colors",
                gameState.isAIMode
                  ? "bg-green-500/20 text-green-400"
                  : "bg-purple-500/20 text-purple-300"
              )}
            >
              {gameState.isAIMode ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </button>
            <button
              onClick={resetGame}
              className="p-1 bg-red-500/20 hover:bg-red-500/40 rounded transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-0 border-2 border-purple-500/30 rounded-lg overflow-hidden bg-purple-900/20 backdrop-blur-sm">
          {gameState.board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isSelected = gameState.selectedPosition?.row === rowIndex && gameState.selectedPosition?.col === colIndex
              const isPossibleMove = gameState.possibleMoves.some(move => move.row === rowIndex && move.col === colIndex)
              const isLight = (rowIndex + colIndex) % 2 === 0

              return (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    "w-12 h-12 flex items-center justify-center cursor-pointer relative text-2xl font-bold transition-colors",
                    isLight ? "bg-amber-100/80" : "bg-amber-800/80",
                    isSelected && "bg-blue-400/60",
                    isPossibleMove && "bg-green-400/40"
                  )}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {piece && (
                    <span className={cn(
                      "select-none",
                      piece.color === 'white' ? "text-white drop-shadow-lg" : "text-black drop-shadow-lg"
                    )}>
                      {pieceSymbols[piece.color][piece.type]}
                    </span>
                  )}
                  
                  {isPossibleMove && !piece && (
                    <div className="w-3 h-3 bg-green-500/60 rounded-full" />
                  )}
                  
                  {isPossibleMove && piece && (
                    <div className="absolute inset-0 border-2 border-green-500/80 rounded" />
                  )}
                </motion.div>
              )
            })
          )}
        </div>

        {/* Game Status */}
        <div className="mt-4 text-center">
          {gameState.gameStatus === 'playing' && (
            <p className="text-purple-300">
              {gameState.currentPlayer === 'white' ? '⚪' : '⚫'} {gameState.currentPlayer.toUpperCase()}'s turn
            </p>
          )}
          {gameState.gameStatus === 'check' && (
            <p className="text-yellow-400 flex items-center justify-center gap-2">
              <Crown className="w-4 h-4" />
              CHECK!
            </p>
          )}
          {gameState.gameStatus === 'checkmate' && (
            <p className="text-red-400 flex items-center justify-center gap-2">
              <Crown className="w-4 h-4" />
              CHECKMATE! {gameState.currentPlayer === 'white' ? 'Black' : 'White'} wins!
            </p>
          )}
          {gameState.gameStatus === 'stalemate' && (
            <p className="text-gray-400 flex items-center justify-center gap-2">
              <Flag className="w-4 h-4" />
              STALEMATE - Draw!
            </p>
          )}
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-64 bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
        {/* Captured Pieces */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-2">Captured</h3>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              <span className="text-purple-300 text-sm">White:</span>
              {gameState.capturedPieces.white.map((piece, index) => (
                <span key={index} className="text-white text-lg">
                  {pieceSymbols[piece.color][piece.type]}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              <span className="text-purple-300 text-sm">Black:</span>
              {gameState.capturedPieces.black.map((piece, index) => (
                <span key={index} className="text-black text-lg drop-shadow-lg">
                  {pieceSymbols[piece.color][piece.type]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Move History */}
        <div>
          <h3 className="text-white font-semibold mb-2">Moves</h3>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {gameState.moveHistory.map((move, index) => (
              <div key={index} className="text-purple-300 text-sm">
                {index + 1}. {move}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
