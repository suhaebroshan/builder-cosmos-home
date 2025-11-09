import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Download,
  Play,
  Copy,
  Layers,
  Type,
  Square,
  Circle,
  Palette,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Slide {
  id: string
  title: string
  content: string
  bgColor: string
  textColor: string
  elements: SlideElement[]
}

interface SlideElement {
  id: string
  type: 'text' | 'shape' | 'image'
  x: number
  y: number
  width: number
  height: number
  content: string
  color?: string
}

const SLIDE_TEMPLATES = [
  { name: 'Title Slide', bgColor: 'from-purple-600 to-indigo-600', textColor: 'text-white' },
  { name: 'Content', bgColor: 'from-gray-900 to-gray-800', textColor: 'text-white' },
  { name: 'Two Column', bgColor: 'from-blue-900 to-purple-900', textColor: 'text-white' },
]

export const Presentations: React.FC<{ windowId?: string }> = ({ windowId }) => {
  const [presentations, setPresentations] = useState([
    {
      id: '1',
      name: 'My Presentation',
      slides: [
        {
          id: 'slide-1',
          title: 'Welcome to Presentations',
          content: 'Create stunning slideshows with ease',
          bgColor: 'from-purple-600 to-indigo-600',
          textColor: 'text-white',
          elements: []
        }
      ]
    }
  ])
  const [activePresentationId, setActivePresentationId] = useState('1')
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [isPresenting, setIsPresenting] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const activePresentation = presentations.find(p => p.id === activePresentationId)
  const activeSlide = activePresentation?.slides[activeSlideIndex]

  const addSlide = (templateIndex?: number) => {
    if (!activePresentation) return

    const template = templateIndex !== undefined ? SLIDE_TEMPLATES[templateIndex] : SLIDE_TEMPLATES[1]
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: `Slide ${activePresentation.slides.length + 1}`,
      content: 'Add your content here',
      bgColor: template.bgColor,
      textColor: template.textColor,
      elements: []
    }

    setPresentations(prev => prev.map(p =>
      p.id === activePresentationId
        ? { ...p, slides: [...p.slides, newSlide] }
        : p
    ))
  }

  const updateSlide = (updates: Partial<Slide>) => {
    if (!activePresentation) return

    setPresentations(prev => prev.map(p =>
      p.id === activePresentationId
        ? {
            ...p,
            slides: p.slides.map((s, i) =>
              i === activeSlideIndex ? { ...s, ...updates } : s
            )
          }
        : p
    ))
  }

  const deleteSlide = (index: number) => {
    if (!activePresentation || activePresentation.slides.length <= 1) return

    setPresentations(prev => prev.map(p =>
      p.id === activePresentationId
        ? { ...p, slides: p.slides.filter((_, i) => i !== index) }
        : p
    ))

    if (activeSlideIndex >= activePresentation.slides.length - 1) {
      setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))
    }
  }

  const duplicateSlide = () => {
    if (!activePresentation || !activeSlide) return

    const newSlide: Slide = {
      ...activeSlide,
      id: `slide-${Date.now()}`
    }

    setPresentations(prev => prev.map(p =>
      p.id === activePresentationId
        ? {
            ...p,
            slides: [
              ...p.slides.slice(0, activeSlideIndex + 1),
              newSlide,
              ...p.slides.slice(activeSlideIndex + 1)
            ]
          }
        : p
    ))

    setActiveSlideIndex(activeSlideIndex + 1)
  }

  const exportPresentation = () => {
    const htmlContent = activePresentation?.slides.map((slide, i) => `
      <div style="width: 100%; height: 100vh; background: linear-gradient(135deg, ${slide.bgColor}); padding: 60px; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="font-size: 48px; font-weight: bold; color: white; margin: 0;">${slide.title}</h1>
        <p style="font-size: 24px; color: white; margin-top: 20px;">${slide.content}</p>
      </div>
    `).join('')

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${activePresentation?.name}</title>
        <style>
          * { margin: 0; padding: 0; }
          body { font-family: system-ui, sans-serif; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activePresentation?.name || 'presentation'}.html`
    a.click()
  }

  if (!activePresentation || !activeSlide) return null

  return (
    <div className="w-full h-full flex bg-gray-900">
      {/* Slide Panel */}
      <motion.div
        className="w-64 glass-purple-dark border-r border-purple-400/20 overflow-y-auto p-4 flex flex-col gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="mb-4">
          <h3 className="text-white font-semibold mb-2">Slides</h3>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="w-full p-2 glass-purple hover:bg-white/10 rounded text-white text-sm"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Slide
          </button>
        </div>

        {showTemplates && (
          <motion.div
            className="space-y-2 mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {SLIDE_TEMPLATES.map((template, idx) => (
              <button
                key={idx}
                onClick={() => {
                  addSlide(idx)
                  setShowTemplates(false)
                }}
                className="w-full p-2 glass-purple hover:bg-white/20 rounded text-white text-xs text-left"
              >
                {template.name}
              </button>
            ))}
          </motion.div>
        )}

        <AnimatePresence>
          {activePresentation.slides.map((slide, index) => (
            <motion.button
              key={slide.id}
              onClick={() => setActiveSlideIndex(index)}
              className={cn(
                'p-3 rounded-lg transition-all group relative overflow-hidden',
                activeSlideIndex === index
                  ? 'ring-2 ring-purple-400 glass-purple'
                  : 'glass-purple hover:bg-white/10'
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={`text-xs font-semibold text-white truncate`}>{slide.title}</div>
              <div className="text-xs text-white/60 truncate">{slide.content}</div>
              {activeSlideIndex === index && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSlide(index)
                  }}
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded"
                  whileHover={{ scale: 1.1 }}
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </motion.button>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Main Editor */}
      <motion.div
        className="flex-1 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Toolbar */}
        <div className="glass-purple-dark border-b border-purple-400/20 px-6 py-3 flex items-center gap-4">
          <button
            onClick={duplicateSlide}
            className="p-2 hover:bg-white/20 rounded text-white transition-colors"
            title="Duplicate Slide"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={exportPresentation}
            className="p-2 hover:bg-white/20 rounded text-white transition-colors"
            title="Export"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPresenting(!isPresenting)}
            className="ml-auto p-2 bg-purple-500 hover:bg-purple-600 rounded text-white transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Present
          </button>
        </div>

        {/* Slide Editor */}
        {!isPresenting ? (
          <motion.div
            className="flex-1 p-8 overflow-auto flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className={cn(
                'w-full max-w-4xl aspect-video rounded-lg shadow-2xl p-8 flex flex-col justify-center items-center',
                `bg-gradient-to-br ${activeSlide.bgColor}`,
                activeSlide.textColor
              )}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  // Click to edit
                }
              }}
            >
              <motion.h1
                className="text-5xl font-bold mb-6 text-center cursor-text"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updateSlide({ title: (e.target as HTMLElement).textContent || '' })}
              >
                {activeSlide.title}
              </motion.h1>
              <motion.p
                className="text-2xl text-center cursor-text opacity-90"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updateSlide({ content: (e.target as HTMLElement).textContent || '' })}
              >
                {activeSlide.content}
              </motion.p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className={cn(
              'flex-1 flex flex-col justify-center items-center',
              `bg-gradient-to-br ${activeSlide.bgColor}`,
              activeSlide.textColor
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.h1 className="text-6xl font-bold mb-8">{activeSlide.title}</motion.h1>
            <motion.p className="text-3xl opacity-90">{activeSlide.content}</motion.p>
          </motion.div>
        )}

        {/* Navigation */}
        {!isPresenting && (
          <div className="glass-purple-dark border-t border-purple-400/20 px-6 py-3 flex items-center justify-between">
            <button
              onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
              disabled={activeSlideIndex === 0}
              className="p-2 hover:bg-white/20 rounded text-white disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white text-sm">
              Slide {activeSlideIndex + 1} of {activePresentation.slides.length}
            </span>
            <button
              onClick={() => setActiveSlideIndex(Math.min(activePresentation.slides.length - 1, activeSlideIndex + 1))}
              disabled={activeSlideIndex === activePresentation.slides.length - 1}
              className="p-2 hover:bg-white/20 rounded text-white disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
