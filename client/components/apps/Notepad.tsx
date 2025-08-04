import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, 
  FolderOpen, 
  FileText, 
  Download, 
  Upload,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Search,
  Plus,
  Trash2,
  Edit3,
  FileX,
  Copy,
  Scissors,
  Clipboard,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Type
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSamStore } from '@/store/sam-store'

interface NoteFile {
  id: string
  name: string
  content: string
  lastModified: Date
  tags: string[]
}

export const Notepad: React.FC = () => {
  const { addMessage, setEmotion } = useSamStore()
  
  const [notes, setNotes] = useState<NoteFile[]>(() => {
    const saved = localStorage.getItem('nyx-notepad-files')
    return saved ? JSON.parse(saved) : [
      {
        id: 'welcome',
        name: 'Welcome to Nyx Notepad',
        content: `# Welcome to Nyx Notepad

This is your quantum text editor! Here's what you can do:

## Features:
- Create, edit, and save notes
- Rich text formatting
- Search functionality
- Export to various formats
- Auto-save (every 30 seconds)
- Tag organization

## Keyboard Shortcuts:
- Ctrl+S: Save current note
- Ctrl+N: New note
- Ctrl+O: Open note browser
- Ctrl+F: Search
- Ctrl+B: Bold
- Ctrl+I: Italic
- Ctrl+U: Underline

Start typing and let your ideas flow!`,
        lastModified: new Date(),
        tags: ['welcome', 'guide']
      }
    ]
  })
  
  const [currentNote, setCurrentNote] = useState<NoteFile>(notes[0])
  const [content, setContent] = useState(currentNote.content)
  const [showFileExplorer, setShowFileExplorer] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false)
  const [newNoteName, setNewNoteName] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [undoHistory, setUndoHistory] = useState<string[]>([currentNote.content])
  const [redoHistory, setRedoHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(0)

  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const historyTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasUnsavedChanges) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
      
      autoSaveTimerRef.current = setTimeout(() => {
        saveCurrentNote()
      }, 30000) // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [content, hasUnsavedChanges, autoSave])

  // Update content and track changes
  useEffect(() => {
    setHasUnsavedChanges(content !== currentNote.content)
  }, [content, currentNote.content])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('nyx-notepad-files', JSON.stringify(notes))
  }, [notes])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            saveCurrentNote()
            break
          case 'n':
            e.preventDefault()
            setShowNewNoteDialog(true)
            break
          case 'o':
            e.preventDefault()
            setShowFileExplorer(true)
            break
          case 'f':
            e.preventDefault()
            setIsSearchOpen(true)
            break
          case 'b':
            e.preventDefault()
            applyFormatting('bold')
            break
          case 'i':
            e.preventDefault()
            applyFormatting('italic')
            break
          case 'u':
            e.preventDefault()
            applyFormatting('underline')
            break
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const addToHistory = (newContent: string) => {
    // Debounce history updates to prevent performance issues
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current)
    }

    historyTimerRef.current = setTimeout(() => {
      const newHistory = undoHistory.slice(0, historyIndex + 1)
      newHistory.push(newContent)
      setUndoHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
      setRedoHistory([])
    }, 500) // Wait 500ms before adding to history
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setContent(undoHistory[newIndex])
    }
  }

  const redo = () => {
    if (historyIndex < undoHistory.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setContent(undoHistory[newIndex])
    }
  }

  const saveCurrentNote = () => {
    const updatedNote = {
      ...currentNote,
      content,
      lastModified: new Date()
    }
    
    setNotes(prev => prev.map(note => 
      note.id === currentNote.id ? updatedNote : note
    ))
    
    setCurrentNote(updatedNote)
    setHasUnsavedChanges(false)
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    
    setEmotion('happy', 0.6)
    addMessage(`Note "${currentNote.name}" saved successfully!`, 'sam', 'happy')
  }

  const createNewNote = () => {
    if (!newNoteName.trim()) return
    
    const newNote: NoteFile = {
      id: `note-${Date.now()}`,
      name: newNoteName.trim(),
      content: '',
      lastModified: new Date(),
      tags: []
    }
    
    setNotes(prev => [...prev, newNote])
    setCurrentNote(newNote)
    setContent('')
    setNewNoteName('')
    setShowNewNoteDialog(false)
    addToHistory('')
    
    setEmotion('excited', 0.7)
    addMessage(`New note "${newNote.name}" created! Let's write something cool.`, 'sam', 'excited')
  }

  const openNote = (note: NoteFile) => {
    if (hasUnsavedChanges) {
      const shouldSave = confirm('You have unsaved changes. Save before switching notes?')
      if (shouldSave) {
        saveCurrentNote()
      }
    }
    
    setCurrentNote(note)
    setContent(note.content)
    setShowFileExplorer(false)
    addToHistory(note.content)
    setHistoryIndex(0)
    setUndoHistory([note.content])
    setRedoHistory([])
  }

  const deleteNote = (noteId: string) => {
    if (notes.length <= 1) {
      addMessage("Can't delete the last note! Create another one first.", 'sam', 'annoyed')
      return
    }
    
    setNotes(prev => prev.filter(note => note.id !== noteId))
    
    if (currentNote.id === noteId) {
      const remainingNotes = notes.filter(note => note.id !== noteId)
      openNote(remainingNotes[0])
    }
    
    setEmotion('neutral', 0.5)
    addMessage("Note deleted. Gone but not forgotten!", 'sam', 'neutral')
  }

  const exportNote = (format: 'txt' | 'md' | 'html') => {
    let exportContent = content
    let mimeType = 'text/plain'
    let extension = 'txt'
    
    switch (format) {
      case 'md':
        mimeType = 'text/markdown'
        extension = 'md'
        break
      case 'html':
        exportContent = content
          .replace(/\n/g, '<br>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
        exportContent = `<!DOCTYPE html><html><head><title>${currentNote.name}</title></head><body>${exportContent}</body></html>`
        mimeType = 'text/html'
        extension = 'html'
        break
    }
    
    const blob = new Blob([exportContent], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentNote.name}.${extension}`
    a.click()
    URL.revokeObjectURL(url)
    
    setEmotion('happy', 0.7)
    addMessage(`Exported as ${format.toUpperCase()}! Download should start now.`, 'sam', 'happy')
  }

  const importFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const newNote: NoteFile = {
        id: `imported-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        content,
        lastModified: new Date(),
        tags: ['imported']
      }
      
      setNotes(prev => [...prev, newNote])
      openNote(newNote)
      setEmotion('excited', 0.8)
      addMessage(`File imported! Welcome to the Nyx ecosystem, "${newNote.name}".`, 'sam', 'excited')
    }
    reader.readAsText(file)
  }

  const applyFormatting = (format: 'bold' | 'italic' | 'underline') => {
    const textarea = textAreaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    if (selectedText) {
      let formattedText = selectedText
      switch (format) {
        case 'bold':
          formattedText = `**${selectedText}**`
          break
        case 'italic':
          formattedText = `*${selectedText}*`
          break
        case 'underline':
          formattedText = `_${selectedText}_`
          break
      }
      
      const newContent = content.substring(0, start) + formattedText + content.substring(end)
      setContent(newContent)
      addToHistory(newContent)
    }
  }

  const getTextSelection = () => {
    const textarea = textAreaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      setSelectedText(content.substring(start, end))
    }
  }

  const filteredNotes = notes.filter(note =>
    note.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length
  const charCount = content.length
  const lineCount = content.split('\n').length

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-950 via-black to-violet-950">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20 border-b border-purple-500/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <h1 className="text-lg font-semibold text-white">Nyx Notepad</h1>
          </div>
          <div className="text-purple-300 text-sm">
            {currentNote.name}
            {hasUnsavedChanges && <span className="text-yellow-400 ml-1">•</span>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewNoteDialog(true)}
            className="p-2 hover:bg-purple-500/20 rounded transition-colors"
            title="New Note (Ctrl+N)"
          >
            <Plus className="w-4 h-4 text-purple-400" />
          </button>
          <button
            onClick={() => setShowFileExplorer(true)}
            className="p-2 hover:bg-purple-500/20 rounded transition-colors"
            title="Open Notes (Ctrl+O)"
          >
            <FolderOpen className="w-4 h-4 text-purple-400" />
          </button>
          <button
            onClick={saveCurrentNote}
            className="p-2 hover:bg-green-500/20 rounded transition-colors"
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4 text-green-400" />
          </button>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 hover:bg-blue-500/20 rounded transition-colors"
            title="Search (Ctrl+F)"
          >
            <Search className="w-4 h-4 text-blue-400" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-black/10 border-b border-purple-500/10">
        <div className="flex items-center gap-2">
          {/* Formatting buttons */}
          <button
            onClick={() => applyFormatting('bold')}
            className="p-1.5 hover:bg-purple-500/20 rounded transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4 text-purple-400" />
          </button>
          <button
            onClick={() => applyFormatting('italic')}
            className="p-1.5 hover:bg-purple-500/20 rounded transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4 text-purple-400" />
          </button>
          <button
            onClick={() => applyFormatting('underline')}
            className="p-1.5 hover:bg-purple-500/20 rounded transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4 text-purple-400" />
          </button>
          
          <div className="w-px h-6 bg-purple-500/20 mx-2" />
          
          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1.5 hover:bg-purple-500/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4 text-purple-400" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= undoHistory.length - 1}
            className="p-1.5 hover:bg-purple-500/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Shift+Z)"
          >
            <RotateCw className="w-4 h-4 text-purple-400" />
          </button>
          
          <div className="w-px h-6 bg-purple-500/20 mx-2" />
          
          {/* Export/Import */}
          <div className="relative group">
            <button className="p-1.5 hover:bg-purple-500/20 rounded transition-colors">
              <Download className="w-4 h-4 text-purple-400" />
            </button>
            <div className="absolute top-8 left-0 bg-black/80 border border-purple-500/30 rounded-lg p-2 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => exportNote('txt')}
                className="block w-full text-left px-3 py-1 rounded text-sm text-purple-300 hover:bg-purple-500/20"
              >
                Export as TXT
              </button>
              <button
                onClick={() => exportNote('md')}
                className="block w-full text-left px-3 py-1 rounded text-sm text-purple-300 hover:bg-purple-500/20"
              >
                Export as Markdown
              </button>
              <button
                onClick={() => exportNote('html')}
                className="block w-full text-left px-3 py-1 rounded text-sm text-purple-300 hover:bg-purple-500/20"
              >
                Export as HTML
              </button>
            </div>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 hover:bg-purple-500/20 rounded transition-colors"
            title="Import File"
          >
            <Upload className="w-4 h-4 text-purple-400" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.html"
            onChange={importFile}
            className="hidden"
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-purple-300">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            <input
              type="range"
              min="10"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-16"
            />
            <span>{fontSize}px</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={wordWrap}
              onChange={(e) => setWordWrap(e.target.checked)}
              className="rounded"
            />
            Wrap
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="rounded"
            />
            Auto-save
          </label>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="p-4 bg-black/20 border-b border-purple-500/20"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-400" />
              <input
                type="text"
                placeholder="Search in current note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-purple-500/20 rounded transition-colors"
              >
                <FileX className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Editor Area */}
      <div className="flex-1 flex">
        {/* Text Editor */}
        <div className="flex-1 p-4">
          <textarea
            ref={textAreaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              // Only add to history after user stops typing
              addToHistory(e.target.value)
            }}
            onSelect={getTextSelection}
            placeholder="Start writing your masterpiece..."
            className={cn(
              "w-full h-full bg-black/20 border border-purple-500/30 rounded-lg p-4 text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none resize-none",
              wordWrap ? "whitespace-pre-wrap" : "whitespace-pre overflow-x-auto"
            )}
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace'
            }}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 bg-black/20 border-t border-purple-500/20 text-sm text-purple-300">
        <div className="flex items-center gap-4">
          <span>Lines: {lineCount}</span>
          <span>Words: {wordCount}</span>
          <span>Characters: {charCount}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Font: {fontSize}px</span>
          <span>Modified: {currentNote.lastModified.toLocaleTimeString()}</span>
          {autoSave && hasUnsavedChanges && <span className="text-yellow-400">Auto-saving...</span>}
        </div>
      </div>

      {/* File Explorer Modal */}
      <AnimatePresence>
        {showFileExplorer && (
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFileExplorer(false)}
          >
            <motion.div
              className="w-96 max-h-96 bg-black/80 border border-purple-500/30 rounded-lg p-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-semibold mb-4">Notes Library</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded cursor-pointer transition-colors",
                      note.id === currentNote.id
                        ? "bg-purple-500/30 border border-purple-400/50"
                        : "hover:bg-purple-500/20"
                    )}
                    onClick={() => openNote(note)}
                  >
                    <div className="flex-1">
                      <div className="text-white font-medium">{note.name}</div>
                      <div className="text-purple-400 text-sm">
                        {note.lastModified.toLocaleDateString()} • {note.content.length} chars
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNote(note.id)
                      }}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Note Dialog */}
      <AnimatePresence>
        {showNewNoteDialog && (
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewNoteDialog(false)}
          >
            <motion.div
              className="w-80 bg-black/80 border border-purple-500/30 rounded-lg p-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-semibold mb-4">Create New Note</h3>
              <input
                type="text"
                placeholder="Note name..."
                value={newNoteName}
                onChange={(e) => setNewNoteName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createNewNote()}
                className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={createNewNote}
                  disabled={!newNoteName.trim()}
                  className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewNoteDialog(false)}
                  className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/40 rounded text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
