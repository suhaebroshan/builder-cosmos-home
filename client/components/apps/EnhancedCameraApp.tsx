import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, Video, RotateCcw, Zap, ZapOff, Settings, 
  Download, Share2, X, FlipHorizontal, Maximize2,
  ZoomIn, ZoomOut, Circle, Square, Palette, Sparkles,
  Timer, Grid3X3, Sun, Moon, Volume2, VolumeX,
  ArrowLeft, MoreHorizontal, Edit, Trash2, Play,
  Pause, StopCircle, RotateCw, Focus, Eye, Lens
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePerformanceManager } from '@/hooks/usePerformanceManager'

interface CapturedMedia {
  id: string
  type: 'photo' | 'video'
  url: string
  timestamp: Date
  edited?: boolean
  duration?: number
}

interface CameraSettings {
  flash: 'auto' | 'on' | 'off'
  timer: 0 | 3 | 10
  grid: boolean
  sound: boolean
  hdr: boolean
  nightMode: boolean
  stabilization: boolean
  resolution: '1080p' | '4K' | '720p'
}

interface CameraCapabilities {
  front: boolean
  back: boolean
  telephoto: boolean
  ultrawide: boolean
  macro: boolean
  supportsZoom: boolean
  maxZoom: number
}

type CameraLens = 'main' | 'telephoto' | 'ultrawide' | 'macro' | 'front'
type RecordingMode = 'single' | 'dual' | 'picture-in-picture'

export const EnhancedCameraApp: React.FC = () => {
  const [mode, setMode] = useState<'photo' | 'video' | 'portrait' | 'night' | 'pro'>('photo')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [currentLens, setCurrentLens] = useState<CameraLens>('main')
  const [flash, setFlash] = useState<'auto' | 'on' | 'off'>('auto')
  const [showSettings, setShowSettings] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia[]>([])
  const [showEditMode, setShowEditMode] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<CapturedMedia | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('single')
  const [capabilities, setCapabilities] = useState<CameraCapabilities>({
    front: false,
    back: false,
    telephoto: false,
    ultrawide: false,
    macro: false,
    supportsZoom: false,
    maxZoom: 1
  })
  
  const mainVideoRef = useRef<HTMLVideoElement>(null)
  const frontVideoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mainStreamRef = useRef<MediaStream | null>(null)
  const frontStreamRef = useRef<MediaStream | null>(null)
  const recordingRef = useRef<MediaRecorder | null>(null)
  const dualRecordingRef = useRef<MediaRecorder | null>(null)
  const recordingTimer = useRef<NodeJS.Timeout>()
  
  const { profile } = usePerformanceManager()

  // Camera settings
  const [settings, setSettings] = useState<CameraSettings>({
    flash: 'auto',
    timer: 0,
    grid: false,
    sound: true,
    hdr: false,
    nightMode: false,
    stabilization: true,
    resolution: '1080p'
  })

  // Detect camera capabilities
  const detectCameraCapabilities = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      const caps: CameraCapabilities = {
        front: false,
        back: false,
        telephoto: false,
        ultrawide: false,
        macro: false,
        supportsZoom: false,
        maxZoom: 1
      }

      for (const device of videoDevices) {
        const label = device.label.toLowerCase()
        
        if (label.includes('front') || label.includes('user')) {
          caps.front = true
        }
        if (label.includes('back') || label.includes('environment')) {
          caps.back = true
        }
        if (label.includes('telephoto') || label.includes('tele')) {
          caps.telephoto = true
        }
        if (label.includes('ultrawide') || label.includes('wide')) {
          caps.ultrawide = true
        }
        if (label.includes('macro')) {
          caps.macro = true
        }

        // Try to get zoom capabilities
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: device.deviceId }
          })
          const track = stream.getVideoTracks()[0]
          const capabilities = track.getCapabilities()
          
          if (capabilities.zoom) {
            caps.supportsZoom = true
            caps.maxZoom = Math.max(caps.maxZoom, capabilities.zoom.max || 3)
          }
          
          stream.getTracks().forEach(track => track.stop())
        } catch (e) {
          // Ignore capability detection errors
        }
      }

      // Fallback assumptions if no specific cameras detected
      if (videoDevices.length >= 2 && !caps.front && !caps.back) {
        caps.front = true
        caps.back = true
      }
      if (videoDevices.length >= 3) {
        caps.telephoto = true
      }
      if (videoDevices.length >= 4) {
        caps.ultrawide = true
      }

      setCapabilities(caps)
    } catch (error) {
      console.error('Failed to detect camera capabilities:', error)
    }
  }, [])

  // Initialize camera with specific lens
  const initializeCamera = useCallback(async (lens: CameraLens = currentLens, dual: boolean = false) => {
    try {
      setError(null)
      
      // Stop existing streams
      if (mainStreamRef.current) {
        mainStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (frontStreamRef.current && dual) {
        frontStreamRef.current.getTracks().forEach(track => track.stop())
      }

      const getConstraints = (lensType: CameraLens) => {
        const resolution = settings.resolution
        let width = 1920
        let height = 1080
        
        switch (resolution) {
          case '4K':
            width = 3840
            height = 2160
            break
          case '720p':
            width = 1280
            height = 720
            break
        }

        const baseConstraints = {
          video: {
            width: { ideal: width },
            height: { ideal: height },
            frameRate: { ideal: 30 }
          },
          audio: mode === 'video'
        }

        switch (lensType) {
          case 'front':
            return {
              ...baseConstraints,
              video: {
                ...baseConstraints.video,
                facingMode: 'user'
              }
            }
          case 'telephoto':
            return {
              ...baseConstraints,
              video: {
                ...baseConstraints.video,
                facingMode: 'environment',
                zoom: { ideal: 2 }
              }
            }
          case 'ultrawide':
            return {
              ...baseConstraints,
              video: {
                ...baseConstraints.video,
                facingMode: 'environment',
                width: { ideal: width * 1.2 },
                height: { ideal: height * 1.2 }
              }
            }
          case 'macro':
            return {
              ...baseConstraints,
              video: {
                ...baseConstraints.video,
                facingMode: 'environment',
                focusMode: 'macro'
              }
            }
          default:
            return {
              ...baseConstraints,
              video: {
                ...baseConstraints.video,
                facingMode: facingMode
              }
            }
        }
      }

      // Initialize main camera
      const mainConstraints = getConstraints(lens)
      const mainStream = await navigator.mediaDevices.getUserMedia(mainConstraints)
      mainStreamRef.current = mainStream
      
      if (mainVideoRef.current) {
        mainVideoRef.current.srcObject = mainStream
        mainVideoRef.current.play()
      }

      // Initialize front camera for dual recording
      if (dual && lens !== 'front') {
        const frontConstraints = getConstraints('front')
        const frontStream = await navigator.mediaDevices.getUserMedia(frontConstraints)
        frontStreamRef.current = frontStream
        
        if (frontVideoRef.current) {
          frontVideoRef.current.srcObject = frontStream
          frontVideoRef.current.play()
        }
      }

      setIsStreaming(true)
    } catch (error) {
      console.error('Camera initialization failed:', error)
      setError('Camera access denied or not available')
      setIsStreaming(false)
    }
  }, [currentLens, facingMode, mode, settings.resolution])

  // Cleanup cameras
  const cleanupCameras = useCallback(() => {
    if (mainStreamRef.current) {
      mainStreamRef.current.getTracks().forEach(track => track.stop())
      mainStreamRef.current = null
    }
    if (frontStreamRef.current) {
      frontStreamRef.current.getTracks().forEach(track => track.stop())
      frontStreamRef.current = null
    }
    setIsStreaming(false)
  }, [])

  // Initialize on mount and detect capabilities
  useEffect(() => {
    detectCameraCapabilities()
    initializeCamera()
    return cleanupCameras
  }, [detectCameraCapabilities, initializeCamera, cleanupCameras])

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
    if (!mainVideoRef.current || !canvasRef.current) return

    const video = mainVideoRef.current
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

    // Draw main video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Add front camera overlay for dual mode
    if (recordingMode === 'picture-in-picture' && frontVideoRef.current) {
      const frontVideo = frontVideoRef.current
      const overlaySize = Math.min(canvas.width, canvas.height) * 0.25
      const x = canvas.width - overlaySize - 20
      const y = 20
      
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(x, y, overlaySize, overlaySize, 15)
      ctx.clip()
      ctx.drawImage(frontVideo, x, y, overlaySize, overlaySize)
      ctx.restore()
    }

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
  }, [mode, settings, recordingMode])

  // Start/stop video recording
  const toggleVideoRecording = useCallback(async () => {
    if (!mainStreamRef.current) return

    if (isRecording) {
      // Stop recording
      if (recordingRef.current) {
        recordingRef.current.stop()
        recordingRef.current = null
      }
      if (dualRecordingRef.current) {
        dualRecordingRef.current.stop()
        dualRecordingRef.current = null
      }
      setIsRecording(false)
    } else {
      // Start recording
      try {
        if (recordingMode === 'dual' && frontStreamRef.current) {
          // Dual recording - separate streams
          const mainRecorder = new MediaRecorder(mainStreamRef.current)
          const frontRecorder = new MediaRecorder(frontStreamRef.current)
          const mainChunks: Blob[] = []
          const frontChunks: Blob[] = []

          mainRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) mainChunks.push(event.data)
          }

          frontRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) frontChunks.push(event.data)
          }

          let recordingsComplete = 0
          const handleRecordingComplete = () => {
            recordingsComplete++
            if (recordingsComplete === 2) {
              // Both recordings complete, save them
              const mainBlob = new Blob(mainChunks, { type: 'video/mp4' })
              const frontBlob = new Blob(frontChunks, { type: 'video/mp4' })
              
              const mainUrl = URL.createObjectURL(mainBlob)
              const frontUrl = URL.createObjectURL(frontBlob)
              
              const newVideo: CapturedMedia = {
                id: Date.now().toString(),
                type: 'video',
                url: mainUrl,
                timestamp: new Date(),
                duration: recordingDuration
              }
              
              // Save front camera video as well
              const frontVideo: CapturedMedia = {
                id: (Date.now() + 1).toString(),
                type: 'video',
                url: frontUrl,
                timestamp: new Date(),
                duration: recordingDuration
              }
              
              setCapturedMedia(prev => [newVideo, frontVideo, ...prev])
            }
          }

          mainRecorder.onstop = handleRecordingComplete
          frontRecorder.onstop = handleRecordingComplete

          mainRecorder.start()
          frontRecorder.start()
          recordingRef.current = mainRecorder
          dualRecordingRef.current = frontRecorder
        } else {
          // Single or picture-in-picture recording
          const stream = mainStreamRef.current
          const mediaRecorder = new MediaRecorder(stream)
          const chunks: Blob[] = []

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) chunks.push(event.data)
          }

          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/mp4' })
            const url = URL.createObjectURL(blob)
            const newVideo: CapturedMedia = {
              id: Date.now().toString(),
              type: 'video',
              url,
              timestamp: new Date(),
              duration: recordingDuration
            }
            setCapturedMedia(prev => [newVideo, ...prev])
          }

          mediaRecorder.start()
          recordingRef.current = mediaRecorder
        }

        setIsRecording(true)
      } catch (error) {
        console.error('Recording failed:', error)
        setError('Video recording not supported')
      }
    }
  }, [isRecording, recordingMode, recordingDuration])

  // Switch camera lens
  const switchLens = useCallback((lens: CameraLens) => {
    setCurrentLens(lens)
    if (lens === 'front') {
      setFacingMode('user')
    } else {
      setFacingMode('environment')
    }
    initializeCamera(lens)
  }, [initializeCamera])

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, capabilities.maxZoom))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1))

  // Format recording duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Delete media
  const deleteMedia = (id: string) => {
    setCapturedMedia(prev => prev.filter(item => item.id !== id))
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-white p-8">
        <Camera className="w-16 h-16 mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Camera Error</h2>
        <p className="text-gray-400 text-center">{error}</p>
        <button
          onClick={() => {
            setError(null)
            initializeCamera()
          }}
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      {/* Camera Preview */}
      <div className="relative h-full">
        {/* Main Camera View */}
        <video
          ref={mainVideoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          style={{
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            filter: mode === 'night' ? 'brightness(1.2) contrast(1.1)' : 'none'
          }}
        />

        {/* Front Camera Overlay for Picture-in-Picture */}
        {recordingMode === 'picture-in-picture' && (
          <motion.div
            className="absolute top-4 right-4 w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <video
              ref={frontVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
              style={{ transform: 'scaleX(-1)' }}
            />
          </motion.div>
        )}

        {/* Grid Overlay */}
        {settings.grid && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <motion.div
            className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Circle className="w-3 h-3 fill-current" />
            <span className="text-sm font-medium">{formatDuration(recordingDuration)}</span>
          </motion.div>
        )}

        {/* Zoom Level Indicator */}
        {zoom > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full">
            <span className="text-sm">{zoom.toFixed(1)}x</span>
          </div>
        )}
      </div>

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Flash Control */}
            <button
              onClick={() => setFlash(prev => prev === 'auto' ? 'on' : prev === 'on' ? 'off' : 'auto')}
              className="p-2 rounded-full bg-black/50 text-white"
            >
              {flash === 'on' ? <Zap className="w-5 h-5" /> : 
               flash === 'off' ? <ZapOff className="w-5 h-5" /> :
               <Sparkles className="w-5 h-5" />}
            </button>

            {/* Timer */}
            <button
              onClick={() => setSettings(prev => ({ 
                ...prev, 
                timer: prev.timer === 0 ? 3 : prev.timer === 3 ? 10 : 0 
              }))}
              className="p-2 rounded-full bg-black/50 text-white"
            >
              <Timer className="w-5 h-5" />
              {settings.timer > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {settings.timer}
                </span>
              )}
            </button>

            {/* Recording Mode Selector */}
            <div className="flex bg-black/50 rounded-full p-1">
              {(['single', 'picture-in-picture', 'dual'] as RecordingMode[]).map((recordMode) => (
                <button
                  key={recordMode}
                  onClick={() => {
                    setRecordingMode(recordMode)
                    initializeCamera(currentLens, recordMode !== 'single')
                  }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all",
                    recordingMode === recordMode
                      ? "bg-white text-black"
                      : "text-white hover:bg-white/20"
                  )}
                >
                  {recordMode === 'picture-in-picture' ? 'PiP' : recordMode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full bg-black/50 text-white"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Gallery */}
            <button
              onClick={() => setShowGallery(true)}
              className="p-2 rounded-full bg-black/50 text-white"
            >
              {capturedMedia.length > 0 && (
                <div className="w-8 h-8 rounded border border-white/50 overflow-hidden">
                  {capturedMedia[0].type === 'video' ? (
                    <Video className="w-full h-full p-1" />
                  ) : (
                    <img src={capturedMedia[0].url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
              )}
              {capturedMedia.length === 0 && <Square className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Lens Selector */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <div className="flex flex-col gap-2">
          {capabilities.ultrawide && (
            <button
              onClick={() => switchLens('ultrawide')}
              className={cn(
                "p-3 rounded-full transition-all",
                currentLens === 'ultrawide'
                  ? "bg-white text-black"
                  : "bg-black/50 text-white"
              )}
            >
              <span className="text-xs font-bold">0.5×</span>
            </button>
          )}
          
          <button
            onClick={() => switchLens('main')}
            className={cn(
              "p-3 rounded-full transition-all",
              currentLens === 'main'
                ? "bg-white text-black"
                : "bg-black/50 text-white"
            )}
          >
            <span className="text-xs font-bold">1×</span>
          </button>

          {capabilities.telephoto && (
            <button
              onClick={() => switchLens('telephoto')}
              className={cn(
                "p-3 rounded-full transition-all",
                currentLens === 'telephoto'
                  ? "bg-white text-black"
                  : "bg-black/50 text-white"
              )}
            >
              <span className="text-xs font-bold">2×</span>
            </button>
          )}

          {capabilities.macro && (
            <button
              onClick={() => switchLens('macro')}
              className={cn(
                "p-3 rounded-full transition-all",
                currentLens === 'macro'
                  ? "bg-white text-black"
                  : "bg-black/50 text-white"
              )}
            >
              <Lens className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right Side Zoom Controls */}
      {capabilities.supportsZoom && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <div className="flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              disabled={zoom >= capabilities.maxZoom}
              className="p-3 rounded-full bg-black/50 text-white disabled:opacity-50"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="p-3 rounded-full bg-black/50 text-white disabled:opacity-50"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center justify-center gap-8">
          {/* Mode Selector */}
          <div className="flex bg-black/50 rounded-full p-1">
            {(['photo', 'video', 'portrait', 'night', 'pro'] as const).map((cameraMode) => (
              <button
                key={cameraMode}
                onClick={() => setMode(cameraMode)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all capitalize",
                  mode === cameraMode
                    ? "bg-white text-black"
                    : "text-white hover:bg-white/20"
                )}
              >
                {cameraMode}
              </button>
            ))}
          </div>

          {/* Capture Button */}
          <div className="flex items-center gap-4">
            {/* Camera Flip */}
            <button
              onClick={() => switchLens(currentLens === 'front' ? 'main' : 'front')}
              className="p-3 rounded-full bg-black/50 text-white"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            {/* Capture/Record Button */}
            <motion.button
              onClick={mode === 'video' ? toggleVideoRecording : takePhoto}
              className={cn(
                "relative w-20 h-20 rounded-full border-4 transition-all",
                mode === 'video'
                  ? isRecording
                    ? "border-red-500 bg-red-500"
                    : "border-white bg-transparent"
                  : "border-white bg-white"
              )}
              whileTap={{ scale: 0.9 }}
            >
              {mode === 'video' && isRecording ? (
                <Square className="w-8 h-8 text-white mx-auto" />
              ) : mode === 'video' ? (
                <Circle className="w-8 h-8 text-white mx-auto fill-red-500" />
              ) : (
                <Camera className="w-8 h-8 text-black mx-auto" />
              )}
            </motion.button>

            {/* Dual Record Toggle */}
            {mode === 'video' && capabilities.front && (
              <button
                onClick={() => setRecordingMode(prev => 
                  prev === 'single' ? 'picture-in-picture' : 'single'
                )}
                className={cn(
                  "p-3 rounded-full transition-all",
                  recordingMode !== 'single'
                    ? "bg-white text-black"
                    : "bg-black/50 text-white"
                )}
              >
                <FlipHorizontal className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Canvas for Photo Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Camera Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Resolution */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Video Resolution
                  </label>
                  <div className="flex gap-2">
                    {(['720p', '1080p', '4K'] as const).map((res) => (
                      <button
                        key={res}
                        onClick={() => setSettings(prev => ({ ...prev, resolution: res }))}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                          settings.resolution === res
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        )}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  {[
                    { key: 'grid', label: 'Grid Lines', icon: Grid3X3 },
                    { key: 'sound', label: 'Camera Sounds', icon: Volume2 },
                    { key: 'hdr', label: 'HDR', icon: Sun },
                    { key: 'stabilization', label: 'Video Stabilization', icon: Focus },
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <label className="text-sm font-medium text-gray-300">{label}</label>
                      </div>
                      <button
                        onClick={() => setSettings(prev => ({ 
                          ...prev, 
                          [key]: !prev[key as keyof CameraSettings] 
                        }))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors",
                          settings[key as keyof CameraSettings] ? "bg-blue-600" : "bg-gray-600"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 bg-white rounded-full transition-transform",
                          settings[key as keyof CameraSettings] ? "translate-x-6" : "translate-x-0.5"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Camera Capabilities Info */}
                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Available Cameras</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div>Front: {capabilities.front ? '✓' : '✗'}</div>
                    <div>Back: {capabilities.back ? '✓' : '✗'}</div>
                    <div>Telephoto: {capabilities.telephoto ? '✓' : '✗'}</div>
                    <div>Ultrawide: {capabilities.ultrawide ? '✓' : '✗'}</div>
                    <div>Macro: {capabilities.macro ? '✓' : '✗'}</div>
                    <div>Max Zoom: {capabilities.maxZoom}×</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Gallery</h2>
              <button
                onClick={() => setShowGallery(false)}
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {capturedMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Camera className="w-16 h-16 mb-4" />
                  <p>No photos or videos yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {capturedMedia.map((media) => (
                    <motion.div
                      key={media.id}
                      className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
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
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {media.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white bg-black/50 rounded-full p-1" />
                        </div>
                      )}

                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={() => deleteMedia(media.id)}
                          className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      </div>

                      <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                        {media.timestamp.toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
