import React, { useState, useEffect, useRef } from 'react'
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
  Heart,
  MoreHorizontal,
  Search,
  Home,
  Library,
  Plus,
  Download,
  Share,
  Music,
  Disc3,
  Clock,
  TrendingUp,
  Star,
  ChevronLeft,
  ChevronRight,
  Radio,
  ExternalLink,
  Upload,
  Loader2,
  AlertCircle,
  Mic
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/store/theme-store'

interface ResoNyxProps {
  windowId: string
}

interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  durationSeconds: number
  coverUrl: string
  audioUrl: string
  isLiked: boolean
  plays: number
  source: 'jamendo' | 'freemusicarchive' | 'url' | 'radio'
  genre?: string
  license?: string
}

interface Playlist {
  id: string
  name: string
  description: string
  tracks: Track[]
  coverUrl: string
  isFollowing: boolean
}

export const ResoNyx: React.FC<ResoNyxProps> = ({ windowId }) => {
  const { settings } = useThemeStore()
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'library' | 'playlist' | 'url-input'>('home')
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off')
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Track[]>([])
  const [customUrl, setCustomUrl] = useState('')
  const [radioStations, setRadioStations] = useState<Track[]>([])
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)

  // Real music tracks from various internet sources
  const [featuredTracks, setFeaturedTracks] = useState<Track[]>([
    // Free Music Archive samples
    {
      id: 'fma-1',
      title: 'Chill Abstract',
      artist: 'Lakey Inspired',
      album: 'Free Music',
      duration: '2:38',
      durationSeconds: 158,
      audioUrl: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3',
      coverUrl: '/api/placeholder/300/300',
      isLiked: false,
      plays: 125000,
      source: 'freemusicarchive',
      genre: 'Electronic',
      license: 'CC BY'
    },
    {
      id: 'fma-2',
      title: 'Something Elated',
      artist: 'Broke For Free',
      album: 'Directionless EP',
      duration: '4:12',
      durationSeconds: 252,
      audioUrl: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_02_-_Something_Elated.mp3',
      coverUrl: '/api/placeholder/300/300',
      isLiked: true,
      plays: 89000,
      source: 'freemusicarchive',
      genre: 'Electronic',
      license: 'CC BY'
    },
    // Internet Radio Stations
    {
      id: 'radio-1',
      title: 'Lofi Hip Hop Radio',
      artist: 'ChilledCow',
      album: 'Live Stream',
      duration: '∞',
      durationSeconds: 0,
      audioUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', // Will be converted to audio stream
      coverUrl: '/api/placeholder/300/300',
      isLiked: true,
      plays: 0,
      source: 'radio',
      genre: 'Lo-Fi',
      license: 'Streaming'
    },
    // Sample high-quality free tracks
    {
      id: 'sample-1',
      title: 'Cosmic Journey',
      artist: 'Space Ambient',
      album: 'Universe Sounds',
      duration: '5:30',
      durationSeconds: 330,
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder - will be replaced with real music APIs
      coverUrl: '/api/placeholder/300/300',
      isLiked: false,
      plays: 45000,
      source: 'url',
      genre: 'Ambient',
      license: 'Free'
    }
  ])

  // Popular radio stations
  const popularRadioStations: Track[] = [
    {
      id: 'radio-jazz',
      title: 'Smooth Jazz Radio',
      artist: 'Jazz Radio',
      album: 'Live Stream',
      duration: '∞',
      durationSeconds: 0,
      audioUrl: 'http://jazz-wr04.ice.infomaniak.ch/jazz-wr04-128.mp3',
      coverUrl: '/api/placeholder/300/300',
      isLiked: false,
      plays: 0,
      source: 'radio',
      genre: 'Jazz',
      license: 'Streaming'
    },
    {
      id: 'radio-classical',
      title: 'Classical Music Radio',
      artist: 'Classical Radio',
      album: 'Live Stream',
      duration: '∞',
      durationSeconds: 0,
      audioUrl: 'http://stream.radiojar.com/4wqre23fytzuv',
      coverUrl: '/api/placeholder/300/300',
      isLiked: false,
      plays: 0,
      source: 'radio',
      genre: 'Classical',
      license: 'Streaming'
    },
    {
      id: 'radio-electronic',
      title: 'Electronic Music Radio',
      artist: 'Electronic Radio',
      album: 'Live Stream',
      duration: '∞',
      durationSeconds: 0,
      audioUrl: 'http://stream.zeno.fm/f3wvbbqmdg8uv',
      coverUrl: '/api/placeholder/300/300',
      isLiked: false,
      plays: 0,
      source: 'radio',
      genre: 'Electronic',
      license: 'Streaming'
    }
  ]

  const samplePlaylists: Playlist[] = [
    {
      id: '1',
      name: 'Night Mode',
      description: 'Perfect for late-night coding sessions',
      tracks: sampleTracks.slice(0, 3),
      coverUrl: '/api/placeholder/300/300',
      isFollowing: true
    },
    {
      id: '2',
      name: 'Cosmic Chill',
      description: 'Relaxing space ambient sounds',
      tracks: sampleTracks.slice(1, 4),
      coverUrl: '/api/placeholder/300/300',
      isFollowing: false
    },
    {
      id: '3',
      name: 'Nyx Vibes',
      description: 'Feel the music, live the vibe',
      tracks: sampleTracks,
      coverUrl: '/api/placeholder/300/300',
      isFollowing: true
    }
  ]

  // Set default current track
  useEffect(() => {
    if (!currentTrack && sampleTracks.length > 0) {
      setCurrentTrack(sampleTracks[0])
    }
  }, [])

  // Simulate progress
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 0.5
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isPlaying])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track)
    setProgress(0)
    setIsPlaying(true)
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    setIsMuted(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const isDark = settings.mode === 'dark'

  // ResoNyx Logo Component
  const ResoNyxLogo = () => (
    <div className="flex items-center gap-3">
      <div className="relative">
        {/* Moon shape */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 relative overflow-hidden">
          {/* Craters */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-purple-600/60" />
          <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-purple-600/40" />
          
          {/* Music note */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Music className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
      <div>
        <div className="text-lg font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
          ResoNyx
        </div>
        <div className="text-xs text-purple-400/70 -mt-1">
          feel the music, live the vibe
        </div>
      </div>
    </div>
  )

  const Sidebar = () => (
    <div className={cn(
      "w-64 flex flex-col",
      isDark ? "bg-black/60" : "bg-white/60"
    )}>
      <div className="p-6">
        <ResoNyxLogo />
      </div>

      <nav className="flex-1 px-3">
        <div className="space-y-1">
          <button
            onClick={() => setCurrentView('home')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
              currentView === 'home'
                ? "bg-purple-500/20 text-purple-300"
                : isDark
                  ? "text-gray-300 hover:text-white hover:bg-white/5"
                  : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
            )}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
          
          <button
            onClick={() => setCurrentView('search')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
              currentView === 'search'
                ? "bg-purple-500/20 text-purple-300"
                : isDark
                  ? "text-gray-300 hover:text-white hover:bg-white/5"
                  : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
            )}
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
          
          <button
            onClick={() => setCurrentView('library')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
              currentView === 'library'
                ? "bg-purple-500/20 text-purple-300"
                : isDark
                  ? "text-gray-300 hover:text-white hover:bg-white/5"
                  : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
            )}
          >
            <Library className="w-5 h-5" />
            <span>Your Library</span>
          </button>
        </div>

        <div className="mt-8">
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
              isDark
                ? "text-gray-300 hover:text-white hover:bg-white/5"
                : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
            )}
          >
            <Plus className="w-5 h-5" />
            <span>Create Playlist</span>
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {samplePlaylists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => {
                setSelectedPlaylist(playlist)
                setCurrentView('playlist')
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg transition-colors",
                isDark
                  ? "text-gray-400 hover:text-white hover:bg-white/5"
                  : "text-gray-500 hover:text-gray-900 hover:bg-black/5"
              )}
            >
              <div className="text-sm">{playlist.name}</div>
              <div className="text-xs opacity-70">{playlist.tracks.length} songs</div>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )

  const HomeView = () => (
    <div className="space-y-8">
      <div>
        <h1 className={cn(
          "text-3xl font-bold mb-2",
          isDark ? "text-white" : "text-gray-900"
        )}>
          Good evening
        </h1>
        <p className={cn(
          "text-lg",
          isDark ? "text-gray-300" : "text-gray-600"
        )}>
          What would you like to listen to tonight?
        </p>
      </div>

      <div>
        <h2 className={cn(
          "text-xl font-semibold mb-4",
          isDark ? "text-white" : "text-gray-900"
        )}>
          Recently played
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {samplePlaylists.map((playlist) => (
            <motion.button
              key={playlist.id}
              onClick={() => {
                setSelectedPlaylist(playlist)
                setCurrentView('playlist')
              }}
              className={cn(
                "p-4 rounded-lg transition-colors group text-left",
                isDark
                  ? "bg-white/5 hover:bg-white/10"
                  : "bg-black/5 hover:bg-black/10"
              )}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 mb-3 flex items-center justify-center">
                <Music className="w-12 h-12 text-white" />
              </div>
              <h3 className={cn(
                "font-medium mb-1",
                isDark ? "text-white" : "text-gray-900"
              )}>
                {playlist.name}
              </h3>
              <p className={cn(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                {playlist.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <h2 className={cn(
          "text-xl font-semibold mb-4",
          isDark ? "text-white" : "text-gray-900"
        )}>
          Trending now
        </h2>
        <div className="space-y-2">
          {sampleTracks.slice(0, 5).map((track, index) => (
            <motion.div
              key={track.id}
              onClick={() => handleTrackSelect(track)}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors group",
                isDark
                  ? "hover:bg-white/5"
                  : "hover:bg-black/5"
              )}
              whileHover={{ x: 4 }}
            >
              <div className="w-8 text-center">
                <span className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}>
                  {index + 1}
                </span>
              </div>
              <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className={cn(
                  "font-medium",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  {track.title}
                </div>
                <div className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}>
                  {track.artist}
                </div>
              </div>
              <div className={cn(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                {track.duration}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Toggle like
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Heart className={cn(
                  "w-5 h-5",
                  track.isLiked ? "text-purple-400 fill-current" : isDark ? "text-gray-400" : "text-gray-600"
                )} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const PlaylistView = () => {
    if (!selectedPlaylist) return null

    return (
      <div>
        <div className="flex items-end gap-6 mb-8">
          <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <Music className="w-24 h-24 text-white" />
          </div>
          <div>
            <p className={cn(
              "text-sm font-medium mb-2",
              isDark ? "text-gray-300" : "text-gray-600"
            )}>
              PLAYLIST
            </p>
            <h1 className={cn(
              "text-4xl font-bold mb-4",
              isDark ? "text-white" : "text-gray-900"
            )}>
              {selectedPlaylist.name}
            </h1>
            <p className={cn(
              "text-lg mb-2",
              isDark ? "text-gray-300" : "text-gray-600"
            )}>
              {selectedPlaylist.description}
            </p>
            <p className={cn(
              "text-sm",
              isDark ? "text-gray-400" : "text-gray-600"
            )}>
              {selectedPlaylist.tracks.length} songs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <motion.button
            onClick={() => {
              if (selectedPlaylist.tracks.length > 0) {
                handleTrackSelect(selectedPlaylist.tracks[0])
              }
            }}
            className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-6 h-6 text-white ml-1" />
          </motion.button>
          <button
            className={cn(
              "w-8 h-8 flex items-center justify-center",
              isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Heart className="w-6 h-6" />
          </button>
          <button
            className={cn(
              "w-8 h-8 flex items-center justify-center",
              isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-1">
          {selectedPlaylist.tracks.map((track, index) => (
            <motion.div
              key={track.id}
              onClick={() => handleTrackSelect(track)}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors group",
                currentTrack?.id === track.id
                  ? "bg-purple-500/20"
                  : isDark
                    ? "hover:bg-white/5"
                    : "hover:bg-black/5"
              )}
              whileHover={{ x: 4 }}
            >
              <div className="w-8 text-center">
                {currentTrack?.id === track.id && isPlaying ? (
                  <div className="flex items-center justify-center">
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-purple-400 rounded animate-pulse" />
                      <div className="w-1 h-3 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-5 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                ) : (
                  <span className={cn(
                    "text-sm",
                    currentTrack?.id === track.id
                      ? "text-purple-400"
                      : isDark ? "text-gray-400" : "text-gray-600"
                  )}>
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className={cn(
                  "font-medium",
                  currentTrack?.id === track.id
                    ? "text-purple-400"
                    : isDark ? "text-white" : "text-gray-900"
                )}>
                  {track.title}
                </div>
                <div className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}>
                  {track.artist}
                </div>
              </div>
              <div className={cn(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                {track.duration}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Toggle like
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Heart className={cn(
                  "w-5 h-5",
                  track.isLiked ? "text-purple-400 fill-current" : isDark ? "text-gray-400" : "text-gray-600"
                )} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  const MainContent = () => (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-6 overflow-y-auto">
        {currentView === 'home' && <HomeView />}
        {currentView === 'playlist' && <PlaylistView />}
        {currentView === 'search' && (
          <div className="text-center py-12">
            <Search className={cn(
              "w-16 h-16 mx-auto mb-4",
              isDark ? "text-gray-600" : "text-gray-400"
            )} />
            <h2 className={cn(
              "text-xl font-semibold mb-2",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Search for music
            </h2>
            <p className={cn(
              isDark ? "text-gray-400" : "text-gray-600"
            )}>
              Find your favorite songs, artists, and playlists
            </p>
          </div>
        )}
        {currentView === 'library' && (
          <div className="text-center py-12">
            <Library className={cn(
              "w-16 h-16 mx-auto mb-4",
              isDark ? "text-gray-600" : "text-gray-400"
            )} />
            <h2 className={cn(
              "text-xl font-semibold mb-2",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Your Library
            </h2>
            <p className={cn(
              isDark ? "text-gray-400" : "text-gray-600"
            )}>
              Your playlists, liked songs, and downloaded music
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const PlayerControls = () => (
    <div className={cn(
      "h-20 border-t backdrop-blur-md flex items-center px-6",
      isDark 
        ? "bg-black/80 border-gray-800" 
        : "bg-white/80 border-gray-200"
    )}>
      {currentTrack && (
        <>
          {/* Now Playing */}
          <div className="flex items-center gap-3 min-w-0 w-1/4">
            <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className={cn(
                "font-medium truncate",
                isDark ? "text-white" : "text-gray-900"
              )}>
                {currentTrack.title}
              </div>
              <div className={cn(
                "text-sm truncate",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                {currentTrack.artist}
              </div>
            </div>
            <button className={cn(
              "ml-2",
              isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
            )}>
              <Heart className={cn(
                "w-5 h-5",
                currentTrack.isLiked ? "text-purple-400 fill-current" : ""
              )} />
            </button>
          </div>

          {/* Main Controls */}
          <div className="flex-1 flex flex-col items-center gap-2 max-w-lg mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShuffle(!shuffle)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center transition-colors",
                  shuffle
                    ? "text-purple-400"
                    : isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              
              <button className={cn(
                "w-8 h-8 flex items-center justify-center",
                isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
              )}>
                <SkipBack className="w-5 h-5" />
              </button>
              
              <motion.button
                onClick={handlePlayPause}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-black" />
                ) : (
                  <Play className="w-5 h-5 text-black ml-0.5" />
                )}
              </motion.button>
              
              <button className={cn(
                "w-8 h-8 flex items-center justify-center",
                isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
              )}>
                <SkipForward className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')}
                className={cn(
                  "w-8 h-8 flex items-center justify-center transition-colors",
                  repeat !== 'off'
                    ? "text-purple-400"
                    : isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex items-center gap-2">
              <span className={cn(
                "text-xs w-10 text-right",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                {Math.floor(progress * 0.01 * 242 / 60)}:{String(Math.floor(progress * 0.01 * 242 % 60)).padStart(2, '0')}
              </span>
              <div className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden group cursor-pointer">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-violet-400 transition-all group-hover:from-purple-300 group-hover:to-violet-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={cn(
                "text-xs w-10",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                {currentTrack.duration}
              </span>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center gap-2 w-1/4 justify-end">
            <button
              onClick={toggleMute}
              className={cn(
                isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
              )}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <div className="w-24 h-1 bg-gray-600 rounded-full overflow-hidden group cursor-pointer">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-violet-400 transition-all group-hover:from-purple-300 group-hover:to-violet-300"
                style={{ width: `${isMuted ? 0 : volume}%` }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className={cn(
      "h-full flex flex-col backdrop-blur-xl",
      isDark 
        ? "bg-gray-950/90 text-white" 
        : "bg-white/90 text-gray-900"
    )}>
      <div className="flex-1 flex min-h-0">
        <Sidebar />
        <MainContent />
      </div>
      <PlayerControls />
      
      <audio ref={audioRef} />
    </div>
  )
}
