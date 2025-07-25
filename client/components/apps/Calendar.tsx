import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSamStore } from '@/store/sam-store'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  Bell,
  MapPin,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarProps {
  windowId: string
}

interface Event {
  id: string
  title: string
  description?: string
  date: Date
  time: string
  duration: number // in minutes
  type: 'meeting' | 'reminder' | 'task' | 'personal'
}

export const Calendar: React.FC<CalendarProps> = ({ windowId }) => {
  const { addMessage, setEmotion } = useSamStore()
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showEventForm, setShowEventForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    time: '09:00',
    duration: 60,
    type: 'meeting' as Event['type']
  })
  
  // Mock events
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Morning standup',
      description: 'Daily team sync',
      date: new Date(),
      time: '09:00',
      duration: 30,
      type: 'meeting'
    },
    {
      id: '2',
      title: 'Work on SamOS',
      description: 'Continue building the OS',
      date: new Date(),
      time: '10:00',
      duration: 120,
      type: 'task'
    },
    {
      id: '3',
      title: 'Lunch break',
      date: new Date(),
      time: '12:00',
      duration: 60,
      type: 'personal'
    }
  ])
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }
  
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    )
  }
  
  const addEvent = () => {
    if (!newEvent.title.trim()) return
    
    const event: Event = {
      id: `event-${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description,
      date: selectedDate,
      time: newEvent.time,
      duration: newEvent.duration,
      type: newEvent.type
    }
    
    setEvents(prev => [...prev, event])
    setNewEvent({
      title: '',
      description: '',
      time: '09:00',
      duration: 60,
      type: 'meeting'
    })
    setShowEventForm(false)
    setEmotion('happy', 0.7)
    addMessage(`Added "${event.title}" to your calendar, bruv! I'll make sure you don't forget.`, 'sam', 'happy')
  }
  
  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId))
    setEmotion('neutral', 0.6)
    addMessage('Event deleted. Your schedule is looking cleaner now.', 'sam', 'neutral')
  }
  
  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500/80'
      case 'task': return 'bg-green-500/80'
      case 'reminder': return 'bg-yellow-500/80'
      case 'personal': return 'bg-purple-500/80'
      default: return 'bg-gray-500/80'
    }
  }
  
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  return (
    <div className="flex h-full bg-black/30 backdrop-blur-sm">
      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
              <h2 className="text-white font-medium">Chrono</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-white font-medium min-w-[150px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Calendar */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-7 gap-1 h-full">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-white/60 text-sm font-medium">
                {day}
              </div>
            ))}
            
            {/* Empty days */}
            {emptyDays.map(day => (
              <div key={`empty-${day}`} className="p-2" />
            ))}
            
            {/* Days */}
            {days.map(day => {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
              const isToday = date.toDateString() === new Date().toDateString()
              const isSelected = date.toDateString() === selectedDate.toDateString()
              const dayEvents = getEventsForDate(date)
              
              return (
                <motion.div
                  key={day}
                  className={cn(
                    "p-2 cursor-pointer rounded-lg border transition-all",
                    isSelected ? "bg-blue-500/30 border-blue-400/50" : "border-white/10 hover:bg-white/5",
                    isToday && "ring-2 ring-yellow-400/50"
                  )}
                  onClick={() => setSelectedDate(date)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isToday ? "text-yellow-400" : "text-white"
                  )}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs px-1 py-0.5 rounded text-white truncate",
                          getEventTypeColor(event.type)
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-white/60">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Sidebar */}
      <div className="w-80 border-l border-white/10 flex flex-col">
        {/* Selected Date */}
        <div className="p-4 border-b border-white/10">
          <div className="text-white font-medium mb-2">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <button
            onClick={() => setShowEventForm(true)}
            className="w-full px-3 py-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-white text-sm">Add Event</span>
          </button>
        </div>
        
        {/* Events List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-white/80 text-sm font-medium mb-3">Events</h3>
            <AnimatePresence>
              {getEventsForDate(selectedDate).map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{event.title}</div>
                      {event.description && (
                        <div className="text-white/60 text-xs mt-1">{event.description}</div>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
                        <Clock className="w-3 h-3" />
                        <span>{event.time}</span>
                        <span>({event.duration}m)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="p-1 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {getEventsForDate(selectedDate).length === 0 && (
              <div className="text-center text-white/60 text-sm">
                No events for this day
              </div>
            )}
          </div>
        </div>
        
        {/* Event Form */}
        <AnimatePresence>
          {showEventForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-4 border-t border-white/10 bg-black/20"
            >
              <h3 className="text-white font-medium mb-3">New Event</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Event title"
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                />
                <input
                  type="text"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description (optional)"
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                />
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  />
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                    className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="task">Task</option>
                    <option value="reminder">Reminder</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEventForm(false)}
                    className="flex-1 p-2 text-white/60 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addEvent}
                    className="flex-1 p-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg transition-colors text-white"
                  >
                    Add Event
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
