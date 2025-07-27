import React, { useState, useRef, useEffect, useCallback } from 'react'
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
  ChevronDown,
  Zap,
  Users,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Trash2,
  Edit,
  Copy,
  Share
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
  isPinned?: boolean
  isIncognito?: boolean
}

interface Bookmark {
  id: string
  title: string
  url: string
  favicon: string
  folder?: string
  isStarred?: boolean
  created: Date
}

interface HistoryEntry {
  id: string
  title: string
  url: string
  timestamp: Date
  favicon: string
  visitCount: number
}

interface Download {
  id: string
  name: string
  url: string
  size: number
  progress: number
  status: 'downloading' | 'completed' | 'paused' | 'failed'
  timestamp: Date
}

const predefinedSites = [
  // Working demo sites that allow iframe embedding
  { name: 'Example.com', url: 'https://example.com', favicon: '🌐', category: 'Demo' },
  { name: 'HTTPBin', url: 'https://httpbin.org', favicon: '🔧', category: 'Demo' },
  { name: 'JSONPlaceholder', url: 'https://jsonplaceholder.typicode.com', favicon: '📦', category: 'Demo' },
  { name: 'Lorem Picsum', url: 'https://picsum.photos', favicon: '🖼️', category: 'Demo' },

  // Development resources (some may work in iframe)
  { name: 'GitHub', url: 'https://github.com', favicon: '🐙', category: 'Development' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', favicon: '📚', category: 'Development' },
  { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', favicon: '📖', category: 'Development' },
  { name: 'React', url: 'https://reactjs.org', favicon: '⚛️', category: 'Development' },
  { name: 'TypeScript', url: 'https://typescriptlang.org', favicon: '🔷', category: 'Development' },

  // Sites that will show restriction message
  { name: 'YouTube', url: 'https://youtube.com', favicon: '📺', category: 'Entertainment' },
  { name: 'Google', url: 'https://google.com', favicon: '🔍', category: 'Search' },
  { name: 'Twitter', url: 'https://twitter.com', favicon: '🐦', category: 'Social' },
  { name: 'LinkedIn', url: 'https://linkedin.com', favicon: '💼', category: 'Social' },
  { name: 'Facebook', url: 'https://facebook.com', favicon: '📘', category: 'Social' },

  // Other useful sites
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com', favicon: '🦆', category: 'Search' },
  { name: 'Wikipedia', url: 'https://wikipedia.org', favicon: '📚', category: 'Reference' },
  { name: 'Archive.org', url: 'https://archive.org', favicon: '📜', category: 'Reference' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com', favicon: '🔶', category: 'News' },
  { name: 'Product Hunt', url: 'https://producthunt.com', favicon: '🚀', category: 'Tech' },
  { name: 'CodePen', url: 'https://codepen.io', favicon: '✏️', category: 'Development' },
]

export const WebBrowser: React.FC = () => {
  const { addMessage, setEmotion } = useSamStore()
  
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'Nyx Web - New Tab',
      url: 'nyx://newtab',
      favicon: '🌐',
      isLoading: false,
      isActive: true,
      canGoBack: false,
      canGoForward: false
    }
  ])
  
  const [activeTabId, setActiveTabId] = useState('tab-1')
  const [addressBarValue, setAddressBarValue] = useState('nyx://newtab')
  const [isAddressBarFocused, setIsAddressBarFocused] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showDownloads, setShowDownloads] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isIncognitoMode, setIsIncognitoMode] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('nyx-browser-bookmarks')
    return saved ? JSON.parse(saved).map((b: any) => ({
      ...b,
      created: new Date(b.created || Date.now())
    })) : predefinedSites.map((site, index) => ({
      id: `bookmark-${index}`,
      title: site.name,
      url: site.url,
      favicon: site.favicon,
      folder: site.category,
      isStarred: index < 5,
      created: new Date()
    }))
  })
  
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem('nyx-browser-history')
    return saved ? JSON.parse(saved).map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    })) : []
  })
  
  const [downloads, setDownloads] = useState<Download[]>(() => {
    const saved = localStorage.getItem('nyx-browser-downloads')
    return saved ? JSON.parse(saved).map((d: any) => ({
      ...d,
      timestamp: new Date(d.timestamp)
    })) : []
  })
  
  const addressBarRef = useRef<HTMLInputElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('nyx-browser-bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])
  
  useEffect(() => {
    localStorage.setItem('nyx-browser-history', JSON.stringify(history))
  }, [history])
  
  useEffect(() => {
    localStorage.setItem('nyx-browser-downloads', JSON.stringify(downloads))
  }, [downloads])
  
  const getActiveTab = () => tabs.find(tab => tab.id === activeTabId) || tabs[0]
  
  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch {
      return string.includes('.') && !string.includes(' ')
    }
  }
  
  const formatUrl = (input: string) => {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return input
    }
    if (input.startsWith('nyx://')) {
      return input
    }
    if (isValidUrl(input)) {
      return `https://${input}`
    }
    return `https://www.google.com/search?q=${encodeURIComponent(input)}`
  }
  
  const generateSuggestions = (input: string) => {
    if (!input.trim()) {
      setSearchSuggestions([])
      return
    }
    
    const bookmarkSuggestions = bookmarks
      .filter(b => b.title.toLowerCase().includes(input.toLowerCase()) || 
                  b.url.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 3)
      .map(b => b.url)
    
    const historySuggestions = history
      .filter(h => h.title.toLowerCase().includes(input.toLowerCase()) || 
                  h.url.toLowerCase().includes(input.toLowerCase()))
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 3)
      .map(h => h.url)
    
    const searchSuggestions = [
      `${input} tutorial`,
      `${input} documentation`,
      `how to ${input}`,
      `what is ${input}`,
      `${input} examples`
    ].slice(0, 2)
    
    const allSuggestions = [...new Set([...bookmarkSuggestions, ...historySuggestions, ...searchSuggestions])]
    setSearchSuggestions(allSuggestions.slice(0, 6))
  }
  
  const navigateToUrl = (url: string, tabId?: string) => {
    const targetTabId = tabId || activeTabId
    const formattedUrl = formatUrl(url)
    
    setTabs(prev => prev.map(tab => 
      tab.id === targetTabId 
        ? { 
            ...tab, 
            url: formattedUrl, 
            isLoading: true,
            canGoBack: true,
            title: 'Loading...'
          }
        : tab
    ))
    
    if (targetTabId === activeTabId) {
      setAddressBarValue(formattedUrl)
    }
    
    // Add to history (unless incognito)
    if (!isIncognitoMode && !formattedUrl.startsWith('nyx://')) {
      const existingEntry = history.find(h => h.url === formattedUrl)
      if (existingEntry) {
        setHistory(prev => prev.map(h => 
          h.id === existingEntry.id 
            ? { ...h, timestamp: new Date(), visitCount: h.visitCount + 1 }
            : h
        ))
      } else {
        const newEntry: HistoryEntry = {
          id: `history-${Date.now()}`,
          title: formattedUrl,
          url: formattedUrl,
          timestamp: new Date(),
          favicon: '🌐',
          visitCount: 1
        }
        setHistory(prev => [newEntry, ...prev.slice(0, 999)]) // Keep last 1000
      }
    }
    
    // Simulate page load
    setTimeout(() => {
      setTabs(prev => prev.map(tab => 
        tab.id === targetTabId 
          ? { 
              ...tab, 
              isLoading: false,
              title: getTitleFromUrl(formattedUrl),
              favicon: getFaviconFromUrl(formattedUrl)
            }
          : tab
      ))
      
      setEmotion('focused', 0.7)
      addMessage(`Navigated to ${getTitleFromUrl(formattedUrl)}. Browsing the web like a pro!`, 'sam', 'focused')
    }, Math.random() * 1000 + 500)
    
    setShowSuggestions(false)
  }
  
  const getTitleFromUrl = (url: string) => {
    if (url.startsWith('nyx://newtab')) return 'New Tab'
    if (url.includes('google.com/search')) return 'Google Search'
    
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
    } catch {
      return 'Loading...'
    }
  }
  
  const getFaviconFromUrl = (url: string) => {
    if (url.startsWith('nyx://')) return '🌐'
    if (url.includes('github.com')) return '🐙'
    if (url.includes('google.com')) return '🔍'
    if (url.includes('youtube.com')) return '📺'
    if (url.includes('twitter.com')) return '🐦'
    if (url.includes('stackoverflow.com')) return '📚'
    if (url.includes('reddit.com')) return '🔥'
    if (url.includes('discord.com')) return '👾'
    if (url.includes('spotify.com')) return '🎵'
    if (url.includes('netflix.com')) return '🍿'
    if (url.includes('openai.com')) return '🤖'
    return '🌐'
  }
  
  const createNewTab = (url = 'nyx://newtab', isIncognito = false) => {
    const newTab: BrowserTab = {
      id: `tab-${Date.now()}`,
      title: url === 'nyx://newtab' ? 'New Tab' : 'Loading...',
      url,
      favicon: '🌐',
      isLoading: false,
      isActive: false,
      canGoBack: false,
      canGoForward: false,
      isIncognito
    }
    
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
    setAddressBarValue(url)
    
    if (url !== 'nyx://newtab') {
      navigateToUrl(url, newTab.id)
    }
    
    setEmotion('happy', 0.6)
    addMessage(`Opened new ${isIncognito ? 'incognito ' : ''}tab! Ready to explore the web!`, 'sam', 'happy')
  }
  
  const closeTab = (tabId: string) => {
    const tabIndex = tabs.findIndex(t => t.id === tabId)
    const newTabs = tabs.filter(t => t.id !== tabId)
    
    if (newTabs.length === 0) {
      createNewTab()
      return
    }
    
    setTabs(newTabs)
    
    if (activeTabId === tabId) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1)
      setActiveTabId(newTabs[newActiveIndex].id)
      setAddressBarValue(newTabs[newActiveIndex].url)
    }
  }
  
  const addBookmark = (tab: BrowserTab) => {
    if (tab.url.startsWith('nyx://')) return
    
    const exists = bookmarks.find(b => b.url === tab.url)
    if (exists) {
      setEmotion('confused', 0.5)
      addMessage('Already bookmarked this page, mate!', 'sam', 'confused')
      return
    }
    
    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      title: tab.title,
      url: tab.url,
      favicon: tab.favicon || '🌐',
      folder: 'General',
      isStarred: false,
      created: new Date()
    }
    
    setBookmarks(prev => [newBookmark, ...prev])
    setEmotion('excited', 0.8)
    addMessage(`Bookmarked ${tab.title}! Easy access for later, bruv!`, 'sam', 'excited')
  }
  
  const removeBookmark = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
    setEmotion('focused', 0.5)
    addMessage('Bookmark removed! Keeping things tidy!', 'sam', 'focused')
  }
  
  const clearHistory = () => {
    setHistory([])
    setEmotion('focused', 0.7)
    addMessage('History cleared! Fresh start, clean slate!', 'sam', 'focused')
  }
  
  const goBack = () => {
    const activeTab = getActiveTab()
    if (activeTab.canGoBack) {
      setEmotion('focused', 0.5)
      addMessage('Going back! Time travel is cool, right?', 'sam', 'focused')
    }
  }
  
  const goForward = () => {
    const activeTab = getActiveTab()
    if (activeTab.canGoForward) {
      setEmotion('focused', 0.5)
      addMessage('Moving forward! Progress is the way!', 'sam', 'focused')
    }
  }
  
  const reload = () => {
    const activeTab = getActiveTab()
    navigateToUrl(activeTab.url)
    setEmotion('excited', 0.6)
    addMessage('Refreshing the page! Sometimes you need a fresh perspective!', 'sam', 'excited')
  }
  
  const handleAddressBarSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigateToUrl(addressBarValue)
    addressBarRef.current?.blur()
  }
  
  const renderNewTabPage = () => (
    <div className="p-8 h-full overflow-auto liquid-glass">
      <div className="max-w-4xl mx-auto">
        {/* Search */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Nyx Web
            </h1>
            <p className="text-white/60">Your quantum-powered gateway to the internet</p>
          </motion.div>
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search the web or enter a URL"
              className="w-full pl-12 pr-4 py-4 liquid-glass-dark rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement
                  navigateToUrl(target.value)
                }
              }}
            />
          </div>
        </div>
        
        {/* Quick Access */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {bookmarks.filter(b => b.isStarred).slice(0, 8).map((bookmark) => (
            <motion.button
              key={bookmark.id}
              onClick={() => navigateToUrl(bookmark.url)}
              className="p-4 liquid-glass-dark rounded-xl hover:bg-white/10 transition-all text-center group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-2xl mb-2">{bookmark.favicon}</div>
              <div className="text-white text-sm truncate">{bookmark.title}</div>
            </motion.button>
          ))}
        </div>
        
        {/* Recent Sites */}
        {history.length > 0 && (
          <div className="mb-8">
            <h2 className="text-white text-lg font-semibold mb-4">Recently Visited</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {history.slice(0, 6).map((entry) => (
                <motion.button
                  key={entry.id}
                  onClick={() => navigateToUrl(entry.url)}
                  className="flex items-center gap-3 p-3 liquid-glass rounded-lg hover:bg-white/10 transition-all text-left"
                  whileHover={{ x: 4 }}
                >
                  <div className="text-lg">{entry.favicon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm truncate">{entry.title}</div>
                    <div className="text-white/40 text-xs truncate">{entry.url}</div>
                  </div>
                  <div className="text-white/40 text-xs">
                    {entry.timestamp.toLocaleDateString()}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
        
        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Development', 'Entertainment', 'Social', 'AI'].map((category) => (
            <div key={category} className="liquid-glass rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3">{category}</h3>
              <div className="space-y-2">
                {bookmarks
                  .filter(b => b.folder === category)
                  .slice(0, 4)
                  .map((bookmark) => (
                    <button
                      key={bookmark.id}
                      onClick={() => navigateToUrl(bookmark.url)}
                      className="flex items-center gap-2 w-full text-left hover:bg-white/10 p-2 rounded transition-colors"
                    >
                      <span className="text-sm">{bookmark.favicon}</span>
                      <span className="text-white/80 text-sm truncate">{bookmark.title}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
  
  const renderWebContent = (tab: BrowserTab) => {
    if (tab.url === 'nyx://newtab') {
      return renderNewTabPage()
    }

    // Handle sites that don't allow iframe embedding
    const isRestrictedSite = tab.url.includes('google.com') ||
                            tab.url.includes('youtube.com') ||
                            tab.url.includes('facebook.com') ||
                            tab.url.includes('twitter.com') ||
                            tab.url.includes('instagram.com') ||
                            tab.url.includes('linkedin.com')

    if (isRestrictedSite) {
      return (
        <div className="h-full flex items-center justify-center liquid-glass">
          <div className="text-center max-w-md mx-4">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-white text-xl font-semibold mb-2">Site Restrictions</h3>
            <p className="text-white/70 mb-4">
              This site doesn't allow embedding in frames for security reasons.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  window.open(tab.url, '_blank')
                  setEmotion('helpful', 0.8)
                  addMessage('Opened in a new window! Some sites need their own space to run properly!', 'sam', 'helpful')
                }}
                className="w-full px-6 py-3 apple-button text-white hover:text-white transition-colors"
              >
                Open in New Window
              </button>
              <div className="p-4 apple-control-panel">
                <h4 className="text-white text-sm font-medium mb-2">Why this happens:</h4>
                <p className="text-white/60 text-xs">
                  Sites like Google, YouTube, and social media platforms use X-Frame-Options headers
                  to prevent embedding for security and user protection.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="h-full">
        <iframe
          ref={iframeRef}
          src={tab.url}
          className="w-full h-full border-none"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
          title={tab.title}
          onError={() => {
            setEmotion('confused', 0.7)
            addMessage('Had trouble loading that page. Some sites are picky about how they\'re accessed!', 'sam', 'confused')
          }}
        />
      </div>
    )
  }
  
  const activeTab = getActiveTab()
  
  return (
    <div className="flex flex-col h-full liquid-glass-window">
      {/* Tab Bar */}
      <div className="flex items-center liquid-glass-dark border-b border-white/10">
        <div className="flex-1 flex items-center overflow-x-auto scrollbar-hidden">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "flex items-center gap-2 px-4 py-3 border-r border-white/10 cursor-pointer transition-all min-w-0 max-w-60 group relative",
                tab.isActive 
                  ? "bg-white/10 text-white" 
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
              onClick={() => {
                setActiveTabId(tab.id)
                setAddressBarValue(tab.url)
              }}
            >
              {tab.isIncognito && (
                <EyeOff className="w-3 h-3 text-purple-400 flex-shrink-0" />
              )}
              {tab.isPinned && (
                <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
              )}
              <span className="text-sm flex-shrink-0">{tab.favicon}</span>
              <span className="text-xs truncate flex-1 min-w-0">{tab.title}</span>
              {tab.isLoading && (
                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
              )}
              {!tab.isPinned && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-all flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        <button
          onClick={() => createNewTab()}
          className="p-3 hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4 text-white/70" />
        </button>
      </div>
      
      {/* Navigation Bar */}
      <div className="flex items-center gap-2 p-3 liquid-glass border-b border-white/10">
        <div className="flex items-center gap-1">
          <button
            onClick={goBack}
            disabled={!activeTab.canGoBack}
            className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goForward}
            disabled={!activeTab.canGoForward}
            className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={reload}
            className="p-2 rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        
        {/* Address Bar */}
        <div className="flex-1 relative">
          <form onSubmit={handleAddressBarSubmit} className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {activeTab.url.startsWith('https://') ? (
                <Lock className="w-4 h-4 text-green-400" />
              ) : (
                <Globe className="w-4 h-4 text-white/40" />
              )}
            </div>
            <input
              ref={addressBarRef}
              type="text"
              value={addressBarValue}
              onChange={(e) => {
                setAddressBarValue(e.target.value)
                generateSuggestions(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => {
                setIsAddressBarFocused(true)
                setShowSuggestions(true)
              }}
              onBlur={() => {
                setTimeout(() => {
                  setIsAddressBarFocused(false)
                  setShowSuggestions(false)
                }, 150)
              }}
              className="w-full pl-10 pr-12 py-2 liquid-glass rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
              placeholder="Search or enter URL"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
          
          {/* Search Suggestions */}
          <AnimatePresence>
            {showSuggestions && searchSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-1 liquid-glass-dark border border-white/20 rounded-lg py-2 z-50"
              >
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => navigateToUrl(suggestion)}
                    className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => addBookmark(activeTab)}
            className="p-2 rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/10"
          >
            <Star className={cn(
              "w-4 h-4",
              bookmarks.some(b => b.url === activeTab.url) && "fill-current text-yellow-400"
            )} />
          </button>
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className="p-2 rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/10"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/10"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={() => createNewTab('nyx://newtab', true)}
            className="p-2 rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/10"
          >
            <EyeOff className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/10"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Bookmarks Bar */}
      {showBookmarks && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden liquid-glass border-b border-white/10"
        >
          <div className="flex items-center gap-2 p-2 overflow-x-auto scrollbar-hidden">
            {bookmarks.slice(0, 10).map((bookmark) => (
              <button
                key={bookmark.id}
                onClick={() => navigateToUrl(bookmark.url)}
                className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 text-sm"
              >
                <span>{bookmark.favicon}</span>
                <span className="text-white/80">{bookmark.title}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {renderWebContent(activeTab)}
      </div>
      
      {/* Sidebar Panels */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute top-0 right-0 w-80 h-full liquid-glass-dark border-l border-white/20 z-50"
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">History</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearHistory}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2 overflow-auto h-full">
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => navigateToUrl(entry.url)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                >
                  <span className="text-lg">{entry.favicon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm truncate">{entry.title}</div>
                    <div className="text-white/40 text-xs truncate">{entry.url}</div>
                    <div className="text-white/30 text-xs">
                      {entry.timestamp.toLocaleString()} • {entry.visitCount} visit{entry.visitCount > 1 ? 's' : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
