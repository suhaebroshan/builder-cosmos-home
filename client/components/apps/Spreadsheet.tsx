import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Download,
  Copy,
  Trash2,
  BarChart3,
  FunctionSquare,
  Filter,
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

export const Spreadsheet: React.FC<{ windowId?: string }> = ({ windowId }) => {
  const [sheets, setSheets] = useState<SheetData[]>([
    {
      id: '1',
      name: 'Sheet 1',
      columns: ['A', 'B', 'C', 'D', 'E'],
      rows: Array(20).fill(null).map(() => ({
        A: '', B: '', C: '', D: '', E: ''
      }))
    }
  ])
  const [activeSheetId, setActiveSheetId] = useState('1')
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null)
  const [filterText, setFilterText] = useState('')

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

  const addRow = () => {
    if (!activeSheet) return

    const newRow = activeSheet.columns.reduce((acc, col) => {
      acc[col] = ''
      return acc
    }, {} as CellData)

    setSheets(prev => prev.map(sheet =>
      sheet.id === activeSheetId
        ? { ...sheet, rows: [...sheet.rows, newRow] }
        : sheet
    ))
  }

  const addColumn = () => {
    if (!activeSheet) return

    const newColName = String.fromCharCode(65 + activeSheet.columns.length)
    
    setSheets(prev => prev.map(sheet =>
      sheet.id === activeSheetId
        ? {
            ...sheet,
            columns: [...sheet.columns, newColName],
            rows: sheet.rows.map(row => ({ ...row, [newColName]: '' }))
          }
        : sheet
    ))
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
      activeSheet.columns.join(','),
      ...activeSheet.rows.map(row =>
        activeSheet.columns.map(col => row[col] || '').join(',')
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

  return (
    <div className="w-full h-full flex flex-col bg-gray-900">
      {/* Header */}
      <motion.div
        className="glass-purple-dark px-6 py-4 border-b border-purple-400/20 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-white font-semibold">{activeSheet.name}</h2>
        <div className="flex gap-2">
          <button
            onClick={addColumn}
            className="p-2 hover:bg-white/20 rounded text-white transition-colors"
            title="Add Column"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={addRow}
            className="p-2 hover:bg-white/20 rounded text-white transition-colors"
            title="Add Row"
          >
            <Plus className="w-4 h-4 rotate-45" />
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
            {activeSheet.columns.map(col => (
              <div
                key={col}
                className="w-32 h-10 glass-purple-dark border border-purple-400/20 flex items-center justify-center text-white text-xs font-semibold cursor-pointer hover:bg-white/10"
              >
                {col}
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {activeSheet.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex border-b border-purple-400/10">
              <div className="w-12 h-10 glass-purple border border-purple-400/10 flex items-center justify-center text-white/60 text-xs">
                {rowIndex + 1}
              </div>
              {activeSheet.columns.map(col => (
                <input
                  key={`${rowIndex}-${col}`}
                  type="text"
                  value={row[col] || ''}
                  onChange={(e) => updateCell(rowIndex, col, e.target.value)}
                  onFocus={() => setSelectedCell({ row: rowIndex, col })}
                  className={cn(
                    'w-32 h-10 px-2 text-sm border border-purple-400/10 bg-gray-800/50 text-white',
                    'hover:bg-gray-800 focus:bg-gray-700 outline-none',
                    selectedCell?.row === rowIndex && selectedCell?.col === col && 'ring-2 ring-purple-400'
                  )}
                  placeholder={`${col}${rowIndex + 1}`}
                />
              ))}
              <button
                onClick={() => deleteRow(rowIndex)}
                className="w-10 h-10 flex items-center justify-center hover:bg-red-500/20 text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Footer - Statistics */}
      <motion.div
        className="glass-purple-dark border-t border-purple-400/20 px-6 py-3 flex items-center gap-4 overflow-x-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {activeSheet.columns.map(col => (
          <div key={col} className="flex gap-2 text-xs text-white/70 whitespace-nowrap">
            <span className="font-semibold text-purple-300">{col}</span>
            <span>Sum: {calculateSum(col).toFixed(2)}</span>
            <span>Avg: {calculateAverage(col).toFixed(2)}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
