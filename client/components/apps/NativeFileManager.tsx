import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Folder, File, ArrowLeft, ArrowRight, Home, 
  Download, Desktop, Image, FileText, Music,
  Video, Archive, Settings, RefreshCw, Search,
  MoreVertical, Copy, Cut, Trash2, FolderPlus,
  Upload, Grid3X3, List, SortAsc
} from 'lucide-react'
import { useThemeStore } from '@/store/theme-store'
import { useTauriIntegration } from '@/hooks/useTauriIntegration'
import { cn } from '@/lib/utils'

interface FileItem {
  name: string
  path: string
  isDir: boolean
  size?: number
  modified?: Date
  extension?: string
}

interface FileManagerState {
  currentPath: string
  files: FileItem[]
  loading: boolean
  error: string | null
  selectedFiles: Set<string>
  viewMode: 'grid' | 'list'
  sortBy: 'name' | 'modified' | 'size' | 'type'
  sortOrder: 'asc' | 'desc'
}

export const NativeFileManager: React.FC = () => {
  const { settings: themeSettings } = useThemeStore()
  const { isNative, systemControls } = useTauriIntegration()
  
  const [state, setState] = useState<FileManagerState>({
    currentPath: '',
    files: [],
    loading: true,
    error: null,
    selectedFiles: new Set(),
    viewMode: 'grid',
    sortBy: 'name',
    sortOrder: 'asc'
  })
  
  const [searchQuery, setSearchQuery] = useState('')
  const [pathHistory, setPathHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Mock file system data for web fallback
  const mockFiles: FileItem[] = [
    { name: 'Documents', path: '/home/user/Documents', isDir: true },
    { name: 'Downloads', path: '/home/user/Downloads', isDir: true },
    { name: 'Pictures', path: '/home/user/Pictures', isDir: true },
    { name: 'Music', path: '/home/user/Music', isDir: true },
    { name: 'Videos', path: '/home/user/Videos', isDir: true },
    { name: 'Desktop', path: '/home/user/Desktop', isDir: true },
    { name: 'example.txt', path: '/home/user/example.txt', isDir: false, size: 1024, extension: 'txt' },
    { name: 'image.png', path: '/home/user/image.png', isDir: false, size: 2048, extension: 'png' },
  ]

  // Get file icon based on extension
  const getFileIcon = (file: FileItem) => {
    if (file.isDir) return <Folder className="w-5 h-5" />
    
    const ext = file.extension?.toLowerCase()
    switch (ext) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
        return <Image className="w-5 h-5" />
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'ogg':
        return <Music className="w-5 h-5" />
      case 'mp4':
      case 'avi':
      case 'mkv':
      case 'mov':
        return <Video className="w-5 h-5" />
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
        return <Archive className="w-5 h-5" />
      case 'txt':
      case 'md':
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5" />
      default:
        return <File className="w-5 h-5" />
    }
  }

  // Load files from current path
  const loadFiles = useCallback(async (path: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      if (isNative) {
        // TODO: Implement actual Tauri file system API calls
        // This would use @tauri-apps/plugin-fs to read directory contents
        // For now, using mock data
        setState(prev => ({
          ...prev,
          files: mockFiles,
          currentPath: path || '/home/user',
          loading: false
        }))
      } else {
        // Web fallback
        setState(prev => ({
          ...prev,
          files: mockFiles,
          currentPath: path || '/home/user',
          loading: false
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to load directory: ${error}`,
        loading: false
      }))
    }
  }, [isNative])

  // Initialize file manager
  useEffect(() => {
    loadFiles(isNative ? '' : '/home/user')
  }, [loadFiles, isNative])

  // Navigation functions
  const navigateTo = useCallback((path: string) => {
    const newHistory = pathHistory.slice(0, historyIndex + 1)
    newHistory.push(path)
    setPathHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    loadFiles(path)
  }, [pathHistory, historyIndex, loadFiles])

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      loadFiles(pathHistory[historyIndex - 1])
    }
  }, [historyIndex, pathHistory, loadFiles])

  const goForward = useCallback(() => {
    if (historyIndex < pathHistory.length - 1) {
      setHistoryIndex(historyIndex + 1)
      loadFiles(pathHistory[historyIndex + 1])
    }
  }, [historyIndex, pathHistory, loadFiles])

  const goHome = useCallback(() => {
    const homePath = isNative ? '' : '/home/user'
    navigateTo(homePath)
  }, [isNative, navigateTo])

  // File operations
  const handleFileClick = useCallback((file: FileItem) => {
    if (file.isDir) {
      navigateTo(file.path)
    } else {
      // Open file with default application
      if (isNative) {
        // TODO: Use Tauri shell plugin to open file
        systemControls.showNotification('File Manager', `Opening ${file.name}`)
      } else {
        systemControls.showNotification('File Manager', `Would open ${file.name}`)
      }
    }
  }, [isNative, navigateTo, systemControls])

  const handleFileSelect = useCallback((filePath: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedFiles)
      if (newSelected.has(filePath)) {
        newSelected.delete(filePath)
      } else {
        newSelected.add(filePath)
      }
      return { ...prev, selectedFiles: newSelected }
    })
  }, [])

  // Filter files based on search
  const filteredFiles = state.files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let comparison = 0
    
    // Directories first
    if (a.isDir && !b.isDir) return -1
    if (!a.isDir && b.isDir) return 1
    
    switch (state.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'modified':
        comparison = (a.modified?.getTime() || 0) - (b.modified?.getTime() || 0)
        break
      case 'size':
        comparison = (a.size || 0) - (b.size || 0)
        break
      case 'type':
        comparison = (a.extension || '').localeCompare(b.extension || '')
        break
    }
    
    return state.sortOrder === 'asc' ? comparison : -comparison
  })

  return (
    <div className={cn(
      "h-full flex flex-col",
      themeSettings.mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    )}>
      {/* Toolbar */}
      <div className={cn(
        "flex items-center gap-2 p-3 border-b",
        themeSettings.mode === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      )}>
        <button
          onClick={goBack}
          disabled={historyIndex <= 0}
          className="p-2 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        
        <button
          onClick={goForward}
          disabled={historyIndex >= pathHistory.length - 1}
          className="p-2 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        
        <button
          onClick={goHome}
          className="p-2 rounded-md hover:bg-gray-600"
        >
          <Home className="w-4 h-4" />
        </button>
        
        <div className="flex-1 mx-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md",
            themeSettings.mode === 'dark' ? 'bg-gray-700' : 'bg-white border'
          )}>
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none"
            />
          </div>
        </div>
        
        <button
          onClick={() => setState(prev => ({ 
            ...prev, 
            viewMode: prev.viewMode === 'grid' ? 'list' : 'grid' 
          }))}
          className="p-2 rounded-md hover:bg-gray-600"
        >
          {state.viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
        </button>
        
        <button
          onClick={() => loadFiles(state.currentPath)}
          className="p-2 rounded-md hover:bg-gray-600"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Path breadcrumb */}
      <div className={cn(
        "px-3 py-2 text-sm border-b",
        themeSettings.mode === 'dark' ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'
      )}>
        {state.currentPath || '/'}
      </div>

      {/* File content */}
      <div className="flex-1 overflow-auto p-4">
        {state.loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        ) : state.error ? (
          <div className="text-red-500 text-center py-8">
            {state.error}
          </div>
        ) : (
          <div className={cn(
            state.viewMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
              : "space-y-1"
          )}>
            <AnimatePresence>
              {sortedFiles.map((file, index) => (
                <motion.div
                  key={file.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.02 }}
                  className={cn(
                    "cursor-pointer rounded-lg transition-all duration-200",
                    state.viewMode === 'grid' 
                      ? "p-3 text-center hover:bg-gray-600" 
                      : "p-2 flex items-center gap-3 hover:bg-gray-600",
                    state.selectedFiles.has(file.path) && "bg-blue-600/20 ring-2 ring-blue-500"
                  )}
                  onClick={() => handleFileClick(file)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    handleFileSelect(file.path)
                  }}
                >
                  {state.viewMode === 'grid' ? (
                    <>
                      <div className="mb-2 flex justify-center text-gray-400">
                        {getFileIcon(file)}
                      </div>
                      <div className="text-sm truncate">{file.name}</div>
                      {!file.isDir && file.size && (
                        <div className="text-xs text-gray-500 mt-1">
                          {(file.size / 1024).toFixed(1)} KB
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-gray-400">
                        {getFileIcon(file)}
                      </div>
                      <div className="flex-1 text-sm">{file.name}</div>
                      {!file.isDir && file.size && (
                        <div className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className={cn(
        "px-3 py-2 text-xs border-t flex justify-between",
        themeSettings.mode === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-600'
      )}>
        <span>{sortedFiles.length} items</span>
        <span>{state.selectedFiles.size} selected</span>
      </div>
    </div>
  )
}

export default NativeFileManager
