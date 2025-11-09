import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Download,
  ArrowRightLeft,
  FileText,
  File,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConversionTask {
  id: string
  fileName: string
  fromFormat: string
  toFormat: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
}

const SUPPORTED_FORMATS = [
  { ext: 'pdf', label: 'PDF', icon: FileText },
  { ext: 'docx', label: 'Word (.docx)', icon: FileText },
  { ext: 'doc', label: 'Word (.doc)', icon: FileText },
  { ext: 'pptx', label: 'PowerPoint', icon: File },
  { ext: 'ppt', label: 'PowerPoint (.ppt)', icon: File },
  { ext: 'xlsx', label: 'Excel', icon: File },
  { ext: 'csv', label: 'CSV', icon: FileText },
  { ext: 'txt', label: 'Text', icon: FileText },
  { ext: 'jpg', label: 'JPEG', icon: File },
  { ext: 'png', label: 'PNG', icon: File },
]

const CONVERSION_ROUTES: Record<string, string[]> = {
  'pdf': ['docx', 'txt', 'xlsx'],
  'docx': ['pdf', 'txt', 'pptx'],
  'doc': ['pdf', 'docx', 'txt'],
  'pptx': ['pdf', 'docx'],
  'ppt': ['pptx', 'pdf'],
  'xlsx': ['pdf', 'csv', 'txt'],
  'csv': ['xlsx', 'txt'],
  'txt': ['docx', 'pdf'],
  'jpg': ['png', 'pdf'],
  'png': ['jpg', 'pdf'],
}

export const FileConverter: React.FC<{ windowId?: string }> = ({ windowId }) => {
  const [tasks, setTasks] = useState<ConversionTask[]>([])
  const [selectedFromFormat, setSelectedFromFormat] = useState('pdf')
  const [selectedToFormat, setSelectedToFormat] = useState('docx')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)

  const availableFormats = CONVERSION_ROUTES[selectedFromFormat] || []

  const simulateConversion = (task: ConversionTask) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setTasks(prev => prev.map(t =>
          t.id === task.id
            ? { ...t, status: 'completed', progress: 100 }
            : t
        ))
      } else {
        setTasks(prev => prev.map(t =>
          t.id === task.id
            ? { ...t, progress: Math.min(progress, 100) }
            : t
        ))
      }
    }, 300)
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()?.toLowerCase() || ''

      if (ext !== selectedFromFormat) {
        alert(`File ${file.name} is not a ${selectedFromFormat.toUpperCase()} file`)
        continue
      }

      const task: ConversionTask = {
        id: `task-${Date.now()}-${i}`,
        fileName: file.name,
        fromFormat: selectedFromFormat,
        toFormat: selectedToFormat,
        status: 'processing',
        progress: 0,
      }

      setTasks(prev => [...prev, task])

      // Simulate conversion
      setTimeout(() => {
        simulateConversion(task)
      }, 300)
    }
  }

  const downloadFile = (task: ConversionTask) => {
    const ext = task.toFormat
    const newFileName = task.fileName.replace(`.${task.fromFormat}`, `.${ext}`)

    // Create a mock file (in real app, this would be the actual converted file)
    const mockContent = `Converted file: ${task.fileName} to ${ext}`
    const blob = new Blob([mockContent], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = newFileName
    a.click()
  }

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const swapFormats = () => {
    if (availableFormats.includes(selectedFromFormat)) {
      setSelectedFromFormat(selectedToFormat)
      setSelectedToFormat(selectedFromFormat)
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <motion.div
        className="glass-purple-dark px-6 py-4 border-b border-purple-400/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-white font-semibold">File Converter</h2>
        <p className="text-white/60 text-sm mt-1">Convert files between different formats instantly</p>
      </motion.div>

      <motion.div
        className="flex-1 flex flex-col overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Format Selection */}
        <motion.div
          className="glass-purple px-8 py-6 border-b border-purple-400/20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-8 max-w-4xl mx-auto">
            {/* From Format */}
            <div className="flex-1">
              <label className="text-white text-sm font-medium mb-2 block">From Format</label>
              <select
                value={selectedFromFormat}
                onChange={(e) => {
                  setSelectedFromFormat(e.target.value)
                  setSelectedToFormat(CONVERSION_ROUTES[e.target.value]?.[0] || '')
                }}
                className="w-full px-4 py-2 bg-gray-800 border border-purple-400/20 rounded text-white"
              >
                {SUPPORTED_FORMATS.map(fmt => (
                  <option key={fmt.ext} value={fmt.ext}>
                    {fmt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <motion.button
              onClick={swapFormats}
              className="mt-7 p-3 hover:bg-white/20 rounded-lg transition-colors text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Swap formats"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </motion.button>

            {/* To Format */}
            <div className="flex-1">
              <label className="text-white text-sm font-medium mb-2 block">To Format</label>
              <select
                value={selectedToFormat}
                onChange={(e) => setSelectedToFormat(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-purple-400/20 rounded text-white"
              >
                {availableFormats.map(fmt => {
                  const format = SUPPORTED_FORMATS.find(f => f.ext === fmt)
                  return format ? (
                    <option key={fmt} value={fmt}>
                      {format.label}
                    </option>
                  ) : null
                })}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Upload Area */}
        {tasks.length === 0 ? (
          <motion.div
            className="flex-1 flex items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              ref={dragRef}
              onDragOver={(e) => {
                e.preventDefault()
                dragRef.current?.classList.add('ring-2', 'ring-purple-400')
              }}
              onDragLeave={() => {
                dragRef.current?.classList.remove('ring-2', 'ring-purple-400')
              }}
              onDrop={(e) => {
                e.preventDefault()
                dragRef.current?.classList.remove('ring-2', 'ring-purple-400')
                handleFileSelect(e.dataTransfer.files)
              }}
              className="w-full max-w-md glass-purple p-12 rounded-lg border-2 border-dashed border-purple-400/30 text-center cursor-pointer hover:border-purple-400/60 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Upload className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-white font-semibold mb-2">Drop files here</h3>
              <p className="text-white/60 text-sm mb-4">or click to select files</p>
              <p className="text-white/40 text-xs">
                Supported: {SUPPORTED_FORMATS.map(f => f.ext).join(', ')}
              </p>
            </motion.div>
          </motion.div>
        ) : null}

        {/* Tasks List */}
        <motion.div
          className={cn(
            'overflow-y-auto px-8 py-6',
            tasks.length > 0 && 'flex-1'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence mode="popLayout">
            {tasks.length > 0 && (
              <motion.div
                className="max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-white font-semibold mb-4">Conversions</h3>
                <div className="space-y-3">
                  {tasks.map(task => (
                    <motion.div
                      key={task.id}
                      className="glass-purple p-4 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      layout
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{task.fileName}</p>
                          <p className="text-white/60 text-xs">
                            {task.fromFormat.toUpperCase()} → {task.toFormat.toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                          {task.status === 'processing' && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, linear: true }}
                            >
                              <AlertCircle className="w-5 h-5 text-yellow-400" />
                            </motion.div>
                          )}
                          {task.status === 'error' && (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-800 rounded-full h-2 mb-3 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-purple-400 to-indigo-400 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress}%` }}
                          transition={{ type: 'tween', duration: 0.3 }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs">{task.progress.toFixed(0)}%</span>
                        {task.status === 'completed' && (
                          <button
                            onClick={() => downloadFile(task)}
                            className="flex items-center gap-2 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        )}
                        <button
                          onClick={() => removeTask(task.id)}
                          className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {tasks.length > 0 && (
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mt-4 p-3 glass-purple hover:bg-white/10 rounded-lg text-white transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Convert More Files
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        accept={`.${selectedFromFormat}`}
        className="hidden"
      />
    </div>
  )
}
