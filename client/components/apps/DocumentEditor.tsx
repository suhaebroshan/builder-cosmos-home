import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Plus,
  Download,
  FileText,
  MoreVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TextStyle {
  bold: boolean
  italic: boolean
  underline: boolean
  alignment: 'left' | 'center' | 'right'
  fontSize: number
  fontFamily: string
  color: string
}

interface DocumentSection {
  id: string
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'list' | 'ordered-list'
  content: string
  style: Partial<TextStyle>
}

export const DocumentEditor: React.FC<{ windowId?: string }> = ({ windowId }) => {
  const [documents, setDocuments] = useState([
    { id: '1', name: 'Untitled Document', lastModified: new Date() }
  ])
  const [activeDocId, setActiveDocId] = useState('1')
  const [sections, setSections] = useState<Record<string, DocumentSection[]>>({
    '1': [
      {
        id: 'sec-1',
        type: 'heading1',
        content: 'Welcome to Document Editor',
        style: { fontSize: 28, bold: true }
      },
      {
        id: 'sec-2',
        type: 'paragraph',
        content: 'Start typing to create your document. Use the formatting tools above to style your text.',
        style: { fontSize: 14 }
      }
    ]
  })
  const [selectedStyle, setSelectedStyle] = useState<Partial<TextStyle>>({
    bold: false,
    italic: false,
    underline: false,
    alignment: 'left',
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#000000'
  })
  const [showMenu, setShowMenu] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const activeDoc = documents.find(d => d.id === activeDocId)
  const activeContent = sections[activeDocId] || []

  const updateSection = (sectionId: string, content: string, type?: DocumentSection['type']) => {
    setSections(prev => ({
      ...prev,
      [activeDocId]: prev[activeDocId].map(s =>
        s.id === sectionId ? { ...s, content, type: type || s.type } : s
      )
    }))
  }

  const addSection = (type: DocumentSection['type']) => {
    const newSection: DocumentSection = {
      id: `sec-${Date.now()}`,
      type,
      content: '',
      style: selectedStyle
    }
    setSections(prev => ({
      ...prev,
      [activeDocId]: [...(prev[activeDocId] || []), newSection]
    }))
  }

  const deleteSection = (sectionId: string) => {
    setSections(prev => ({
      ...prev,
      [activeDocId]: prev[activeDocId].filter(s => s.id !== sectionId)
    }))
  }

  const createNewDocument = () => {
    const newId = `doc-${Date.now()}`
    setDocuments(prev => [...prev, { id: newId, name: 'Untitled Document', lastModified: new Date() }])
    setSections(prev => ({
      ...prev,
      [newId]: [{ id: 'sec-1', type: 'paragraph', content: '', style: selectedStyle }]
    }))
    setActiveDocId(newId)
  }

  const exportAsHTML = () => {
    const html = activeContent.map(section => {
      const tagMap = {
        'heading1': 'h1',
        'heading2': 'h2',
        'heading3': 'h3',
        'paragraph': 'p',
        'list': 'ul',
        'ordered-list': 'ol'
      }
      const tag = tagMap[section.type]
      const style = `style="font-size: ${section.style.fontSize}px; font-weight: ${section.style.bold ? 'bold' : 'normal'}; font-style: ${section.style.italic ? 'italic' : 'normal'}; text-align: ${section.style.alignment}; color: ${section.style.color};"`
      return `<${tag} ${style}>${section.content}</${tag}>`
    }).join('\n')

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeDoc?.name || 'document'}.html`
    a.click()
  }

  const getHeadingStyle = (type: string): React.CSSProperties => {
    const styles: Record<string, React.CSSProperties> = {
      'heading1': { fontSize: 28, fontWeight: 'bold', marginTop: 24, marginBottom: 16 },
      'heading2': { fontSize: 22, fontWeight: 'bold', marginTop: 18, marginBottom: 12 },
      'heading3': { fontSize: 18, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
      'paragraph': { fontSize: 14, marginBottom: 12, lineHeight: 1.6 },
      'list': { marginLeft: 24, marginBottom: 12 },
      'ordered-list': { marginLeft: 24, marginBottom: 12 }
    }
    return styles[type] || styles['paragraph']
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <motion.div
        className="glass-purple-dark px-6 py-4 border-b border-purple-400/20 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-white font-semibold">{activeDoc?.name || 'Document'}</h2>
            <p className="text-white/60 text-xs">Last modified: {activeDoc?.lastModified.toLocaleDateString()}</p>
          </div>
        </div>
        <button
          onClick={createNewDocument}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="New Document"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        className="glass-purple px-6 py-3 border-b border-purple-400/20 flex flex-wrap gap-2 items-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex gap-1 border-r border-purple-400/20 pr-3">
          <button className="p-2 hover:bg-white/20 rounded transition-colors text-white" title="Bold">
            <Bold className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/20 rounded transition-colors text-white" title="Italic">
            <Italic className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/20 rounded transition-colors text-white" title="Underline">
            <Underline className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 border-r border-purple-400/20 pr-3">
          <button className="p-2 hover:bg-white/20 rounded transition-colors text-white" title="Align Left">
            <AlignLeft className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/20 rounded transition-colors text-white" title="Align Center">
            <AlignCenter className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/20 rounded transition-colors text-white" title="Align Right">
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 border-r border-purple-400/20 pr-3">
          <button
            onClick={() => addSection('heading1')}
            className="p-2 hover:bg-white/20 rounded transition-colors text-white text-xs font-semibold"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => addSection('heading2')}
            className="p-2 hover:bg-white/20 rounded transition-colors text-white text-xs font-semibold"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => addSection('heading3')}
            className="p-2 hover:bg-white/20 rounded transition-colors text-white text-xs font-semibold"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 border-r border-purple-400/20 pr-3">
          <button
            onClick={() => addSection('list')}
            className="p-2 hover:bg-white/20 rounded transition-colors text-white"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => addSection('ordered-list')}
            className="p-2 hover:bg-white/20 rounded transition-colors text-white"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={exportAsHTML}
          className="ml-auto p-2 hover:bg-white/20 rounded transition-colors text-white"
          title="Export as HTML"
        >
          <Download className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Editor Content */}
      <motion.div
        ref={editorRef}
        className="flex-1 overflow-y-auto p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <AnimatePresence mode="popLayout">
            {activeContent.length === 0 ? (
              <motion.div
                className="text-center text-gray-400 py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p>Start typing or click the + button to add content</p>
              </motion.div>
            ) : (
              activeContent.map((section, index) => (
                <motion.div
                  key={section.id}
                  className="group relative mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  layout
                >
                  {section.type === 'list' && (
                    <ul style={getHeadingStyle(section.type)}>
                      <li className="text-gray-800">{section.content}</li>
                    </ul>
                  )}
                  {section.type === 'ordered-list' && (
                    <ol style={getHeadingStyle(section.type)}>
                      <li className="text-gray-800">{section.content}</li>
                    </ol>
                  )}
                  {(section.type === 'heading1' || section.type === 'heading2' || section.type === 'heading3') && (
                    <div style={getHeadingStyle(section.type)} className="text-gray-800">
                      {section.content || `Type your ${section.type} here...`}
                    </div>
                  )}
                  {section.type === 'paragraph' && (
                    <div style={getHeadingStyle(section.type)} className="text-gray-700">
                      {section.content || 'Start typing here...'}
                    </div>
                  )}

                  <input
                    type="text"
                    value={section.content}
                    onChange={(e) => updateSection(section.id, e.target.value)}
                    className="absolute inset-0 w-full bg-transparent outline-none opacity-0 hover:opacity-100 focus:opacity-100"
                    style={getHeadingStyle(section.type)}
                  />

                  <button
                    onClick={() => deleteSection(section.id)}
                    className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                  >
                    <span className="text-red-400 text-sm">×</span>
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Add Content Button */}
      <motion.button
        onClick={() => addSection('paragraph')}
        className="m-4 p-3 glass-purple hover:bg-white/20 rounded-lg text-white transition-colors flex items-center gap-2 justify-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus className="w-4 h-4" />
        Add Paragraph
      </motion.button>
    </div>
  )
}
