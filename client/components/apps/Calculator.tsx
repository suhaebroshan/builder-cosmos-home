import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RotateCcw, 
  Delete, 
  Divide, 
  X, 
  Minus, 
  Plus, 
  Equal,
  Calculator as CalculatorIcon,
  History,
  Function,
  MoreHorizontal,
  Copy,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSamStore } from '@/store/sam-store'

interface CalculationHistory {
  id: string
  expression: string
  result: string
  timestamp: Date
}

type CalculatorMode = 'basic' | 'scientific' | 'programmer'

export const Calculator: React.FC = () => {
  const { addMessage, setEmotion } = useSamStore()
  
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [mode, setMode] = useState<CalculatorMode>('basic')
  const [memory, setMemory] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<CalculationHistory[]>(() => {
    const saved = localStorage.getItem('nyx-calculator-history')
    return saved ? JSON.parse(saved) : []
  })
  const [isRadian, setIsRadian] = useState(true)
  const [precision, setPrecision] = useState(10)

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('nyx-calculator-history', JSON.stringify(history))
  }, [history])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event
      
      if (key >= '0' && key <= '9') {
        inputNumber(key)
      } else if (['+', '-', '*', '/', '=', 'Enter'].includes(key)) {
        if (key === '=') {
          calculate()
        } else if (key === 'Enter') {
          event.preventDefault()
          calculate()
        } else {
          inputOperation(key === '*' ? '×' : key === '/' ? '÷' : key)
        }
      } else if (key === '.') {
        inputDecimal()
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clear()
      } else if (key === 'Backspace') {
        backspace()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [display, operation, previousValue, waitingForOperand])

  const addToHistory = (expression: string, result: string) => {
    const newEntry: CalculationHistory = {
      id: `calc-${Date.now()}`,
      expression,
      result,
      timestamp: new Date()
    }
    
    setHistory(prev => [newEntry, ...prev.slice(0, 99)]) // Keep last 100 entries
  }

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.')
    }
  }

  const clear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay('0')
    }
  }

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = performOperation(currentValue, inputValue, operation)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operation) {
      const currentValue = previousValue
      const newValue = performOperation(currentValue, inputValue, operation)
      
      const expression = `${currentValue} ${operation} ${inputValue}`
      const result = String(newValue)
      
      addToHistory(expression, result)
      setDisplay(result)
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)
      
      setEmotion('focused', 0.6)
      addMessage(`Calculated: ${expression} = ${result}`, 'sam', 'focused')
    }
  }

  const performOperation = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue
      case '-':
        return firstValue - secondValue
      case '×':
        return firstValue * secondValue
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : NaN
      case 'mod':
        return firstValue % secondValue
      case '^':
        return Math.pow(firstValue, secondValue)
      default:
        return secondValue
    }
  }

  // Scientific functions
  const scientificOperation = (func: string) => {
    const value = parseFloat(display)
    let result: number

    switch (func) {
      case 'sin':
        result = Math.sin(isRadian ? value : (value * Math.PI) / 180)
        break
      case 'cos':
        result = Math.cos(isRadian ? value : (value * Math.PI) / 180)
        break
      case 'tan':
        result = Math.tan(isRadian ? value : (value * Math.PI) / 180)
        break
      case 'log':
        result = Math.log10(value)
        break
      case 'ln':
        result = Math.log(value)
        break
      case 'sqrt':
        result = Math.sqrt(value)
        break
      case 'square':
        result = value * value
        break
      case 'inverse':
        result = 1 / value
        break
      case 'factorial':
        result = factorial(Math.floor(value))
        break
      case 'abs':
        result = Math.abs(value)
        break
      case 'pi':
        result = Math.PI
        break
      case 'e':
        result = Math.E
        break
      default:
        result = value
    }

    const expression = `${func}(${value})`
    const resultStr = parseFloat(result.toPrecision(precision)).toString()
    
    addToHistory(expression, resultStr)
    setDisplay(resultStr)
    setWaitingForOperand(true)
  }

  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n)) return NaN
    if (n === 0 || n === 1) return 1
    return n * factorial(n - 1)
  }

  // Memory functions
  const memoryAdd = () => {
    setMemory(memory + parseFloat(display))
    setEmotion('happy', 0.5)
    addMessage('Added to memory!', 'sam', 'happy')
  }

  const memorySubtract = () => {
    setMemory(memory - parseFloat(display))
    setEmotion('happy', 0.5)
    addMessage('Subtracted from memory!', 'sam', 'happy')
  }

  const memoryRecall = () => {
    setDisplay(memory.toString())
    setWaitingForOperand(true)
  }

  const memoryClear = () => {
    setMemory(0)
    setEmotion('neutral', 0.5)
    addMessage('Memory cleared!', 'sam', 'neutral')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setEmotion('happy', 0.6)
    addMessage('Copied to clipboard!', 'sam', 'happy')
  }

  const Button: React.FC<{
    onClick: () => void
    className?: string
    children: React.ReactNode
    disabled?: boolean
    size?: 'normal' | 'wide' | 'tall'
  }> = ({ onClick, className = '', children, disabled = false, size = 'normal' }) => (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-12 rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        size === 'wide' && "col-span-2",
        size === 'tall' && "row-span-2",
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {children}
    </motion.button>
  )

  const renderBasicCalculator = () => (
    <div className="grid grid-cols-4 gap-2 p-4">
      {/* Row 1 */}
      <Button onClick={clear} className="bg-red-500/20 hover:bg-red-500/30 text-red-400">
        C
      </Button>
      <Button onClick={backspace} className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400">
        <Delete className="w-4 h-4" />
      </Button>
      <Button onClick={() => inputOperation('mod')} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400">
        %
      </Button>
      <Button onClick={() => inputOperation('÷')} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400">
        ÷
      </Button>

      {/* Row 2 */}
      <Button onClick={() => inputNumber('7')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        7
      </Button>
      <Button onClick={() => inputNumber('8')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        8
      </Button>
      <Button onClick={() => inputNumber('9')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        9
      </Button>
      <Button onClick={() => inputOperation('×')} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400">
        ×
      </Button>

      {/* Row 3 */}
      <Button onClick={() => inputNumber('4')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        4
      </Button>
      <Button onClick={() => inputNumber('5')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        5
      </Button>
      <Button onClick={() => inputNumber('6')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        6
      </Button>
      <Button onClick={() => inputOperation('-')} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400">
        -
      </Button>

      {/* Row 4 */}
      <Button onClick={() => inputNumber('1')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        1
      </Button>
      <Button onClick={() => inputNumber('2')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        2
      </Button>
      <Button onClick={() => inputNumber('3')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        3
      </Button>
      <Button onClick={() => inputOperation('+')} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400">
        +
      </Button>

      {/* Row 5 */}
      <Button onClick={() => inputNumber('0')} size="wide" className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        0
      </Button>
      <Button onClick={inputDecimal} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        .
      </Button>
      <Button onClick={calculate} className="bg-green-500/20 hover:bg-green-500/30 text-green-400">
        =
      </Button>
    </div>
  )

  const renderScientificCalculator = () => (
    <div className="grid grid-cols-5 gap-2 p-4">
      {/* Row 1 - Functions */}
      <Button onClick={() => scientificOperation('sin')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm">
        sin
      </Button>
      <Button onClick={() => scientificOperation('cos')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm">
        cos
      </Button>
      <Button onClick={() => scientificOperation('tan')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm">
        tan
      </Button>
      <Button onClick={() => scientificOperation('log')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm">
        log
      </Button>
      <Button onClick={() => scientificOperation('ln')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm">
        ln
      </Button>

      {/* Row 2 - More functions */}
      <Button onClick={() => scientificOperation('sqrt')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm">
        √
      </Button>
      <Button onClick={() => scientificOperation('square')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm">
        x²
      </Button>
      <Button onClick={() => inputOperation('^')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm">
        x^y
      </Button>
      <Button onClick={() => scientificOperation('factorial')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm">
        x!
      </Button>
      <Button onClick={() => scientificOperation('inverse')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm">
        1/x
      </Button>

      {/* Row 3 - Constants and Clear */}
      <Button onClick={() => scientificOperation('pi')} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm">
        π
      </Button>
      <Button onClick={() => scientificOperation('e')} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm">
        e
      </Button>
      <Button onClick={clear} className="bg-red-500/20 hover:bg-red-500/30 text-red-400">
        C
      </Button>
      <Button onClick={backspace} className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400">
        <Delete className="w-4 h-4" />
      </Button>
      <Button onClick={() => inputOperation('÷')} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400">
        ÷
      </Button>

      {/* Numbers and operations */}
      <Button onClick={() => inputNumber('7')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        7
      </Button>
      <Button onClick={() => inputNumber('8')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        8
      </Button>
      <Button onClick={() => inputNumber('9')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        9
      </Button>
      <Button onClick={() => inputOperation('×')} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400">
        ×
      </Button>
      <Button onClick={() => inputOperation('mod')} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm">
        mod
      </Button>

      <Button onClick={() => inputNumber('4')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        4
      </Button>
      <Button onClick={() => inputNumber('5')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        5
      </Button>
      <Button onClick={() => inputNumber('6')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        6
      </Button>
      <Button onClick={() => inputOperation('-')} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400">
        -
      </Button>
      <Button onClick={() => scientificOperation('abs')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm">
        |x|
      </Button>

      <Button onClick={() => inputNumber('1')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        1
      </Button>
      <Button onClick={() => inputNumber('2')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        2
      </Button>
      <Button onClick={() => inputNumber('3')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        3
      </Button>
      <Button onClick={() => inputOperation('+')} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400">
        +
      </Button>
      <Button onClick={() => setIsRadian(!isRadian)} className={cn(
        "text-sm",
        isRadian ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400" : "bg-gray-500/20 hover:bg-gray-500/30 text-gray-400"
      )}>
        {isRadian ? 'RAD' : 'DEG'}
      </Button>

      <Button onClick={() => inputNumber('0')} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        0
      </Button>
      <Button onClick={inputDecimal} className="bg-gray-600/20 hover:bg-gray-600/30 text-white">
        .
      </Button>
      <Button onClick={calculate} className="bg-green-500/20 hover:bg-green-500/30 text-green-400">
        =
      </Button>
      <Button onClick={() => setShowHistory(!showHistory)} className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400">
        <History className="w-4 h-4" />
      </Button>
      <Button onClick={() => copyToClipboard(display)} className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400">
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-950 via-black to-violet-950">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <CalculatorIcon className="w-5 h-5 text-purple-400" />
          <h1 className="text-lg font-semibold text-white">Nyx Calculator</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mode selector */}
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as CalculatorMode)}
            className="px-3 py-1 bg-black/40 border border-purple-500/30 rounded text-white text-sm focus:border-purple-400/50 focus:outline-none"
          >
            <option value="basic">Basic</option>
            <option value="scientific">Scientific</option>
          </select>
          
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              "p-2 rounded transition-colors",
              showHistory ? "bg-indigo-500/30 text-indigo-400" : "hover:bg-purple-500/20 text-purple-400"
            )}
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Main Calculator */}
        <div className="flex-1 flex flex-col">
          {/* Display */}
          <div className="p-6 bg-black/10">
            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
              <div className="text-right">
                {memory !== 0 && (
                  <div className="text-purple-400 text-sm mb-1">M: {memory}</div>
                )}
                <div 
                  className="text-white text-3xl font-mono break-all cursor-pointer"
                  onClick={() => copyToClipboard(display)}
                  title="Click to copy"
                >
                  {display}
                </div>
                {operation && previousValue !== null && (
                  <div className="text-purple-300 text-sm mt-1">
                    {previousValue} {operation}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Memory buttons (for scientific mode) */}
          {mode === 'scientific' && (
            <div className="grid grid-cols-4 gap-2 px-4 py-2">
              <Button onClick={memoryClear} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm">
                MC
              </Button>
              <Button onClick={memoryRecall} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm">
                MR
              </Button>
              <Button onClick={memoryAdd} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm">
                M+
              </Button>
              <Button onClick={memorySubtract} className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-sm">
                M-
              </Button>
            </div>
          )}

          {/* Calculator Buttons */}
          <div className="flex-1">
            {mode === 'basic' ? renderBasicCalculator() : renderScientificCalculator()}
          </div>
        </div>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              className="w-80 bg-black/20 border-l border-purple-500/20 p-4"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">History</h3>
                <button
                  onClick={() => {
                    setHistory([])
                    setEmotion('neutral', 0.5)
                    addMessage('History cleared!', 'sam', 'neutral')
                  }}
                  className="text-red-400 hover:bg-red-500/20 p-1 rounded transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {history.map((entry) => (
                  <motion.div
                    key={entry.id}
                    className="bg-black/40 border border-purple-500/30 rounded p-3 cursor-pointer hover:bg-purple-500/20 transition-colors"
                    onClick={() => {
                      setDisplay(entry.result)
                      setWaitingForOperand(true)
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="text-purple-300 text-sm">{entry.expression}</div>
                    <div className="text-white font-mono">{entry.result}</div>
                    <div className="text-purple-500 text-xs mt-1">
                      {entry.timestamp.toLocaleTimeString()}
                    </div>
                  </motion.div>
                ))}
                
                {history.length === 0 && (
                  <div className="text-center text-purple-400 py-8">
                    No calculations yet
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between p-2 bg-black/20 border-t border-purple-500/20 text-sm text-purple-300">
        <div className="flex items-center gap-4">
          <span>Mode: {mode}</span>
          {mode === 'scientific' && <span>Angle: {isRadian ? 'Radians' : 'Degrees'}</span>}
        </div>
        <div className="flex items-center gap-4">
          <span>Precision: {precision}</span>
          <span>History: {history.length}</span>
        </div>
      </div>
    </div>
  )
}
