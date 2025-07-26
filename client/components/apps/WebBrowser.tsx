import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Bookmark, 
  BookmarkPlus,
  X,
  Plus,
  Download,
  Shield,
  Globe,
  Star,
  Search,
  Settings,
  History,
  Menu,
  ExternalLink,
  Lock,
  Unlock,
  Wifi,
  WifiOff,
  Clock,
  Eye,
  EyeOff,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSamStore } from '@/store/sam-store'

interface BrowserTab {
  id: string
  title: string
  url: string
  favicon?: string
  isLoading: boolean
  isActive: boolean
  canGoBack: boolean
  canGoForward: boolean
}

interface Bookmark {
  id: string
  title: string
  url: string
  favicon: string
  folder?: string
}

interface HistoryEntry {
  id: string
  title: string
  url: string
  timestamp: Date
  favicon: string
}

export const WebBrowser: React.FC = () => {
  const { addMessage, setEmotion } = useSamStore()
  
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'Nyx Web - New Tab',
      url: 'nyx://newtab',
      isLoading: false,
      isActive: true,
      canGoBack: false,
      canGoForward: false
    }
  ])
  
  const [activeTabId, setActiveTabId] = useState('tab-1')
  const [addressBarValue, setAddressBarValue] = useState('nyx://newtab')
  const [isAddressBarFocused, setIsAddressBarFocused] = useState(false)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('nyx-browser-bookmarks')
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'GitHub', url: 'https://github.com', favicon: '🐙', folder: 'Dev' },
      { id: '2', title: 'OpenAI', url: 'https://openai.com', favicon: '🤖', folder: 'AI' },
      { id: '3', title: 'Stack Overflow', url: 'https://stackoverflow.com', favicon: '📚', folder: 'Dev' },
      { id: '4', title: 'YouTube', url: 'https://youtube.com', favicon: '📺', folder: 'Media' },
      { id: '5', title: 'Twitter', url: 'https://twitter.com', favicon: '🐦', folder: 'Social' },
      { id: '6', title: 'Reddit', url: 'https://reddit.com', favicon: '🔥', folder: 'Social' },
    ]
  })
  
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem('nyx-browser-history')
    return saved ? JSON.parse(saved).map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    })) : []
  })
  
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showDownloads, setShowDownloads] = useState(false)
  const [isIncognito, setIsIncognito] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({})
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const addressBarRef = useRef<HTMLInputElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  // Save bookmarks and history to localStorage
  useEffect(() => {
    localStorage.setItem('nyx-browser-bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  useEffect(() => {
    localStorage.setItem('nyx-browser-history', JSON.stringify(history))
  }, [history])

  // Generate search suggestions
  useEffect(() => {
    if (addressBarValue && addressBarValue.length > 2 && isAddressBarFocused) {
      const suggestions = [
        ...bookmarks.filter(b => 
          b.title.toLowerCase().includes(addressBarValue.toLowerCase()) ||
          b.url.toLowerCase().includes(addressBarValue.toLowerCase())
        ).map(b => b.url),
        ...history.filter(h => 
          h.title.toLowerCase().includes(addressBarValue.toLowerCase()) ||
          h.url.toLowerCase().includes(addressBarValue.toLowerCase())
        ).map(h => h.url).slice(0, 3),
        `https://www.google.com/search?q=${encodeURIComponent(addressBarValue)}`,
        `https://duckduckgo.com/?q=${encodeURIComponent(addressBarValue)}`,
      ]
      setSearchSuggestions([...new Set(suggestions)].slice(0, 6))
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [addressBarValue, isAddressBarFocused, bookmarks, history])

  const createNewTab = (url: string = 'nyx://newtab') => {
    const newTab: BrowserTab = {
      id: `tab-${Date.now()}`,
      title: 'Loading...',
      url,
      isLoading: true,
      isActive: true,
      canGoBack: false,
      canGoForward: false
    }
    
    setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat(newTab))
    setActiveTabId(newTab.id)
    setAddressBarValue(url)
    
    // Simulate loading
    setTimeout(() => {
      setTabs(prev => prev.map(tab => 
        tab.id === newTab.id 
          ? { ...tab, isLoading: false, title: getPageTitle(url) }
          : tab
      ))
    }, 1000)
  }

  const closeTab = (tabId: string) => {
    const tabIndex = tabs.findIndex(tab => tab.id === tabId)
    const newTabs = tabs.filter(tab => tab.id !== tabId)
    
    if (newTabs.length === 0) {
      createNewTab()
      return
    }
    
    setTabs(newTabs)
    
    if (activeTabId === tabId) {
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
    let finalUrl = url
    
    // Handle different URL formats
    if (!url.startsWith('http') && !url.startsWith('nyx://') && !url.startsWith('about:')) {
      if (url.includes('.') && !url.includes(' ')) {
        finalUrl = `https://${url}`
      } else {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`
      }
    }
    
    if (activeTab) {
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, url: finalUrl, isLoading: true, title: 'Loading...' }
          : tab
      ))
      
      setAddressBarValue(finalUrl)
      setShowSuggestions(false)
      
      // Add to history (unless incognito)
      if (!isIncognito && !finalUrl.startsWith('nyx://')) {
        const historyEntry: HistoryEntry = {
          id: `history-${Date.now()}`,
          title: getPageTitle(finalUrl),
          url: finalUrl,
          timestamp: new Date(),
          favicon: getFavicon(finalUrl)
        }
        setHistory(prev => [historyEntry, ...prev.slice(0, 99)])
      }
      
      // Simulate loading
      setTimeout(() => {
        setTabs(prev => prev.map(tab => 
          tab.id === activeTabId 
            ? { ...tab, isLoading: false, title: getPageTitle(finalUrl) }
            : tab
        ))
      }, Math.random() * 2000 + 500)
      
      setEmotion('focused', 0.6)
      addMessage(`Navigating to ${getPageTitle(finalUrl)}`, 'sam', 'focused')
    }
  }

  const getPageTitle = (url: string): string => {
    if (url.startsWith('nyx://')) {
      const page = url.split('//')[1]
      switch (page) {
        case 'newtab': return 'New Tab'
        case 'bookmarks': return 'Bookmarks'
        case 'history': return 'History'
        case 'settings': return 'Browser Settings'
        case 'downloads': return 'Downloads'
        default: return 'Nyx Page'
      }
    }
    
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      return domain.charAt(0).toUpperCase() + domain.slice(1)
    } catch {
      return 'Web Page'
    }
  }

  const getFavicon = (url: string): string => {
    if (url.includes('github.com')) return '🐙'
    if (url.includes('google.com')) return '🔍'
    if (url.includes('youtube.com')) return '📺'
    if (url.includes('twitter.com')) return '🐦'
    if (url.includes('reddit.com')) return '🔥'
    if (url.includes('stackoverflow.com')) return '📚'
    if (url.includes('openai.com')) return '🤖'
    return '🌐'
  }

  const addBookmark = () => {
    if (activeTab && !isBookmarkAlreadyAdded()) {
      const newBookmark: Bookmark = {
        id: `bookmark-${Date.now()}`,
        title: activeTab.title,
        url: activeTab.url,
        favicon: getFavicon(activeTab.url),
        folder: 'General'
      }
      setBookmarks(prev => [...prev, newBookmark])
      setEmotion('happy', 0.7)
      addMessage('Bookmark added! Easy access for later.', 'sam', 'happy')
    }
  }

  const isBookmarkAlreadyAdded = (): boolean => {
    return activeTab ? bookmarks.some(b => b.url === activeTab.url) : false
  }

  const goBack = () => {
    if (activeTab?.canGoBack) {
      // Simulate going back
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, canGoForward: true }
          : tab
      ))
    }
  }

  const goForward = () => {
    if (activeTab?.canGoForward) {
      // Simulate going forward
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, canGoForward: false }
          : tab
      ))
    }
  }

  const refresh = () => {
    if (activeTab) {
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, isLoading: true }
          : tab
      ))
      
      setTimeout(() => {
        setTabs(prev => prev.map(tab => 
          tab.id === activeTabId 
            ? { ...tab, isLoading: false }
            : tab
        ))
      }, 1000)
    }
  }

  const renderNewTabPage = () => (
    <div className="h-full bg-gradient-to-br from-purple-950 via-black to-violet-950 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-4">
            Nyx Web
          </h1>
          <p className="text-purple-300/80 text-lg">Your gateway to the quantum internet</p>
        </div>
        
        {/* Quick Search */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-purple-400" />
              <input
                type="text"
                placeholder="Search the web or enter URL..."
                className="w-full bg-black/40 border-2 border-purple-500/30 rounded-2xl pl-14 pr-6 py-4 text-white text-lg placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigateToUrl(e.currentTarget.value)
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {bookmarks.slice(0, 8).map((bookmark) => (
            <button
              key={bookmark.id}
              onClick={() => navigateToUrl(bookmark.url)}
              className="bg-purple-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-200 group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {bookmark.favicon}
              </div>
              <div className="text-white font-medium text-sm">{bookmark.title}</div>
            </button>
          ))}
        </div>

        {/* Recent History */}
        {history.length > 0 && (
          <div className="bg-purple-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent History
            </h3>
            <div className="space-y-3">
              {history.slice(0, 5).map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => navigateToUrl(entry.url)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-purple-800/20 rounded-lg transition-colors text-left"
                >
                  <span className="text-lg">{entry.favicon}</span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{entry.title}</div>
                    <div className="text-purple-300/70 text-xs">{entry.url}</div>
                  </div>
                  <div className="text-purple-400 text-xs">
                    {entry.timestamp.toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderContent = () => {
    if (!activeTab) return null

    if (activeTab.url === 'nyx://newtab') {
      return renderNewTabPage()
    }

    if (activeTab.url === 'nyx://bookmarks') {
      return (
        <div className="h-full bg-gradient-to-br from-purple-950 via-black to-violet-950 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Bookmarks</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((bookmark) => (
              <button
                key={bookmark.id}
                onClick={() => navigateToUrl(bookmark.url)}
                className="bg-black/40 border border-purple-500/30 rounded-lg p-4 hover:bg-purple-500/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{bookmark.favicon}</span>
                  <div>
                    <div className="text-white font-medium">{bookmark.title}</div>
                    <div className="text-purple-300/70 text-sm">{bookmark.url}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    }

    if (activeTab.url === 'nyx://history') {
      return (
        <div className="h-full bg-gradient-to-br from-purple-950 via-black to-violet-950 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Browsing History</h1>
          <div className="space-y-2">
            {history.map((entry) => (
              <button
                key={entry.id}
                onClick={() => navigateToUrl(entry.url)}
                className="w-full flex items-center gap-4 p-4 bg-black/40 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors text-left"
              >
                <span className="text-xl">{entry.favicon}</span>
                <div className="flex-1">
                  <div className="text-white font-medium">{entry.title}</div>
                  <div className="text-purple-300/70 text-sm">{entry.url}</div>
                </div>
                <div className="text-purple-400 text-sm">
                  {entry.timestamp.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    }

    // For external websites, show iframe with proper URL
    return (
      <div className="h-full relative">
        <iframe
          ref={iframeRef}
          src={activeTab.url}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
          title={activeTab.title}
          onLoad={() => {
            setTabs(prev => prev.map(tab => 
              tab.id === activeTabId 
                ? { ...tab, isLoading: false, canGoBack: true }
                : tab
            ))
          }}
        />
        
        {/* Loading overlay */}
        {activeTab.isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <motion.div
              className="w-12 h-12 border-4 border-purple-400/30 border-t-purple-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-black/90 backdrop-blur-xl">
      {/* Tab Bar */}
      <div className="flex items-center bg-black/60 border-b border-purple-500/20 px-2 py-1">
        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-t-lg border-b-2 transition-all cursor-pointer group min-w-32 max-w-48",
                tab.isActive 
                  ? "bg-purple-900/40 border-purple-400/50 text-white" 
                  : "bg-black/20 border-transparent text-purple-300 hover:bg-purple-900/20"
              )}
              onClick={() => switchTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              layout
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {tab.isLoading ? (
                  <motion.div
                    className="w-3 h-3 border border-purple-400/30 border-t-purple-400 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <span className="text-sm">{getFavicon(tab.url)}</span>
                )}
                <div className="truncate text-xs font-medium">{tab.title}</div>
              </div>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded p-1 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
        
        <button
          onClick={() => createNewTab()}
          className="p-2 hover:bg-purple-800/20 rounded-lg transition-colors ml-2"
        >
          <Plus className="w-4 h-4 text-purple-400" />
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 p-3 bg-black/40 border-b border-purple-500/20">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={goBack}
            disabled={!activeTab?.canGoBack}
            className="p-2 rounded-lg hover:bg-purple-800/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-purple-400" />
          </button>
          
          <button
            onClick={goForward}
            disabled={!activeTab?.canGoForward}
            className="p-2 rounded-lg hover:bg-purple-800/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </button>
          
          <button
            onClick={refresh}
            className="p-2 rounded-lg hover:bg-purple-800/20 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-purple-400" />
          </button>
          
          <button
            onClick={() => navigateToUrl('nyx://newtab')}
            className="p-2 rounded-lg hover:bg-purple-800/20 transition-colors"
          >
            <Home className="w-4 h-4 text-purple-400" />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 relative">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {activeTab?.url.startsWith('https://') ? (
                <Lock className="w-4 h-4 text-green-400" />
              ) : (
                <Globe className="w-4 h-4 text-purple-400" />
              )}
            </div>
            <input
              ref={addressBarRef}
              type="text"
              value={addressBarValue}
              onChange={(e) => setAddressBarValue(e.target.value)}
              onFocus={() => setIsAddressBarFocused(true)}
              onBlur={() => setTimeout(() => setIsAddressBarFocused(false), 100)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigateToUrl(addressBarValue)
                }
              }}
              className="w-full bg-black/60 border border-purple-500/30 rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none"
              placeholder="Search or enter address..."
            />
          </div>
          
          {/* Search Suggestions */}
          <AnimatePresence>
            {showSuggestions && searchSuggestions.length > 0 && (
              <motion.div
                className="absolute top-full left-0 right-0 bg-black/90 border border-purple-500/30 rounded-lg mt-1 py-2 z-50 max-h-60 overflow-y-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => navigateToUrl(suggestion)}
                    className="w-full px-4 py-2 text-left text-white text-sm hover:bg-purple-500/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3 h-3 text-purple-400" />
                      {suggestion}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Browser Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={addBookmark}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isBookmarkAlreadyAdded() 
                ? "text-yellow-400 bg-yellow-400/20" 
                : "text-purple-400 hover:bg-purple-800/20"
            )}
          >
            {isBookmarkAlreadyAdded() ? 
              <Star className="w-4 h-4 fill-current" /> : 
              <BookmarkPlus className="w-4 h-4" />
            }
          </button>
          
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className="p-2 rounded-lg hover:bg-purple-800/20 transition-colors"
          >
            <Bookmark className="w-4 h-4 text-purple-400" />
          </button>
          
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-lg hover:bg-purple-800/20 transition-colors"
          >
            <History className="w-4 h-4 text-purple-400" />
          </button>
          
          <button
            onClick={() => setIsIncognito(!isIncognito)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isIncognito ? "bg-purple-500/20 text-purple-300" : "hover:bg-purple-800/20 text-purple-400"
            )}
          >
            {isIncognito ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-black/40 border-t border-purple-500/20 text-xs text-purple-300">
        <div className="flex items-center gap-4">
          <span>Nyx Web Browser</span>
          {isIncognito && (
            <span className="flex items-center gap-1">
              <EyeOff className="w-3 h-3" />
              Incognito Mode
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>Tabs: {tabs.length}</span>
          <span>Bookmarks: {bookmarks.length}</span>
          {navigator.onLine ? (
            <span className="flex items-center gap-1 text-green-400">
              <Wifi className="w-3 h-3" />
              Online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-400">
              <WifiOff className="w-3 h-3" />
              Offline
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
