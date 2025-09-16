import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopStore } from '@/store/desktop-store'
import { useWindowStore } from '@/store/window-store'
import { useThemeStore } from '@/store/theme-store'
import { Search, Moon, Sun, Settings as SettingsIcon, Calendar as CalendarIcon } from 'lucide-react'

interface CommandItem {
  id: string
  type: 'app' | 'command'
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action: () => void
}

export const CommandPalette: React.FC = () => {
  const { icons } = useDesktopStore()
  const { openWindow } = useWindowStore()
  const { settings, setThemeMode } = useThemeStore()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const onToggle = () => setOpen((o) => !o)
    window.addEventListener('nyx:toggle-command-palette' as any, onToggle)
    return () => window.removeEventListener('nyx:toggle-command-palette' as any, onToggle)
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  const items: CommandItem[] = useMemo(() => {
    const desktopCommands: CommandItem[] = [0,1,2,3].map((idx) => ({
      id: `cmd-switch-desktop-${idx+1}`,
      type: 'command',
      title: `Switch to Desktop ${idx + 1}`,
      action: () => {
        const store = require('@/store/virtual-desktop-store') as any
        store.useVirtualDesktopStore.getState().switchDesktop(idx)
        setOpen(false)
      }
    }))

    const moveWindowCommands: CommandItem[] = [0,1,2,3].map((idx) => ({
      id: `cmd-move-window-desktop-${idx+1}`,
      type: 'command',
      title: `Move focused window to Desktop ${idx + 1}`,
      action: () => {
        const store = require('@/store/virtual-desktop-store') as any
        store.useVirtualDesktopStore.getState().switchDesktop(idx)
        const { focusedWindowId, moveWindowToDesktop } = require('@/store/window-store') as any
        const id = (require('@/store/window-store') as any).useWindowStore.getState().focusedWindowId
        if (id) {
          ;(require('@/store/window-store') as any).useWindowStore.getState().moveWindowToDesktop(id, idx)
        }
        setOpen(false)
      }
    }))

    const appItems: CommandItem[] = icons.map((icon) => ({
      id: `app-${icon.appId}`,
      type: 'app',
      title: icon.name,
      subtitle: icon.description,
      icon: React.createElement(icon.icon, { className: 'w-4 h-4' }),
      action: () => {
        // Open app with its defaults
        openWindow({
          appId: icon.appId,
          title: icon.name,
          component: icon.component,
          position: icon.defaultPosition,
          size: icon.defaultSize,
          mode: 'windowed',
        })
        setOpen(false)
      }
    }))

    const commandItems: CommandItem[] = [
      {
        id: 'cmd-toggle-theme',
        type: 'command',
        title: settings.mode === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
        icon: settings.mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
        action: () => {
          setThemeMode(settings.mode === 'dark' ? 'light' : 'dark')
          setOpen(false)
        }
      },
      ...desktopCommands,
      ...moveWindowCommands,
      {
        id: 'cmd-open-settings',
        type: 'command',
        title: 'Open Settings',
        icon: <SettingsIcon className="w-4 h-4" />,
        action: () => {
          const icon = icons.find(i => i.appId === 'settings')
          if (icon) {
            openWindow({ title: icon.name, appId: icon.appId, component: icon.component, position: icon.defaultPosition, size: icon.defaultSize, mode: 'windowed' })
          }
          setOpen(false)
        }
      },
      {
        id: 'cmd-open-calendar',
        type: 'command',
        title: 'Open Calendar',
        icon: <CalendarIcon className="w-4 h-4" />,
        action: () => {
          const icon = icons.find(i => i.appId === 'calendar')
          if (icon) {
            openWindow({ title: icon.name, appId: icon.appId, component: icon.component, position: icon.defaultPosition, size: icon.defaultSize, mode: 'windowed' })
          }
          setOpen(false)
        }
      }
    ]

    return [...commandItems, ...appItems]
  }, [icons, openWindow, settings, setThemeMode])

  const filtered = items.filter((item) =>
    (item.title + ' ' + (item.subtitle || ''))
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      const item = filtered[selectedIndex]
      if (item) item.action()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <motion.div
            className="relative w-full max-w-xl mx-auto rounded-2xl overflow-hidden backdrop-blur-xl border border-white/15 bg-black/50"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <Search className="w-4 h-4 text-white/70" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search apps and commands..."
                className="w-full bg-transparent outline-none text-white placeholder:text-white/50"
              />
            </div>
            <div className="max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-white/60 text-sm">No results</div>
              ) : (
                filtered.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${idx === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="mt-0.5 text-white/80">{item.icon}</div>
                    <div>
                      <div className="text-white text-sm font-medium">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-white/60 text-xs mt-0.5">{item.subtitle}</div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
