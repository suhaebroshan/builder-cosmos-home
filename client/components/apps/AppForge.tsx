import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSamStore } from '@/store/sam-store'
import { useWindowStore } from '@/store/window-store'
import { aiService } from '@/services/ai-service'
import { Zap, Code, Play, Save, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppForgeProps {
  windowId: string
}

interface GeneratedApp {
  id: string
  name: string
  description: string
  code: string
  timestamp: Date
}

export const AppForge: React.FC<AppForgeProps> = ({ windowId }) => {
  const { addMessage, setEmotion, isThinking, setThinking } = useSamStore()
  const { openWindow } = useWindowStore()
  
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedApps, setGeneratedApps] = useState<GeneratedApp[]>([])
  const [selectedApp, setSelectedApp] = useState<GeneratedApp | null>(null)
  
  const generateApp = async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    setThinking(true)
    setEmotion('focused', 0.9)

    try {
      // Use AI service to generate the app
      const aiPrompt = `Create a React functional component for: ${prompt}

Requirements:
- Use React hooks (useState, useEffect as needed)
- Return a complete functional component
- Use dark theme styling with Tailwind CSS classes
- Make it interactive and functional
- Include proper JSX structure
- Component should be self-contained

Example format:
const MyApp = () => {
  // hooks and logic here
  return (
    <div className="p-4 text-white h-full bg-gray-900">
      {/* UI here */}
    </div>
  )
}`

      const response = await aiService.sendMessage(aiPrompt, true) // Use code model

      // Parse app name from prompt
      const appName = prompt.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).slice(0, 3).join(' ') + ' App'

      const newApp: GeneratedApp = {
        id: `app-${Date.now()}`,
        name: appName,
        description: prompt,
        code: response.text,
        timestamp: new Date()
      }

      setGeneratedApps(prev => [...prev, newApp])
      setSelectedApp(newApp)
      setPrompt('')
      setIsGenerating(false)
      setThinking(false)
      setEmotion('excited', 0.8)

      addMessage(`Generated ${appName}! Check out the code and hit launch to see it in action.`, 'sam', 'excited')

    } catch (error) {
      console.error('Error generating app:', error)
      setIsGenerating(false)
      setThinking(false)
      setEmotion('confused', 0.7)
      addMessage("Damn, something went wrong with the app generation. Let me try a template instead.", 'sam', 'confused')

      // Fallback to working template
      const appName = prompt.split(' ').slice(0, 2).join(' ') + ' App'
      const newApp: GeneratedApp = {
        id: `app-${Date.now()}`,
        name: appName,
        description: prompt,
        code: `const ${appName.replace(/\s+/g, '')} = () => {
  const [items, setItems] = React.useState([])
  const [input, setInput] = React.useState('')

  const addItem = () => {
    if (input.trim()) {
      setItems([...items, { id: Date.now(), text: input }])
      setInput('')
    }
  }

  return (
    <div className="p-4 text-white h-full bg-gray-900">
      <h2 className="text-xl mb-4">${appName}</h2>
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 bg-gray-800 rounded border border-gray-600"
          placeholder="Enter something..."
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
        />
        <button onClick={addItem} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
          Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="p-2 bg-gray-800 rounded">
            {item.text}
          </div>
        ))}
      </div>
    </div>
  )
}`,
        timestamp: new Date()
      }

      setGeneratedApps(prev => [...prev, newApp])
      setSelectedApp(newApp)
      setPrompt('')
    }
  }
  
  const launchApp = (app: GeneratedApp) => {
    // Create a dynamic component from the code
    const AppComponent = () => (
      <div className="h-full">
        <div className="p-4 text-white">
          <div className="mb-4">
            <h3 className="text-lg font-bold">{app.name}</h3>
            <p className="text-sm text-gray-400">{app.description}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <div className="text-center text-gray-400">
              App preview would be rendered here
              <br />
              <span className="text-xs">Code: {app.code.slice(0, 100)}...</span>
            </div>
          </div>
        </div>
      </div>
    )
    
    openWindow({
      title: app.name,
      component: AppComponent,
      position: { x: 300 + Math.random() * 100, y: 200 + Math.random() * 100 },
      size: { width: 500, height: 400 },
    })
    
    setEmotion('happy', 0.7)
    addMessage(`Launched ${app.name}! Pretty cool, right? Want me to modify it or build something else?`, 'sam', 'happy')
  }
  
  const deleteApp = (appId: string) => {
    setGeneratedApps(prev => prev.filter(app => app.id !== appId))
    if (selectedApp?.id === appId) {
      setSelectedApp(null)
    }
  }
  
  return (
    <div className="flex h-full bg-black/20 backdrop-blur-xl">
      {/* Sidebar - Generated Apps */}
      <div className="w-1/3 border-r border-white/10 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h2 className="text-white font-medium">Generated Apps</h2>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {generatedApps.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all border",
                  selectedApp?.id === app.id
                    ? "bg-blue-500/20 border-blue-400/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
                onClick={() => setSelectedApp(app)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{app.name}</div>
                    <div className="text-white/60 text-xs mt-1">{app.description}</div>
                    <div className="text-white/40 text-xs mt-1">
                      {app.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteApp(app.id)
                    }}
                    className="p-1 text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {generatedApps.length === 0 && (
          <div className="text-center text-white/60 text-sm mt-8">
            No apps generated yet.<br />
            Describe what you want to build!
          </div>
        )}
      </div>
      
      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Input Section */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Code className="w-5 h-5 text-purple-400" />
            <h2 className="text-white font-medium">App Forge</h2>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the app you want to build..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              onKeyPress={(e) => e.key === 'Enter' && generateApp()}
              disabled={isGenerating}
            />
            <button
              onClick={generateApp}
              disabled={!prompt.trim() || isGenerating}
              className="px-4 py-2 bg-purple-500/80 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span className="text-white text-sm">Build</span>
            </button>
          </div>
        </div>
        
        {/* Preview/Code Section */}
        <div className="flex-1 p-4">
          {selectedApp ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium text-lg">{selectedApp.name}</h3>
                  <p className="text-white/60 text-sm">{selectedApp.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => launchApp(selectedApp)}
                    className="px-3 py-2 bg-green-500/80 hover:bg-green-500 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    <span className="text-white text-sm">Launch</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 bg-gray-900/50 rounded-lg border border-white/10 overflow-hidden">
                <div className="p-3 border-b border-white/10 bg-gray-800/50">
                  <div className="text-white/80 text-sm font-mono">Generated Code</div>
                </div>
                <div className="p-4 h-full overflow-auto">
                  <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
                    {selectedApp.code}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div className="text-white/60">
                <Zap className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-lg mb-2">Ready to Build</h3>
                <p className="text-sm">
                  Tell Sam what kind of app you want to create.<br />
                  He'll generate the code and you can launch it instantly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
