import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSamStore } from '@/store/sam-store'
import { useThemeStore } from '@/store/theme-store'
import { useDeviceAuthStore, AuthMethod, DeviceType } from '@/store/device-auth-store'
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
  ChevronRight,
  Upload,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Speaker,
  SpeakerX,
  Zap,
  ZapOff,
  Smartphone,
  Tablet,
  Lock,
  Fingerprint,
  Key,
  Grid3X3,
  Unlock,
  Timer,
  Hand,
  Vibrate,
  Gauge
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsProps {
  windowId: string
}

export const Settings: React.FC<SettingsProps> = ({ windowId }) => {
  const {
    currentEmotion,
    setEmotion,
    currentTheme,
    setTheme,
    addMessage,
    userName,
    setUserName,
    userMemories,
    alarms,
    schedule
  } = useSamStore()

  const { isDarkMode, setDarkMode } = useThemeStore()

  const {
    authMethod,
    passcode,
    pattern,
    biometricEnabled,
    autoLockTimeout,
    deviceType,
    navigationStyle,
    showStatusBar,
    statusBarStyle,
    showNotificationDots,
    enableHapticFeedback,
    animationSpeed,
    quickSettingsEnabled,
    quickSettingsTiles,
    setAuthMethod,
    setPasscode,
    setPattern,
    setBiometric,
    setAutoLockTimeout,
    setDeviceType,
    setNavigationStyle,
    setStatusBarPreferences,
    setNotificationDots,
    setHapticFeedback,
    setAnimationSpeed,
    setQuickSettings
  } = useDeviceAuthStore()
  
  const [activeSection, setActiveSection] = useState('profile')
  const [profilePicture, setProfilePicture] = useState(() => {
    return localStorage.getItem('nyx-profile-picture') || '👤'
  })
  const [tempProfilePic, setTempProfilePic] = useState(profilePicture)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('nyx-settings')
    return savedSettings ? JSON.parse(savedSettings) : {
      // Profile
      displayName: userName,
      email: 'user@nyx.os',
      bio: 'Digital explorer in the quantum realm',
      
      // Appearance
      theme: isDarkMode ? 'dark' : 'light',
      accentColor: 'purple',
      windowOpacity: 85,
      glassEffect: 'high',
      animations: true,
      particleEffects: true,
      wallpaperStyle: 'dynamic',
      
      // Audio
      masterVolume: 70,
      systemSounds: true,
      samVoiceVolume: 80,
      notificationSounds: true,
      voiceEffects: true,
      
      // Display
      fontSize: 14,
      scaleFactor: 100,
      nightMode: false,
      autoHideTaskbar: false,
      desktopIcons: true,
      
      // Privacy & Security
      dataCollection: false,
      analytics: false,
      locationServices: false,
      cameraAccess: true,
      microphoneAccess: true,
      biometricLogin: false,
      
      // Accessibility
      highContrast: false,
      largeText: false,
      reduceMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      
      // Sam AI
      personality: 'casual',
      emotionIntensity: 70,
      proactiveMode: true,
      learningMode: true,
      voiceSpeed: 'normal',
      memoryRetention: 'high',
      
      // System
      autoSave: true,
      notificationFrequency: 'normal',
      powerSaving: false,
      debugMode: false
    }
  })

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('nyx-settings', JSON.stringify(settings))
  }, [settings])

  // Save profile picture to localStorage
  useEffect(() => {
    localStorage.setItem('nyx-profile-picture', profilePicture)
  }, [profilePicture])

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    
    // Apply certain settings immediately
    switch (key) {
      case 'theme':
        setDarkMode(value === 'dark')
        break
      case 'displayName':
        setUserName(value)
        break
      case 'emotionIntensity':
        // Update Sam's current emotion intensity
        setEmotion(currentEmotion, value / 100)
        break
    }
    
    // Sam reactions to setting changes
    if (key === 'personality') {
      setEmotion('excited', 0.8)
      addMessage(`Personality updated to ${value}! I'm feeling fresh, bro.`, 'sam', 'excited')
    } else if (key === 'theme') {
      setEmotion('happy', 0.7)
      addMessage(`${value === 'dark' ? 'Dark' : 'Light'} mode activated! Looking sleek.`, 'sam', 'happy')
    }
  }

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setTempProfilePic(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProfilePicture = () => {
    setProfilePicture(tempProfilePic)
    setEmotion('happy', 0.8)
    addMessage('Profile picture updated! Looking fresh, my dude.', 'sam', 'happy')
  }

  const resetProfilePicture = () => {
    setTempProfilePic('👤')
    setProfilePicture('👤')
  }

  const settingSections = [
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      description: 'Personal information and avatar'
    },
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
      description: 'Screen and interface settings'
    },
    {
      id: 'sam',
      name: 'Sam AI',
      icon: User,
      description: 'AI personality and behavior'
    },
    {
      id: 'privacy',
      name: 'Privacy',
      icon: Shield,
      description: 'Security and data protection'
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
      description: 'System performance and advanced options'
    }
  ]

  const Slider: React.FC<{
    label: string
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    unit?: string
  }> = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = '' }) => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-white text-sm">{label}</label>
        <span className="text-purple-300 text-sm">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  )

  const Toggle: React.FC<{
    label: string
    description?: string
    checked: boolean
    onChange: (checked: boolean) => void
  }> = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-white text-sm">{label}</div>
        {description && <div className="text-purple-300/70 text-xs">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "w-12 h-6 rounded-full transition-colors relative",
          checked ? "bg-purple-500" : "bg-gray-600"
        )}
      >
        <div
          className={cn(
            "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform",
            checked ? "translate-x-7" : "translate-x-1"
          )}
        />
      </button>
    </div>
  )

  const Select: React.FC<{
    label: string
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
  }> = ({ label, value, onChange, options }) => (
    <div className="space-y-2">
      <label className="text-white text-sm">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:border-purple-400/50 focus:outline-none"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  )

  const renderProfileSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Profile Settings</h3>
      
      {/* Profile Picture */}
      <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6">
        <h4 className="text-white font-medium mb-4">Profile Picture</h4>
        <div className="flex items-center gap-6">
          <div className="relative">
            {tempProfilePic.startsWith('data:') ? (
              <img
                src={tempProfilePic}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-500/50"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center text-4xl border-2 border-purple-500/50">
                {tempProfilePic}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg transition-colors text-purple-300 text-sm flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Image
              </button>
              <button
                onClick={saveProfilePicture}
                disabled={tempProfilePic === profilePicture}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-green-300 text-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={resetProfilePicture}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors text-red-300 text-sm flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
            <p className="text-purple-300/70 text-xs">Upload a custom image or use an emoji</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleProfilePictureUpload}
          className="hidden"
        />
      </div>

      {/* Personal Information */}
      <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 space-y-4">
        <h4 className="text-white font-medium">Personal Information</h4>
        
        <div className="space-y-2">
          <label className="text-white text-sm">Display Name</label>
          <input
            type="text"
            value={settings.displayName}
            onChange={(e) => updateSetting('displayName', e.target.value)}
            className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:border-purple-400/50 focus:outline-none"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-white text-sm">Email</label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => updateSetting('email', e.target.value)}
            className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:border-purple-400/50 focus:outline-none"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-white text-sm">Bio</label>
          <textarea
            value={settings.bio}
            onChange={(e) => updateSetting('bio', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:border-purple-400/50 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Account Stats */}
      <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6">
        <h4 className="text-white font-medium mb-4">Account Statistics</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{userMemories.length}</div>
            <div className="text-purple-300 text-sm">Memories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{alarms.length}</div>
            <div className="text-purple-300 text-sm">Alarms</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{schedule.length}</div>
            <div className="text-purple-300 text-sm">Events</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Appearance Settings</h3>
      
      <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 space-y-4">
        <Select
          label="Theme"
          value={settings.theme}
          onChange={(value) => updateSetting('theme', value)}
          options={[
            { value: 'light', label: 'Light Mode' },
            { value: 'dark', label: 'Dark Mode' },
            { value: 'auto', label: 'Auto (System)' }
          ]}
        />
        
        <Select
          label="Accent Color"
          value={settings.accentColor}
          onChange={(value) => updateSetting('accentColor', value)}
          options={[
            { value: 'purple', label: 'Purple' },
            { value: 'blue', label: 'Blue' },
            { value: 'green', label: 'Green' },
            { value: 'red', label: 'Red' },
            { value: 'orange', label: 'Orange' }
          ]}
        />
        
        <Slider
          label="Window Opacity"
          value={settings.windowOpacity}
          onChange={(value) => updateSetting('windowOpacity', value)}
          min={20}
          max={100}
          unit="%"
        />
        
        <Select
          label="Glass Effect"
          value={settings.glassEffect}
          onChange={(value) => updateSetting('glassEffect', value)}
          options={[
            { value: 'none', label: 'None' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' }
          ]}
        />
        
        <Toggle
          label="Animations"
          description="Enable smooth animations and transitions"
          checked={settings.animations}
          onChange={(checked) => updateSetting('animations', checked)}
        />
        
        <Toggle
          label="Particle Effects"
          description="Show floating particles and visual effects"
          checked={settings.particleEffects}
          onChange={(checked) => updateSetting('particleEffects', checked)}
        />
      </div>
    </div>
  )

  const renderAudioSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Audio Settings</h3>
      
      <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 space-y-4">
        <Slider
          label="Master Volume"
          value={settings.masterVolume}
          onChange={(value) => updateSetting('masterVolume', value)}
          unit="%"
        />
        
        <Slider
          label="Sam Voice Volume"
          value={settings.samVoiceVolume}
          onChange={(value) => updateSetting('samVoiceVolume', value)}
          unit="%"
        />
        
        <Toggle
          label="System Sounds"
          description="Play sounds for system events"
          checked={settings.systemSounds}
          onChange={(checked) => updateSetting('systemSounds', checked)}
        />
        
        <Toggle
          label="Notification Sounds"
          description="Play sounds for notifications"
          checked={settings.notificationSounds}
          onChange={(checked) => updateSetting('notificationSounds', checked)}
        />
        
        <Toggle
          label="Voice Effects"
          description="Apply audio effects to Sam's voice"
          checked={settings.voiceEffects}
          onChange={(checked) => updateSetting('voiceEffects', checked)}
        />
        
        <Select
          label="Voice Speed"
          value={settings.voiceSpeed}
          onChange={(value) => updateSetting('voiceSpeed', value)}
          options={[
            { value: 'slow', label: 'Slow' },
            { value: 'normal', label: 'Normal' },
            { value: 'fast', label: 'Fast' }
          ]}
        />
      </div>
    </div>
  )

  const renderDisplaySection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Display Settings</h3>
      
      <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 space-y-4">
        <Slider
          label="Font Size"
          value={settings.fontSize}
          onChange={(value) => updateSetting('fontSize', value)}
          min={10}
          max={24}
          unit="px"
        />
        
        <Slider
          label="UI Scale Factor"
          value={settings.scaleFactor}
          onChange={(value) => updateSetting('scaleFactor', value)}
          min={75}
          max={150}
          unit="%"
        />
        
        <Toggle
          label="Night Mode"
          description="Reduce blue light for better sleep"
          checked={settings.nightMode}
          onChange={(checked) => updateSetting('nightMode', checked)}
        />
        
        <Toggle
          label="Auto-hide Taskbar"
          description="Hide taskbar when not in use"
          checked={settings.autoHideTaskbar}
          onChange={(checked) => updateSetting('autoHideTaskbar', checked)}
        />
        
        <Toggle
          label="Desktop Icons"
          description="Show icons on desktop"
          checked={settings.desktopIcons}
          onChange={(checked) => updateSetting('desktopIcons', checked)}
        />
      </div>
    </div>
  )

  const renderSamSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Sam AI Settings</h3>
      
      <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 space-y-4">
        <Select
          label="Personality"
          value={settings.personality}
          onChange={(value) => updateSetting('personality', value)}
          options={[
            { value: 'professional', label: 'Professional' },
            { value: 'casual', label: 'Casual' },
            { value: 'playful', label: 'Playful' },
            { value: 'sarcastic', label: 'Sarcastic' },
            { value: 'helpful', label: 'Helpful' }
          ]}
        />
        
        <Slider
          label="Emotion Intensity"
          value={settings.emotionIntensity}
          onChange={(value) => updateSetting('emotionIntensity', value)}
          unit="%"
        />
        
        <Toggle
          label="Proactive Mode"
          description="Sam can initiate conversations and suggestions"
          checked={settings.proactiveMode}
          onChange={(checked) => updateSetting('proactiveMode', checked)}
        />
        
        <Toggle
          label="Learning Mode"
          description="Sam learns from your interactions"
          checked={settings.learningMode}
          onChange={(checked) => updateSetting('learningMode', checked)}
        />
        
        <Select
          label="Memory Retention"
          value={settings.memoryRetention}
          onChange={(value) => updateSetting('memoryRetention', value)}
          options={[
            { value: 'low', label: 'Low (1 week)' },
            { value: 'medium', label: 'Medium (1 month)' },
            { value: 'high', label: 'High (1 year)' },
            { value: 'permanent', label: 'Permanent' }
          ]}
        />
      </div>
    </div>
  )

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Privacy & Security</h3>
      
      <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 space-y-4">
        <Toggle
          label="Data Collection"
          description="Allow anonymous usage data collection"
          checked={settings.dataCollection}
          onChange={(checked) => updateSetting('dataCollection', checked)}
        />
        
        <Toggle
          label="Analytics"
          description="Help improve Nyx OS with usage analytics"
          checked={settings.analytics}
          onChange={(checked) => updateSetting('analytics', checked)}
        />
        
        <Toggle
          label="Location Services"
          description="Allow location-based features"
          checked={settings.locationServices}
          onChange={(checked) => updateSetting('locationServices', checked)}
        />
        
        <Toggle
          label="Camera Access"
          description="Allow apps to access camera"
          checked={settings.cameraAccess}
          onChange={(checked) => updateSetting('cameraAccess', checked)}
        />
        
        <Toggle
          label="Microphone Access"
          description="Allow apps to access microphone"
          checked={settings.microphoneAccess}
          onChange={(checked) => updateSetting('microphoneAccess', checked)}
        />
        
        <Toggle
          label="Biometric Login"
          description="Use fingerprint or face recognition"
          checked={settings.biometricLogin}
          onChange={(checked) => updateSetting('biometricLogin', checked)}
        />
      </div>
    </div>
  )

  const renderAccessibilitySection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Accessibility</h3>
      
      <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 space-y-4">
        <Toggle
          label="High Contrast"
          description="Increase contrast for better visibility"
          checked={settings.highContrast}
          onChange={(checked) => updateSetting('highContrast', checked)}
        />
        
        <Toggle
          label="Large Text"
          description="Use larger font sizes throughout the system"
          checked={settings.largeText}
          onChange={(checked) => updateSetting('largeText', checked)}
        />
        
        <Toggle
          label="Reduce Motion"
          description="Minimize animations and transitions"
          checked={settings.reduceMotion}
          onChange={(checked) => updateSetting('reduceMotion', checked)}
        />
        
        <Toggle
          label="Screen Reader"
          description="Enable screen reader compatibility"
          checked={settings.screenReader}
          onChange={(checked) => updateSetting('screenReader', checked)}
        />
        
        <Toggle
          label="Keyboard Navigation"
          description="Enhanced keyboard navigation support"
          checked={settings.keyboardNavigation}
          onChange={(checked) => updateSetting('keyboardNavigation', checked)}
        />
      </div>
    </div>
  )

  const renderSystemSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">System Settings</h3>
      
      <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 space-y-4">
        <Toggle
          label="Auto Save"
          description="Automatically save work and settings"
          checked={settings.autoSave}
          onChange={(checked) => updateSetting('autoSave', checked)}
        />
        
        <Select
          label="Notification Frequency"
          value={settings.notificationFrequency}
          onChange={(value) => updateSetting('notificationFrequency', value)}
          options={[
            { value: 'minimal', label: 'Minimal' },
            { value: 'normal', label: 'Normal' },
            { value: 'frequent', label: 'Frequent' },
            { value: 'all', label: 'All' }
          ]}
        />
        
        <Toggle
          label="Power Saving"
          description="Optimize for battery life"
          checked={settings.powerSaving}
          onChange={(checked) => updateSetting('powerSaving', checked)}
        />
        
        <Toggle
          label="Debug Mode"
          description="Show advanced debugging information"
          checked={settings.debugMode}
          onChange={(checked) => updateSetting('debugMode', checked)}
        />
      </div>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection()
      case 'appearance': return renderAppearanceSection()
      case 'audio': return renderAudioSection()
      case 'display': return renderDisplaySection()
      case 'sam': return renderSamSection()
      case 'privacy': return renderPrivacySection()
      case 'accessibility': return renderAccessibilitySection()
      case 'system': return renderSystemSection()
      default: return renderProfileSection()
    }
  }

  return (
    <div className="flex h-full bg-gradient-to-br from-purple-950 via-black to-violet-950">
      {/* Sidebar */}
      <div className="w-80 bg-black/20 border-r border-purple-500/20 p-4">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="w-5 h-5 text-purple-400" />
          <h1 className="text-lg font-semibold text-white">Settings</h1>
        </div>
        
        <div className="space-y-1">
          {settingSections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                  activeSection === section.id
                    ? "bg-purple-500/30 text-white border border-purple-400/50"
                    : "text-purple-300 hover:bg-purple-500/20"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">{section.name}</div>
                  <div className="text-xs opacity-70">{section.description}</div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
