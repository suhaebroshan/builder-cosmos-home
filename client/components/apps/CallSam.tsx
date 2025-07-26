import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSamStore } from '@/store/sam-store'
import { aiService } from '@/services/ai-service'
import { Mic, MicOff, Phone, PhoneOff, Camera, CameraOff, Volume2 } from 'lucide-react'
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
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  
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

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      setRecordingDuration(0)
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [isRecording])

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

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await processVoiceInput(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setEmotion('focused', 0.8)
    } catch (error) {
      console.error('Error starting voice recording:', error)
      addMessage('Sorry bro, couldn\'t access your mic. Check your permissions.', 'sam', 'confused')
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessingVoice(true)
    try {
      // For now, we'll simulate voice processing since transcription requires server-side
      // In a real implementation, you'd send this to a speech-to-text service
      const simulatedTranscription = "I heard you speaking! Voice processing is working."
      
      // Send the transcribed text to Sam
      const response = await aiService.sendMessage(simulatedTranscription)
      addMessage(simulatedTranscription, 'user')
      addMessage(response.text, 'sam', response.emotion)
      
      // Generate speech response using ElevenLabs
      if (response.audio) {
        const audio = new Audio(response.audio)
        setSpeaking(true)
        audio.play()
        audio.onended = () => setSpeaking(false)
      } else {
        // Fallback: generate speech for the response
        try {
          const audioUrl = await aiService.generateSpeech(response.text)
          const audio = new Audio(audioUrl)
          setSpeaking(true)
          audio.play()
          audio.onended = () => setSpeaking(false)
        } catch (error) {
          console.error('Error generating speech:', error)
          setSpeaking(false)
        }
      }
    } catch (error) {
      console.error('Error processing voice:', error)
      addMessage('Shit, something went wrong processing your voice. Try again?', 'sam', 'annoyed')
    } finally {
      setIsProcessingVoice(false)
    }
  }
  
  const startCall = () => {
    setIsCallActive(true)
    setEmotion('happy', 0.8)
    setSpeaking(true)
    
    // Sam's greeting with voice
    setTimeout(async () => {
      const greeting = "Yo! Good to see you, bruv. What's on your mind today?"
      addMessage(greeting, 'sam', 'happy')
      
      try {
        const audioUrl = await aiService.generateSpeech(greeting)
        const audio = new Audio(audioUrl)
        audio.play()
        audio.onended = () => setSpeaking(false)
      } catch (error) {
        console.error('Error generating greeting speech:', error)
        setSpeaking(false)
      }
    }, 1000)
  }
  
  const endCall = () => {
    setIsCallActive(false)
    setSpeaking(false)
    setEmotion('neutral', 0.5)
    stopCamera()
    setIsCameraOn(false)
    if (isRecording) {
      stopVoiceRecording()
    }
    addMessage("Call ended. Hit me up anytime, bruv!", 'sam', 'neutral')
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
      borderRadius: ["30% 70% 70% 30%", "70% 30% 30% 70%", "30% 70% 70% 30%"],
    },
    listening: {
      scale: [1, 1.2, 1],
      rotate: [0, -5, 5, 0],
      borderRadius: ["50% 50% 50% 50%", "60% 40% 60% 40%", "50% 50% 50% 50%"],
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-950 via-black to-violet-950 p-6">
      <AnimatePresence mode="wait">
        {!isCallActive ? (
          <motion.div
            key="call-start"
            className="flex-1 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Ready to call Sam?</h2>
              <p className="text-purple-300">Voice chat with your AI companion using ElevenLabs TTS</p>
              <p className="text-purple-400 text-sm mt-2">Press and hold the mic button to speak, release to send</p>
            </div>

            <motion.div
              className="relative mb-8"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${getBlobColor()[0]}, ${getBlobColor()[1]})`
                }}
              >
                <Phone className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <button
              onClick={startCall}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-full text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Call
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="call-active"
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Call Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Talking with Sam</h2>
                <p className="text-purple-300">AI Voice Assistant</p>
              </div>
              <div className="text-purple-300 text-sm">
                Call Active • {formatTime(Math.floor(Date.now() / 1000) % 3600)}
              </div>
            </div>

            {/* Video/Avatar Section */}
            <div className="flex-1 flex items-center justify-center mb-6 relative">
              {isCameraOn ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-64 h-48 rounded-2xl border-2 border-purple-500/50 shadow-2xl"
                  />
                  {availableCameras.length > 1 && (
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => setShowCameraMenu(!showCameraMenu)}
                        className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                      
                      {showCameraMenu && (
                        <div className="absolute top-12 right-0 bg-black/80 border border-purple-500/30 rounded-lg p-2 space-y-1 z-10">
                          {availableCameras.map((camera) => (
                            <button
                              key={camera.deviceId}
                              onClick={() => switchCamera(camera.deviceId)}
                              className={cn(
                                "block w-full text-left px-3 py-1 rounded text-sm transition-colors",
                                selectedCameraId === camera.deviceId
                                  ? "bg-purple-500/50 text-white"
                                  : "text-purple-300 hover:bg-purple-500/20"
                              )}
                            >
                              {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <motion.div
                  className="w-64 h-64 relative"
                  variants={blobVariants}
                  animate={
                    isRecording ? 'listening' : 
                    isSpeaking ? 'speaking' : 
                    'idle'
                  }
                  transition={{
                    duration: isSpeaking ? 0.3 : 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${getBlobColor()[0]}, ${getBlobColor()[1]}, ${getBlobColor()[2]})`,
                      opacity: 0.1 + emotionIntensity * 0.9
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <div className="relative z-10 text-center">
                      <div className="text-white text-6xl mb-2">🤖</div>
                      <div className="text-white font-semibold">Sam</div>
                      <div className="text-purple-200 text-sm capitalize">{currentEmotion}</div>
                    </div>
                  </div>
                  
                  {/* Audio visualization */}
                  {isSpeaking && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-8 bg-white/30 rounded-full mx-1"
                          animate={{
                            scaleY: [1, 2, 1, 2.5, 1],
                            opacity: [0.3, 0.8, 0.3, 1, 0.3]
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Recording Status */}
            {isRecording && (
              <motion.div
                className="text-center mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-300 font-medium">Recording • {formatTime(recordingDuration)}</span>
                </div>
                <p className="text-purple-400 text-sm mt-2">Release mic button to send</p>
              </motion.div>
            )}

            {/* Processing Status */}
            {isProcessingVoice && (
              <motion.div
                className="text-center mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-4 py-2">
                  <Volume2 className="w-4 h-4 text-yellow-400 animate-spin" />
                  <span className="text-yellow-300 font-medium">Processing your voice...</span>
                </div>
              </motion.div>
            )}

            {/* Call Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onMouseDown={startVoiceRecording}
                onMouseUp={stopVoiceRecording}
                onTouchStart={startVoiceRecording}
                onTouchEnd={stopVoiceRecording}
                disabled={isProcessingVoice}
                className={cn(
                  "p-4 rounded-full transition-all duration-200 shadow-lg relative select-none",
                  isRecording
                    ? "bg-red-500/30 hover:bg-red-500/40 text-red-300 animate-pulse"
                    : isProcessingVoice
                    ? "bg-yellow-500/30 text-yellow-300 cursor-not-allowed"
                    : "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                )}
              >
                {isProcessingVoice ? (
                  <Volume2 className="w-6 h-6 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
                {isRecording && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                )}
              </button>

              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={cn(
                  "p-4 rounded-full transition-all duration-200 shadow-lg",
                  isCameraOn
                    ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                    : "bg-gray-500/20 hover:bg-gray-500/30 text-gray-400"
                )}
              >
                {isCameraOn ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
              </button>

              <button
                onClick={endCall}
                className="p-4 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-200 shadow-lg"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mt-4 text-purple-400 text-sm">
              <p>Hold the mic button to speak with Sam using ElevenLabs voice synthesis</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
