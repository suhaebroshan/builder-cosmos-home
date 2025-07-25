import React from 'react'
import { useWindowStore } from '@/store/window-store'
import { DraggableWindow } from './DraggableWindow'
import { AnimatePresence } from 'framer-motion'

export const WindowManager: React.FC = () => {
  const { windows } = useWindowStore()
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {windows.map((window) => (
          <div key={window.id} className="pointer-events-auto">
            <DraggableWindow window={window}>
              <window.component {...(window.props || {})} windowId={window.id} />
            </DraggableWindow>
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
