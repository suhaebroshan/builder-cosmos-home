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
  Palette,
  Type,
} from 'lucide-react'
import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType } from 'docx'
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
  const [docTitle, setDocTitle] = useState('Untitled Document')
  const [sections, setSections] = useState<Record<string, DocumentSection[]>>({
    '1': [
      {
        id: 'sec-1',
        type: 'paragraph',
        content: 'Start typing your document here...',
        style: { fontSize: 14, bold: false, color: '#d1d5db', fontFamily: 'Inter' }
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
    color: '#d1d5db'
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const activeDoc = documents.find(d => d.id === activeDocId)
  const activeContent = sections[activeDocId] || []

  const updateSection = (sectionId: string, content: string) => {
    setSections(prev => ({
      ...prev,
      [activeDocId]: prev[activeDocId].map(s =>
        s.id === sectionId ? { ...s, content } : s
      )
    }))
  }

  const updateSectionType = (sectionId: string, type: DocumentSection['type']) => {
    setSections(prev => ({
      ...prev,
      [activeDocId]: prev[activeDocId].map(s =>
        s.id === sectionId ? { ...s, type } : s
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
    setEditingId(newSection.id)
  }

  const deleteSection = (sectionId: string) => {
    setSections(prev => ({
      ...prev,
      [activeDocId]: prev[activeDocId].filter(s => s.id !== sectionId)
    }))
  }

  const createNewDocument = () => {
    const newId = `doc-${Date.now()}`
    const newName = `Untitled Document ${documents.length}`
    setDocuments(prev => [...prev, { id: newId, name: newName, lastModified: new Date() }])
    setSections(prev => ({
      ...prev,
      [newId]: [{ id: 'sec-1', type: 'paragraph', content: '', style: selectedStyle }]
    }))
    setActiveDocId(newId)
    setDocTitle(newName)
  }

  const exportAsDOCX = async () => {
    const paragraphs = activeContent.map(section => {
      const alignmentMap: Record<string, AlignmentType> = {
        'left': AlignmentType.LEFT,
        'center': AlignmentType.CENTER,
        'right': AlignmentType.RIGHT
      }

      const text = new TextRun({
        text: section.content || '',
        bold: section.style.bold,
        italic: section.style.italic,
        underline: section.style.underline ? { type: 'single' } : undefined,
        size: (section.style.fontSize || 14) * 2, // half-points
        font: section.style.fontFamily || 'Calibri',
        color: section.style.color?.replace('#', ''),
      })

      const headingLevelMap: Record<string, HeadingLevel> = {
        'heading1': HeadingLevel.HEADING_1,
        'heading2': HeadingLevel.HEADING_2,
        'heading3': HeadingLevel.HEADING_3,
      }

      if (['heading1', 'heading2', 'heading3'].includes(section.type)) {
        return new Paragraph({
          text: section.content,
          heading: headingLevelMap[section.type],
          alignment: alignmentMap[section.style.alignment || 'left'],
        })
      }

      if (section.type === 'list') {
        return new Paragraph({
          text: section.content,
          bullet: { level: 0 },
          alignment: alignmentMap[section.style.alignment || 'left'],
        })
      }

      if (section.type === 'ordered-list') {
        return new Paragraph({
          text: section.content,
          numbering: { level: 0, reference: 'default-numbering' },
          alignment: alignmentMap[section.style.alignment || 'left'],
        })
      }

      return new Paragraph({
        children: [text],
        alignment: alignmentMap[section.style.alignment || 'left'],
      })
    })

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: docTitle,
              heading: HeadingLevel.HEADING_1,
              bold: true,
              alignment: AlignmentType.CENTER,
            }),
            ...paragraphs
          ],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${docTitle || 'document'}.docx`
    a.click()
  }

  const getHeadingStyle = (type: string): React.CSSProperties => {
    const styles: Record<string, React.CSSProperties> = {
      'heading1': { fontSize: 28, fontWeight: 'bold', marginTop: 24, marginBottom: 16, color: '#e0e7ff' },
      'heading2': { fontSize: 22, fontWeight: 'bold', marginTop: 18, marginBottom: 12, color: '#e0e7ff' },
      'heading3': { fontSize: 18, fontWeight: 'bold', marginTop: 12, marginBottom: 8, color: '#e0e7ff' },
      'paragraph': { fontSize: 14, marginBottom: 12, lineHeight: 1.6, color: '#d1d5db' },
      'list': { marginLeft: 24, marginBottom: 12, color: '#d1d5db', listStyleType: 'disc' },
      'ordered-list': { marginLeft: 24, marginBottom: 12, color: '#d1d5db', listStyleType: 'decimal' }
    }
    return styles[type] || styles['paragraph']
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <motion.div
        className="glass-purple-dark px-6 py-4 border-b border-purple-400/20 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 flex-1">
          <FileText className="w-6 h-6 text-purple-400" />
          <div className="flex-1">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => {
                setDocTitle(e.target.value)
                setDocuments(prev => prev.map(d =>
                  d.id === activeDocId ? { ...d, name: e.target.value } : d
                ))
              }}
              className="text-white font-semibold bg-transparent outline-none w-full hover:bg-white/10 px-2 py-1 rounded transition-colors"
              placeholder="Document name"
            />
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
        className="glass-purple px-6 py-3 border-b border-purple-400/20 flex flex-wrap gap-3 items-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex gap-1">
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

        <div className="w-px h-6 bg-white/20" />

        <div className="flex gap-1">
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

        <div className="w-px h-6 bg-white/20" />

        <div className="flex gap-1">
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

        <div className="w-px h-6 bg-white/20" />

        <div className="flex gap-1">
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
          onClick={exportAsDOCX}
          className="ml-auto p-2 hover:bg-white/20 rounded transition-colors text-white flex items-center gap-2"
          title="Export as DOCX"
        >
          <Download className="w-4 h-4" />
          <span className="text-xs">DOCX</span>
        </button>
      </motion.div>

      {/* Editor Content */}
      <motion.div
        className="flex-1 overflow-y-auto p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="max-w-4xl mx-auto glass-purple-dark rounded-lg shadow-2xl p-8">
          <AnimatePresence mode="popLayout">
            {activeContent.length === 0 ? (
              <motion.div
                className="text-center text-gray-400 py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-white/60">Start typing or click the + button to add content</p>
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
                  {editingId === section.id ? (
                    // Edit Mode - Text Input
                    <input
                      type="text"
                      value={section.content}
                      onChange={(e) => updateSection(section.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingId(null)
                        }
                      }}
                      className="w-full p-2 bg-gray-700/50 border border-purple-400/40 rounded text-white outline-none"
                      style={getHeadingStyle(section.type)}
                      autoFocus
                    />
                  ) : (
                    // View Mode
                    <>
                      {section.type === 'list' && (
                        <ul style={getHeadingStyle(section.type)}>
                          <li>{section.content || 'Bullet point...'}</li>
                        </ul>
                      )}
                      {section.type === 'ordered-list' && (
                        <ol style={getHeadingStyle(section.type)}>
                          <li>{section.content || 'Numbered point...'}</li>
                        </ol>
                      )}
                      {(section.type === 'heading1' || section.type === 'heading2' || section.type === 'heading3') && (
                        <div
                          style={getHeadingStyle(section.type)}
                          onClick={() => setEditingId(section.id)}
                          className="cursor-text hover:bg-white/5 px-2 py-1 rounded transition-colors"
                        >
                          {section.content || `Type ${section.type} here...`}
                        </div>
                      )}
                      {section.type === 'paragraph' && (
                        <div
                          style={getHeadingStyle(section.type)}
                          onClick={() => setEditingId(section.id)}
                          className="cursor-text hover:bg-white/5 px-2 py-1 rounded transition-colors"
                        >
                          {section.content || 'Click to type...'}
                        </div>
                      )}
                    </>
                  )}

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
