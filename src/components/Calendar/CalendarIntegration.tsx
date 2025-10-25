import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock,
  Plus, Download, Upload, Settings, Grid, List, X,
  CheckCircle2, AlertCircle, Users, MapPin, Video, Link2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  type: 'task' | 'meeting' | 'focus' | 'break' | 'personal'
  priority?: 'low' | 'medium' | 'high'
  attendees?: string[]
  location?: string
  videoUrl?: string
  color: string
}

interface TimeBlock {
  id: string
  title: string
  startTime: string
  duration: number
  type: 'deep-work' | 'meetings' | 'email' | 'breaks' | 'personal'
  recurring?: 'daily' | 'weekly' | 'monthly'
  color: string
}

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    description: 'Daily sync with development team',
    startTime: new Date(2024, 0, 15, 9, 0),
    endTime: new Date(2024, 0, 15, 9, 30),
    type: 'meeting',
    attendees: ['John', 'Sarah', 'Mike'],
    videoUrl: 'https://meet.google.com/abc-defg-hij',
    color: '#3b82f6'
  },
  {
    id: '2',
    title: 'Deep Work: Feature Development',
    description: 'Focus on new authentication system',
    startTime: new Date(2024, 0, 15, 10, 0),
    endTime: new Date(2024, 0, 15, 12, 0),
    type: 'focus',
    priority: 'high',
    color: '#8b5cf6'
  },
  {
    id: '3',
    title: 'Lunch Break',
    startTime: new Date(2024, 0, 15, 12, 0),
    endTime: new Date(2024, 0, 15, 13, 0),
    type: 'break',
    color: '#10b981'
  },
  {
    id: '4',
    title: 'Client Meeting',
    description: 'Project kickoff with Acme Corp',
    startTime: new Date(2024, 0, 15, 14, 0),
    endTime: new Date(2024, 0, 15, 15, 0),
    type: 'meeting',
    attendees: ['Client Team', 'Account Manager'],
    location: 'Conference Room A',
    priority: 'high',
    color: '#f59e0b'
  },
  {
    id: '5',
    title: 'Code Review',
    description: 'Review PRs from team members',
    startTime: new Date(2024, 0, 15, 15, 30),
    endTime: new Date(2024, 0, 15, 16, 30),
    type: 'task',
    priority: 'medium',
    color: '#06b6d4'
  }
]

const TIME_BLOCKS: TimeBlock[] = [
  { id: '1', title: 'Deep Work Morning', startTime: '09:00', duration: 120, type: 'deep-work', recurring: 'daily', color: '#8b5cf6' },
  { id: '2', title: 'Email & Communications', startTime: '11:00', duration: 30, type: 'email', recurring: 'daily', color: '#06b6d4' },
  { id: '3', title: 'Lunch Break', startTime: '12:00', duration: 60, type: 'breaks', recurring: 'daily', color: '#10b981' },
  { id: '4', title: 'Meetings Block', startTime: '14:00', duration: 120, type: 'meetings', recurring: 'daily', color: '#f59e0b' },
  { id: '5', title: 'Deep Work Afternoon', startTime: '16:00', duration: 90, type: 'deep-work', recurring: 'daily', color: '#8b5cf6' }
]

export function CalendarIntegration() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [events] = useState<CalendarEvent[]>(SAMPLE_EVENTS)
  const [timeBlocks] = useState<TimeBlock[]>(TIME_BLOCKS)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  const getEventStyle = (event: CalendarEvent) => {
    const start = event.startTime.getHours() * 60 + event.startTime.getMinutes()
    const end = event.endTime.getHours() * 60 + event.endTime.getMinutes()
    const duration = end - start
    
    return {
      top: `${(start / 1440) * 100}%`,
      height: `${(duration / 1440) * 100}%`,
      backgroundColor: event.color
    }
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

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const exportCalendar = () => {
    // In production, this would generate an .ics file
    alert('Calendar exported as .ics file')
  }

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return Users
      case 'focus': return Clock
      case 'break': return CalendarIcon
      case 'task': return CheckCircle2
      default: return CalendarIcon
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendar & Time Blocking</h1>
          <p className="text-muted-foreground">Plan your time effectively and integrate with external calendars</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCalendar}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold min-w-[200px] text-center">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <TabsList>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button onClick={() => setShowEventDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] overflow-hidden">
            <CardContent className="p-0 h-full">
              {/* Day/Week View */}
              {(viewMode === 'day' || viewMode === 'week') && (
                <div className="h-full overflow-y-auto">
                  {/* Time labels */}
                  <div className="flex border-b sticky top-0 bg-background z-10">
                    <div className="w-16 flex-shrink-0 border-r p-2">
                      <div className="text-xs text-muted-foreground">Time</div>
                    </div>
                    <div className="flex-1 p-2">
                      <div className="font-semibold">
                        {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Hour slots */}
                  <div className="relative">
                    {hours.map(hour => (
                      <div key={hour} className="flex border-b h-16">
                        <div className="w-16 flex-shrink-0 border-r p-2 text-xs text-muted-foreground">
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                        <div className="flex-1 relative">
                          {/* Time blocks background */}
                          {timeBlocks
                            .filter(block => {
                              const blockHour = parseInt(block.startTime.split(':')[0])
                              const blockEnd = blockHour + block.duration / 60
                              return hour >= blockHour && hour < blockEnd
                            })
                            .map(block => (
                              <div
                                key={block.id}
                                className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{ backgroundColor: block.color }}
                              />
                            ))}
                        </div>
                      </div>
                    ))}

                    {/* Events overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="relative h-full" style={{ minHeight: `${hours.length * 64}px` }}>
                        {events.map(event => {
                          const EventIcon = getEventIcon(event.type)
                          return (
                            <motion.button
                              key={event.id}
                              onClick={() => handleEventClick(event)}
                              className="absolute left-16 right-2 pointer-events-auto rounded-lg shadow-md hover:shadow-lg transition-shadow p-2 text-left cursor-pointer text-white"
                              style={getEventStyle(event)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start gap-2">
                                <EventIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm truncate">{event.title}</div>
                                  <div className="text-xs opacity-90">
                                    {event.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    {' - '}
                                    {event.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                                {event.priority && (
                                  <Badge variant="secondary" className="text-xs">
                                    {event.priority}
                                  </Badge>
                                )}
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Month View */}
              {viewMode === 'month' && (
                <div className="h-full p-4">
                  <div className="grid grid-cols-7 gap-2 h-full">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-semibold text-muted-foreground pb-2">
                        {day}
                      </div>
                    ))}
                    {/* Calendar grid would go here */}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Time Blocks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Time Blocks</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBlockDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Recurring time allocations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {timeBlocks.map(block => (
                <div
                  key={block.id}
                  className="p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: block.color }}
                    />
                    <div className="font-medium text-sm">{block.title}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {block.startTime} • {block.duration}min
                  </div>
                  {block.recurring && (
                    <Badge variant="secondary" className="text-xs mt-2">
                      {block.recurring}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {events.slice(0, 3).map(event => {
                const EventIcon = getEventIcon(event.type)
                return (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="w-full p-3 rounded-lg border hover:border-primary/50 transition-colors text-left"
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className="p-1.5 rounded"
                        style={{ backgroundColor: `${event.color}20`, color: event.color }}
                      >
                        <EventIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {event.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          {/* Calendar Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <img src="https://www.google.com/calendar/images/ext/gc_button1_en.gif" alt="Google" className="h-4 w-4 mr-2" />
                Google Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Outlook Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Apple Calendar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon = getEventIcon(selectedEvent.type)
                    return <Icon className="h-5 w-5" />
                  })()}
                  {selectedEvent.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedEvent.startTime.toLocaleString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {' - '}
                  {selectedEvent.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedEvent.description && (
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Attendees
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedEvent.attendees.map(attendee => (
                        <Badge key={attendee} variant="secondary">{attendee}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent.location && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedEvent.location}</p>
                  </div>
                )}

                {selectedEvent.videoUrl && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video Call
                    </Label>
                    <Button variant="outline" size="sm" className="mt-2 w-full justify-start" asChild>
                      <a href={selectedEvent.videoUrl} target="_blank" rel="noopener noreferrer">
                        <Link2 className="h-4 w-4 mr-2" />
                        Join Meeting
                      </a>
                    </Button>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Edit Event</Button>
                  <Button variant="destructive">Delete</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>Schedule a new event or time block</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="event-title">Title</Label>
              <Input id="event-title" placeholder="Event title" className="mt-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input id="start-time" type="datetime-local" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input id="end-time" type="datetime-local" className="mt-2" />
              </div>
            </div>

            <div>
              <Label htmlFor="event-type">Type</Label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="focus">Focus Time</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="break">Break</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Event description" className="mt-2" rows={3} />
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1">Create Event</Button>
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
