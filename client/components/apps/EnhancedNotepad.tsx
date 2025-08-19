import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, FileText, Plus, Search, Download, Upload, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Code, Image, Link,
  Undo, Redo, Copy, Cut, Paste, Settings,
  Eye, Edit3, Trash2, Calendar, Clock, User,
  ArrowLeft, MoreHorizontal, Palette, Type,
  Maximize2, Minimize2, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  wordCount: number
  characterCount: number
}

interface EditorSettings {
  fontSize: number
  fontFamily: string
  lineHeight: number
  darkMode: boolean
  spellCheck: boolean
  wordWrap: boolean
  autoSave: boolean
}

export const EnhancedNotepad: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoSaveTimer = useRef<NodeJS.Timeout>()

  const [settings, setSettings] = useState<EditorSettings>({
    fontSize: 14,
    fontFamily: 'Inter',
    lineHeight: 1.6,
    darkMode: true,
    spellCheck: true,
    wordWrap: true,
    autoSave: true
  })

  // Auto-save functionality
  useEffect(() => {
    if (settings.autoSave && currentNote && isEditing) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      
      autoSaveTimer.current = setTimeout(() => {
        saveNote()
      }, 2000) // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [currentNote?.content, settings.autoSave])

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('nyx-notepad-notes')
    if (savedNotes) {
      const parsed = JSON.parse(savedNotes)
      setNotes(parsed.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      })))
    }

    const savedSettings = localStorage.getItem('nyx-notepad-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Create default note if none exist
    if (!savedNotes || JSON.parse(savedNotes).length === 0) {
      createNewNote()
    }
  }, [])

  // Save notes to localStorage
  const saveNotesToStorage = useCallback((notesToSave: Note[]) => {
    localStorage.setItem('nyx-notepad-notes', JSON.stringify(notesToSave))
  }, [])

  // Save settings to localStorage
  const saveSettingsToStorage = useCallback((settingsToSave: EditorSettings) => {
    localStorage.setItem('nyx-notepad-settings', JSON.stringify(settingsToSave))
    setSettings(settingsToSave)
  }, [])

  // Create new note
  const createNewNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      wordCount: 0,
      characterCount: 0
    }

    setNotes(prev => {
      const updated = [newNote, ...prev]
      saveNotesToStorage(updated)
      return updated
    })
    setCurrentNote(newNote)
    setIsEditing(true)
  }, [saveNotesToStorage])

  // Save current note
  const saveNote = useCallback(() => {
    if (!currentNote) return

    const wordCount = currentNote.content.trim().split(/\s+/).filter(word => word.length > 0).length
    const characterCount = currentNote.content.length

    const updatedNote = {
      ...currentNote,
      updatedAt: new Date(),
      wordCount,
      characterCount
    }

    setNotes(prev => {
      const updated = prev.map(note => 
        note.id === currentNote.id ? updatedNote : note
      )
      saveNotesToStorage(updated)
      return updated
    })
    setCurrentNote(updatedNote)
  }, [currentNote, saveNotesToStorage])

  // Delete note
  const deleteNote = useCallback((noteId: string) => {
    setNotes(prev => {
      const updated = prev.filter(note => note.id !== noteId)
      saveNotesToStorage(updated)
      return updated
    })

    if (currentNote?.id === noteId) {
      const remainingNotes = notes.filter(note => note.id !== noteId)
      if (remainingNotes.length > 0) {
        setCurrentNote(remainingNotes[0])
      } else {
        createNewNote()
      }
    }
  }, [currentNote, notes, saveNotesToStorage, createNewNote])

  // Update note content
  const updateNoteContent = useCallback((content: string) => {
    if (!currentNote) return

    // Add to undo stack
    setUndoStack(prev => [...prev.slice(-19), currentNote.content]) // Keep last 20 states
    setRedoStack([]) // Clear redo stack when new content is added

    setCurrentNote(prev => prev ? { ...prev, content } : null)
  }, [currentNote])

  // Update note title
  const updateNoteTitle = useCallback((title: string) => {
    if (!currentNote) return
    setCurrentNote(prev => prev ? { ...prev, title } : null)
  }, [currentNote])

  // Undo/Redo functionality
  const undo = useCallback(() => {
    if (undoStack.length === 0 || !currentNote) return

    const previousContent = undoStack[undoStack.length - 1]
    setRedoStack(prev => [currentNote.content, ...prev.slice(0, 19)])
    setUndoStack(prev => prev.slice(0, -1))
    setCurrentNote(prev => prev ? { ...prev, content: previousContent } : null)
  }, [undoStack, currentNote])

  const redo = useCallback(() => {
    if (redoStack.length === 0 || !currentNote) return

    const nextContent = redoStack[0]
    setUndoStack(prev => [...prev.slice(-19), currentNote.content])
    setRedoStack(prev => prev.slice(1))
    setCurrentNote(prev => prev ? { ...prev, content: nextContent } : null)
  }, [redoStack, currentNote])

  // Text formatting functions
  const insertTextAtCursor = (text: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentContent = currentNote?.content || ''
    
    const newContent = currentContent.slice(0, start) + text + currentContent.slice(end)
    updateNoteContent(newContent)

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const wrapSelectedText = (before: string, after: string = before) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentContent = currentNote?.content || ''
    const selectedText = currentContent.slice(start, end)
    
    if (selectedText) {
      const newContent = currentContent.slice(0, start) + before + selectedText + after + currentContent.slice(end)
      updateNoteContent(newContent)
      
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + before.length, end + before.length)
      }, 0)
    } else {
      insertTextAtCursor(before + after)
    }
  }

  // Export note
  const exportNote = useCallback(() => {
    if (!currentNote) return

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(currentNote.content)
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `${currentNote.title}.txt`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }, [currentNote])

  // Import note
  const importNote = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const newNote: Note = {
        id: Date.now().toString(),
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        wordCount: content.trim().split(/\s+/).filter(word => word.length > 0).length,
        characterCount: content.length
      }

      setNotes(prev => {
        const updated = [newNote, ...prev]
        saveNotesToStorage(updated)
        return updated
      })
      setCurrentNote(newNote)
      setIsEditing(true)
    }
    reader.readAsText(file)
  }, [saveNotesToStorage])

  // Filter notes based on search
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey)) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            saveNote()
            break
          case 'n':
            e.preventDefault()
            createNewNote()
            break
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 'b':
            e.preventDefault()
            wrapSelectedText('**')
            break
          case 'i':
            e.preventDefault()
            wrapSelectedText('*')
            break
          case 'u':
            e.preventDefault()
            wrapSelectedText('<u>', '</u>')
            break
        }
      }
    }

    if (isEditing) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isEditing, saveNote, createNewNote, undo, redo])

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Notes</h1>
            <div className="flex gap-2">
              <button
                onClick={createNewNote}
                className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                title="New Note (Ctrl+N)"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </div>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => {
                  if (currentNote && isEditing) {
                    saveNote()
                  }
                  setCurrentNote(note)
                  setIsEditing(false)
                }}
                className={cn(
                  "w-full p-4 text-left border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                  currentNote?.id === note.id && "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700"
                )}
              >
                <div className="font-medium text-gray-900 dark:text-white truncate mb-1">
                  {note.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                  {note.content || 'No content'}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                  <span>{note.updatedAt.toLocaleDateString()}</span>
                  <span>{note.wordCount} words</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Import/Export */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm">Import</span>
            </button>
            <button
              onClick={exportNote}
              disabled={!currentNote}
              className="flex-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md"
            onChange={importNote}
            className="hidden"
          />
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {currentNote ? (
          <>
            {/* Editor Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={currentNote.title}
                  onChange={(e) => updateNoteTitle(e.target.value)}
                  className="text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 flex-1"
                  placeholder="Note title..."
                />
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      showPreview 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    )}
                  >
                    {showPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={saveNote}
                    className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                    title="Save (Ctrl+S)"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => deleteNote(currentNote.id)}
                    className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              {!showPreview && (
                <div className="flex items-center gap-1 flex-wrap">
                  <div className="flex items-center gap-1 mr-4">
                    <button
                      onClick={undo}
                      disabled={undoStack.length === 0}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo className="w-4 h-4" />
                    </button>
                    <button
                      onClick={redo}
                      disabled={redoStack.length === 0}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Redo (Ctrl+Shift+Z)"
                    >
                      <Redo className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 mr-4">
                    <button
                      onClick={() => wrapSelectedText('**')}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                      title="Bold (Ctrl+B)"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => wrapSelectedText('*')}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                      title="Italic (Ctrl+I)"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => wrapSelectedText('<u>', '</u>')}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                      title="Underline (Ctrl+U)"
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 mr-4">
                    <button
                      onClick={() => insertTextAtCursor('- ')}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => insertTextAtCursor('1. ')}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => insertTextAtCursor('> ')}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => wrapSelectedText('`')}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => insertTextAtCursor('[Link](url)')}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <Link className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>{currentNote.wordCount} words</span>
                  <span>{currentNote.characterCount} characters</span>
                  <span>Last saved: {currentNote.updatedAt.toLocaleTimeString()}</span>
                </div>
                {settings.autoSave && (
                  <span className="text-green-500">Auto-save enabled</span>
                )}
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-0">
              {showPreview ? (
                <div 
                  className="h-full p-6 overflow-y-auto prose prose-lg dark:prose-invert max-w-none"
                  style={{
                    fontSize: `${settings.fontSize}px`,
                    fontFamily: settings.fontFamily,
                    lineHeight: settings.lineHeight
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: currentNote.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/`(.*?)`/g, '<code>$1</code>')
                      .replace(/^- (.+)$/gm, '<li>$1</li>')
                      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
                      .replace(/\n/g, '<br>')
                  }}
                />
              ) : (
                <textarea
                  ref={textareaRef}
                  value={currentNote.content}
                  onChange={(e) => updateNoteContent(e.target.value)}
                  onFocus={() => setIsEditing(true)}
                  placeholder="Start writing your note..."
                  className="w-full h-full p-6 resize-none border-none outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  style={{
                    fontSize: `${settings.fontSize}px`,
                    fontFamily: settings.fontFamily,
                    lineHeight: settings.lineHeight,
                    whiteSpace: settings.wordWrap ? 'pre-wrap' : 'pre'
                  }}
                  spellCheck={settings.spellCheck}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl mb-2">No note selected</p>
              <p>Create a new note or select an existing one to start editing</p>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Size: {settings.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={settings.fontSize}
                    onChange={(e) => saveSettingsToStorage({ ...settings, fontSize: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Family
                  </label>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) => saveSettingsToStorage({ ...settings, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="monospace">Monospace</option>
                  </select>
                </div>

                {/* Line Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Line Height: {settings.lineHeight}
                  </label>
                  <input
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    value={settings.lineHeight}
                    onChange={(e) => saveSettingsToStorage({ ...settings, lineHeight: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Spell Check
                    </label>
                    <button
                      onClick={() => saveSettingsToStorage({ ...settings, spellCheck: !settings.spellCheck })}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors",
                        settings.spellCheck ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full transition-transform",
                        settings.spellCheck ? "translate-x-6" : "translate-x-0.5"
                      )} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Word Wrap
                    </label>
                    <button
                      onClick={() => saveSettingsToStorage({ ...settings, wordWrap: !settings.wordWrap })}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors",
                        settings.wordWrap ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full transition-transform",
                        settings.wordWrap ? "translate-x-6" : "translate-x-0.5"
                      )} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Auto Save
                    </label>
                    <button
                      onClick={() => saveSettingsToStorage({ ...settings, autoSave: !settings.autoSave })}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors",
                        settings.autoSave ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full transition-transform",
                        settings.autoSave ? "translate-x-6" : "translate-x-0.5"
                      )} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
