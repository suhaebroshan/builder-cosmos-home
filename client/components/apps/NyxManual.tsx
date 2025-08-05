import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Book,
  Smartphone,
  Monitor,
  Tablet,
  Keyboard,
  Hand,
  Zap,
  Settings,
  Search,
  Star,
  ChevronRight,
  Home,
  ArrowLeft,
  Square,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ManualSection {
  id: string
  title: string
  icon: React.ComponentType<any>
  content: React.ReactNode
}

export const NyxManual: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview')
  const [searchTerm, setSearchTerm] = useState('')

  const sections: ManualSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: Book,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to Nyx OS</h2>
            <p className="text-purple-200/80 leading-relaxed">
              Nyx OS is a revolutionary quantum operating system that adapts to your device and provides 
              a seamless experience across mobile, tablet, and desktop platforms. Named after the Greek 
              goddess of night, Nyx OS brings you the smoothest web-based OS experience ever created.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-2">🌙 Night-Themed Design</h3>
              <p className="text-purple-200/70 text-sm">
                Beautiful dark interface optimized for extended use and reduced eye strain
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-blue-300 font-semibold mb-2">🤖 AI-Powered Assistant</h3>
              <p className="text-blue-200/70 text-sm">
                Sam AI provides intelligent assistance with voice and text communication
              </p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h3 className="text-green-300 font-semibold mb-2">⚡ Lightning Fast</h3>
              <p className="text-green-200/70 text-sm">
                Running at 120fps on modern devices with physics-based animations
              </p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <h3 className="text-yellow-300 font-semibold mb-2">🎯 Adaptive Interface</h3>
              <p className="text-yellow-200/70 text-sm">
                Automatically detects and optimizes for your device type
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'shortcuts',
      title: 'Keyboard Shortcuts',
      icon: Keyboard,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Keyboard Shortcuts</h2>
          
          <div className="space-y-4">
            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-3">Window Management</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Close Window</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + W</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Minimize Window</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + M</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Maximize Window</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + Shift + M</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Switch Windows</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Alt + Tab</kbd>
                </div>
              </div>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-3">Desktop Navigation</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Enter Edit Mode</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">F2 or Ctrl/Cmd + R</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Exit Edit Mode</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Escape</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Duplicate Icons</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + D</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Delete Icons</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Delete/Backspace</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Group into Folder</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + G</kbd>
                </div>
              </div>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-3">App Shortcuts</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Launch Sam Chat</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + 1</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Launch Call Sam</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + 2</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Launch Files</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + 3</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Launch App Forge</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + 4</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Launch Calendar</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + 5</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Open Settings</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + ,</kbd>
                </div>
              </div>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-3">Notepad Shortcuts</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Save Note</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + S</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">New Note</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + N</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Open Notes</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + O</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Find</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + F</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Bold</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + B</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Italic</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + I</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Underline</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + U</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Undo</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + Z</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Redo</span>
                  <kbd className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300">Ctrl/Cmd + Shift + Z</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'mobile',
      title: 'Mobile Features',
      icon: Smartphone,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Mobile Experience</h2>
          <p className="text-purple-200/80 leading-relaxed">
            On mobile devices, Nyx OS transforms into an Android-style experience with smooth animations,
            gesture navigation, and optimized touch interactions.
          </p>

          <div className="space-y-4">
            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                <Gesture className="w-5 h-5" />
                Gesture Navigation
              </h3>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Swipe up from bottom</span>
                  <span className="text-purple-300">Go Home</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Swipe up and hold</span>
                  <span className="text-purple-300">Recent Apps</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Swipe from left edge</span>
                  <span className="text-purple-300">Go Back</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Swipe down from top</span>
                  <span className="text-purple-300">Notifications</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Swipe down from top-right</span>
                  <span className="text-purple-300">Quick Settings</span>
                </div>
              </div>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-3">Button Navigation (Alternative)</h3>
              <div className="flex items-center justify-center gap-8 py-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center mb-2">
                    <ArrowLeft className="w-5 h-5 text-purple-300" />
                  </div>
                  <span className="text-white/70 text-sm">Back</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center mb-2">
                    <Home className="w-5 h-5 text-purple-300" />
                  </div>
                  <span className="text-white/70 text-sm">Home</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center mb-2">
                    <Square className="w-5 h-5 text-purple-300" />
                  </div>
                  <span className="text-white/70 text-sm">Recent</span>
                </div>
              </div>
              <p className="text-white/60 text-sm text-center">
                Switch between gesture and button navigation in Quick Settings
              </p>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-3">App Features</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  All apps open in fullscreen for maximum screen usage
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  Split screen support for multitasking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  Floating windows for quick access
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  Bouncy physics-based animations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  Optimized touch targets and gestures
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tablet',
      title: 'Tablet Features',
      icon: Tablet,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Tablet Experience</h2>
          <p className="text-purple-200/80 leading-relaxed">
            Tablet mode combines the best of mobile and desktop experiences with 80% Android-style 
            mobile features and 20% desktop capabilities for enhanced productivity.
          </p>

          <div className="grid gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h3 className="text-green-300 font-semibold mb-2">80% Mobile Experience</h3>
              <ul className="space-y-1 text-sm text-green-200/70">
                <li>• Fullscreen apps by default</li>
                <li>• Gesture navigation</li>
                <li>• App drawer and notifications</li>
                <li>• Touch-optimized interface</li>
                <li>• Smooth animations</li>
              </ul>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-blue-300 font-semibold mb-2">20% Desktop Features</h3>
              <ul className="space-y-1 text-sm text-blue-200/70">
                <li>• Window resizing capabilities</li>
                <li>• Minimal taskbar</li>
                <li>• More app instances allowed</li>
                <li>• Enhanced multitasking</li>
                <li>• Keyboard shortcut support</li>
              </ul>
            </div>
          </div>

          <div className="bg-black/20 border border-white/10 rounded-xl p-4">
            <h3 className="text-purple-300 font-semibold mb-3">Split Screen Mode</h3>
            <p className="text-white/70 text-sm mb-3">
              Run two apps side by side for enhanced productivity. Perfect for research, communication, and multitasking.
            </p>
            <div className="grid grid-cols-2 gap-2 h-32">
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                <span className="text-purple-300 text-sm">App 1</span>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                <span className="text-blue-300 text-sm">App 2</span>
              </div>
            </div>
          </div>

          <div className="bg-black/20 border border-white/10 rounded-xl p-4">
            <h3 className="text-purple-300 font-semibold mb-3">Floating Windows</h3>
            <p className="text-white/70 text-sm">
              Apps can float above others for quick access. Adjust transparency and position for the perfect workflow.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'desktop',
      title: 'Desktop Features',
      icon: Monitor,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Desktop Experience</h2>
          <p className="text-purple-200/80 leading-relaxed">
            The full desktop experience with traditional window management, keyboard shortcuts, 
            and advanced multitasking capabilities for maximum productivity.
          </p>

          <div className="space-y-4">
            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-3">Window Management</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  Multiple windows with resize, move, minimize, maximize
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  Up to 20 windows open simultaneously
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  Window snapping and organization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  Alt+Tab window switching
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  Desktop icons with drag & drop
                </li>
              </ul>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-3">Multitasking</h3>
              <p className="text-white/70 text-sm mb-3">
                True macOS-level multitasking with multiple instances of the same app, 
                background processing, and seamless app switching.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
                  <div className="text-purple-300 text-sm font-medium">Notepad #1</div>
                  <div className="text-purple-400 text-xs">Personal Notes</div>
                </div>
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
                  <div className="text-purple-300 text-sm font-medium">Notepad #2</div>
                  <div className="text-purple-400 text-xs">Work Notes</div>
                </div>
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
                  <div className="text-purple-300 text-sm font-medium">Notepad #3</div>
                  <div className="text-purple-400 text-xs">Meeting Notes</div>
                </div>
              </div>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-3">Desktop Features</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  Full taskbar with running applications
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  System tray with status indicators
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  Context menus and right-click actions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  Hover effects and cursor interactions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  Advanced keyboard navigation
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'apps',
      title: 'Applications',
      icon: Zap,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Built-in Applications</h2>
          
          <div className="grid gap-4">
            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                🤖 Sam AI Chat
              </h3>
              <p className="text-white/70 text-sm">
                Intelligent AI assistant powered by advanced language models. Features voice support, 
                emotion recognition, and natural conversation.
              </p>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                📞 Call Sam
              </h3>
              <p className="text-white/70 text-sm">
                Voice-enabled AI communication with real microphone access, speech generation, 
                and video call simulation.
              </p>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                🛠️ App Forge
              </h3>
              <p className="text-white/70 text-sm">
                AI-powered app generator that creates functional React components from natural language descriptions.
              </p>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                📁 Files
              </h3>
              <p className="text-white/70 text-sm">
                Complete file manager with copy, cut, paste, delete operations, search, and multiple view modes.
              </p>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                📝 Notepad
              </h3>
              <p className="text-white/70 text-sm">
                Advanced text editor with formatting, auto-save, export options, and undo/redo functionality.
              </p>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                🌐 Web Browser
              </h3>
              <p className="text-white/70 text-sm">
                Full-featured browser with tabs, bookmarks, history, and internal Nyx OS documentation.
              </p>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                📅 Calendar
              </h3>
              <p className="text-white/70 text-sm">
                Event management with multiple views, reminders, recurring events, and export functionality.
              </p>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                🧮 Calculator
              </h3>
              <p className="text-white/70 text-sm">
                Scientific calculator with advanced mathematical operations and expression evaluation.
              </p>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                🎮 Games
              </h3>
              <p className="text-white/70 text-sm">
                Built-in games including 2048, Flappy Bird, Chess, and an infinite runner for entertainment.
              </p>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                ⚙️ Settings
              </h3>
              <p className="text-white/70 text-sm">
                Comprehensive system settings for themes, navigation style, user management, and OS configuration.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tips',
      title: 'Tips & Tricks',
      icon: Star,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Tips & Tricks</h2>
          
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <h3 className="text-yellow-300 font-semibold mb-2">💡 Pro Tips</h3>
              <ul className="space-y-2 text-sm text-yellow-200/80">
                <li>• Hold and drag icons in edit mode to reorganize your desktop</li>
                <li>• Use Ctrl/Cmd + D to duplicate apps for multiple instances</li>
                <li>• Right-click on empty desktop space for quick actions</li>
                <li>• Sam responds to your emotions - try different conversation styles!</li>
                <li>• Apps automatically save your work - no need to worry about losing data</li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h3 className="text-green-300 font-semibold mb-2">🚀 Performance Tips</h3>
              <ul className="space-y-2 text-sm text-green-200/80">
                <li>• Close unused windows to maintain smooth performance</li>
                <li>• Use keyboard shortcuts for faster navigation</li>
                <li>• Enable hardware acceleration in browser settings</li>
                <li>• Clear browser cache regularly for optimal speed</li>
                <li>• Use gesture navigation on mobile for the smoothest experience</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-blue-300 font-semibold mb-2">🎨 Customization</h3>
              <ul className="space-y-2 text-sm text-blue-200/80">
                <li>• Switch between light and dark themes with the theme toggle</li>
                <li>• Create custom wallpapers using the wallpaper settings</li>
                <li>• Organize apps into folders for better organization</li>
                <li>• Pin important windows to keep them always accessible</li>
                <li>• Adjust window opacity for better focus management</li>
              </ul>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <h3 className="text-purple-300 font-semibold mb-2">🤖 AI Features</h3>
              <ul className="space-y-2 text-sm text-purple-200/80">
                <li>• Ask Sam to help you with complex tasks and questions</li>
                <li>• Use App Forge to create custom applications instantly</li>
                <li>• Enable voice mode for hands-free interaction</li>
                <li>• Sam learns from your usage patterns to provide better assistance</li>
                <li>• Try different conversation styles to see Sam's personality</li>
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <h3 className="text-red-300 font-semibold mb-2">🛟 Troubleshooting</h3>
              <ul className="space-y-2 text-sm text-red-200/80">
                <li>• If an app crashes, use the "Try Again" button in the error dialog</li>
                <li>• Refresh the browser if the OS becomes unresponsive</li>
                <li>• Check microphone permissions if voice features don't work</li>
                <li>• Clear browser data if you experience storage issues</li>
                <li>• Use keyboard shortcuts if touch/mouse input stops working</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ]

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.toString().toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-full bg-black/20 backdrop-blur-xl">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-white/10 p-4">
        <div className="mb-6">
          <h1 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
            <Book className="w-6 h-6 text-purple-400" />
            Nyx OS Manual
          </h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="text"
              placeholder="Search manual..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                activeSection === section.id
                  ? "bg-purple-500/20 border border-purple-400/50 text-white"
                  : "hover:bg-white/10 text-white/70 hover:text-white"
              )}
            >
              <section.icon className={cn(
                "w-5 h-5",
                activeSection === section.id ? "text-purple-400" : "text-white/50"
              )} />
              <span className="flex-1">{section.title}</span>
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform",
                activeSection === section.id ? "rotate-90 text-purple-400" : "text-white/30"
              )} />
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <h3 className="text-purple-300 font-semibold mb-2">Need Help?</h3>
          <p className="text-purple-200/70 text-sm mb-3">
            Can't find what you're looking for? Ask Sam for personalized assistance!
          </p>
          <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
            Chat with Sam
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {sections.find(s => s.id === activeSection)?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
