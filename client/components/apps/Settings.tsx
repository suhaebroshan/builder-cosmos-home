import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useSamStore } from '@/store/sam-store'
import { 
  Settings as SettingsIcon, 
  Palette, 
  Volume2, 
  Monitor, 
  User, 
  Shield,
  Accessibility,
  Wifi,
  Battery,
  Moon,
  Sun,
  Sliders,
  Camera,
  Mic,
  Bell,
  Globe,
  HardDrive,
  Cpu,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsProps {
  windowId: string
}

export const Settings: React.FC<SettingsProps> = ({ windowId }) => {
  const { currentEmotion, setEmotion, currentTheme, setTheme, addMessage } = useSamStore()
  
  const [activeSection, setActiveSection] = useState('appearance')
  const [settings, setSettings] = useState({
    // Appearance
    theme: 'dark',
    accentColor: 'blue',
    windowOpacity: 80,
    glassEffect: 'high',
    animations: true,
    particleEffects: true,
    
    // Audio
    masterVolume: 70,
    systemSounds: true,
    samVoiceVolume: 80,
    notificationSounds: true,
    
    // Display
    resolution: '1920x1080',
    scaleFactor: 100,
    refreshRate: 60,
    nightMode: false,
    
    // Privacy
    dataCollection: false,
    analytics: false,
    locationServices: false,
    cameraAccess: true,
    microphoneAccess: true,
    
    // Accessibility
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReader: false,
    
    // Sam AI
    personality: 'casual',
    emotionIntensity: 70,
    proactiveMode: true,
    learningMode: true,
    voiceSpeed: 'normal',
  })
  
  const settingSections = [
    {
      id: 'appearance',
      name: 'Appearance',
      icon: Palette,
      description: 'Themes, colors, and visual effects'
    },
    {
      id: 'audio',
      name: 'Audio',
      icon: Volume2,
      description: 'Sound settings and voice controls'
    },
    {
      id: 'display',
      name: 'Display',
      icon: Monitor,
      description: 'Screen resolution and display options'
    },
    {
      id: 'sam',
      name: 'Sam AI',
      icon: User,
      description: 'AI personality and behavior settings'
    },
    {
      id: 'privacy',
      name: 'Privacy',
      icon: Shield,
      description: 'Data and security preferences'
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      icon: Accessibility,
      description: 'Accessibility and ease of use'
    },
    {
      id: 'system',
      name: 'System',
      icon: Cpu,
      description: 'Performance and system information'
    }
  ]
  
  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    
    // Apply certain settings immediately
    if (key === 'theme') {
      setTheme(value)
    }
    
    if (key === 'emotionIntensity') {
      setEmotion(currentEmotion, value / 100)
    }
    
    addMessage(`Updated ${key} setting, bruv! The OS is looking fresh.`, 'sam', 'happy')
  }
  
  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-medium mb-3">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {['dark', 'light', 'auto'].map(theme => (
            <button
              key={theme}
              onClick={() => updateSetting('theme', theme)}
              className={cn(
                "p-3 rounded-xl border transition-all capitalize",
                settings.theme === theme
                  ? "bg-blue-500/30 border-blue-400/50"
                  : "bg-white/5 border-white/20 hover:bg-white/10"
              )}
            >
              <div className="text-white text-sm">{theme}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-white font-medium mb-3">Accent Color</h3>
        <div className="grid grid-cols-6 gap-2">
          {['blue', 'purple', 'green', 'pink', 'orange', 'red'].map(color => (
            <button
              key={color}
              onClick={() => updateSetting('accentColor', color)}
              className={cn(
                "w-8 h-8 rounded-lg border-2 transition-all",
                settings.accentColor === color ? "border-white" : "border-transparent",
                color === 'blue' && "bg-blue-500",
                color === 'purple' && "bg-purple-500",
                color === 'green' && "bg-green-500",
                color === 'pink' && "bg-pink-500",
                color === 'orange' && "bg-orange-500",
                color === 'red' && "bg-red-500"
              )}
            />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-white font-medium mb-3">Window Opacity</h3>
        <input
          type="range"
          min="20"
          max="100"
          value={settings.windowOpacity}
          onChange={(e) => updateSetting('windowOpacity', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-white/60 text-sm mt-1">{settings.windowOpacity}%</div>
      </div>
      
      <div>
        <h3 className="text-white font-medium mb-3">Effects</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-white">Glass Effect</span>
            <select
              value={settings.glassEffect}
              onChange={(e) => updateSetting('glassEffect', e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-white">Animations</span>
            <input
              type="checkbox"
              checked={settings.animations}
              onChange={(e) => updateSetting('animations', e.target.checked)}
              className="toggle"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-white">Particle Effects</span>
            <input
              type="checkbox"
              checked={settings.particleEffects}
              onChange={(e) => updateSetting('particleEffects', e.target.checked)}
              className="toggle"
            />
          </label>
        </div>
      </div>
    </div>
  )
  
  const renderSamSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-medium mb-3">Personality</h3>
        <select
          value={settings.personality}
          onChange={(e) => updateSetting('personality', e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
        >
          <option value="casual">Casual & Friendly</option>
          <option value="professional">Professional</option>
          <option value="witty">Witty & Sarcastic</option>
          <option value="supportive">Supportive & Caring</option>
          <option value="energetic">Energetic & Excited</option>
        </select>
      </div>
      
      <div>
        <h3 className="text-white font-medium mb-3">Emotion Intensity</h3>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.emotionIntensity}
          onChange={(e) => updateSetting('emotionIntensity', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-white/60 text-sm mt-1">{settings.emotionIntensity}% emotional</div>
      </div>
      
      <div>
        <h3 className="text-white font-medium mb-3">Voice Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-white">Voice Volume</span>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.samVoiceVolume}
              onChange={(e) => updateSetting('samVoiceVolume', parseInt(e.target.value))}
              className="w-32"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-white">Speech Speed</span>
            <select
              value={settings.voiceSpeed}
              onChange={(e) => updateSetting('voiceSpeed', e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white"
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </label>
        </div>
      </div>
      
      <div>
        <h3 className="text-white font-medium mb-3">Behavior</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-white">Proactive Mode</span>
            <input
              type="checkbox"
              checked={settings.proactiveMode}
              onChange={(e) => updateSetting('proactiveMode', e.target.checked)}
              className="toggle"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-white">Learning Mode</span>
            <input
              type="checkbox"
              checked={settings.learningMode}
              onChange={(e) => updateSetting('learningMode', e.target.checked)}
              className="toggle"
            />
          </label>
        </div>
      </div>
    </div>
  )
  
  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'appearance':
        return renderAppearanceSettings()
      case 'sam':
        return renderSamSettings()
      case 'audio':
        return (
          <div className="space-y-4">
            <div className="text-white/60">Audio settings coming soon...</div>
          </div>
        )
      case 'display':
        return (
          <div className="space-y-4">
            <div className="text-white/60">Display settings coming soon...</div>
          </div>
        )
      case 'privacy':
        return (
          <div className="space-y-4">
            <div className="text-white/60">Privacy settings coming soon...</div>
          </div>
        )
      case 'accessibility':
        return (
          <div className="space-y-4">
            <div className="text-white/60">Accessibility settings coming soon...</div>
          </div>
        )
      case 'system':
        return (
          <div className="space-y-4">
            <div className="text-white/60">System information coming soon...</div>
          </div>
        )
      default:
        return renderAppearanceSettings()
    }
  }
  
  return (
    <div className="flex h-full bg-black/20 backdrop-blur-xl">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/10 p-4">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="w-5 h-5 text-blue-400" />
          <h2 className="text-white font-medium">Settings</h2>
        </div>
        
        <div className="space-y-2">
          {settingSections.map(section => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full p-3 rounded-xl border transition-all text-left",
                  activeSection === section.id
                    ? "bg-blue-500/20 border-blue-400/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-white/80" />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{section.name}</div>
                    <div className="text-white/60 text-xs">{section.description}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-white text-2xl font-bold capitalize">{activeSection}</h1>
          <p className="text-white/60 text-sm mt-1">
            {settingSections.find(s => s.id === activeSection)?.description}
          </p>
        </div>
        
        <div className="max-w-2xl">
          {renderCurrentSection()}
        </div>
      </div>
    </div>
  )
}
