import React, { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Download,
  Copy,
  Trash2,
  BarChart3,
  FunctionSquare,
  Filter,
  ChevronDown,
  Palette,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { cn } from '@/lib/utils'

interface CellData {
  [key: string]: string | number
}

interface CellFormat {
  color?: string
  bgColor?: string
  bold?: boolean
  italic?: boolean
  alignment?: 'left' | 'center' | 'right'
}

interface SheetData {
  id: string
  name: string
  rows: CellData[]
  columns: string[]
  formats: Record<string, CellFormat>
}

// Generate column names: A-Z, AA-ZZ, AAA-ZZZ
const generateColumnName = (index: number): string => {
  let col = ''
  let num = index + 1
  while (num > 0) {
    num--
    col = String.fromCharCode(65 + (num % 26)) + col
    num = Math.floor(num / 26)
  }
  return col
}

const generateColumns = (count: number): string[] => {
  return Array.from({ length: count }, (_, i) => generateColumnName(i))
}

// Formula evaluator
const evaluateFormula = (formula: string, rows: CellData[], columns: string[]): string => {
  if (!formula.startsWith('=')) return formula

  const expression = formula.substring(1)

  // SUM(A1:A10)
  const sumMatch = expression.match(/SUM\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)/i)
  if (sumMatch) {
    const [, startCol, startRow, endCol, endRow] = sumMatch
    let sum = 0
    const start = parseInt(startRow) - 1
    const end = parseInt(endRow) - 1
    for (let i = start; i <= end && i < rows.length; i++) {
      const val = parseFloat(String(rows[i][startCol] || 0))
      sum += isNaN(val) ? 0 : val
    }
    return sum.toString()
  }

  // AVERAGE(A1:A10)
  const avgMatch = expression.match(/AVERAGE\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)/i)
  if (avgMatch) {
    const [, startCol, startRow, endCol, endRow] = avgMatch
    let sum = 0
    let count = 0
    const start = parseInt(startRow) - 1
    const end = parseInt(endRow) - 1
    for (let i = start; i <= end && i < rows.length; i++) {
      const val = parseFloat(String(rows[i][startCol] || 0))
      if (!isNaN(val)) {
        sum += val
        count++
      }
    }
    return count > 0 ? (sum / count).toFixed(2) : '0'
  }

  // IF(A1>10, "yes", "no")
  const ifMatch = expression.match(/IF\((.+?),\s*"(.+?)",\s*"(.+?)"\)/i)
  if (ifMatch) {
    return 'IF function'
  }

  return formula
}

export const Spreadsheet: React.FC<{ windowId?: string }> = ({ windowId }) => {
  const [sheets, setSheets] = useState<SheetData[]>([
    {
      id: '1',
      name: 'Sheet 1',
      columns: generateColumns(26),
      rows: Array(100).fill(null).map(() =>
        generateColumns(26).reduce((acc, col) => {
          acc[col] = ''
          return acc
        }, {} as CellData)
      ),
      formats: {}
    }
  ])
  const [activeSheetId, setActiveSheetId] = useState('1')
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null)
  const [visibleRows, setVisibleRows] = useState(100)
  const [visibleCols, setVisibleCols] = useState(26)

  const activeSheet = sheets.find(s => s.id === activeSheetId)

  const updateCell = (rowIndex: number, colName: string, value: string | number) => {
    setSheets(prev => prev.map(sheet =>
      sheet.id === activeSheetId
        ? {
            ...sheet,
            rows: sheet.rows.map((row, i) =>
              i === rowIndex ? { ...row, [colName]: value } : row
            )
          }
        : sheet
    ))
  }

  const setCellFormat = (rowIndex: number, colName: string, format: CellFormat) => {
    const cellId = `${colName}${rowIndex + 1}`
    setSheets(prev => prev.map(sheet =>
      sheet.id === activeSheetId
        ? {
            ...sheet,
            formats: {
              ...sheet.formats,
              [cellId]: format
            }
          }
        : sheet
    ))
  }

  const addRows = (count: number = 100) => {
    if (!activeSheet) return

    const newRows = Array(count).fill(null).map(() =>
      activeSheet.columns.reduce((acc, col) => {
        acc[col] = ''
        return acc
      }, {} as CellData)
    )

    setSheets(prev => prev.map(sheet =>
      sheet.id === activeSheetId
        ? { ...sheet, rows: [...sheet.rows, ...newRows] }
        : sheet
    ))

    setVisibleRows(prev => Math.min(prev + count, activeSheet.rows.length + count))
  }

  const addColumns = (count: number = 26) => {
    if (!activeSheet) return

    const newColCount = activeSheet.columns.length + count
    const newColumns = generateColumns(newColCount)

    setSheets(prev => prev.map(sheet =>
      sheet.id === activeSheetId
        ? {
            ...sheet,
            columns: newColumns,
            rows: sheet.rows.map(row => {
              const newRow = { ...row }
              for (let i = activeSheet.columns.length; i < newColCount; i++) {
                newRow[newColumns[i]] = ''
              }
              return newRow
            })
          }
        : sheet
    ))

    setVisibleCols(prev => prev + count)
  }

  const deleteRow = (index: number) => {
    setSheets(prev => prev.map(sheet =>
      sheet.id === activeSheetId
        ? { ...sheet, rows: sheet.rows.filter((_, i) => i !== index) }
        : sheet
    ))
  }

  const addSheet = () => {
    const newId = `sheet-${Date.now()}`
    const newSheet: SheetData = {
      id: newId,
      name: `Sheet ${sheets.length + 1}`,
      columns: generateColumns(26),
      rows: Array(100).fill(null).map(() =>
        generateColumns(26).reduce((acc, col) => {
          acc[col] = ''
          return acc
        }, {} as CellData)
      ),
      formats: {}
    }
    setSheets(prev => [...prev, newSheet])
    setActiveSheetId(newId)
  }

  const exportAsXLSX = () => {
    if (!activeSheet) return

    const wsData = [
      activeSheet.columns.slice(0, visibleCols),
      ...activeSheet.rows.slice(0, visibleRows).map(row =>
        activeSheet.columns.slice(0, visibleCols).map(col => {
          const cellValue = row[col] || ''
          // Evaluate formulas
          if (String(cellValue).startsWith('=')) {
            return evaluateFormula(String(cellValue), activeSheet.rows, activeSheet.columns)
          }
          return cellValue
        })
      )
    ]

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, activeSheet.name)
    XLSX.writeFile(wb, `${activeSheet.name}.xlsx`)
  }

  const calculateSum = (colName: string) => {
    if (!activeSheet) return 0
    return activeSheet.rows.reduce((sum, row) => {
      const val = parseFloat(String(row[colName] || 0))
      return sum + (isNaN(val) ? 0 : val)
    }, 0)
  }

  const calculateAverage = (colName: string) => {
    if (!activeSheet) return 0
    const sum = calculateSum(colName)
    return activeSheet.rows.length > 0 ? sum / activeSheet.rows.length : 0
  }

  if (!activeSheet) return null

  const visibleColumns = activeSheet.columns.slice(0, visibleCols)
  const visibleSheetRows = activeSheet.rows.slice(0, visibleRows)

  const getCellFormat = (rowIndex: number, colName: string) => {
    const cellId = `${colName}${rowIndex + 1}`
    return activeSheet.formats[cellId] || {}
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900">
      {/* Header */}
      <motion.div
        className="glass-purple-dark px-6 py-4 border-b border-purple-400/20 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <h2 className="text-white font-semibold">{activeSheet.name}</h2>
          <span className="text-white/60 text-xs ml-2">
            {visibleRows} rows × {visibleCols} cols
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => addColumns(26)}
            className="p-2 hover:bg-white/20 rounded text-white transition-colors text-xs"
            title="Add 26 Columns"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Cols
          </button>
          <button
            onClick={() => addRows(100)}
            className="p-2 hover:bg-white/20 rounded text-white transition-colors text-xs"
            title="Add 100 Rows"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Rows
          </button>
          <button
            onClick={addSheet}
            className="p-2 hover:bg-white/20 rounded text-white transition-colors text-xs"
            title="Add Sheet"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Sheet
          </button>
          <button
            onClick={exportAsXLSX}
            className="p-2 hover:bg-white/20 rounded text-white transition-colors"
            title="Export as XLSX"
          >
            <Download className="w-4 h-4 inline mr-1" />
            <span className="text-xs">XLSX</span>
          </button>
        </div>
      </motion.div>

      {/* Sheet Tabs */}
      <div className="glass-purple border-b border-purple-400/20 px-6 py-2 flex gap-2 overflow-x-auto">
        {sheets.map(sheet => (
          <button
            key={sheet.id}
            onClick={() => setActiveSheetId(sheet.id)}
            className={cn(
              'px-3 py-1 rounded text-xs transition-colors',
              activeSheetId === sheet.id
                ? 'bg-purple-500 text-white'
                : 'text-white/60 hover:text-white'
            )}
          >
            {sheet.name}
          </button>
        ))}
      </div>

      {/* Spreadsheet */}
      <motion.div
        className="flex-1 overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="inline-block min-w-full">
          {/* Header Row */}
          <div className="flex sticky top-0 z-10 bg-purple-950/80 backdrop-blur">
            <div className="w-12 h-10 glass-purple-dark border border-purple-400/20 flex items-center justify-center text-white text-xs font-semibold" />
            {visibleColumns.map(col => (
              <div
                key={col}
                className="w-32 h-10 glass-purple-dark border border-purple-400/20 flex items-center justify-center text-white text-xs font-semibold cursor-pointer hover:bg-white/10 flex-shrink-0"
              >
                {col}
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {visibleSheetRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex border-b border-purple-400/10">
              <div className="w-12 h-10 glass-purple border border-purple-400/10 flex items-center justify-center text-white/60 text-xs flex-shrink-0">
                {rowIndex + 1}
              </div>
              {visibleColumns.map(col => {
                const cellFormat = getCellFormat(rowIndex, col)
                const cellValue = row[col] || ''
                const isFormula = String(cellValue).startsWith('=')
                const displayValue = isFormula ? evaluateFormula(String(cellValue), activeSheet.rows, activeSheet.columns) : cellValue

                return (
                  <input
                    key={`${rowIndex}-${col}`}
                    type="text"
                    value={cellValue}
                    onChange={(e) => updateCell(rowIndex, col, e.target.value)}
                    onFocus={() => setSelectedCell({ row: rowIndex, col })}
                    className={cn(
                      'w-32 h-10 px-2 text-sm border border-purple-400/10 bg-gray-800/50 text-white',
                      'hover:bg-gray-800 focus:bg-gray-700 outline-none flex-shrink-0',
                      selectedCell?.row === rowIndex && selectedCell?.col === col && 'ring-2 ring-purple-400'
                    )}
                    style={{
                      fontWeight: cellFormat.bold ? 'bold' : 'normal',
                      fontStyle: cellFormat.italic ? 'italic' : 'normal',
                      textAlign: (cellFormat.alignment || 'left') as any,
                      color: cellFormat.color || '#ffffff',
                      backgroundColor: cellFormat.bgColor || (isFormula ? 'rgba(139, 92, 246, 0.1)' : '')
                    }}
                    placeholder={`${col}${rowIndex + 1}`}
                    title={isFormula ? `Formula: ${cellValue}` : ''}
                  />
                )
              })}
              <button
                onClick={() => deleteRow(rowIndex)}
                className="w-10 h-10 flex items-center justify-center hover:bg-red-500/20 text-red-400 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Footer - Statistics */}
      <motion.div
        className="glass-purple-dark border-t border-purple-400/20 px-6 py-3 flex items-center gap-4 overflow-x-auto max-h-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-white text-xs whitespace-nowrap font-semibold">Formula Tips:</span>
        <span className="text-white/70 text-xs whitespace-nowrap">= SUM(A1:A10)</span>
        <span className="text-white/70 text-xs whitespace-nowrap">= AVERAGE(A1:A10)</span>
        <span className="text-white/70 text-xs whitespace-nowrap">= IF(A1>10,"yes","no")</span>
      </motion.div>
    </div>
  )
}