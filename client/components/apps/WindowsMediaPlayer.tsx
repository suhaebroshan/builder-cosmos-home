import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Shuffle, 
  Repeat,
  List,
  Search,
  Folder,
  Download,
  Music,
  Radio,
  Disc,
  Maximize2,
  Minimize2,
  X,
  MoreHorizontal,
  Heart,
  Plus,
  Settings,
  Upload,
  ExternalLink,
  Loader2,
  AlertCircle,
  HardDrive,
  Globe,
  Mic,
  Headphones
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/store/theme-store'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'

interface WindowsMediaPlayerProps {
  windowId: string
}

interface AudioTrack {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  src: string
  cover?: string
  genre?: string
  year?: number
  bitrate?: string
  format?: string
  size?: string
}

interface Playlist {
  id: string
  name: string
  tracks: AudioTrack[]
  isDefault?: boolean
}

// Real working audio sources
const DEFAULT_TRACKS: AudioTrack[] = [
  {
    id: '1',
    title: 'Night Owl',
    artist: 'Broke For Free',
    album: 'Directionless EP',
    duration: 158,
    src: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3',
    cover: '/api/placeholder/300/300',
    genre: 'Electronic',
    year: 2012,
    bitrate: '320kbps',
    format: 'MP3'
  },
  {
    id: '2',
    title: 'Something Elated',
    artist: 'Broke For Free',
    album: 'Directionless EP', 
    duration: 252,
    src: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_02_-_Something_Elated.mp3',
    cover: '/api/placeholder/300/300',
    genre: 'Electronic',
    year: 2012,
    bitrate: '320kbps',
    format: 'MP3'
  },
  {
    id: '3',
    title: 'As Colorful as Ever',
    artist: 'Broke For Free',
    album: 'Directionless EP',
    duration: 180,
    src: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_03_-_As_Colorful_as_Ever.mp3',
    cover: '/api/placeholder/300/300',
    genre: 'Electronic',
    year: 2012,
    bitrate: '320kbps',
    format: 'MP3'
  },
  {
    id: '4',
    title: 'Mellow Waves',
    artist: 'Josh Lippi & The Overtimers',
    album: 'Instrumental',
    duration: 195,
    src: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Josh_Lippi__The_Overtimers/The_Story_Starts/Josh_Lippi__The_Overtimers_-_05_-_Mellow_Waves.mp3',
    cover: '/api/placeholder/300/300',
    genre: 'Instrumental',
    year: 2014,
    bitrate: '320kbps',
    format: 'MP3'
  }
]

// Radio stations
const RADIO_STATIONS: AudioTrack[] = [
  {
    id: 'radio-1',
    title: 'Smooth Jazz 24/7',
    artist: 'Jazz Radio Network',
    album: 'Live Stream',
    duration: 0,
    src: 'http://jazz-wr04.ice.infomaniak.ch/jazz-wr04-128.mp3',
    cover: '/api/placeholder/300/300',
    genre: 'Jazz',
    format: 'Stream'
  },
  {
    id: 'radio-2',
    title: 'Classical Music Radio',
    artist: 'Classical Network',
    album: 'Live Stream',
    duration: 0,
    src: 'http://stream.radiojar.com/4wqre23fytzuv',
    cover: '/api/placeholder/300/300',
    genre: 'Classical',
    format: 'Stream'
  },
  {
    id: 'radio-3',
    title: 'Electronic Beats',
    artist: 'Electronic Radio',
    album: 'Live Stream',
    duration: 0,
    src: 'http://stream.zeno.fm/f3wvbbqmdg8uv',
    cover: '/api/placeholder/300/300',
    genre: 'Electronic',
    format: 'Stream'
  }
]

export const WindowsMediaPlayer: React.FC<WindowsMediaPlayerProps> = ({ windowId }) => {
  const { settings } = useThemeStore()
  const { isPhone, isTablet } = useDeviceDetection()
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // State management
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<'none' | 'all' | 'one'>('none')
  
  // UI State
  const [currentView, setCurrentView] = useState<'now-playing' | 'library' | 'playlists' | 'radio' | 'search'>('now-playing')
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { id: 'default', name: 'My Music', tracks: DEFAULT_TRACKS, isDefault: true },
    { id: 'radio', name: 'Radio Stations', tracks: RADIO_STATIONS, isDefault: true }
  ])
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist>(playlists[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [isAddingUrl, setIsAddingUrl] = useState(false)
  
  // Responsive layout
  const isMobile = isPhone
  const isCompact = isPhone || isTablet

  // Audio event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
      setIsLoading(false)
      setError(null)
    }
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }, [])

  const handleEnded = useCallback(() => {
    if (repeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    } else {
      const currentIndex = currentPlaylist.tracks.findIndex(track => track.id === currentTrack?.id)
      const nextIndex = currentIndex + 1
      
      if (nextIndex < currentPlaylist.tracks.length) {
        playTrack(currentPlaylist.tracks[nextIndex])
      } else if (repeat === 'all') {
        playTrack(currentPlaylist.tracks[0])
      } else {
        setIsPlaying(false)
      }
    }
  }, [currentTrack, currentPlaylist, repeat])

  const handleError = useCallback(() => {
    setError('Failed to load audio file')
    setIsPlaying(false)
    setIsLoading(false)
  }, [])

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadstart', () => setIsLoading(true))
    audio.addEventListener('canplay', () => setIsLoading(false))

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [handleLoadedMetadata, handleTimeUpdate, handleEnded, handleError])

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // Initialize with first track
  useEffect(() => {
    if (!currentTrack && DEFAULT_TRACKS.length > 0) {
      setCurrentTrack(DEFAULT_TRACKS[0])
    }
  }, [currentTrack])

  // Play/Pause functions
  const togglePlayback = async () => {
    if (!audioRef.current || !currentTrack) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err) {
      setError('Playback failed')
    }
  }

  const playTrack = async (track: AudioTrack) => {
    if (!audioRef.current) return

    setCurrentTrack(track)
    setIsLoading(true)
    setError(null)
    
    audioRef.current.src = track.src
    audioRef.current.load()

    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch (err) {
      setError('Failed to play track')
      setIsLoading(false)
    }
  }

  const skipNext = () => {
    const currentIndex = currentPlaylist.tracks.findIndex(track => track.id === currentTrack?.id)
    const nextIndex = shuffle 
      ? Math.floor(Math.random() * currentPlaylist.tracks.length)
      : (currentIndex + 1) % currentPlaylist.tracks.length
    
    if (currentPlaylist.tracks[nextIndex]) {
      playTrack(currentPlaylist.tracks[nextIndex])
    }
  }

  const skipPrevious = () => {
    const currentIndex = currentPlaylist.tracks.findIndex(track => track.id === currentTrack?.id)
    const prevIndex = shuffle 
      ? Math.floor(Math.random() * currentPlaylist.tracks.length)
      : currentIndex > 0 ? currentIndex - 1 : currentPlaylist.tracks.length - 1
    
    if (currentPlaylist.tracks[prevIndex]) {
      playTrack(currentPlaylist.tracks[prevIndex])
    }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const addCustomTrack = async () => {
    if (!customUrl.trim()) return

    const newTrack: AudioTrack = {
      id: `custom-${Date.now()}`,
      title: 'Custom Track',
      artist: 'Unknown Artist',
      album: 'Custom',
      duration: 0,
      src: customUrl,
      format: 'Unknown'
    }

    const updatedPlaylist = {
      ...currentPlaylist,
      tracks: [...currentPlaylist.tracks, newTrack]
    }

    setCurrentPlaylist(updatedPlaylist)
    setPlaylists(prev => prev.map(p => p.id === currentPlaylist.id ? updatedPlaylist : p))
    setCustomUrl('')
    setIsAddingUrl(false)
    
    await playTrack(newTrack)
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={cn(
      "h-full flex flex-col",
      settings.mode === 'dark' ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900",
      "border border-gray-300"
    )}>
      {/* Windows-style Menu Bar */}
      <div className={cn(
        "h-8 flex items-center px-2 text-xs border-b",
        settings.mode === 'dark' ? "bg-gray-800 border-gray-700" : "bg-gray-200 border-gray-300"
      )}>
        <div className="flex space-x-4">
          <span className="hover:bg-blue-500 hover:text-white px-2 py-1 cursor-pointer">File</span>
          <span className="hover:bg-blue-500 hover:text-white px-2 py-1 cursor-pointer">View</span>
          <span className="hover:bg-blue-500 hover:text-white px-2 py-1 cursor-pointer">Play</span>
          <span className="hover:bg-blue-500 hover:text-white px-2 py-1 cursor-pointer">Tools</span>
          <span className="hover:bg-blue-500 hover:text-white px-2 py-1 cursor-pointer">Help</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation - Hidden on mobile */}
        {!isMobile && (
          <div className={cn(
            "w-48 border-r flex flex-col",
            settings.mode === 'dark' ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"
          )}>
            <div className="p-3">
              <h3 className="text-sm font-semibold mb-2">Library</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setCurrentView('now-playing')}
                  className={cn(
                    "w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-500 hover:text-white",
                    currentView === 'now-playing' && "bg-blue-500 text-white"
                  )}
                >
                  <Music className="w-3 h-3 inline mr-2" />
                  Now Playing
                </button>
                <button
                  onClick={() => setCurrentView('library')}
                  className={cn(
                    "w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-500 hover:text-white",
                    currentView === 'library' && "bg-blue-500 text-white"
                  )}
                >
                  <HardDrive className="w-3 h-3 inline mr-2" />
                  Music Library
                </button>
                <button
                  onClick={() => setCurrentView('radio')}
                  className={cn(
                    "w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-500 hover:text-white",
                    currentView === 'radio' && "bg-blue-500 text-white"
                  )}
                >
                  <Radio className="w-3 h-3 inline mr-2" />
                  Radio
                </button>
                <button
                  onClick={() => setCurrentView('search')}
                  className={cn(
                    "w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-500 hover:text-white",
                    currentView === 'search' && "bg-blue-500 text-white"
                  )}
                >
                  <Search className="w-3 h-3 inline mr-2" />
                  Search
                </button>
              </div>
            </div>

            <div className="p-3 border-t border-gray-300">
              <h3 className="text-sm font-semibold mb-2">Playlists</h3>
              <div className="space-y-1">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => setCurrentPlaylist(playlist)}
                    className={cn(
                      "w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-500 hover:text-white truncate",
                      currentPlaylist.id === playlist.id && "bg-blue-500 text-white"
                    )}
                  >
                    <List className="w-3 h-3 inline mr-2" />
                    {playlist.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content Area */}
          <div className="flex-1 overflow-auto p-4">
            {currentView === 'now-playing' && (
              <div className={cn("space-y-6", isCompact && "space-y-4")}>
                {/* Current Track Display */}
                {currentTrack && (
                  <div className="text-center">
                    <div className={cn(
                      "mx-auto rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg",
                      isMobile ? "w-48 h-48" : isCompact ? "w-32 h-32" : "w-64 h-64"
                    )}>
                      <Music className={cn("text-white", isMobile ? "w-24 h-24" : isCompact ? "w-16 h-16" : "w-32 h-32")} />
                    </div>
                    <h2 className={cn("font-bold mb-2 px-4", isMobile ? "text-xl" : isCompact ? "text-lg" : "text-3xl")}>{currentTrack.title}</h2>
                    <p className={cn("mb-2 px-4", isMobile ? "text-lg" : isCompact ? "text-sm" : "text-xl")}>{currentTrack.artist}</p>
                    <p className={cn("text-gray-500 px-4", isMobile ? "text-sm" : isCompact ? "text-xs" : "text-lg")}>{currentTrack.album}</p>
                    {currentTrack.year && (
                      <p className={cn("text-gray-400 mt-2 px-4", isMobile ? "text-sm" : "text-xs")}>
                        {currentTrack.year} • {currentTrack.genre} • {currentTrack.format}
                      </p>
                    )}
                  </div>
                )}

                {/* Track Info */}
                {!isCompact && currentTrack && (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Track Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Duration: {formatTime(currentTrack.duration)}</div>
                      <div>Bitrate: {currentTrack.bitrate || 'Unknown'}</div>
                      <div>Format: {currentTrack.format || 'Unknown'}</div>
                      <div>Genre: {currentTrack.genre || 'Unknown'}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentView === 'library' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Music Library</h2>
                  <button
                    onClick={() => setIsAddingUrl(true)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add URL
                  </button>
                </div>

                <div className="space-y-2">
                  {currentPlaylist.tracks.map((track, index) => (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className={cn(
                        "flex items-center rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                        currentTrack?.id === track.id && "bg-blue-100 dark:bg-blue-900",
                        isMobile ? "p-3" : "p-2"
                      )}
                    >
                      {!isMobile && <div className="w-8 text-center text-sm">{index + 1}</div>}
                      <div className={cn(
                        "bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center mr-3",
                        isMobile ? "w-12 h-12" : "w-10 h-10"
                      )}>
                        <Music className={cn("text-white", isMobile ? "w-6 h-6" : "w-5 h-5")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn("font-medium truncate", isMobile && "text-lg")}>{track.title}</div>
                        <div className={cn("text-gray-500 truncate", isMobile ? "text-base" : "text-sm")}>{track.artist}</div>
                      </div>
                      <div className={cn("text-gray-500 ml-2", isMobile ? "text-base" : "text-sm")}>{formatTime(track.duration)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentView === 'radio' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Radio Stations</h2>
                <div className="space-y-2">
                  {RADIO_STATIONS.map((station) => (
                    <div
                      key={station.id}
                      onClick={() => playTrack(station)}
                      className={cn(
                        "flex items-center p-3 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700",
                        currentTrack?.id === station.id && "bg-blue-100 dark:bg-blue-900"
                      )}
                    >
                      <Radio className="w-8 h-8 text-blue-500 mr-3" />
                      <div className="flex-1">
                        <div className="font-medium">{station.title}</div>
                        <div className="text-sm text-gray-500">{station.genre} • Live Stream</div>
                      </div>
                      <div className="text-sm text-green-500">LIVE</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentView === 'search' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Add Music</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Add Audio URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://example.com/song.mp3"
                        className="flex-1 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                      />
                      <button
                        onClick={addCustomTrack}
                        disabled={!customUrl.trim()}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Supported Formats</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• MP3, WAV, OGG, AAC audio files</li>
                      <li>• Direct streaming URLs</li>
                      <li>• Internet radio stations</li>
                      <li>• Make sure URLs are CORS-enabled</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className={cn(
            "border-t p-3",
            settings.mode === 'dark' ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"
          )}>
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center space-x-2 text-xs">
                <span className="w-12 text-right">{formatTime(currentTime)}</span>
                <div
                  className="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded cursor-pointer"
                  onClick={seek}
                >
                  <div
                    className="h-full bg-blue-500 rounded"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="w-12">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Transport Controls */}
                <button
                  onClick={skipPrevious}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlayback}
                  disabled={!currentTrack || isLoading}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={skipNext}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Additional Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShuffle(!shuffle)}
                  className={cn(
                    "p-1 rounded",
                    shuffle ? "bg-blue-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRepeat(repeat === 'none' ? 'all' : repeat === 'all' ? 'one' : 'none')}
                  className={cn(
                    "p-1 rounded",
                    repeat !== 'none' ? "bg-blue-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  <Repeat className="w-4 h-4" />
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value))
                      setIsMuted(false)
                    }}
                    className="w-16"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobile && (
        <div className={cn(
          "border-t flex justify-around py-2",
          settings.mode === 'dark' ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"
        )}>
          <button
            onClick={() => setCurrentView('now-playing')}
            className={cn(
              "flex flex-col items-center px-3 py-1 rounded",
              currentView === 'now-playing' ? "bg-blue-500 text-white" : "text-gray-600"
            )}
          >
            <Music className="w-4 h-4" />
            <span className="text-xs">Playing</span>
          </button>
          <button
            onClick={() => setCurrentView('library')}
            className={cn(
              "flex flex-col items-center px-3 py-1 rounded",
              currentView === 'library' ? "bg-blue-500 text-white" : "text-gray-600"
            )}
          >
            <List className="w-4 h-4" />
            <span className="text-xs">Library</span>
          </button>
          <button
            onClick={() => setCurrentView('radio')}
            className={cn(
              "flex flex-col items-center px-3 py-1 rounded",
              currentView === 'radio' ? "bg-blue-500 text-white" : "text-gray-600"
            )}
          >
            <Radio className="w-4 h-4" />
            <span className="text-xs">Radio</span>
          </button>
          <button
            onClick={() => setCurrentView('search')}
            className={cn(
              "flex flex-col items-center px-3 py-1 rounded",
              currentView === 'search' ? "bg-blue-500 text-white" : "text-gray-600"
            )}
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs">Add</span>
          </button>
        </div>
      )}

      {/* Audio Element */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="metadata"
      />

      {/* Error Display */}
      {error && (
        <motion.div
          className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          onClick={() => setError(null)}
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Add URL Modal */}
      {isAddingUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Add Audio URL</h3>
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/song.mp3"
              className="w-full px-3 py-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsAddingUrl(false)
                  setCustomUrl('')
                }}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={addCustomTrack}
                disabled={!customUrl.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
