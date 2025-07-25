import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSamStore } from '@/store/sam-store'
import { Mic, MicOff, Phone, PhoneOff, Camera, CameraOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CallSamProps {
  windowId: string
}

export const CallSam: React.FC<CallSamProps> = ({ windowId }) => {
  const {
    currentEmotion,
    emotionIntensity,
    isSpeaking,
    setSpeaking,
    setEmotion,
    addMessage,
  } = useSamStore()
  
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string>('')
  const [showCameraMenu, setShowCameraMenu] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  useEffect(() => {
    // Get available cameras on component mount
    getCameras()
  }, [])

  useEffect(() => {
    if (isCameraOn) {
      startCamera()
    } else {
      stopCamera()
    }
  }, [isCameraOn, selectedCameraId])

  const getCameras = async () => {
    try {
      // Request permission first
      await navigator.mediaDevices.getUserMedia({ video: true })
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(device => device.kind === 'videoinput')
      setAvailableCameras(cameras)
      if (cameras.length > 0 && !selectedCameraId) {
        setSelectedCameraId(cameras[0].deviceId)
      }
    } catch (error) {
      console.error('Error getting cameras:', error)
    }
  }
  
  const startCamera = async () => {
    try {
      // Stop existing stream if any
      stopCamera()

      const constraints: MediaStreamConstraints = {
        video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setIsCameraOn(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const switchCamera = (cameraId: string) => {
    setSelectedCameraId(cameraId)
    setShowCameraMenu(false)
    if (isCameraOn) {
      // Camera will restart due to useEffect dependency
    }
  }
  
  const startCall = () => {
    setIsCallActive(true)
    setEmotion('happy', 0.8)
    setSpeaking(true)
    
    // Simulate Sam greeting
    setTimeout(() => {
      setSpeaking(false)
      addMessage("Yo! Good to see you, bruv. What's on your mind today?", 'sam', 'happy')
    }, 2000)
  }
  
  const endCall = () => {
    setIsCallActive(false)
    setSpeaking(false)
    setEmotion('neutral', 0.5)
    stopCamera()
    setIsCameraOn(false)
  }
  
  const getBlobColor = () => {
    switch (currentEmotion) {
      case 'happy': return ['#22c55e', '#16a34a', '#15803d']
      case 'excited': return ['#fbbf24', '#f59e0b', '#d97706']
      case 'sad': return ['#3b82f6', '#2563eb', '#1d4ed8']
      case 'annoyed': return ['#ef4444', '#dc2626', '#b91c1c']
      case 'focused': return ['#a855f7', '#9333ea', '#7c3aed']
      case 'confused': return ['#9ca3af', '#6b7280', '#4b5563']
      case 'tired': return ['#4b5563', '#374151', '#1f2937']
      default: return ['#475569', '#334155', '#1e293b']
    }
  }
  
  const blobVariants = {
    idle: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      borderRadius: ["60% 40% 30% 70%", "30% 60% 70% 40%", "60% 40% 30% 70%"],
    },
    speaking: {
      scale: [1, 1.3, 1.1, 1.4, 1],
      rotate: [0, 10, -10, 15, 0],
      borderRadius: ["60% 40% 30% 70%", "40% 60% 40% 60%", "70% 30% 60% 40%", "30% 70% 40% 60%", "60% 40% 30% 70%"],
    },
    excited: {
      scale: [1, 1.5, 1.2, 1.6, 1.1],
      rotate: [0, 20, -15, 25, 0],
      borderRadius: ["60% 40% 30% 70%", "30% 70% 60% 40%", "70% 30% 40% 60%", "40% 60% 30% 70%", "60% 40% 30% 70%"],
    }
  }
  
  const getAnimationVariant = () => {
    if (currentEmotion === 'excited') return 'excited'
    if (isSpeaking) return 'speaking'
    return 'idle'
  }
  
  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-xl">
      {/* Call Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-medium">Call with Sam</div>
            <div className={cn(
              "text-xs transition-colors",
              isCallActive ? "text-green-400" : "text-white/60"
            )}>
              {isCallActive ? 'Connected' : 'Ready to connect'}
            </div>
          </div>
          <div className="text-xs text-white/60">
            {isCallActive && '🟢 Live'}
          </div>
        </div>
      </div>
      
      {/* Main Call Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Sam's Animated Blob */}
        <div className="relative mb-8">
          <motion.div
            className="w-40 h-40 relative"
            variants={blobVariants}
            animate={getAnimationVariant()}
            transition={{
              duration: isSpeaking ? 0.5 : 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: `radial-gradient(circle, ${getBlobColor()[0]} 0%, ${getBlobColor()[1]} 50%, ${getBlobColor()[2]} 100%)`,
              filter: `blur(${isSpeaking ? '2px' : '1px'})`,
              boxShadow: `0 0 ${20 + emotionIntensity * 30}px ${getBlobColor()[0]}`,
            }}
          />
          
          {/* Audio Level Indicator */}
          {isSpeaking && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
          
          {/* Emotion Indicator */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="text-xs text-white/80 bg-black/50 rounded-full px-2 py-1 capitalize">
              {currentEmotion}
            </div>
          </div>
        </div>
        
        {/* User Camera */}
        <AnimatePresence>
          {isCameraOn && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute bottom-4 right-4 w-40 h-30 rounded-lg overflow-hidden border-2 border-white/20 bg-black/50"
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Camera selection button */}
              {availableCameras.length > 1 && (
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => setShowCameraMenu(!showCameraMenu)}
                    className="p-1 bg-black/60 rounded-lg border border-white/20 hover:bg-black/80 transition-colors"
                  >
                    <Camera className="w-3 h-3 text-white" />
                  </button>

                  {/* Camera selection dropdown */}
                  <AnimatePresence>
                    {showCameraMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -10 }}
                        className="absolute top-8 right-0 bg-black/80 backdrop-blur-xl border border-white/30 rounded-lg py-2 min-w-48 z-10"
                      >
                        {availableCameras.map((camera) => (
                          <button
                            key={camera.deviceId}
                            onClick={() => switchCamera(camera.deviceId)}
                            className={cn(
                              "w-full px-3 py-2 text-left text-white text-xs hover:bg-white/10 transition-colors",
                              selectedCameraId === camera.deviceId && "bg-blue-500/30"
                            )}
                          >
                            {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Status Messages */}
        <div className="text-center text-white/80 text-sm max-w-xs">
          {!isCallActive ? (
            <p>Click the phone button to start talking with Sam</p>
          ) : (
            <p>Say something! Sam is listening and will respond with voice and emotion.</p>
          )}
        </div>
      </div>
      
      {/* Call Controls */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            disabled={!isCallActive}
            className={cn(
              "p-3 rounded-full transition-all",
              isMuted ? "bg-red-500/80 hover:bg-red-500" : "bg-white/20 hover:bg-white/30",
              !isCallActive && "opacity-50 cursor-not-allowed"
            )}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
          </button>
          
          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            disabled={!isCallActive}
            className={cn(
              "p-3 rounded-full transition-all",
              !isCameraOn ? "bg-white/20 hover:bg-white/30" : "bg-blue-500/80 hover:bg-blue-500",
              !isCallActive && "opacity-50 cursor-not-allowed"
            )}
          >
            {isCameraOn ? <Camera className="w-5 h-5 text-white" /> : <CameraOff className="w-5 h-5 text-white" />}
          </button>
          
          <button
            onClick={isCallActive ? endCall : startCall}
            className={cn(
              "p-4 rounded-full transition-all",
              isCallActive 
                ? "bg-red-500/80 hover:bg-red-500" 
                : "bg-green-500/80 hover:bg-green-500"
            )}
          >
            {isCallActive ? (
              <PhoneOff className="w-6 h-6 text-white" />
            ) : (
              <Phone className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
        
        <div className="text-center mt-2 text-xs text-white/60">
          {isCallActive ? "Tap to end call" : "Tap to start call"}
        </div>
      </div>
    </div>
  )
}
