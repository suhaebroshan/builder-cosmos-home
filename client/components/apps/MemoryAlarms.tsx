import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Clock, 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Bell, 
  BellOff,
  User,
  Tag,
  Filter,
  Search,
  Volume2,
  VolumeX
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSamStore, UserMemory, Alarm, ScheduleEvent } from '@/store/sam-store'

type TabType = 'memory' | 'alarms' | 'schedule'

export const MemoryAlarms: React.FC = () => {
  const {
    userMemories,
    alarms,
    schedule,
    userName,
    addMemory,
    updateMemory,
    removeMemory,
    getMemoriesByCategory,
    addAlarm,
    updateAlarm,
    removeAlarm,
    toggleAlarm,
    addScheduleEvent,
    updateScheduleEvent,
    removeScheduleEvent,
    getTodayEvents,
    setUserName,
    addMessage,
    setEmotion
  } = useSamStore()

  const [activeTab, setActiveTab] = useState<TabType>('memory')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form states
  const [newMemoryForm, setNewMemoryForm] = useState({
    key: '',
    value: '',
    category: 'personal' as UserMemory['category']
  })

  const [newAlarmForm, setNewAlarmForm] = useState({
    title: '',
    time: '',
    date: '',
    recurring: 'none' as Alarm['recurring'],
    sound: true,
    message: ''
  })

  const [newEventForm, setNewEventForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    category: 'personal' as ScheduleEvent['category'],
    priority: 'medium' as ScheduleEvent['priority']
  })

  // Check for triggered alarms
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === currentTime) {
          setEmotion('excited', 0.8)
          addMessage(`🔔 Alarm: ${alarm.title}${alarm.message ? ` - ${alarm.message}` : ''}`, 'sam', 'excited')
          
          if (alarm.sound) {
            // Play alarm sound
            const audio = new Audio('data:audio/wav;base64,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')
            audio.play().catch(console.error)
          }
        }
      })
    }

    const interval = setInterval(checkAlarms, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [alarms, setEmotion, addMessage])

  const filteredMemories = userMemories.filter(memory => {
    const matchesSearch = memory.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memory.value.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || memory.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAddMemory = () => {
    if (newMemoryForm.key && newMemoryForm.value) {
      addMemory(newMemoryForm.key, newMemoryForm.value, newMemoryForm.category)
      setNewMemoryForm({ key: '', value: '', category: 'personal' })
      setIsAddingNew(false)
      setEmotion('happy', 0.7)
      addMessage(`Got it! I'll remember that ${newMemoryForm.key}: ${newMemoryForm.value}`, 'sam', 'happy')
    }
  }

  const handleAddAlarm = () => {
    if (newAlarmForm.title && newAlarmForm.time) {
      addAlarm({
        title: newAlarmForm.title,
        time: newAlarmForm.time,
        date: newAlarmForm.date || undefined,
        enabled: true,
        recurring: newAlarmForm.recurring,
        sound: newAlarmForm.sound,
        message: newAlarmForm.message || undefined
      })
      setNewAlarmForm({ title: '', time: '', date: '', recurring: 'none', sound: true, message: '' })
      setIsAddingNew(false)
      setEmotion('focused', 0.8)
      addMessage(`Alarm set for ${newAlarmForm.time}! I'll make sure to wake you up, bruv.`, 'sam', 'focused')
    }
  }

  const handleAddEvent = () => {
    if (newEventForm.title && newEventForm.startTime) {
      const startTime = new Date(newEventForm.startTime)
      const endTime = newEventForm.endTime ? new Date(newEventForm.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000)
      
      addScheduleEvent({
        title: newEventForm.title,
        description: newEventForm.description,
        startTime,
        endTime,
        category: newEventForm.category,
        priority: newEventForm.priority
      })
      setNewEventForm({ title: '', description: '', startTime: '', endTime: '', category: 'personal', priority: 'medium' })
      setIsAddingNew(false)
      setEmotion('excited', 0.7)
      addMessage(`Event scheduled! I'll keep track of "${newEventForm.title}" for you.`, 'sam', 'excited')
    }
  }

  const renderMemoryTab = () => (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white focus:border-purple-400/50 focus:outline-none"
        >
          <option value="all">All Categories</option>
          <option value="personal">Personal</option>
          <option value="preference">Preference</option>
          <option value="task">Task</option>
          <option value="note">Note</option>
        </select>
        <button
          onClick={() => setIsAddingNew(true)}
          className="p-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 text-purple-400" />
        </button>
      </div>

      {/* Add new memory form */}
      {isAddingNew && activeTab === 'memory' && (
        <motion.div
          className="bg-black/40 border border-purple-500/30 rounded-lg p-4 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-white font-semibold">Add New Memory</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Memory key (e.g., 'favorite color')"
              value={newMemoryForm.key}
              onChange={(e) => setNewMemoryForm({ ...newMemoryForm, key: e.target.value })}
              className="px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none"
            />
            <select
              value={newMemoryForm.category}
              onChange={(e) => setNewMemoryForm({ ...newMemoryForm, category: e.target.value as UserMemory['category'] })}
              className="px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white focus:border-purple-400/50 focus:outline-none"
            >
              <option value="personal">Personal</option>
              <option value="preference">Preference</option>
              <option value="task">Task</option>
              <option value="note">Note</option>
            </select>
          </div>
          <textarea
            placeholder="Memory value"
            value={newMemoryForm.value}
            onChange={(e) => setNewMemoryForm({ ...newMemoryForm, value: e.target.value })}
            className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddMemory}
              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/40 rounded transition-colors text-green-400"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Save
            </button>
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 rounded transition-colors text-red-400"
            >
              <X className="w-4 h-4 inline mr-2" />
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Memory list */}
      <div className="space-y-2">
        {filteredMemories.map((memory) => (
          <motion.div
            key={memory.id}
            className="bg-black/40 border border-purple-500/30 rounded-lg p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-medium">{memory.key}</h4>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs",
                    {
                      'bg-blue-500/20 text-blue-400': memory.category === 'personal',
                      'bg-green-500/20 text-green-400': memory.category === 'preference',
                      'bg-yellow-500/20 text-yellow-400': memory.category === 'task',
                      'bg-purple-500/20 text-purple-400': memory.category === 'note'
                    }
                  )}>
                    {memory.category}
                  </span>
                </div>
                <p className="text-purple-300">{memory.value}</p>
                <p className="text-purple-500 text-xs mt-2">
                  {memory.timestamp.toLocaleDateString()} at {memory.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex gap-2">
                {memory.editable && (
                  <button
                    onClick={() => setEditingId(memory.id)}
                    className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-blue-400" />
                  </button>
                )}
                <button
                  onClick={() => removeMemory(memory.id)}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderAlarmsTab = () => (
    <div className="space-y-4">
      {/* Add alarm button */}
      <div className="flex justify-between items-center">
        <h3 className="text-white font-semibold">Your Alarms</h3>
        <button
          onClick={() => setIsAddingNew(true)}
          className="p-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 text-purple-400" />
        </button>
      </div>

      {/* Add new alarm form */}
      {isAddingNew && activeTab === 'alarms' && (
        <motion.div
          className="bg-black/40 border border-purple-500/30 rounded-lg p-4 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-white font-semibold">Add New Alarm</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Alarm title"
              value={newAlarmForm.title}
              onChange={(e) => setNewAlarmForm({ ...newAlarmForm, title: e.target.value })}
              className="px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none"
            />
            <input
              type="time"
              value={newAlarmForm.time}
              onChange={(e) => setNewAlarmForm({ ...newAlarmForm, time: e.target.value })}
              className="px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white focus:border-purple-400/50 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={newAlarmForm.date}
              onChange={(e) => setNewAlarmForm({ ...newAlarmForm, date: e.target.value })}
              className="px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white focus:border-purple-400/50 focus:outline-none"
            />
            <select
              value={newAlarmForm.recurring}
              onChange={(e) => setNewAlarmForm({ ...newAlarmForm, recurring: e.target.value as Alarm['recurring'] })}
              className="px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white focus:border-purple-400/50 focus:outline-none"
            >
              <option value="none">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="weekdays">Weekdays</option>
            </select>
          </div>
          <textarea
            placeholder="Alarm message (optional)"
            value={newAlarmForm.message}
            onChange={(e) => setNewAlarmForm({ ...newAlarmForm, message: e.target.value })}
            className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none resize-none"
            rows={2}
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={newAlarmForm.sound}
                onChange={(e) => setNewAlarmForm({ ...newAlarmForm, sound: e.target.checked })}
                className="rounded"
              />
              Play sound
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddAlarm}
              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/40 rounded transition-colors text-green-400"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Save Alarm
            </button>
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 rounded transition-colors text-red-400"
            >
              <X className="w-4 h-4 inline mr-2" />
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Alarms list */}
      <div className="space-y-2">
        {alarms.map((alarm) => (
          <motion.div
            key={alarm.id}
            className={cn(
              "bg-black/40 border border-purple-500/30 rounded-lg p-4",
              alarm.enabled ? "border-green-500/30" : "border-gray-500/30"
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleAlarm(alarm.id)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      alarm.enabled ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                    )}
                  >
                    {alarm.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>
                  <div>
                    <h4 className="text-white font-medium">{alarm.title}</h4>
                    <p className="text-purple-300">
                      {alarm.time} {alarm.date && `on ${alarm.date}`}
                      {alarm.recurring !== 'none' && ` (${alarm.recurring})`}
                    </p>
                    {alarm.message && <p className="text-purple-400 text-sm">{alarm.message}</p>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {alarm.sound ? (
                  <Volume2 className="w-4 h-4 text-purple-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
                <button
                  onClick={() => removeAlarm(alarm.id)}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderScheduleTab = () => (
    <div className="space-y-4">
      {/* Add event button */}
      <div className="flex justify-between items-center">
        <h3 className="text-white font-semibold">Your Schedule</h3>
        <button
          onClick={() => setIsAddingNew(true)}
          className="p-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 text-purple-400" />
        </button>
      </div>

      {/* Add new event form */}
      {isAddingNew && activeTab === 'schedule' && (
        <motion.div
          className="bg-black/40 border border-purple-500/30 rounded-lg p-4 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-white font-semibold">Add New Event</h3>
          <input
            type="text"
            placeholder="Event title"
            value={newEventForm.title}
            onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
            className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none"
          />
          <textarea
            placeholder="Event description (optional)"
            value={newEventForm.description}
            onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
            className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white placeholder-purple-300/50 focus:border-purple-400/50 focus:outline-none resize-none"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="datetime-local"
              value={newEventForm.startTime}
              onChange={(e) => setNewEventForm({ ...newEventForm, startTime: e.target.value })}
              className="px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white focus:border-purple-400/50 focus:outline-none"
            />
            <input
              type="datetime-local"
              value={newEventForm.endTime}
              onChange={(e) => setNewEventForm({ ...newEventForm, endTime: e.target.value })}
              className="px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white focus:border-purple-400/50 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={newEventForm.category}
              onChange={(e) => setNewEventForm({ ...newEventForm, category: e.target.value as ScheduleEvent['category'] })}
              className="px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white focus:border-purple-400/50 focus:outline-none"
            >
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="meeting">Meeting</option>
              <option value="reminder">Reminder</option>
            </select>
            <select
              value={newEventForm.priority}
              onChange={(e) => setNewEventForm({ ...newEventForm, priority: e.target.value as ScheduleEvent['priority'] })}
              className="px-3 py-2 bg-black/40 border border-purple-500/30 rounded text-white focus:border-purple-400/50 focus:outline-none"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddEvent}
              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/40 rounded transition-colors text-green-400"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Save Event
            </button>
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 rounded transition-colors text-red-400"
            >
              <X className="w-4 h-4 inline mr-2" />
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Schedule list */}
      <div className="space-y-2">
        {schedule.sort((a, b) => a.startTime.getTime() - b.startTime.getTime()).map((event) => (
          <motion.div
            key={event.id}
            className={cn(
              "bg-black/40 border border-purple-500/30 rounded-lg p-4",
              {
                'border-red-500/30': event.priority === 'high',
                'border-yellow-500/30': event.priority === 'medium',
                'border-gray-500/30': event.priority === 'low'
              }
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-medium">{event.title}</h4>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs",
                    {
                      'bg-blue-500/20 text-blue-400': event.category === 'personal',
                      'bg-green-500/20 text-green-400': event.category === 'work',
                      'bg-purple-500/20 text-purple-400': event.category === 'meeting',
                      'bg-yellow-500/20 text-yellow-400': event.category === 'reminder'
                    }
                  )}>
                    {event.category}
                  </span>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs",
                    {
                      'bg-red-500/20 text-red-400': event.priority === 'high',
                      'bg-yellow-500/20 text-yellow-400': event.priority === 'medium',
                      'bg-gray-500/20 text-gray-400': event.priority === 'low'
                    }
                  )}>
                    {event.priority}
                  </span>
                </div>
                {event.description && <p className="text-purple-300 mb-2">{event.description}</p>}
                <p className="text-purple-400 text-sm">
                  {event.startTime.toLocaleDateString()} {event.startTime.toLocaleTimeString()} - {event.endTime.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => removeScheduleEvent(event.id)}
                className="p-1 hover:bg-red-500/20 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-950 via-black to-violet-950 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
          Memory & Alarms
        </h1>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-purple-400" />
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="px-2 py-1 bg-black/40 border border-purple-500/30 rounded text-white text-sm focus:border-purple-400/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { id: 'memory', label: 'Memory', icon: Brain },
          { id: 'alarms', label: 'Alarms', icon: Clock },
          { id: 'schedule', label: 'Schedule', icon: Calendar }
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id)
              setIsAddingNew(false)
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              activeTab === id
                ? "bg-purple-500/30 text-white border border-purple-400/50"
                : "bg-black/20 text-purple-300 hover:bg-purple-500/20"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'memory' && renderMemoryTab()}
            {activeTab === 'alarms' && renderAlarmsTab()}
            {activeTab === 'schedule' && renderScheduleTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
