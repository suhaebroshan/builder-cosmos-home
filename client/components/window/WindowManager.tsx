import React from 'react'
import { useWindowStore } from '@/store/window-store'
import { useVirtualDesktopStore } from '@/store/virtual-desktop-store'
import { DraggableWindow } from './DraggableWindow'
import { AnimatePresence } from 'framer-motion'

export const WindowManager: React.FC = () => {
  const { windows } = useWindowStore()
  const { currentDesktop } = useVirtualDesktopStore()

  const visibleWindows = windows.filter(w => (w.desktopId ?? 0) === currentDesktop || w.isPinned)

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {visibleWindows.map((window) => (
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
