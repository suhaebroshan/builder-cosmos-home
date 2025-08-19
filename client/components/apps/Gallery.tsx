import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Search, MoreHorizontal, Download, Share2, 
  Trash2, Edit, Heart, Grid3X3, List, Calendar,
  Filter, Star, Copy, Move, Folder, Image,
  Play, Pause, Volume2, VolumeX, RotateCw,
  ZoomIn, ZoomOut, Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaItem {
  id: string
  name: string
  url: string
  type: 'photo' | 'video'
  size: number
  timestamp: Date
  favorite: boolean
  album?: string
  tags: string[]
}

type ViewMode = 'grid' | 'list'
type SortBy = 'date' | 'name' | 'size' | 'type'

export const Gallery: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all')
  const [showDetails, setShowDetails] = useState(false)
  const [currentItem, setCurrentItem] = useState<MediaItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)

  // Load sample media items
  useEffect(() => {
    const sampleMedia: MediaItem[] = [
      {
        id: '1',
        name: 'Mountain Sunset',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        type: 'photo',
        size: 2480000,
        timestamp: new Date('2024-01-15'),
        favorite: true,
        album: 'Nature',
        tags: ['sunset', 'mountain', 'landscape']
      },
      {
        id: '2',
        name: 'City Lights',
        url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400',
        type: 'photo',
        size: 1920000,
        timestamp: new Date('2024-01-14'),
        favorite: false,
        album: 'Urban',
        tags: ['city', 'night', 'lights']
      },
      {
        id: '3',
        name: 'Ocean Waves',
        url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400',
        type: 'video',
        size: 15600000,
        timestamp: new Date('2024-01-13'),
        favorite: true,
        album: 'Nature',
        tags: ['ocean', 'waves', 'beach']
      },
      {
        id: '4',
        name: 'Forest Path',
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
        type: 'photo',
        size: 3100000,
        timestamp: new Date('2024-01-12'),
        favorite: false,
        album: 'Nature',
        tags: ['forest', 'path', 'trees']
      },
      {
        id: '5',
        name: 'Abstract Art',
        url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
        type: 'photo',
        size: 1450000,
        timestamp: new Date('2024-01-11'),
        favorite: false,
        album: 'Art',
        tags: ['abstract', 'colorful', 'art']
      },
      {
        id: '6',
        name: 'Street Performance',
        url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        type: 'video',
        size: 22400000,
        timestamp: new Date('2024-01-10'),
        favorite: true,
        album: 'Urban',
        tags: ['street', 'performance', 'music']
      }
    ]
    setMediaItems(sampleMedia)
  }, [])

  // Get unique albums
  const albums = ['all', ...Array.from(new Set(mediaItems.map(item => item.album).filter(Boolean)))]

  // Filter and sort media items
  const filteredAndSortedItems = mediaItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesAlbum = selectedAlbum === 'all' || item.album === selectedAlbum
      return matchesSearch && matchesAlbum
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'size':
          return b.size - a.size
        case 'type':
          return a.type.localeCompare(b.type)
        case 'date':
        default:
          return b.timestamp.getTime() - a.timestamp.getTime()
      }
    })

  // Toggle item selection
  const toggleSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems)
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId)
    } else {
      newSelection.add(itemId)
    }
    setSelectedItems(newSelection)
  }

  // Toggle favorite
  const toggleFavorite = (itemId: string) => {
    setMediaItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, favorite: !item.favorite } : item
      )
    )
  }

  // Delete selected items
  const deleteSelectedItems = () => {
    setMediaItems(prev => prev.filter(item => !selectedItems.has(item.id)))
    setSelectedItems(new Set())
    setSelectionMode(false)
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Open item in detail view
  const openDetailView = (item: MediaItem) => {
    setCurrentItem(item)
    setShowDetails(true)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gallery</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredAndSortedItems.length} items
                {selectedItems.size > 0 && ` • ${selectedItems.size} selected`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectionMode && selectedItems.size > 0 && (
              <>
                <button
                  onClick={deleteSelectedItems}
                  className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </>
            )}
            
            <button
              onClick={() => setSelectionMode(!selectionMode)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                selectionMode 
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos and videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {albums.map(album => (
              <option key={album} value={album}>
                {album === 'all' ? 'All Albums' : album}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="type">Type</option>
          </select>

          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 transition-colors",
                viewMode === 'grid' 
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 transition-colors",
                viewMode === 'list' 
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      <div className="flex-1 p-4 overflow-y-auto">
        {filteredAndSortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Image className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-xl mb-2">No media found</p>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredAndSortedItems.map((item) => (
              <motion.div
                key={item.id}
                className="relative group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div 
                  className={cn(
                    "aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer relative",
                    selectedItems.has(item.id) && "ring-2 ring-blue-500"
                  )}
                  onClick={() => selectionMode ? toggleSelection(item.id) : openDetailView(item)}
                >
                  {item.type === 'video' ? (
                    <div className="relative w-full h-full">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        Video
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Selection indicator */}
                  {selectionMode && (
                    <div className={cn(
                      "absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center",
                      selectedItems.has(item.id) 
                        ? "bg-blue-500 border-blue-500"
                        : "border-white bg-black/20"
                    )}>
                      {selectedItems.has(item.id) && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  )}

                  {/* Favorite indicator */}
                  {item.favorite && (
                    <div className="absolute top-2 right-2">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all opacity-0 group-hover:opacity-100">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <p className="text-white/80 text-xs">{formatFileSize(item.size)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedItems.map((item) => (
              <motion.div
                key={item.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors",
                  selectedItems.has(item.id) && "bg-blue-50 dark:bg-blue-900/20"
                )}
                onClick={() => selectionMode ? toggleSelection(item.id) : openDetailView(item)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                    {item.favorite && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{item.type === 'photo' ? 'Photo' : 'Video'}</span>
                    <span>{formatFileSize(item.size)}</span>
                    <span>{item.timestamp.toLocaleDateString()}</span>
                    {item.album && <span>{item.album}</span>}
                  </div>
                </div>

                {selectionMode && (
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    selectedItems.has(item.id) 
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  )}>
                    {selectedItems.has(item.id) && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail View Modal */}
      <AnimatePresence>
        {showDetails && currentItem && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetails(false)}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 text-white">
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(currentItem.id)}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Heart className={cn(
                      "w-5 h-5",
                      currentItem.favorite ? "text-red-500 fill-red-500" : "text-white"
                    )} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Media Content */}
              <div className="flex-1 flex items-center justify-center p-4">
                {currentItem.type === 'video' ? (
                  <div className="relative">
                    <video
                      src={currentItem.url}
                      className="max-w-full max-h-full"
                      controls
                      autoPlay
                    />
                  </div>
                ) : (
                  <img
                    src={currentItem.url}
                    alt={currentItem.name}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>

              {/* Info */}
              <div className="p-4 bg-black/50 text-white">
                <h2 className="text-xl font-bold mb-2">{currentItem.name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">Type:</span>
                    <span className="ml-2 capitalize">{currentItem.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Size:</span>
                    <span className="ml-2">{formatFileSize(currentItem.size)}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Date:</span>
                    <span className="ml-2">{currentItem.timestamp.toLocaleDateString()}</span>
                  </div>
                  {currentItem.album && (
                    <div>
                      <span className="text-gray-300">Album:</span>
                      <span className="ml-2">{currentItem.album}</span>
                    </div>
                  )}
                </div>
                {currentItem.tags.length > 0 && (
                  <div className="mt-2">
                    <span className="text-gray-300">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {currentItem.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-white/20 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
