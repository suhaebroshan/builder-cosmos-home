import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX,
  MessageSquare, Settings, MoreHorizontal, Camera,
  CameraOff, Speaker, Headphones, VideoIcon as Video,
  Pause, Play, RotateCcw, Zap, Heart, Brain
} from 'lucide-react'
import { useSamStore } from '@/store/sam-store'
import { useThemeStore } from '@/store/theme-store'
import { usePerformanceManager } from '@/hooks/usePerformanceManager'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  text: string
  sender: 'user' | 'sam'
  timestamp: Date
  type: 'text' | 'voice'
  audioUrl?: string
  emotion?: string
}

interface CallSettings {
  autoResponse: boolean
  voiceSpeed: number
  volume: number
  micSensitivity: number
  noiseReduction: boolean
  echoCancellation: boolean
}

export const EnhancedCallSam: React.FC = () => {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  
  const {
    currentEmotion,
    emotionIntensity,
    addMessage,
    setEmotion,
    isSpeaking,
    setSpeaking
  } = useSamStore()
  const { settings: themeSettings } = useThemeStore()
  const { profile } = usePerformanceManager()

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const animationRef = useRef<number>()
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const callTimerRef = useRef<NodeJS.Timeout>()

  const [settings, setSettings] = useState<CallSettings>({
    autoResponse: true,
    voiceSpeed: 1,
    volume: 0.8,
    micSensitivity: 0.7,
    noiseReduction: true,
    echoCancellation: true
  })

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onresult = (event) => {
        const result = event.results[event.resultIndex]
        if (result.isFinal) {
          const transcript = result[0].transcript.trim()
          if (transcript) {
            handleUserSpeech(transcript)
          }
        }
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }
      
      recognition.onend = () => {
        if (isCallActive && !isMuted) {
          // Restart recognition if call is still active
          recognition.start()
        }
      }
      
      recognitionRef.current = recognition
    }
  }, [])

  // Initialize audio context for visualization
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: settings.echoCancellation,
          noiseSuppression: settings.noiseReduction,
          autoGainControl: true,
          sampleRate: 44100
        }
      })
      
      streamRef.current = stream
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      source.connect(analyser)
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      dataArrayRef.current = dataArray
      
      return true
    } catch (error) {
      console.error('Microphone access denied:', error)
      return false
    }
  }, [settings])

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
    setAudioLevel(rms * 100 * settings.micSensitivity)

    if (isCallActive) {
      animationRef.current = requestAnimationFrame(monitorAudioLevel)
    }
  }, [isCallActive, settings.micSensitivity])

  // Start call
  const startCall = useCallback(async () => {
    const hasAudio = await initializeAudio()
    if (!hasAudio) {
      alert('Microphone access is required for voice calls')
      return
    }

    setIsCallActive(true)
    setSpeaking(true)
    setCallDuration(0)

    // Start call timer
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)

    // Start audio monitoring
    monitorAudioLevel()

    // Start speech recognition
    if (recognitionRef.current && !isMuted) {
      recognitionRef.current.start()
      setIsRecording(true)
    }

    // Sam's greeting
    setTimeout(() => {
      const greeting = getContextualGreeting()
      speakText(greeting)
      addMessageToChat(greeting, 'sam', 'voice')
      setEmotion('happy', 0.8)
    }, 1000)
  }, [initializeAudio, monitorAudioLevel, isMuted])

  // End call
  const endCall = useCallback(() => {
    setIsCallActive(false)
    setIsRecording(false)
    setSpeaking(false)

    // Stop all streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // Stop audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    // Stop speech synthesis
    synthRef.current.cancel()

    // Clear timers
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    setAudioLevel(0)
    setCallDuration(0)

    // Sam's goodbye
    const goodbye = "Thanks for the chat! Feel free to call me anytime."
    addMessageToChat(goodbye, 'sam', 'voice')
    setEmotion('neutral', 0.5)
  }, [])

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
    
    if (!isMuted) {
      // Muting - stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsRecording(false)
    } else {
      // Unmuting - start speech recognition
      if (recognitionRef.current && isCallActive) {
        recognitionRef.current.start()
        setIsRecording(true)
      }
    }
  }, [isMuted, isCallActive])

  // Get contextual greeting
  const getContextualGreeting = () => {
    const hour = new Date().getHours()
    const greetings = [
      "Hey there! How can I help you today?",
      "Hi! What's on your mind?",
      "Hello! I'm here and ready to chat.",
      "Hey! What would you like to talk about?",
    ]

    if (hour < 12) {
      greetings.unshift("Good morning! How are you feeling today?")
    } else if (hour < 18) {
      greetings.unshift("Good afternoon! What brings you here?")
    } else {
      greetings.unshift("Good evening! How was your day?")
    }

    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  // Handle user speech input
  const handleUserSpeech = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return

    setIsProcessing(true)
    addMessageToChat(transcript, 'user', 'voice')

    try {
      // Process the user's speech and generate response
      const response = await generateAIResponse(transcript)
      
      setTimeout(() => {
        speakText(response.text)
        addMessageToChat(response.text, 'sam', 'voice', response.emotion)
        setEmotion(response.emotion, response.intensity)
        setIsProcessing(false)
      }, 500 + Math.random() * 1000) // Add realistic response delay
    } catch (error) {
      console.error('Error processing speech:', error)
      const fallback = "I'm having trouble processing that. Could you try again?"
      speakText(fallback)
      addMessageToChat(fallback, 'sam', 'voice')
      setIsProcessing(false)
    }
  }, [])

  // Generate AI response (enhanced)
  const generateAIResponse = async (input: string): Promise<{text: string, emotion: string, intensity: number}> => {
    const lowerInput = input.toLowerCase()
    
    // Emotion detection
    let emotion = 'neutral'
    let intensity = 0.6
    
    if (lowerInput.includes('happy') || lowerInput.includes('great') || lowerInput.includes('awesome')) {
      emotion = 'happy'
      intensity = 0.8
    } else if (lowerInput.includes('sad') || lowerInput.includes('down') || lowerInput.includes('upset')) {
      emotion = 'sad'
      intensity = 0.7
    } else if (lowerInput.includes('excited') || lowerInput.includes('amazing') || lowerInput.includes('fantastic')) {
      emotion = 'excited'
      intensity = 0.9
    } else if (lowerInput.includes('angry') || lowerInput.includes('frustrated') || lowerInput.includes('annoyed')) {
      emotion = 'annoyed'
      intensity = 0.6
    }

    // Context-aware responses
    const responses = {
      greetings: [
        "Hello! I'm so glad you called. How are you doing?",
        "Hey there! It's great to hear your voice. What's new?",
        "Hi! Thanks for reaching out. I'm here to help with whatever you need."
      ],
      questions: [
        "That's a really interesting question! Let me think about that...",
        "Great question! Here's what I think about that...",
        "I love that you asked that! From my perspective..."
      ],
      emotional: [
        "I can hear the emotion in your voice. Tell me more about how you're feeling.",
        "It sounds like this is really important to you. I'm listening.",
        "Your feelings are completely valid. Would you like to talk about it?"
      ],
      technical: [
        "That's a fascinating technical topic! I'd be happy to discuss that with you.",
        "Interesting! I enjoy talking about technical subjects. Let me share my thoughts...",
        "Great technical question! Here's how I understand it..."
      ],
      casual: [
        "That's cool! I love having casual conversations like this.",
        "Nice! It's fun to just chat about everyday things.",
        "I enjoy these relaxed conversations. What else is going on?"
      ],
      default: [
        "That's really interesting! Can you tell me more?",
        "I see what you mean. What are your thoughts on that?",
        "Thanks for sharing that with me. How do you feel about it?",
        "I appreciate you opening up about that. What's your perspective?"
      ]
    }

    // Determine response category
    let responseCategory = 'default'
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi ') || lowerInput.includes('hey')) {
      responseCategory = 'greetings'
    } else if (lowerInput.includes('?') || lowerInput.includes('how') || lowerInput.includes('what') || lowerInput.includes('why')) {
      responseCategory = 'questions'
    } else if (lowerInput.includes('feel') || lowerInput.includes('emotion') || lowerInput.includes('love') || lowerInput.includes('hate')) {
      responseCategory = 'emotional'
    } else if (lowerInput.includes('code') || lowerInput.includes('program') || lowerInput.includes('computer') || lowerInput.includes('technology')) {
      responseCategory = 'technical'
    } else if (lowerInput.includes('weather') || lowerInput.includes('food') || lowerInput.includes('music') || lowerInput.includes('movie')) {
      responseCategory = 'casual'
    }

    const categoryResponses = responses[responseCategory as keyof typeof responses] || responses.default
    const selectedResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)]

    return {
      text: selectedResponse,
      emotion,
      intensity
    }
  }

  // Speak text using Web Speech API
  const speakText = useCallback((text: string) => {
    if (!isCallActive || !isSpeakerOn) return

    synthRef.current.cancel() // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = settings.voiceSpeed
    utterance.volume = settings.volume
    utterance.pitch = 1

    // Try to use a more natural voice
    const voices = synthRef.current.getVoices()
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Enhanced') || 
      voice.name.includes('Premium') ||
      voice.name.includes('Neural') ||
      (voice.lang.includes('en') && voice.localService)
    ) || voices.find(voice => voice.lang.includes('en')) || voices[0]

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    synthRef.current.speak(utterance)
  }, [isCallActive, isSpeakerOn, settings])

  // Add message to chat
  const addMessageToChat = (text: string, sender: 'user' | 'sam', type: 'text' | 'voice', emotion?: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      type,
      emotion
    }
    setMessages(prev => [...prev, message])
  }

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall()
    }
  }, [endCall])

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                currentEmotion === 'happy' ? 'bg-green-500' :
                currentEmotion === 'sad' ? 'bg-blue-500' :
                currentEmotion === 'excited' ? 'bg-yellow-500' :
                currentEmotion === 'annoyed' ? 'bg-red-500' :
                'bg-purple-500'
              )}
              animate={{ 
                scale: isCallActive ? [1, 1.1, 1] : 1,
                boxShadow: isCallActive ? [
                  '0 0 0 0 rgba(139, 92, 246, 0.4)',
                  '0 0 0 20px rgba(139, 92, 246, 0)',
                  '0 0 0 0 rgba(139, 92, 246, 0)'
                ] : '0 0 0 0 rgba(139, 92, 246, 0)'
              }}
              transition={{ duration: 2, repeat: isCallActive ? Infinity : 0 }}
            >
              <Brain className="w-6 h-6 text-white" />
            </motion.div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sam AI</h1>
              <p className={cn(
                "text-sm",
                isCallActive ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
              )}>
                {isCallActive ? `Connected • ${formatDuration(callDuration)}` : 'Ready to chat'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Voice Visualizer */}
      {isCallActive && (
        <div className="p-6">
          <div className="text-center mb-4">
            <p className={cn(
              "text-sm font-medium",
              isRecording ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
            )}>
              {isProcessing ? 'Processing...' : 
               isRecording ? 'Listening...' : 
               isMuted ? 'Muted' : 'Ready'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1 h-16 mb-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "w-1 rounded-full",
                  isRecording ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                )}
                style={{
                  height: isRecording 
                    ? Math.max(4, (audioLevel * Math.random()) + 4) + 'px'
                    : '4px'
                }}
                animate={isRecording && !isMuted ? {
                  height: [4, Math.max(4, (audioLevel * Math.random()) + 4), 4]
                } : {}}
                transition={{ duration: 0.2, repeat: Infinity }}
              />
            ))}
          </div>

          {/* Current emotion indicator */}
          <div className="text-center">
            <motion.div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                currentEmotion === 'happy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                currentEmotion === 'sad' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                currentEmotion === 'excited' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                currentEmotion === 'annoyed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
              )}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="w-4 h-4" />
              Sam feels {currentEmotion}
            </motion.div>
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="p-6">
        <div className="flex items-center justify-center gap-4">
          {isCallActive ? (
            <>
              <button
                onClick={toggleMute}
                className={cn(
                  "p-4 rounded-full transition-all",
                  isMuted 
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                )}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={cn(
                  "p-4 rounded-full transition-all",
                  !isSpeakerOn 
                    ? "bg-gray-500 hover:bg-gray-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                )}
              >
                {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </button>

              <motion.button
                onClick={endCall}
                className="p-6 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PhoneOff className="w-8 h-8" />
              </motion.button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={cn(
                  "p-4 rounded-full transition-all",
                  isVideoOn 
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                )}
              >
                {isVideoOn ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
              </button>

              <button
                className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all"
              >
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </>
          ) : (
            <motion.button
              onClick={startCall}
              className="p-6 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="w-8 h-8" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                  message.sender === 'user' 
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                )}>
                  <p className="text-sm">{message.text}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.type === 'voice' && (
                      <div className="flex items-center gap-1">
                        <Mic className="w-3 h-3 opacity-70" />
                        {message.emotion && (
                          <span className="text-xs opacity-70">
                            {message.emotion}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Call Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Voice Speed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Voice Speed: {settings.voiceSpeed.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.voiceSpeed}
                    onChange={(e) => setSettings(prev => ({ ...prev, voiceSpeed: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Volume */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Volume: {Math.round(settings.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.volume}
                    onChange={(e) => setSettings(prev => ({ ...prev, volume: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Mic Sensitivity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mic Sensitivity: {Math.round(settings.micSensitivity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={settings.micSensitivity}
                    onChange={(e) => setSettings(prev => ({ ...prev, micSensitivity: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Auto Response
                    </label>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, autoResponse: !prev.autoResponse }))}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors",
                        settings.autoResponse ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full transition-transform",
                        settings.autoResponse ? "translate-x-6" : "translate-x-0.5"
                      )} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Noise Reduction
                    </label>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, noiseReduction: !prev.noiseReduction }))}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors",
                        settings.noiseReduction ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full transition-transform",
                        settings.noiseReduction ? "translate-x-6" : "translate-x-0.5"
                      )} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Echo Cancellation
                    </label>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, echoCancellation: !prev.echoCancellation }))}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors",
                        settings.echoCancellation ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full transition-transform",
                        settings.echoCancellation ? "translate-x-6" : "translate-x-0.5"
                      )} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
