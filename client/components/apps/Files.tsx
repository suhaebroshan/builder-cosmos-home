import React, { useState } from 'react'
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
  List
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilesProps {
  windowId: string
}

interface FileItem {
  id: string
  name: string
  type: 'folder' | 'file'
  fileType?: 'text' | 'image' | 'audio' | 'video' | 'other'
  size?: string
  modified: Date
  content?: string
}

export const Files: React.FC<FilesProps> = ({ windowId }) => {
  const { addMessage, setEmotion } = useSamStore()
  
  const [currentPath, setCurrentPath] = useState('/')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  
  // Mock file system data
  const [files] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      modified: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Pictures',
      type: 'folder',
      modified: new Date('2024-01-10'),
    },
    {
      id: '3',
      name: 'Music',
      type: 'folder',
      modified: new Date('2024-01-08'),
    },
    {
      id: '4',
      name: 'readme.txt',
      type: 'file',
      fileType: 'text',
      size: '2.4 KB',
      modified: new Date('2024-01-20'),
      content: 'Welcome to SamOS file system!'
    },
    {
      id: '5',
      name: 'wallpaper.jpg',
      type: 'file',
      fileType: 'image',
      size: '1.2 MB',
      modified: new Date('2024-01-18'),
    },
    {
      id: '6',
      name: 'song.mp3',
      type: 'file',
      fileType: 'audio',
      size: '5.1 MB',
      modified: new Date('2024-01-12'),
    },
  ])
  
  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') return Folder
    
    switch (item.fileType) {
      case 'text': return FileText
      case 'image': return Image
      case 'audio': return Music
      case 'video': return Video
      default: return File
    }
  }
  
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
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
      setCurrentPath(`${currentPath}${file.name}/`)
      setEmotion('focused', 0.6)
      addMessage(`Opening ${file.name} folder...`, 'sam', 'neutral')
    } else {
      setEmotion('happy', 0.7)
      addMessage(`Opening ${file.name}. That's a nice ${file.fileType} file you got there, bruv!`, 'sam', 'happy')
    }
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over')
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setEmotion('excited', 0.8)
      addMessage(`Yo! I see you dropped ${files.length} file(s). I'd totally organize those for you if I had real file access, bruv!`, 'sam', 'excited')
    }
  }
  
  return (
    <div className="flex flex-col h-full bg-black/30 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Files</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === 'grid' ? "bg-blue-500/30 text-blue-400" : "text-white/60 hover:text-white"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === 'list' ? "bg-blue-500/30 text-blue-400" : "text-white/60 hover:text-white"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Path and Search */}
        <div className="flex items-center gap-2 mb-3">
          <div className="text-white/60 text-sm font-mono">{currentPath}</div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
        </div>
      </div>
      
      {/* File Area */}
      <div
        className="flex-1 p-4 overflow-auto"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-4 gap-4">
              {filteredFiles.map((file) => {
                const Icon = getFileIcon(file)
                const isSelected = selectedFiles.includes(file.id)
                
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all hover:scale-105",
                      isSelected
                        ? "bg-blue-500/20 border-blue-400/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                    onClick={(e) => handleFileSelect(file.id, e.ctrlKey || e.metaKey)}
                    onDoubleClick={() => handleFileDoubleClick(file)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <Icon className={cn(
                        "w-8 h-8 mb-2",
                        file.type === 'folder' ? "text-blue-400" : "text-white/70"
                      )} />
                      <div className="text-white text-sm truncate w-full">{file.name}</div>
                      {file.size && (
                        <div className="text-white/40 text-xs mt-1">{file.size}</div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFiles.map((file) => {
                const Icon = getFileIcon(file)
                const isSelected = selectedFiles.includes(file.id)
                
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      isSelected
                        ? "bg-blue-500/20 border-blue-400/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                    onClick={(e) => handleFileSelect(file.id, e.ctrlKey || e.metaKey)}
                    onDoubleClick={() => handleFileDoubleClick(file)}
                  >
                    <Icon className={cn(
                      "w-5 h-5",
                      file.type === 'folder' ? "text-blue-400" : "text-white/70"
                    )} />
                    <div className="flex-1">
                      <div className="text-white text-sm">{file.name}</div>
                      <div className="text-white/40 text-xs">
                        {file.modified.toLocaleDateString()} {file.size && `• ${file.size}`}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
        
        {filteredFiles.length === 0 && (
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
      
      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="text-white/60 text-sm">
            {filteredFiles.length} item{filteredFiles.length !== 1 ? 's' : ''}
            {selectedFiles.length > 0 && ` • ${selectedFiles.length} selected`}
          </div>
          <div className="text-white/40 text-xs">
            Drag & drop files here to upload
          </div>
        </div>
      </div>
    </div>
  )
}
