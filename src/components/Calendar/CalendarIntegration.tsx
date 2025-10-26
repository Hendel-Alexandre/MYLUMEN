'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock,
  Plus, Download, Settings, X, CheckCircle2, Users, MapPin, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBookings, type Booking } from '@/lib/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  bookingId: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  clientName?: string;
  clientEmail?: string;
  color: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
  rescheduled: '#f59e0b',
};

export function CalendarIntegration() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    date: '',
    time: '',
    duration: '60',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'rescheduled',
    notes: '',
  });

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = endOfMonth.toISOString().split('T')[0];

  const { bookings, isLoading, createBooking, updateBooking, deleteBooking } = useBookings({
    startDate,
    endDate,
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoadingClients(true);
      const response = await fetch('/api/lumenr/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const events: CalendarEvent[] = useMemo(() => {
    return bookings.map((booking) => {
      const [hours, minutes] = booking.time.split(':').map(Number);
      const bookingDate = new Date(booking.date);
      const startTime = new Date(bookingDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + booking.duration);

      return {
        id: booking.id.toString(),
        bookingId: booking.id,
        title: booking.title,
        description: booking.notes,
        startTime,
        endTime,
        status: booking.status,
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        color: STATUS_COLORS[booking.status] || STATUS_COLORS.scheduled,
      };
    });
  }, [bookings]);

  const todayEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    });
  }, [events]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getEventStyle = (event: CalendarEvent) => {
    const start = event.startTime.getHours() * 60 + event.startTime.getMinutes();
    const end = event.endTime.getHours() * 60 + event.endTime.getMinutes();
    const duration = end - start;
    
    return {
      top: `${(start / 1440) * 100}%`,
      height: `${(duration / 1440) * 100}%`,
      backgroundColor: event.color,
    };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCreateClick = () => {
    const today = new Date();
    setFormData({
      clientId: '',
      title: '',
      date: today.toISOString().split('T')[0],
      time: '09:00',
      duration: '60',
      status: 'scheduled',
      notes: '',
    });
    setSelectedEvent(null);
    setShowEventDialog(true);
  };

  const handleEditClick = (event: CalendarEvent) => {
    const booking = bookings.find(b => b.id === event.bookingId);
    if (booking) {
      setFormData({
        clientId: booking.clientId.toString(),
        title: booking.title,
        date: booking.date,
        time: booking.time,
        duration: booking.duration.toString(),
        status: booking.status,
        notes: booking.notes || '',
      });
      setSelectedEvent(event);
      setShowEventDialog(true);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.clientId || !formData.title || !formData.date || !formData.time) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      const bookingData = {
        clientId: parseInt(formData.clientId),
        title: formData.title,
        date: formData.date,
        time: formData.time,
        duration: parseInt(formData.duration),
        status: formData.status,
        notes: formData.notes,
      };

      if (selectedEvent) {
        await updateBooking(selectedEvent.bookingId, bookingData);
      } else {
        await createBooking(bookingData);
      }

      setShowEventDialog(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      await deleteBooking(selectedEvent.bookingId);
      setShowEventDialog(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const exportCalendar = () => {
    toast({
      title: 'Export',
      description: 'Calendar export feature coming soon!',
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Calendar & Bookings</h1>
          <p className="text-sm text-muted-foreground">Manage your schedule and appointments</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={exportCalendar} className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Settings className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-base sm:text-xl font-semibold min-w-[140px] sm:min-w-[200px] text-center">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('next')}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="flex-1 sm:flex-none">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="day" className="text-xs sm:text-sm">Day</TabsTrigger>
                  <TabsTrigger value="week" className="text-xs sm:text-sm">Week</TabsTrigger>
                  <TabsTrigger value="month" className="text-xs sm:text-sm">Month</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button onClick={handleCreateClick} size="sm" className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">New Booking</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <Card className="h-[500px] sm:h-[600px] overflow-hidden">
            <CardContent className="p-0 h-full">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="h-full overflow-y-auto">
                  {/* Day/Week View */}
                  {(viewMode === 'day' || viewMode === 'week') && (
                    <>
                      {/* Time labels */}
                      <div className="flex border-b sticky top-0 bg-background z-10">
                        <div className="w-12 sm:w-16 flex-shrink-0 border-r p-2">
                          <div className="text-xs text-muted-foreground">Time</div>
                        </div>
                        <div className="flex-1 p-2">
                          <div className="font-semibold text-sm sm:text-base">
                            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      {/* Hour slots */}
                      <div className="relative">
                        {hours.map(hour => (
                          <div key={hour} className="flex border-b h-12 sm:h-16">
                            <div className="w-12 sm:w-16 flex-shrink-0 border-r p-1 sm:p-2 text-xs text-muted-foreground">
                              {hour.toString().padStart(2, '0')}:00
                            </div>
                            <div className="flex-1 relative"></div>
                          </div>
                        ))}

                        {/* Events overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="relative h-full" style={{ minHeight: `${hours.length * 48}px` }}>
                            {todayEvents.map(event => (
                              <motion.button
                                key={event.id}
                                onClick={() => handleEventClick(event)}
                                className="absolute left-12 sm:left-16 right-2 pointer-events-auto rounded-lg shadow-md hover:shadow-lg transition-shadow p-1.5 sm:p-2 text-left cursor-pointer text-white"
                                style={getEventStyle(event)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="flex items-start gap-1 sm:gap-2">
                                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-xs sm:text-sm truncate">{event.title}</div>
                                    <div className="text-xs opacity-90 truncate">{event.clientName}</div>
                                    <div className="text-xs opacity-90">
                                      {event.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                      {' - '}
                                      {event.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Month View */}
                  {viewMode === 'month' && (
                    <div className="h-full p-2 sm:p-4">
                      <div className="text-center text-sm text-muted-foreground">
                        Month view coming soon
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings today</p>
              ) : (
                todayEvents.slice(0, 5).map(event => (
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
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{event.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{event.clientName}</div>
                        <div className="text-xs text-muted-foreground">
                          {event.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Calendar Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Google Calendar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent && !showEventDialog} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
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
                {selectedEvent.clientName && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Client
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedEvent.clientName}</p>
                    {selectedEvent.clientEmail && (
                      <p className="text-xs text-muted-foreground">{selectedEvent.clientEmail}</p>
                    )}
                  </div>
                )}

                {selectedEvent.description && (
                  <div>
                    <Label>Notes</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedEvent.description}</p>
                  </div>
                )}

                <div>
                  <Label>Status</Label>
                  <Badge className="mt-1" style={{ backgroundColor: selectedEvent.color }}>
                    {selectedEvent.status}
                  </Badge>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={() => handleEditClick(selectedEvent)}>Edit</Button>
                  <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Booking Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Edit Booking' : 'Create New Booking'}</DialogTitle>
            <DialogDescription>Schedule a new appointment with a client</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="client">Client *</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingClients ? (
                    <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                  ) : clients.length === 0 ? (
                    <SelectItem value="none" disabled>No clients found</SelectItem>
                  ) : (
                    clients.map(client => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Booking title"
                className="mt-2"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  className="mt-2"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  className="mt-2"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  step="15"
                  className="mt-2"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes"
                className="mt-2"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleSubmit}>
                {selectedEvent ? 'Update' : 'Create'} Booking
              </Button>
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
