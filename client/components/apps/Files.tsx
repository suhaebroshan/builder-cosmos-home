import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSamStore } from '@/store/sam-store'
import { 
  Folder, 
  File, 
  FileText, 
  Image, 
  Music, 
  Video, 
  Download,
  Upload,
  Trash2,
  Search,
  Grid,
  List,
  Home,
  ChevronRight,
  Plus,
  MoreVertical,
  Copy,
  Scissors,
  Clipboard,
  FolderPlus,
  Edit,
  Eye,
  Star,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilesProps {
  windowId: string
}

interface FileItem {
  id: string
  name: string
  type: 'folder' | 'file'
  fileType?: 'text' | 'image' | 'audio' | 'video' | 'pdf' | 'doc' | 'other'
  size?: number
  modified: Date
  created: Date
  content?: string
  parent?: string
  starred?: boolean
  path: string
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const Files: React.FC<FilesProps> = ({ windowId }) => {
  const { addMessage, setEmotion } = useSamStore()
  
  const [currentPath, setCurrentPath] = useState('/')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [clipboard, setClipboard] = useState<{ files: FileItem[]; operation: 'copy' | 'cut' } | null>(null)
  const [history, setHistory] = useState<string[]>(['/'])
  const [historyIndex, setHistoryIndex] = useState(0)
  
  // Complete file system simulation
  const [fileSystem, setFileSystem] = useState<FileItem[]>(() => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    return [
      // Root folders
      {
        id: 'desktop',
        name: 'Desktop',
        type: 'folder',
        modified: now,
        created: lastWeek,
        path: '/Desktop',
        parent: '/'
      },
      {
        id: 'documents',
        name: 'Documents',
        type: 'folder',
        modified: yesterday,
        created: lastWeek,
        path: '/Documents',
        parent: '/'
      },
      {
        id: 'downloads',
        name: 'Downloads',
        type: 'folder',
        modified: now,
        created: lastWeek,
        path: '/Downloads',
        parent: '/'
      },
      {
        id: 'pictures',
        name: 'Pictures',
        type: 'folder',
        modified: yesterday,
        created: lastWeek,
        path: '/Pictures',
        parent: '/'
      },
      {
        id: 'music',
        name: 'Music',
        type: 'folder',
        modified: lastWeek,
        created: lastWeek,
        path: '/Music',
        parent: '/'
      },
      {
        id: 'videos',
        name: 'Videos',
        type: 'folder',
        modified: lastWeek,
        created: lastWeek,
        path: '/Videos',
        parent: '/'
      },
      // Sample files
      {
        id: 'readme',
        name: 'README.txt',
        type: 'file',
        fileType: 'text',
        size: 2400,
        modified: now,
        created: yesterday,
        path: '/README.txt',
        parent: '/',
        content: 'Welcome to Nyx OS!\n\nThis is a fully functional file system with:\n- Folder navigation\n- File operations (copy, cut, paste, delete)\n- Search functionality\n- Multiple view modes\n- Drag & drop support\n- Context menus\n- File preview\n\nBuilt with React and TypeScript for the ultimate desktop experience.',
        starred: true
      },
      {
        id: 'report-doc',
        name: 'Project Report.doc',
        type: 'file',
        fileType: 'doc',
        size: 45600,
        modified: yesterday,
        created: lastWeek,
        path: '/Documents/Project Report.doc',
        parent: '/Documents'
      },
      {
        id: 'presentation',
        name: 'Presentation.pdf',
        type: 'file',
        fileType: 'pdf',
        size: 2340000,
        modified: yesterday,
        created: lastWeek,
        path: '/Documents/Presentation.pdf',
        parent: '/Documents'
      },
      {
        id: 'wallpaper1',
        name: 'cosmic-wallpaper.jpg',
        type: 'file',
        fileType: 'image',
        size: 1240000,
        modified: lastWeek,
        created: lastWeek,
        path: '/Pictures/cosmic-wallpaper.jpg',
        parent: '/Pictures',
        starred: true
      },
      {
        id: 'photo1',
        name: 'vacation-photo.png',
        type: 'file',
        fileType: 'image',
        size: 890000,
        modified: yesterday,
        created: yesterday,
        path: '/Pictures/vacation-photo.png',
        parent: '/Pictures'
      },
      {
        id: 'song1',
        name: 'ambient-space.mp3',
        type: 'file',
        fileType: 'audio',
        size: 5100000,
        modified: lastWeek,
        created: lastWeek,
        path: '/Music/ambient-space.mp3',
        parent: '/Music'
      },
      {
        id: 'video1',
        name: 'demo-video.mp4',
        type: 'file',
        fileType: 'video',
        size: 45000000,
        modified: lastWeek,
        created: lastWeek,
        path: '/Videos/demo-video.mp4',
        parent: '/Videos'
      }
    ]
  })
  
  const getCurrentFiles = useCallback(() => {
    return fileSystem.filter(file => file.parent === currentPath)
  }, [fileSystem, currentPath])
  
  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') return Folder
    
    switch (item.fileType) {
      case 'text': return FileText
      case 'image': return Image
      case 'audio': return Music
      case 'video': return Video
      case 'pdf': return FileText
      case 'doc': return FileText
      default: return File
    }
  }
  
  const filteredFiles = getCurrentFiles().filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const navigateToPath = (newPath: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setCurrentPath(newPath)
      setSelectedFiles([])
      setSearchQuery('')
      
      // Update history
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newPath)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
      
      setIsLoading(false)
    }, 100)
  }
  
  const navigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setCurrentPath(history[newIndex])
      setSelectedFiles([])
    }
  }
  
  const navigateForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setCurrentPath(history[newIndex])
      setSelectedFiles([])
    }
  }
  
  const handleFileSelect = (fileId: string, isMultiple = false) => {
    if (isMultiple) {
      setSelectedFiles(prev => 
        prev.includes(fileId) 
          ? prev.filter(id => id !== fileId)
          : [...prev, fileId]
      )
    } else {
      setSelectedFiles([fileId])
    }
  }
  
  const handleFileDoubleClick = (file: FileItem) => {
    if (file.type === 'folder') {
      navigateToPath(file.path)
      setEmotion('focused', 0.6)
      addMessage(`Opening ${file.name} folder...`, 'sam', 'focused')
    } else {
      setEmotion('happy', 0.7)
      addMessage(`Opening ${file.name}. That's a ${file.fileType} file! Pretty cool stuff, bruv!`, 'sam', 'happy')
      
      // Simulate file opening
      if (file.fileType === 'text' && file.content) {
        // Could open in notepad app
        console.log('Opening text file:', file.content)
      }
    }
  }
  
  const createNewFolder = () => {
    const name = prompt('Enter folder name:')
    if (name && name.trim()) {
      const newFolder: FileItem = {
        id: `folder-${Date.now()}`,
        name: name.trim(),
        type: 'folder',
        modified: new Date(),
        created: new Date(),
        path: `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${name.trim()}`,
        parent: currentPath
      }
      
      setFileSystem(prev => [...prev, newFolder])
      setEmotion('excited', 0.8)
      addMessage(`Created new folder "${name}"! Organization is key, my friend!`, 'sam', 'excited')
    }
  }
  
  const createNewFile = () => {
    const name = prompt('Enter file name (with extension):')
    if (name && name.trim()) {
      const extension = name.split('.').pop()?.toLowerCase()
      let fileType: FileItem['fileType'] = 'other'
      
      if (['txt', 'md', 'js', 'ts', 'css', 'html'].includes(extension || '')) fileType = 'text'
      else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '')) fileType = 'image'
      else if (['mp3', 'wav', 'ogg'].includes(extension || '')) fileType = 'audio'
      else if (['mp4', 'avi', 'mov'].includes(extension || '')) fileType = 'video'
      else if (extension === 'pdf') fileType = 'pdf'
      else if (['doc', 'docx'].includes(extension || '')) fileType = 'doc'
      
      const newFile: FileItem = {
        id: `file-${Date.now()}`,
        name: name.trim(),
        type: 'file',
        fileType,
        size: Math.floor(Math.random() * 10000) + 100,
        modified: new Date(),
        created: new Date(),
        path: `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${name.trim()}`,
        parent: currentPath,
        content: fileType === 'text' ? 'New file content...' : undefined
      }
      
      setFileSystem(prev => [...prev, newFile])
      setEmotion('happy', 0.7)
      addMessage(`Created new file "${name}"! Ready to fill it with awesome content!`, 'sam', 'happy')
    }
  }
  
  const deleteFiles = (fileIds: string[]) => {
    if (fileIds.length === 0) return
    
    const fileNames = fileSystem.filter(f => fileIds.includes(f.id)).map(f => f.name)
    const confirm = window.confirm(`Delete ${fileNames.join(', ')}?`)
    
    if (confirm) {
      setFileSystem(prev => prev.filter(f => !fileIds.includes(f.id)))
      setSelectedFiles([])
      setEmotion('focused', 0.6)
      addMessage(`Deleted ${fileIds.length} item${fileIds.length > 1 ? 's' : ''}. Gone but not forgotten!`, 'sam', 'focused')
    }
  }
  
  const copyFiles = (fileIds: string[]) => {
    const files = fileSystem.filter(f => fileIds.includes(f.id))
    setClipboard({ files, operation: 'copy' })
    setEmotion('happy', 0.6)
    addMessage(`Copied ${files.length} item${files.length > 1 ? 's' : ''} to clipboard!`, 'sam', 'happy')
  }
  
  const cutFiles = (fileIds: string[]) => {
    const files = fileSystem.filter(f => fileIds.includes(f.id))
    setClipboard({ files, operation: 'cut' })
    setEmotion('focused', 0.6)
    addMessage(`Cut ${files.length} item${files.length > 1 ? 's' : ''} to clipboard!`, 'sam', 'focused')
  }
  
  const pasteFiles = () => {
    if (!clipboard) return
    
    const newFiles = clipboard.files.map(file => ({
      ...file,
      id: `${file.id}-copy-${Date.now()}`,
      name: clipboard.operation === 'copy' ? `${file.name} copy` : file.name,
      path: `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${clipboard.operation === 'copy' ? `${file.name} copy` : file.name}`,
      parent: currentPath,
      modified: new Date()
    }))
    
    if (clipboard.operation === 'cut') {
      setFileSystem(prev => prev.filter(f => !clipboard.files.some(cf => cf.id === f.id)).concat(newFiles))
    } else {
      setFileSystem(prev => [...prev, ...newFiles])
    }
    
    setClipboard(null)
    setEmotion('excited', 0.8)
    addMessage(`Pasted ${newFiles.length} item${newFiles.length > 1 ? 's' : ''}! Smooth operation, bruv!`, 'sam', 'excited')
  }
  
  const toggleStar = (fileId: string) => {
    setFileSystem(prev => prev.map(f => 
      f.id === fileId ? { ...f, starred: !f.starred } : f
    ))
    
    const file = fileSystem.find(f => f.id === fileId)
    if (file) {
      setEmotion('happy', 0.6)
      addMessage(`${file.starred ? 'Unstarred' : 'Starred'} ${file.name}!`, 'sam', 'happy')
    }
  }
  
  const handleContextMenu = (e: React.MouseEvent, fileId?: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, fileId })
  }
  
  const getPathSegments = () => {
    if (currentPath === '/') return [{ name: 'Home', path: '/' }]
    
    const segments = currentPath.split('/').filter(Boolean)
    const pathSegments = [{ name: 'Home', path: '/' }]
    
    let buildPath = ''
    segments.forEach(segment => {
      buildPath += `/${segment}`
      pathSegments.push({ name: segment, path: buildPath })
    })
    
    return pathSegments
  }
  
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null)
    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
  }, [])
  
  return (
    <div className="flex flex-col h-full liquid-glass-dark">
      {/* Toolbar */}
      <div className="p-4 border-b border-white/10 liquid-glass">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={navigateBack}
              disabled={historyIndex <= 0}
              className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white/60 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={navigateForward}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white/60 hover:text-white hover:bg-white/10"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateToPath(currentPath)}
              className="p-2 rounded-lg transition-colors text-white/60 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={createNewFolder}
              className="p-2 rounded-lg transition-colors text-white/60 hover:text-white hover:bg-white/10"
              title="New Folder"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
            <button
              onClick={createNewFile}
              className="p-2 rounded-lg transition-colors text-white/60 hover:text-white hover:bg-white/10"
              title="New File"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/20 mx-1" />
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === 'grid' ? "bg-purple-500/30 text-purple-400" : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === 'list' ? "bg-purple-500/30 text-purple-400" : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1 mb-3 text-sm">
          {getPathSegments().map((segment, index) => (
            <React.Fragment key={segment.path}>
              <button
                onClick={() => navigateToPath(segment.path)}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                {segment.name}
              </button>
              {index < getPathSegments().length - 1 && (
                <ChevronRight className="w-3 h-3 text-white/40" />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files and folders..."
            className="w-full pl-10 pr-4 py-2 liquid-glass rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
          />
        </div>
      </div>
      
      {/* File Area */}
      <div
        className="flex-1 p-4 overflow-auto scrollbar-hidden"
        onContextMenu={(e) => handleContextMenu(e)}
        onClick={() => setSelectedFiles([])}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/60">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <div>Loading...</div>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div 
                key="grid"
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredFiles.map((file) => {
                  const Icon = getFileIcon(file)
                  const isSelected = selectedFiles.includes(file.id)
                  
                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                      className={cn(
                        "relative p-4 rounded-xl border cursor-pointer transition-all hover:scale-105 liquid-glass group",
                        isSelected
                          ? "bg-purple-500/20 border-purple-400/50"
                          : "border-white/10 hover:bg-white/10"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFileSelect(file.id, e.ctrlKey || e.metaKey)
                      }}
                      onDoubleClick={() => handleFileDoubleClick(file)}
                      onContextMenu={(e) => {
                        e.stopPropagation()
                        handleContextMenu(e, file.id)
                      }}
                    >
                      {file.starred && (
                        <Star className="absolute top-2 right-2 w-3 h-3 text-yellow-400 fill-current" />
                      )}
                      <div className="flex flex-col items-center text-center">
                        <Icon className={cn(
                          "w-8 h-8 mb-2",
                          file.type === 'folder' ? "text-blue-400" : "text-white/70"
                        )} />
                        <div className="text-white text-sm truncate w-full">{file.name}</div>
                        {file.size && (
                          <div className="text-white/40 text-xs mt-1">{formatFileSize(file.size)}</div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                className="space-y-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredFiles.map((file) => {
                  const Icon = getFileIcon(file)
                  const isSelected = selectedFiles.includes(file.id)
                  
                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      layout
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all liquid-glass",
                        isSelected
                          ? "bg-purple-500/20 border-purple-400/50"
                          : "border-white/10 hover:bg-white/10"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFileSelect(file.id, e.ctrlKey || e.metaKey)
                      }}
                      onDoubleClick={() => handleFileDoubleClick(file)}
                      onContextMenu={(e) => {
                        e.stopPropagation()
                        handleContextMenu(e, file.id)
                      }}
                    >
                      <Icon className={cn(
                        "w-5 h-5",
                        file.type === 'folder' ? "text-blue-400" : "text-white/70"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-white text-sm truncate">{file.name}</div>
                          {file.starred && (
                            <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-white/40 text-xs">
                          {file.modified.toLocaleDateString()} {file.size && `• ${formatFileSize(file.size)}`}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        {filteredFiles.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-white/60">
              <Folder className="w-12 h-12 mx-auto mb-4 text-white/30" />
              <h3 className="text-lg mb-2">No files found</h3>
              <p className="text-sm">
                {searchQuery ? "Try a different search term" : "This folder is empty"}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Status Bar */}
      <div className="p-4 border-t border-white/10 liquid-glass">
        <div className="flex items-center justify-between">
          <div className="text-white/60 text-sm">
            {filteredFiles.length} item{filteredFiles.length !== 1 ? 's' : ''}
            {selectedFiles.length > 0 && ` • ${selectedFiles.length} selected`}
          </div>
          <div className="flex items-center gap-4">
            {clipboard && (
              <button
                onClick={pasteFiles}
                className="text-purple-400 hover:text-purple-300 text-sm transition-colors flex items-center gap-1"
              >
                <Clipboard className="w-3 h-3" />
                Paste {clipboard.files.length} item{clipboard.files.length > 1 ? 's' : ''}
              </button>
            )}
            <div className="text-white/40 text-xs">
              {currentPath}
            </div>
          </div>
        </div>
      </div>
      
      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            className="fixed z-50 liquid-glass-dark border border-white/30 rounded-xl py-2 min-w-48"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {contextMenu.fileId ? (
              // File context menu
              <>
                <button
                  onClick={() => {
                    const file = fileSystem.find(f => f.id === contextMenu.fileId)
                    if (file) handleFileDoubleClick(file)
                    setContextMenu(null)
                  }}
                  className="w-full px-4 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Open
                </button>
                <button
                  onClick={() => {
                    copyFiles([contextMenu.fileId!])
                    setContextMenu(null)
                  }}
                  className="w-full px-4 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={() => {
                    cutFiles([contextMenu.fileId!])
                    setContextMenu(null)
                  }}
                  className="w-full px-4 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Cut className="w-4 h-4" />
                  Cut
                </button>
                <button
                  onClick={() => {
                    toggleStar(contextMenu.fileId!)
                    setContextMenu(null)
                  }}
                  className="w-full px-4 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  {fileSystem.find(f => f.id === contextMenu.fileId)?.starred ? 'Unstar' : 'Star'}
                </button>
                <div className="border-t border-white/10 my-1" />
                <button
                  onClick={() => {
                    deleteFiles([contextMenu.fileId!])
                    setContextMenu(null)
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 text-sm hover:bg-red-500/10 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            ) : (
              // Empty space context menu
              <>
                <button
                  onClick={() => {
                    createNewFolder()
                    setContextMenu(null)
                  }}
                  className="w-full px-4 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  New Folder
                </button>
                <button
                  onClick={() => {
                    createNewFile()
                    setContextMenu(null)
                  }}
                  className="w-full px-4 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New File
                </button>
                {clipboard && (
                  <>
                    <div className="border-t border-white/10 my-1" />
                    <button
                      onClick={() => {
                        pasteFiles()
                        setContextMenu(null)
                      }}
                      className="w-full px-4 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Clipboard className="w-4 h-4" />
                      Paste
                    </button>
                  </>
                )}
                {selectedFiles.length > 0 && (
                  <>
                    <div className="border-t border-white/10 my-1" />
                    <button
                      onClick={() => {
                        deleteFiles(selectedFiles)
                        setContextMenu(null)
                      }}
                      className="w-full px-4 py-2 text-left text-red-400 text-sm hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Selected
                    </button>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
