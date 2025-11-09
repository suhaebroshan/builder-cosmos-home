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
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CellData {
  [key: string]: string | number
}

interface SheetData {
  id: string
  name: string
  rows: CellData[]
  columns: string[]
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

// Generate multiple columns
const generateColumns = (count: number): string[] => {
  return Array.from({ length: count }, (_, i) => generateColumnName(i))
}

export const Spreadsheet: React.FC<{ windowId?: string }> = ({ windowId }) => {
  const [sheets, setSheets] = useState<SheetData[]>([
    {
      id: '1',
      name: 'Sheet 1',
      columns: generateColumns(26), // Start with A-Z
      rows: Array(100).fill(null).map(() => 
        generateColumns(26).reduce((acc, col) => {
          acc[col] = ''
          return acc
        }, {} as CellData)
      )
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

    setVisibleRows(prev => prev + count)
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

  const exportAsCSV = () => {
    if (!activeSheet) return

    const rows = [
      activeSheet.columns.slice(0, visibleCols).join(','),
      ...activeSheet.rows.slice(0, visibleRows).map(row =>
        activeSheet.columns.slice(0, visibleCols).map(col => row[col] || '').join(',')
      )
    ]

    const csv = rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeSheet.name}.csv`
    a.click()
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
            onClick={exportAsCSV}
            className="p-2 hover:bg-white/20 rounded text-white transition-colors"
            title="Export as CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

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
              {visibleColumns.map(col => (
                <input
                  key={`${rowIndex}-${col}`}
                  type="text"
                  value={row[col] || ''}
                  onChange={(e) => updateCell(rowIndex, col, e.target.value)}
                  onFocus={() => setSelectedCell({ row: rowIndex, col })}
                  className={cn(
                    'w-32 h-10 px-2 text-sm border border-purple-400/10 bg-gray-800/50 text-white',
                    'hover:bg-gray-800 focus:bg-gray-700 outline-none flex-shrink-0',
                    selectedCell?.row === rowIndex && selectedCell?.col === col && 'ring-2 ring-purple-400'
                  )}
                  placeholder={`${col}${rowIndex + 1}`}
                />
              ))}
              <button
                onClick={() => deleteRow(rowIndex)}
                className="w-10 h-10 flex items-center justify-center hover:bg-red-500/20 text-red-400 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Load More Indicator */}
          {visibleRows < activeSheet.rows.length && (
            <div className="flex bg-gray-800/50 border-t border-purple-400/10">
              <div className="w-12 h-10" />
              <button
                onClick={() => addRows(100)}
                className="flex-1 p-2 text-white/60 text-xs hover:text-white hover:bg-purple-500/20 transition-colors"
              >
                Load {Math.min(100, activeSheet.rows.length - visibleRows)} more rows...
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer - Statistics */}
      <motion.div
        className="glass-purple-dark border-t border-purple-400/20 px-6 py-3 flex items-center gap-4 overflow-x-auto max-h-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-white text-xs whitespace-nowrap">Stats:</span>
        {visibleColumns.slice(0, 5).map(col => (
          <div key={col} className="flex gap-2 text-xs text-white/70 whitespace-nowrap">
            <span className="font-semibold text-purple-300">{col}</span>
            <span>Σ {calculateSum(col).toFixed(2)}</span>
            <span>μ {calculateAverage(col).toFixed(2)}</span>
          </div>
        ))}
        {visibleColumns.length > 5 && (
          <span className="text-white/60 text-xs">+ {visibleColumns.length - 5} more columns</span>
        )}
      </motion.div>
    </div>
  )
}
