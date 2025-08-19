import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, Square, Play, Pause, MoreHorizontal, Trash2, 
  Share2, Download, ArrowLeft, Settings, Volume2,
  FileAudio, Clock, Calendar, Search, Filter,
  Edit3, Save, X, Waves, MicOff
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Recording {
  id: string
  name: string
  url: string
  duration: number
  timestamp: Date
  size: number
  quality: 'low' | 'medium' | 'high'
}

interface RecorderSettings {
  quality: 'low' | 'medium' | 'high'
  autoStop: number // minutes, 0 = no auto stop
  skipSilence: boolean
  enhanceVoice: boolean
}

export const VoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showRename, setShowRename] = useState(false)
  const [newName, setNewName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'duration'>('date')
  const [audioLevel, setAudioLevel] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const durationTimerRef = useRef<NodeJS.Timeout>()

  const [settings, setSettings] = useState<RecorderSettings>({
    quality: 'medium',
    autoStop: 0,
    skipSilence: false,
    enhanceVoice: true
  })

  // Initialize audio
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: settings.enhanceVoice,
          noiseSuppression: settings.enhanceVoice,
          autoGainControl: true,
          sampleRate: settings.quality === 'high' ? 48000 : 
                     settings.quality === 'medium' ? 44100 : 22050
        }
      })
      
      streamRef.current = stream

      // Set up audio analysis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      source.connect(analyser)
      analyserRef.current = analyser
      dataArrayRef.current = dataArray

      return true
    } catch (error) {
      console.error('Microphone access denied:', error)
      return false
    }
  }, [settings.enhanceVoice, settings.quality])

  // Monitor audio levels
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return

    analyserRef.current.getByteTimeDomainData(dataArrayRef.current)
    
    let sum = 0
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const sample = (dataArrayRef.current[i] - 128) / 128
      sum += sample * sample
    }
    
    const rms = Math.sqrt(sum / dataArrayRef.current.length)
    setAudioLevel(rms * 100)

    if (isRecording) {
      animationRef.current = requestAnimationFrame(monitorAudioLevel)
    }
  }, [isRecording])

  // Start recording
  const startRecording = useCallback(async () => {
    const hasAudio = await initializeAudio()
    if (!hasAudio || !streamRef.current) return

    const mimeType = settings.quality === 'high' ? 'audio/webm;codecs=opus' :
                    settings.quality === 'medium' ? 'audio/webm' : 'audio/mp4'

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined
    })

    audioChunksRef.current = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      const newRecording: Recording = {
        id: Date.now().toString(),
        name: `Recording ${recordings.length + 1}`,
        url: audioUrl,
        duration: duration,
        timestamp: new Date(),
        size: audioBlob.size,
        quality: settings.quality
      }

      setRecordings(prev => [newRecording, ...prev])
      setDuration(0)
    }

    mediaRecorder.start(1000) // Collect data every second
    mediaRecorderRef.current = mediaRecorder
    setIsRecording(true)
    setIsPaused(false)

    // Start duration timer
    durationTimerRef.current = setInterval(() => {
      setDuration(prev => prev + 1)
    }, 1000)

    // Start audio level monitoring
    monitorAudioLevel()

    // Auto-stop timer
    if (settings.autoStop > 0) {
      setTimeout(() => {
        stopRecording()
      }, settings.autoStop * 60 * 1000)
    }
  }, [initializeAudio, duration, recordings.length, settings, monitorAudioLevel])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current)
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    setIsRecording(false)
    setIsPaused(false)
    setAudioLevel(0)
  }, [isRecording])

  // Pause/resume recording
  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current) return

    if (isPaused) {
      mediaRecorderRef.current.resume()
      durationTimerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
      setIsPaused(false)
    } else {
      mediaRecorderRef.current.pause()
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
      }
      setIsPaused(true)
    }
  }, [isPaused])

  // Play recording
  const playRecording = useCallback((recording: Recording) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const audio = new Audio(recording.url)
    audioRef.current = audio

    audio.addEventListener('loadedmetadata', () => {
      setSelectedRecording(recording)
      setPlaybackTime(0)
    })

    audio.addEventListener('timeupdate', () => {
      setPlaybackTime(audio.currentTime)
    })

    audio.addEventListener('ended', () => {
      setIsPlaying(false)
      setPlaybackTime(0)
    })

    audio.play()
    setIsPlaying(true)
  }, [])

  // Pause playback
  const pausePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  // Resume playback
  const resumePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [])

  // Delete recording
  const deleteRecording = useCallback((recording: Recording) => {
    URL.revokeObjectURL(recording.url)
    setRecordings(prev => prev.filter(r => r.id !== recording.id))
    
    if (selectedRecording?.id === recording.id) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setSelectedRecording(null)
      setIsPlaying(false)
    }
  }, [selectedRecording])

  // Download recording
  const downloadRecording = useCallback((recording: Recording) => {
    const link = document.createElement('a')
    link.href = recording.url
    link.download = `${recording.name}.wav`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  // Share recording
  const shareRecording = useCallback(async (recording: Recording) => {
    if (navigator.share) {
      try {
        const response = await fetch(recording.url)
        const blob = await response.blob()
        const file = new File([blob], `${recording.name}.wav`, { type: 'audio/wav' })
        
        await navigator.share({
          files: [file],
          title: recording.name
        })
      } catch (error) {
        console.error('Sharing failed:', error)
      }
    }
  }, [])

  // Rename recording
  const renameRecording = useCallback((recording: Recording, newName: string) => {
    setRecordings(prev => 
      prev.map(r => 
        r.id === recording.id ? { ...r, name: newName } : r
      )
    )
    setShowRename(false)
    setNewName('')
  }, [])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Filter and sort recordings
  const filteredRecordings = recordings
    .filter(recording => 
      recording.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'duration':
          return b.duration - a.duration
        case 'date':
        default:
          return b.timestamp.getTime() - a.timestamp.getTime()
      }
    })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Voice Recorder</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {recordings.length} recording{recordings.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Recording Control */}
      <div className="flex-1 flex flex-col">
        {/* Recording Interface */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Audio Level Visualizer */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-1 h-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "w-2 rounded-full",
                    isRecording && !isPaused ? "bg-red-500" : "bg-gray-300 dark:bg-gray-600"
                  )}
                  style={{
                    height: isRecording && !isPaused 
                      ? Math.max(8, (audioLevel * Math.random()) + 8) + 'px'
                      : '8px'
                  }}
                  animate={isRecording && !isPaused ? {
                    height: [8, Math.max(8, (audioLevel * Math.random()) + 8), 8]
                  } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="mb-8 text-center">
            <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-2">
              {formatTime(duration)}
            </div>
            {isRecording && (
              <div className="flex items-center justify-center gap-2 text-red-500">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium">
                  {isPaused ? 'PAUSED' : 'RECORDING'}
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
            {!isRecording ? (
              <motion.button
                onClick={startRecording}
                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mic className="w-8 h-8 text-white" />
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={togglePause}
                  className="w-16 h-16 rounded-full bg-gray-500 hover:bg-gray-600 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPaused ? (
                    <Mic className="w-6 h-6 text-white" />
                  ) : (
                    <Pause className="w-6 h-6 text-white" />
                  )}
                </motion.button>

                <motion.button
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Square className="w-8 h-8 text-white fill-white" />
                </motion.button>
              </>
            )}
          </div>

          {/* Recording Quality Indicator */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Quality: <span className="font-medium capitalize">{settings.quality}</span>
            </div>
          </div>
        </div>

        {/* Recordings List */}
        {recordings.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search recordings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>

            {/* Recordings */}
            <div className="max-h-64 overflow-y-auto">
              {filteredRecordings.map((recording) => (
                <div
                  key={recording.id}
                  className={cn(
                    "flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                    selectedRecording?.id === recording.id && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FileAudio className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {recording.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {formatTime(recording.duration)}
                        <span>•</span>
                        {formatFileSize(recording.size)}
                        <span>•</span>
                        {recording.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (selectedRecording?.id === recording.id && isPlaying) {
                          pausePlayback()
                        } else if (selectedRecording?.id === recording.id && !isPlaying) {
                          resumePlayback()
                        } else {
                          playRecording(recording)
                        }
                      }}
                      className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white"
                    >
                      {selectedRecording?.id === recording.id && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>

                    <div className="relative">
                      <button className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center">
                        <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                      
                      {/* Action Menu */}
                      <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px] z-10 hidden">
                        <button
                          onClick={() => {
                            setNewName(recording.name)
                            setShowRename(true)
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Rename
                        </button>
                        <button
                          onClick={() => shareRecording(recording)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                        <button
                          onClick={() => downloadRecording(recording)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => deleteRecording(recording)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Recording Quality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recording Quality
                  </label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map((quality) => (
                      <button
                        key={quality}
                        onClick={() => setSettings(prev => ({ ...prev, quality: quality as any }))}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          settings.quality === quality
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {quality.charAt(0).toUpperCase() + quality.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Stop */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Auto Stop (minutes)
                  </label>
                  <select
                    value={settings.autoStop}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoStop: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={0}>Never</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>

                {/* Voice Enhancement */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Voice Enhancement
                  </label>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, enhanceVoice: !prev.enhanceVoice }))}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors",
                      settings.enhanceVoice ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full transition-transform",
                      settings.enhanceVoice ? "translate-x-6" : "translate-x-0.5"
                    )} />
                  </button>
                </div>

                {/* Skip Silence */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Skip Silence
                  </label>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, skipSilence: !prev.skipSilence }))}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors",
                      settings.skipSilence ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full transition-transform",
                      settings.skipSilence ? "translate-x-6" : "translate-x-0.5"
                    )} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rename Modal */}
      <AnimatePresence>
        {showRename && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Rename Recording
              </h2>
              
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRename(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedRecording) {
                      renameRecording(selectedRecording, newName)
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
