import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
  Trash2,
  Edit,
  Users,
  Video,
  Phone,
  Mail,
  FileText,
  Star,
  X,
  Check,
  AlertCircle,
  Repeat,
  Globe,
  Zap,
  Filter,
  Search,
  Download,
  Upload,
  Settings,
  MoreVertical
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
  startTime: string
  endTime: string
  type: 'meeting' | 'reminder' | 'task' | 'personal' | 'work' | 'appointment'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  location?: string
  attendees?: string[]
  isRecurring?: boolean
  recurrenceType?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  reminders?: number[] // minutes before
  status: 'upcoming' | 'completed' | 'cancelled'
  color?: string
  isAllDay?: boolean
  created: Date
  modified: Date
}

interface CalendarView {
  type: 'month' | 'week' | 'day' | 'agenda'
}

const EVENT_COLORS = {
  meeting: '#3b82f6',
  work: '#8b5cf6',
  personal: '#10b981',
  reminder: '#f59e0b',
  task: '#ef4444',
  appointment: '#06b6d4'
}

const PRIORITY_COLORS = {
  low: '#6b7280',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#dc2626'
}

export const Calendar: React.FC<CalendarProps> = ({ windowId }) => {
  const { addMessage, setEmotion } = useSamStore()
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>({ type: 'month' })
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showEventDetails, setShowEventDetails] = useState<Event | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<Event['type'] | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    type: 'meeting' as Event['type'],
    priority: 'medium' as Event['priority'],
    location: '',
    attendees: [] as string[],
    isRecurring: false,
    recurrenceType: 'weekly' as Event['recurrenceType'],
    reminders: [15] as number[],
    isAllDay: false
  })
  
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('nyx-calendar-events')
    if (saved) {
      return JSON.parse(saved).map((e: any) => ({
        ...e,
        date: new Date(e.date),
        created: new Date(e.created),
        modified: new Date(e.modified)
      }))
    }
    
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    return [
      {
        id: '1',
        title: 'Team Standup',
        description: 'Daily sync with the development team',
        date: now,
        startTime: '09:00',
        endTime: '09:30',
        type: 'meeting',
        priority: 'medium',
        location: 'Conference Room A',
        attendees: ['john@company.com', 'sarah@company.com'],
        reminders: [15, 5],
        status: 'upcoming',
        created: now,
        modified: now
      },
      {
        id: '2',
        title: 'Investor Presentation',
        description: 'Present Nyx OS to potential investors',
        date: tomorrow,
        startTime: '14:00',
        endTime: '15:30',
        type: 'work',
        priority: 'urgent',
        location: 'Main Conference Room',
        attendees: ['investors@fund.com', 'ceo@company.com'],
        reminders: [60, 30, 15],
        status: 'upcoming',
        created: now,
        modified: now
      },
      {
        id: '3',
        title: 'Doctor Appointment',
        description: 'Annual checkup',
        date: nextWeek,
        startTime: '10:00',
        endTime: '11:00',
        type: 'appointment',
        priority: 'medium',
        location: 'Medical Center',
        reminders: [120, 30],
        status: 'upcoming',
        created: now,
        modified: now
      },
      {
        id: '4',
        title: 'Code Review',
        description: 'Review pull requests and provide feedback',
        date: now,
        startTime: '15:00',
        endTime: '16:00',
        type: 'task',
        priority: 'high',
        isRecurring: true,
        recurrenceType: 'daily',
        reminders: [15],
        status: 'upcoming',
        created: now,
        modified: now
      }
    ] as Event[]
  })
  
  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem('nyx-calendar-events', JSON.stringify(events))
  }, [events])
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Previous month's trailing days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDay = new Date(year, month, -i)
      days.push({ date: prevDay, isCurrentMonth: false })
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    }
    
    // Next month's leading days
    const remainingCells = 42 - days.length
    for (let day = 1; day <= remainingCells; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false })
    }
    
    return days
  }
  
  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString() &&
             (filterType === 'all' || event.type === filterType) &&
             (searchQuery === '' || 
              event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              event.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    }).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [events, filterType, searchQuery])
  
  const getTodayEvents = () => {
    const today = new Date()
    return getEventsForDate(today)
  }
  
  const getUpcomingEvents = () => {
    const now = new Date()
    return events
      .filter(event => new Date(event.date) >= now && event.status === 'upcoming')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }
  
  const navigateToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
    setEmotion('happy', 0.6)
    addMessage("Back to today! Living in the present is the way to go!", 'sam', 'happy')
  }
  
  const createEvent = () => {
    if (!newEvent.title.trim()) {
      setEmotion('confused', 0.6)
      addMessage("Need a title for the event, mate! What's it about?", 'sam', 'confused')
      return
    }
    
    const event: Event = {
      id: editingEvent?.id || `event-${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description,
      date: selectedDate,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      type: newEvent.type,
      priority: newEvent.priority,
      location: newEvent.location,
      attendees: newEvent.attendees,
      isRecurring: newEvent.isRecurring,
      recurrenceType: newEvent.recurrenceType,
      reminders: newEvent.reminders,
      status: 'upcoming',
      isAllDay: newEvent.isAllDay,
      created: editingEvent?.created || new Date(),
      modified: new Date()
    }
    
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? event : e))
      setEmotion('focused', 0.7)
      addMessage(`Updated "${event.title}"! Changes saved successfully!`, 'sam', 'focused')
    } else {
      setEvents(prev => [...prev, event])
      setEmotion('excited', 0.8)
      addMessage(`Created "${event.title}"! Your schedule is looking organized!`, 'sam', 'excited')
    }
    
    resetEventForm()
  }
  
  const deleteEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (event && window.confirm(`Delete "${event.title}"?`)) {
      setEvents(prev => prev.filter(e => e.id !== eventId))
      setShowEventDetails(null)
      setEmotion('focused', 0.6)
      addMessage(`Deleted "${event.title}". Sometimes we need to clear the schedule!`, 'sam', 'focused')
    }
  }
  
  const editEvent = (event: Event) => {
    setEditingEvent(event)
    setNewEvent({
      title: event.title,
      description: event.description || '',
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      priority: event.priority,
      location: event.location || '',
      attendees: event.attendees || [],
      isRecurring: event.isRecurring || false,
      recurrenceType: event.recurrenceType || 'weekly',
      reminders: event.reminders || [15],
      isAllDay: event.isAllDay || false
    })
    setShowEventForm(true)
    setShowEventDetails(null)
  }
  
  const resetEventForm = () => {
    setNewEvent({
      title: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      type: 'meeting',
      priority: 'medium',
      location: '',
      attendees: [],
      isRecurring: false,
      recurrenceType: 'weekly',
      reminders: [15],
      isAllDay: false
    })
    setEditingEvent(null)
    setShowEventForm(false)
  }
  
  const toggleEventStatus = (eventId: string) => {
    setEvents(prev => prev.map(e => 
      e.id === eventId 
        ? { ...e, status: e.status === 'completed' ? 'upcoming' : 'completed', modified: new Date() }
        : e
    ))
    
    const event = events.find(e => e.id === eventId)
    if (event) {
      setEmotion('happy', 0.7)
      addMessage(`Marked "${event.title}" as ${event.status === 'completed' ? 'upcoming' : 'completed'}!`, 'sam', 'happy')
    }
  }
  
  const exportCalendar = () => {
    const calendarData = JSON.stringify(events, null, 2)
    const blob = new Blob([calendarData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nyx-calendar-export.json'
    a.click()
    URL.revokeObjectURL(url)
    
    setEmotion('excited', 0.8)
    addMessage('Calendar exported! Backup is always a smart move!', 'sam', 'excited')
  }
  
  const importCalendar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedEvents = JSON.parse(e.target?.result as string)
          setEvents(prev => [...prev, ...importedEvents.map((e: any) => ({
            ...e,
            id: `imported-${Date.now()}-${Math.random()}`,
            date: new Date(e.date),
            created: new Date(e.created),
            modified: new Date()
          }))])
          setEmotion('excited', 0.9)
          addMessage(`Imported ${importedEvents.length} events! Welcome to your expanded schedule!`, 'sam', 'excited')
        } catch {
          setEmotion('confused', 0.7)
          addMessage('Could not import that file. Make sure it\'s a valid calendar export!', 'sam', 'confused')
        }
      }
      reader.readAsText(file)
    }
  }
  
  const days = getDaysInMonth(currentDate)
  const todayEvents = getTodayEvents()
  const upcomingEvents = getUpcomingEvents()
  
  return (
    <div className="flex h-full liquid-glass-dark">
      {/* Main Calendar */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 liquid-glass">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-purple-400" />
                Chrono Calendar
              </h1>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setView({ type: 'month' })}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-colors",
                    view.type === 'month' ? "bg-purple-500/30 text-purple-300" : "text-white/60 hover:text-white"
                  )}
                >
                  Month
                </button>
                <button
                  onClick={() => setView({ type: 'week' })}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-colors",
                    view.type === 'week' ? "bg-purple-500/30 text-purple-300" : "text-white/60 hover:text-white"
                  )}
                >
                  Week
                </button>
                <button
                  onClick={() => setView({ type: 'agenda' })}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-colors",
                    view.type === 'agenda' ? "bg-purple-500/30 text-purple-300" : "text-white/60 hover:text-white"
                  )}
                >
                  Agenda
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="pl-10 pr-4 py-2 liquid-glass rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 w-64"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 liquid-glass rounded-lg hover:bg-white/10 transition-colors"
              >
                <Filter className="w-4 h-4 text-white/70" />
              </button>
              <button
                onClick={exportCalendar}
                className="p-2 liquid-glass rounded-lg hover:bg-white/10 transition-colors"
              >
                <Download className="w-4 h-4 text-white/70" />
              </button>
              <label className="p-2 liquid-glass rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-white/70" />
                <input
                  type="file"
                  accept=".json"
                  onChange={importCalendar}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowEventForm(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Event
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 pb-4">
                  <span className="text-white/60 text-sm">Filter by type:</span>
                  {(['all', 'meeting', 'work', 'personal', 'reminder', 'task', 'appointment'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={cn(
                        "px-3 py-1 rounded text-xs transition-colors capitalize",
                        filterType === type ? "bg-purple-500/30 text-purple-300" : "text-white/60 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white/70" />
              </button>
              <h2 className="text-lg font-semibold text-white min-w-48 text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white/70" />
              </button>
            </div>
            
            <button
              onClick={navigateToToday}
              className="px-4 py-2 liquid-glass rounded-lg hover:bg-white/10 transition-colors text-white text-sm"
            >
              Today
            </button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="flex-1 p-4">
          {view.type === 'month' ? (
            <div className="h-full">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center p-2 text-white/60 text-sm font-medium">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 h-full">
                {days.map((day, index) => {
                  const dayEvents = getEventsForDate(day.date)
                  const isToday = day.date.toDateString() === new Date().toDateString()
                  const isSelected = day.date.toDateString() === selectedDate.toDateString()
                  
                  return (
                    <motion.div
                      key={index}
                      className={cn(
                        "p-2 rounded-lg border cursor-pointer transition-all hover:bg-white/5 min-h-24",
                        day.isCurrentMonth ? "border-white/10" : "border-white/5",
                        isToday && "bg-purple-500/20 border-purple-400/50",
                        isSelected && "ring-2 ring-purple-400/50",
                        !day.isCurrentMonth && "opacity-50"
                      )}
                      onClick={() => setSelectedDate(day.date)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={cn(
                        "text-sm font-medium mb-1",
                        day.isCurrentMonth ? "text-white" : "text-white/40",
                        isToday && "text-purple-300"
                      )}>
                        {day.date.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <motion.div
                            key={event.id}
                            className="text-xs p-1 rounded truncate liquid-glass border border-white/10"
                            style={{ backgroundColor: `${EVENT_COLORS[event.type]}20` }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowEventDetails(event)
                            }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <div className="truncate font-medium text-white">
                              {event.title}
                            </div>
                            <div className="text-white/60">
                              {event.startTime}
                            </div>
                          </motion.div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-white/60 text-center">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ) : view.type === 'agenda' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Upcoming Events</h3>
              {upcomingEvents.map((event) => (
                <motion.div
                  key={event.id}
                  className="p-4 liquid-glass rounded-xl border border-white/10 cursor-pointer"
                  onClick={() => setShowEventDetails(event)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: EVENT_COLORS[event.type] }}
                        />
                        <h4 className="text-white font-medium">{event.title}</h4>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs",
                          `bg-${PRIORITY_COLORS[event.priority]}20 text-white`
                        )}>
                          {event.priority}
                        </span>
                      </div>
                      <div className="text-white/60 text-sm mb-2">
                        {event.date.toLocaleDateString()} • {event.startTime} - {event.endTime}
                      </div>
                      {event.description && (
                        <p className="text-white/80 text-sm mb-2">{event.description}</p>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1 text-white/60 text-sm">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleEventStatus(event.id)
                      }}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        event.status === 'completed'
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/10 text-white/60 hover:text-white"
                      )}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Sidebar */}
      <div className="w-80 border-l border-white/10 liquid-glass">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            {selectedDate.toLocaleDateString()}
          </h3>
          
          {/* Today's Events */}
          <div className="space-y-2 mb-6">
            {getEventsForDate(selectedDate).map((event) => (
              <motion.div
                key={event.id}
                className="p-3 liquid-glass rounded-lg border border-white/10 cursor-pointer"
                onClick={() => setShowEventDetails(event)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: EVENT_COLORS[event.type] }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleEventStatus(event.id)
                    }}
                    className={cn(
                      "text-xs",
                      event.status === 'completed' ? "text-green-400" : "text-white/60"
                    )}
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
                <h4 className="text-white font-medium text-sm mb-1">{event.title}</h4>
                <div className="text-white/60 text-xs">
                  {event.startTime} - {event.endTime}
                </div>
              </motion.div>
            ))}
            
            {getEventsForDate(selectedDate).length === 0 && (
              <div className="text-center text-white/60 py-8">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events scheduled</p>
              </div>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="liquid-glass rounded-xl p-4">
            <h4 className="text-white font-medium mb-3">This Month</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Total Events</span>
                <span className="text-white">{events.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Completed</span>
                <span className="text-green-400">
                  {events.filter(e => e.status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Upcoming</span>
                <span className="text-blue-400">
                  {events.filter(e => e.status === 'upcoming').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Event Form Modal */}
      <AnimatePresence>
        {showEventForm && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="liquid-glass-window rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-auto"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {editingEvent ? 'Edit Event' : 'New Event'}
                </h3>
                <button
                  onClick={resetEventForm}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 liquid-glass rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    placeholder="Event title"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-2">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 liquid-glass rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 h-20 resize-none"
                    placeholder="Event description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Start Time</label>
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full p-3 liquid-glass rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">End Time</label>
                    <input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full p-3 liquid-glass rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Type</label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                      className="w-full p-3 liquid-glass rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="reminder">Reminder</option>
                      <option value="task">Task</option>
                      <option value="appointment">Appointment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Priority</label>
                    <select
                      value={newEvent.priority}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, priority: e.target.value as Event['priority'] }))}
                      className="w-full p-3 liquid-glass rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-2">Location</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 liquid-glass rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    placeholder="Event location"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={resetEventForm}
                    className="flex-1 py-3 liquid-glass rounded-lg text-white hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createEvent}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                  >
                    {editingEvent ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Event Details Modal */}
      <AnimatePresence>
        {showEventDetails && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="liquid-glass-window rounded-2xl p-6 w-full max-w-lg mx-4"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: EVENT_COLORS[showEventDetails.type] }}
                    />
                    <h3 className="text-lg font-semibold text-white">{showEventDetails.title}</h3>
                  </div>
                  <div className="text-white/60 text-sm">
                    {showEventDetails.date.toLocaleDateString()} • {showEventDetails.startTime} - {showEventDetails.endTime}
                  </div>
                </div>
                <button
                  onClick={() => setShowEventDetails(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {showEventDetails.description && (
                <div className="mb-4">
                  <h4 className="text-white/80 text-sm font-medium mb-2">Description</h4>
                  <p className="text-white/70 text-sm">{showEventDetails.description}</p>
                </div>
              )}
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-white/60" />
                  <span className="text-white/80">
                    {showEventDetails.startTime} - {showEventDetails.endTime}
                  </span>
                </div>
                
                {showEventDetails.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-white/60" />
                    <span className="text-white/80">{showEventDetails.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-white/60" />
                  <span className="text-white/80 capitalize">{showEventDetails.priority} priority</span>
                </div>
                
                {showEventDetails.attendees && showEventDetails.attendees.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Users className="w-4 h-4 text-white/60 mt-0.5" />
                    <div className="text-white/80">
                      {showEventDetails.attendees.join(', ')}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => editEvent(showEventDetails)}
                  className="flex-1 py-2 liquid-glass rounded-lg text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => toggleEventStatus(showEventDetails.id)}
                  className={cn(
                    "flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2",
                    showEventDetails.status === 'completed'
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  )}
                >
                  <Check className="w-4 h-4" />
                  {showEventDetails.status === 'completed' ? 'Completed' : 'Mark Done'}
                </button>
                <button
                  onClick={() => deleteEvent(showEventDetails.id)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
