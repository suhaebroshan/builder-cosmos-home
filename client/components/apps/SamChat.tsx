import React, { useState, useRef, useEffect } from 'react'
import { useSamStore } from '@/store/sam-store'
import { aiService } from '@/services/ai-service'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SamChatProps {
  windowId: string
}

export const SamChat: React.FC<SamChatProps> = ({ windowId }) => {
  const {
    messages,
    addMessage,
    isThinking,
    setThinking,
    currentEmotion,
    emotionIntensity,
    setEmotion,
  } = useSamStore()
  
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleSendMessage = async () => {
    if (!input.trim() || isThinking) return
    
    const userMessage = input.trim()
    setInput('')
    addMessage(userMessage, 'user')
    
    // Simulate Sam's thinking and response
    setThinking(true)
    setEmotion('focused', 0.7)
    
    try {
      // Use real AI service
      const response = await aiService.sendMessage(userMessage)

      // Set Sam's emotion based on response content or use emotion from AI
      if (response.emotion) {
        setEmotion(response.emotion as any, 0.8)
      } else {
        // Analyze response text for emotion cues
        const text = response.text.toLowerCase()
        if (text.includes('brilliant') || text.includes('awesome') || text.includes('amazing')) {
          setEmotion('excited', 0.8)
        } else if (text.includes('frustrated') || text.includes('annoying') || text.includes('damn')) {
          setEmotion('annoyed', 0.6)
        } else if (text.includes('focused') || text.includes('thinking') || text.includes('analyzing')) {
          setEmotion('focused', 0.7)
        } else {
          setEmotion('happy', 0.7)
        }
      }

      addMessage(response.text, 'sam', currentEmotion)

      // Play audio if available
      if (response.audio) {
        const audio = new Audio(response.audio)
        audio.play().catch(console.warn)
      }

    } catch (error) {
      console.error('Error sending message to AI:', error)
      setEmotion('confused', 0.6)
      addMessage("Sorry bruv, I'm having some technical difficulties right now. Give me a sec to get my shit together.", 'sam', 'confused')
    } finally {
      setThinking(false)
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  const getEmotionColor = () => {
    switch (currentEmotion) {
      case 'happy': return 'text-green-400'
      case 'excited': return 'text-yellow-400'
      case 'sad': return 'text-blue-400'
      case 'annoyed': return 'text-red-400'
      case 'focused': return 'text-purple-400'
      case 'confused': return 'text-gray-400'
      case 'tired': return 'text-slate-500'
      default: return 'text-white'
    }
  }
  
  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-3 h-3 rounded-full transition-all duration-300",
            isThinking ? "animate-pulse bg-yellow-400" : "bg-green-400"
          )} />
          <div>
            <div className="text-white font-medium">Sam</div>
            <div className={cn("text-xs transition-colors", getEmotionColor())}>
              {isThinking ? 'thinking...' : `feeling ${currentEmotion}`}
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                  message.role === 'user'
                    ? 'bg-blue-500/80 text-white ml-auto'
                    : 'bg-white/10 text-white/90 backdrop-blur-sm border border-white/20'
                )}
              >
                {message.content}
                <div className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white/10 text-white/90 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Sam is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type to Sam..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-sm"
            disabled={isThinking}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isThinking}
            className="p-2 bg-blue-500/80 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
