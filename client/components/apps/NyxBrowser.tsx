import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Bookmark, 
  BookmarkPlus,
  MoreHorizontal,
  X,
  Plus,
  Download,
  Shield,
  Globe,
  Star,
  Search,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BrowserTab {
  id: string
  title: string
  url: string
  favicon?: string
  isLoading: boolean
  isActive: boolean
}

interface NyxBrowserProps {
  windowId: string
}

export const NyxBrowser: React.FC<NyxBrowserProps> = ({ windowId }) => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'Nyx OS Start Page',
      url: 'nyx://start',
      isLoading: false,
      isActive: true
    }
  ])
  
  const [activeTabId, setActiveTabId] = useState('tab-1')
  const [addressBarValue, setAddressBarValue] = useState('nyx://start')
  const [bookmarks, setBookmarks] = useState([
    { id: '1', title: 'GitHub', url: 'https://github.com', favicon: '🐙' },
    { id: '2', title: 'OpenAI', url: 'https://openai.com', favicon: '🤖' },
    { id: '3', title: 'Nyx Docs', url: 'nyx://docs', favicon: '📚' },
  ])
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({})
  
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  const createNewTab = () => {
    const newTab: BrowserTab = {
      id: `tab-${Date.now()}`,
      title: 'New Tab',
      url: 'nyx://start',
      isLoading: false,
      isActive: true
    }
    
    setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat(newTab))
    setActiveTabId(newTab.id)
    setAddressBarValue('nyx://start')
  }

  const closeTab = (tabId: string) => {
    const tabIndex = tabs.findIndex(tab => tab.id === tabId)
    const newTabs = tabs.filter(tab => tab.id !== tabId)
    
    if (newTabs.length === 0) {
      // Close browser if no tabs left
      return
    }
    
    setTabs(newTabs)
    
    if (activeTabId === tabId) {
      // Switch to adjacent tab
      const newActiveTab = newTabs[Math.max(0, tabIndex - 1)]
      setActiveTabId(newActiveTab.id)
      setAddressBarValue(newActiveTab.url)
    }
  }

  const switchTab = (tabId: string) => {
    setTabs(prev => prev.map(tab => ({ ...tab, isActive: tab.id === tabId })))
    setActiveTabId(tabId)
    const tab = tabs.find(t => t.id === tabId)
    if (tab) {
      setAddressBarValue(tab.url)
    }
  }

  const navigateToUrl = (url: string) => {
    if (!url.startsWith('http') && !url.startsWith('nyx://')) {
      // Assume it's a search query
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`
    }
    
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, url, isLoading: true, title: 'Loading...' }
        : tab
    ))
    
    setAddressBarValue(url)
    
    // Simulate loading
    setTimeout(() => {
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, isLoading: false, title: getPageTitle(url) }
          : tab
      ))
    }, 1000)
  }

  const getPageTitle = (url: string): string => {
    if (url.startsWith('nyx://')) {
      const page = url.split('//')[1]
      switch (page) {
        case 'start': return 'Nyx Start Page'
        case 'docs': return 'Nyx Documentation'
        case 'settings': return 'Browser Settings'
        default: return 'Nyx Page'
      }
    }
    
    try {
      const domain = new URL(url).hostname
      return domain.replace('www.', '')
    } catch {
      return 'Web Page'
    }
  }

  const addBookmark = () => {
    if (activeTab && !isBookmarked) {
      const newBookmark = {
        id: Date.now().toString(),
        title: activeTab.title,
        url: activeTab.url,
        favicon: '🌐'
      }
      setBookmarks(prev => [...prev, newBookmark])
      setIsBookmarked(true)
    }
  }

  const renderNyxPage = (url: string) => {
    const page = url.split('//')[1]
    
    switch (page) {
      case 'start':
        return (
          <div className="h-full bg-gradient-to-br from-purple-950 via-black to-violet-950 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-4">
                  Welcome to Nyx Browse
                </h1>
                <p className="text-purple-300/80 text-lg">Your gateway to the quantum web</p>
              </div>
              
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-purple-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                  <h3 className="text-white font-semibold mb-3">Quick Search</h3>
                  <input
                    type="text"
                    placeholder="Search the web..."
                    className="w-full bg-black/30 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-300/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigateToUrl(e.currentTarget.value)
                      }
                    }}
                  />
                </div>
                
                <div className="bg-purple-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                  <h3 className="text-white font-semibold mb-3">Bookmarks</h3>
                  <div className="space-y-2">
                    {bookmarks.slice(0, 3).map(bookmark => (
                      <button
                        key={bookmark.id}
                        onClick={() => navigateToUrl(bookmark.url)}
                        className="w-full text-left p-2 hover:bg-purple-800/20 rounded-lg transition-colors text-purple-300 text-sm"
                      >
                        {bookmark.favicon} {bookmark.title}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-purple-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                  <h3 className="text-white font-semibold mb-3">Nyx Tools</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigateToUrl('nyx://docs')}
                      className="w-full text-left p-2 hover:bg-purple-800/20 rounded-lg transition-colors text-purple-300 text-sm"
                    >
                      📚 Documentation
                    </button>
                    <button
                      onClick={() => navigateToUrl('nyx://settings')}
                      className="w-full text-left p-2 hover:bg-purple-800/20 rounded-lg transition-colors text-purple-300 text-sm"
                    >
                      ⚙️ Settings
                    </button>
                    <button
                      onClick={() => navigateToUrl('https://github.com')}
                      className="w-full text-left p-2 hover:bg-purple-800/20 rounded-lg transition-colors text-purple-300 text-sm"
                    >
                      🔗 External Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'docs':
        return (
          <div className="h-full bg-gradient-to-br from-purple-950 via-black to-violet-950 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-white mb-8">Nyx OS Documentation</h1>
              <div className="prose prose-purple prose-invert max-w-none">
                <h2 className="text-purple-400">Getting Started</h2>
                <p className="text-purple-200">Welcome to Nyx OS, a futuristic operating system powered by quantum computing and AI.</p>
                
                <h3 className="text-purple-300">Features</h3>
                <ul className="text-purple-200">
                  <li>AI-powered desktop management</li>
                  <li>Voice-controlled interfaces</li>
                  <li>Quantum-encrypted security</li>
                  <li>Neural network optimization</li>
                </ul>
                
                <h3 className="text-purple-300">Browser Features</h3>
                <ul className="text-purple-200">
                  <li>Multi-tab browsing with quantum rendering</li>
                  <li>AI-enhanced bookmarking</li>
                  <li>Secure download management</li>
                  <li>Voice navigation</li>
                </ul>
              </div>
            </div>
          </div>
        )
        
      default:
        return (
          <div className="h-full flex items-center justify-center bg-purple-950">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
              <p className="text-purple-300">The requested Nyx page could not be found.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col h-full bg-black/90 backdrop-blur-xl">
      {/* Tab Bar */}
      <div className="flex items-center bg-black/40 border-b border-purple-500/20 px-2 py-1">
        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-t-lg border-b-2 transition-all cursor-pointer group min-w-32 max-w-48",
                tab.isActive 
                  ? "bg-purple-900/30 border-purple-400/50 text-white" 
                  : "bg-black/20 border-transparent text-purple-300 hover:bg-purple-900/20"
              )}
              onClick={() => switchTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              layout
            >
              <div className="flex-1 truncate text-xs">
                {tab.isLoading ? 'Loading...' : tab.title}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded p-1 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
        
        <button
          onClick={createNewTab}
          className="p-2 hover:bg-purple-800/20 rounded-lg transition-colors ml-2"
        >
          <Plus className="w-4 h-4 text-purple-400" />
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 p-2 bg-black/30 border-b border-purple-500/20">
        <div className="flex items-center gap-1">
          <button
            onClick={() => window.history.back()}
            disabled={!canGoBack}
            className="p-2 rounded-lg hover:bg-purple-800/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-purple-400" />
          </button>
          
          <button
            onClick={() => window.history.forward()}
            disabled={!canGoForward}
            className="p-2 rounded-lg hover:bg-purple-800/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-lg hover:bg-purple-800/20 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-purple-400" />
          </button>
          
          <button
            onClick={() => navigateToUrl('nyx://start')}
            className="p-2 rounded-lg hover:bg-purple-800/20 transition-colors"
          >
            <Home className="w-4 h-4 text-purple-400" />
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={addressBarValue}
              onChange={(e) => setAddressBarValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigateToUrl(addressBarValue)
                }
              }}
              className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-2 pr-10 text-white text-sm placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none"
              placeholder="Search or enter address..."
            />
            <Shield className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400" />
          </div>
          
          <button
            onClick={addBookmark}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isBookmarked ? "text-yellow-400 bg-yellow-400/20" : "text-purple-400 hover:bg-purple-800/20"
            )}
          >
            {isBookmarked ? <Star className="w-4 h-4 fill-current" /> : <BookmarkPlus className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className="p-2 rounded-lg hover:bg-purple-800/20 transition-colors"
          >
            <Bookmark className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>

      {/* Bookmarks Bar */}
      <AnimatePresence>
        {showBookmarks && (
          <motion.div
            className="flex items-center gap-2 p-2 bg-black/20 border-b border-purple-500/20 overflow-x-auto"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {bookmarks.map((bookmark) => (
              <button
                key={bookmark.id}
                onClick={() => navigateToUrl(bookmark.url)}
                className="flex items-center gap-2 px-3 py-1 bg-purple-900/20 hover:bg-purple-800/30 rounded-lg transition-colors text-sm text-purple-300 whitespace-nowrap"
              >
                <span>{bookmark.favicon}</span>
                <span>{bookmark.title}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {activeTab && activeTab.url.startsWith('nyx://') ? (
          renderNyxPage(activeTab.url)
        ) : (
          <iframe
            ref={iframeRef}
            src={activeTab?.url}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
            title={activeTab?.title}
          />
        )}
        
        {/* Loading Overlay */}
        {activeTab?.isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <motion.div
              className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}
      </div>

      {/* Download Progress */}
      <AnimatePresence>
        {Object.keys(downloadProgress).length > 0 && (
          <motion.div
            className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-xl rounded-lg p-4 border border-purple-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-purple-400" />
              <span className="text-white text-sm">Downloads</span>
            </div>
            {Object.entries(downloadProgress).map(([filename, progress]) => (
              <div key={filename} className="mb-2">
                <div className="text-xs text-purple-300 mb-1">{filename}</div>
                <div className="w-48 bg-purple-900/30 rounded-full h-2">
                  <div
                    className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
