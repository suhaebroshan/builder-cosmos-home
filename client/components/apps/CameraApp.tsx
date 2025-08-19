import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, Video, RotateCcw, Zap, ZapOff, Settings, 
  Download, Share2, X, FlipHorizontal, Maximize2,
  ZoomIn, ZoomOut, Circle, Square, Palette, Sparkles,
  Timer, Grid3X3, Sun, Moon, Volume2, VolumeX,
  ArrowLeft, MoreHorizontal, Edit, Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePerformanceManager } from '@/hooks/usePerformanceManager'

interface CapturedMedia {
  id: string
  type: 'photo' | 'video'
  url: string
  timestamp: Date
  edited?: boolean
}

interface CameraSettings {
  flash: 'auto' | 'on' | 'off'
  timer: 0 | 3 | 10
  grid: boolean
  sound: boolean
  hdr: boolean
  nightMode: boolean
}

export const CameraApp: React.FC = () => {
  const [mode, setMode] = useState<'photo' | 'video' | 'portrait' | 'night' | 'pro'>('photo')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [flash, setFlash] = useState<'auto' | 'on' | 'off'>('auto')
  const [showSettings, setShowSettings] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia[]>([])
  const [showEditMode, setShowEditMode] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<CapturedMedia | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recordingRef = useRef<MediaRecorder | null>(null)
  const recordingTimer = useRef<NodeJS.Timeout>()
  
  const { profile } = usePerformanceManager()

  // Camera settings
  const [settings, setSettings] = useState<CameraSettings>({
    flash: 'auto',
    timer: 0,
    grid: false,
    sound: true,
    hdr: false,
    nightMode: false
  })

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      setError(null)
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: mode === 'video'
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsStreaming(true)
      }
    } catch (error) {
      console.error('Camera initialization failed:', error)
      setError('Camera access denied or not available')
      setIsStreaming(false)
    }
  }, [facingMode, mode])

  // Cleanup camera
  const cleanupCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsStreaming(false)
  }, [])

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera()
    return cleanupCamera
  }, [initializeCamera, cleanupCamera])

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current)
      }
      setRecordingDuration(0)
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current)
      }
    }
  }, [isRecording])

  // Take photo
  const takePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Set canvas size to video size
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Apply flash effect
    if (settings.flash === 'on') {
      document.body.style.background = 'white'
      setTimeout(() => {
        document.body.style.background = ''
      }, 100)
    }

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Apply filters based on mode
    if (mode === 'night') {
      ctx.filter = 'brightness(1.2) contrast(1.1)'
    } else if (mode === 'portrait') {
      ctx.filter = 'blur(1px) brightness(1.1)'
    }

    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const newPhoto: CapturedMedia = {
          id: Date.now().toString(),
          type: 'photo',
          url,
          timestamp: new Date()
        }
        setCapturedMedia(prev => [newPhoto, ...prev])
      }
    }, 'image/jpeg', 0.9)

    // Play shutter sound
    if (settings.sound) {
      // Create audio context and play camera sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    }
  }, [mode, settings])

  // Start/stop video recording
  const toggleVideoRecording = useCallback(async () => {
    if (!streamRef.current) return

    if (isRecording) {
      // Stop recording
      if (recordingRef.current) {
        recordingRef.current.stop()
        recordingRef.current = null
      }
      setIsRecording(false)
    } else {
      // Start recording
      try {
        const mediaRecorder = new MediaRecorder(streamRef.current)
        const chunks: Blob[] = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/mp4' })
          const url = URL.createObjectURL(blob)
          const newVideo: CapturedMedia = {
            id: Date.now().toString(),
            type: 'video',
            url,
            timestamp: new Date()
          }
          setCapturedMedia(prev => [newVideo, ...prev])
        }

        mediaRecorder.start()
        recordingRef.current = mediaRecorder
        setIsRecording(true)
      } catch (error) {
        console.error('Recording failed:', error)
        setError('Video recording not supported')
      }
    }
  }, [isRecording])

  // Switch camera
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }, [])

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1))

  // Format recording duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Delete media
  const deleteMedia = (media: CapturedMedia) => {
    URL.revokeObjectURL(media.url)
    setCapturedMedia(prev => prev.filter(m => m.id !== media.id))
    if (selectedMedia?.id === media.id) {
      setSelectedMedia(null)
      setShowEditMode(false)
    }
  }

  // Share media
  const shareMedia = async (media: CapturedMedia) => {
    if (navigator.share) {
      try {
        const response = await fetch(media.url)
        const blob = await response.blob()
        const file = new File([blob], `capture_${media.id}.${media.type === 'photo' ? 'jpg' : 'mp4'}`, {
          type: media.type === 'photo' ? 'image/jpeg' : 'video/mp4'
        })
        
        await navigator.share({
          files: [file],
          title: `Nyx Camera ${media.type}`,
        })
      } catch (error) {
        console.error('Sharing failed:', error)
      }
    }
  }

  // Download media
  const downloadMedia = (media: CapturedMedia) => {
    const link = document.createElement('a')
    link.href = media.url
    link.download = `nyx_camera_${media.id}.${media.type === 'photo' ? 'jpg' : 'mp4'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Camera View */}
      <div className="relative w-full h-full">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <Camera className="mx-auto mb-4" size={48} />
              <p className="text-lg mb-2">Camera Error</p>
              <p className="text-sm opacity-70">{error}</p>
              <button
                onClick={initializeCamera}
                className="mt-4 px-4 py-2 bg-blue-500 rounded-lg text-white"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{
                transform: `scale(${zoom}) ${facingMode === 'user' ? 'scaleX(-1)' : ''}`,
                filter: mode === 'night' ? 'brightness(1.2) contrast(1.1)' : 
                       mode === 'portrait' ? 'blur(0.5px) brightness(1.05)' : 'none'
              }}
              autoPlay
              playsInline
              muted
            />
            
            <canvas ref={canvasRef} className="hidden" />

            {/* Grid overlay */}
            {settings.grid && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-white/20" />
                  ))}
                </div>
              </div>
            )}

            {/* Recording indicator */}
            {isRecording && (
              <motion.div
                className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Circle className="w-3 h-3 fill-white" />
                <span className="text-white text-sm font-mono">
                  REC {formatDuration(recordingDuration)}
                </span>
              </motion.div>
            )}

            {/* Flash indicator */}
            {settings.flash === 'on' && (
              <div className="absolute top-4 right-4 bg-yellow-500 p-2 rounded-full">
                <Zap className="w-4 h-4 text-white" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-2">
            {/* Flash control */}
            <button
              onClick={() => {
                const modes: CameraSettings['flash'][] = ['auto', 'on', 'off']
                const currentIndex = modes.indexOf(settings.flash)
                const nextIndex = (currentIndex + 1) % modes.length
                setSettings(prev => ({ ...prev, flash: modes[nextIndex] }))
              }}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
            >
              {settings.flash === 'off' ? (
                <ZapOff className="w-5 h-5 text-white" />
              ) : (
                <Zap className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Night mode toggle */}
            <button
              onClick={() => setMode(prev => prev === 'night' ? 'photo' : 'night')}
              className={cn(
                "w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center",
                mode === 'night' ? "bg-blue-500" : "bg-black/30"
              )}
            >
              <Moon className="w-5 h-5 text-white" />
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Camera modes */}
        <div className="flex justify-center mt-4">
          <div className="flex bg-black/30 backdrop-blur-sm rounded-full p-1">
            {(['photo', 'video', 'portrait', 'night', 'pro'] as const).map((modeOption) => (
              <button
                key={modeOption}
                onClick={() => setMode(modeOption)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  mode === modeOption
                    ? "bg-white text-black"
                    : "text-white"
                )}
              >
                {modeOption.charAt(0).toUpperCase() + modeOption.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/50 to-transparent">
        {/* Zoom controls */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
            <button onClick={handleZoomOut} disabled={zoom <= 1}>
              <ZoomOut className={cn("w-5 h-5", zoom <= 1 ? "text-white/30" : "text-white")} />
            </button>
            <span className="text-white text-sm font-mono min-w-[3rem] text-center">
              {zoom.toFixed(1)}x
            </span>
            <button onClick={handleZoomIn} disabled={zoom >= 3}>
              <ZoomIn className={cn("w-5 h-5", zoom >= 3 ? "text-white/30" : "text-white")} />
            </button>
          </div>
        </div>

        {/* Main controls */}
        <div className="flex items-center justify-between">
          {/* Gallery thumbnail */}
          <button
            onClick={() => setShowGallery(true)}
            className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/30"
          >
            {capturedMedia.length > 0 ? (
              mode === 'video' && capturedMedia[0].type === 'video' ? (
                <video
                  src={capturedMedia[0].url}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={capturedMedia[0].url}
                  alt="Last capture"
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                <Grid3X3 className="w-6 h-6 text-white/50" />
              </div>
            )}
          </button>

          {/* Capture button */}
          <div className="flex flex-col items-center">
            <motion.button
              className={cn(
                "w-20 h-20 rounded-full border-4 border-white flex items-center justify-center",
                mode === 'video' 
                  ? (isRecording ? "bg-red-500" : "bg-white/20")
                  : "bg-white/20"
              )}
              whileTap={{ scale: 0.9 }}
              onClick={mode === 'video' ? toggleVideoRecording : takePhoto}
              disabled={!isStreaming}
            >
              {mode === 'video' ? (
                isRecording ? (
                  <Square className="w-8 h-8 text-white fill-white" />
                ) : (
                  <Circle className="w-10 h-10 text-red-500 fill-red-500" />
                )
              ) : (
                <Circle className="w-12 h-12 text-white" />
              )}
            </motion.button>
            
            {settings.timer > 0 && (
              <div className="mt-1 text-white text-xs">
                <Timer className="w-3 h-3 inline mr-1" />
                {settings.timer}s
              </div>
            )}
          </div>

          {/* Switch camera */}
          <button
            onClick={switchCamera}
            className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
          >
            <FlipHorizontal className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/20">
                <h2 className="text-white text-xl font-medium">Camera Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 p-4 space-y-4">
                {/* Timer */}
                <div className="flex items-center justify-between">
                  <span className="text-white">Timer</span>
                  <div className="flex gap-2">
                    {[0, 3, 10].map((seconds) => (
                      <button
                        key={seconds}
                        onClick={() => setSettings(prev => ({ ...prev, timer: seconds as any }))}
                        className={cn(
                          "px-3 py-1 rounded-full text-sm",
                          settings.timer === seconds
                            ? "bg-blue-500 text-white"
                            : "bg-white/10 text-white"
                        )}
                      >
                        {seconds === 0 ? 'Off' : `${seconds}s`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid */}
                <div className="flex items-center justify-between">
                  <span className="text-white">Grid Lines</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, grid: !prev.grid }))}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors",
                      settings.grid ? "bg-blue-500" : "bg-white/20"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full transition-transform",
                      settings.grid ? "translate-x-6" : "translate-x-0.5"
                    )} />
                  </button>
                </div>

                {/* Sound */}
                <div className="flex items-center justify-between">
                  <span className="text-white">Shutter Sound</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, sound: !prev.sound }))}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors",
                      settings.sound ? "bg-blue-500" : "bg-white/20"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full transition-transform",
                      settings.sound ? "translate-x-6" : "translate-x-0.5"
                    )} />
                  </button>
                </div>

                {/* HDR */}
                <div className="flex items-center justify-between">
                  <span className="text-white">HDR</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, hdr: !prev.hdr }))}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors",
                      settings.hdr ? "bg-blue-500" : "bg-white/20"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full transition-transform",
                      settings.hdr ? "translate-x-6" : "translate-x-0.5"
                    )} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            className="absolute inset-0 z-50 bg-black"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/20">
                <h2 className="text-white text-xl font-medium">Gallery</h2>
                <button
                  onClick={() => setShowGallery(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 p-4">
                {capturedMedia.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-white/60">
                      <Camera className="mx-auto mb-4" size={48} />
                      <p>No photos or videos yet</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {capturedMedia.map((media) => (
                      <button
                        key={media.id}
                        onClick={() => {
                          setSelectedMedia(media)
                          setShowEditMode(true)
                          setShowGallery(false)
                        }}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-800"
                      >
                        {media.type === 'video' ? (
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={media.url}
                            alt="Captured media"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {media.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Viewer/Editor */}
      <AnimatePresence>
        {showEditMode && selectedMedia && (
          <motion.div
            className="absolute inset-0 z-50 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={() => setShowEditMode(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => shareMedia(selectedMedia)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                  >
                    <Share2 className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => downloadMedia(selectedMedia)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => deleteMedia(selectedMedia)}
                    className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center">
                {selectedMedia.type === 'video' ? (
                  <video
                    src={selectedMedia.url}
                    className="max-w-full max-h-full"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt="Selected media"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>

              {/* Edit controls for photos */}
              {selectedMedia.type === 'photo' && (
                <div className="p-4 border-t border-white/20">
                  <div className="flex justify-center gap-4">
                    <button className="flex flex-col items-center gap-1 text-white">
                      <Sparkles className="w-6 h-6" />
                      <span className="text-xs">Enhance</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-white">
                      <Palette className="w-6 h-6" />
                      <span className="text-xs">Filters</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-white">
                      <Edit className="w-6 h-6" />
                      <span className="text-xs">Edit</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
