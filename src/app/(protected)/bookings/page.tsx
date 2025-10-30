'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Calendar as CalendarIcon, MoreHorizontal, Edit, Trash2, Clock, User, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface Client {
  id: number
  name: string
  email: string
  company: string | null
}

interface Booking {
  id: number
  clientId: number
  userId: string
  title: string
  date: string
  time: string
  duration: number
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  scheduled: 'default',
  completed: 'default',
  cancelled: 'destructive',
  rescheduled: 'secondary'
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [newBooking, setNewBooking] = useState({
    clientId: '',
    title: '',
    date: '',
    time: '',
    duration: 60,
    status: 'scheduled',
    notes: ''
  })

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('bearer_token')
      if (!token) {
        throw new Error('Authentication required')
      }
      
      const response = await fetch('/api/lumenr/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      const data = await response.json()
      setBookings(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch bookings')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('bearer_token')
      const response = await fetch('/api/lumenr/clients', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setClients(Array.isArray(data) ? data : [])
      }
    } catch (error: any) {
      console.error('Error fetching clients:', error)
      setClients([])
    }
  }

  const createBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('bearer_token')
      const response = await fetch('/api/lumenr/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newBooking,
          clientId: parseInt(newBooking.clientId)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create booking')
      }

      toast.success('Booking created successfully')

      setNewBooking({
        clientId: '',
        title: '',
        date: '',
        time: '',
        duration: 60,
        status: 'scheduled',
        notes: ''
      })
      setIsDialogOpen(false)
      fetchBookings()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const deleteBooking = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('bearer_token')
      const response = await fetch(`/api/lumenr/bookings?id=${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete booking')
      }

      toast.success('Booking deleted successfully')
      fetchBookings()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking)
    setIsEditDialogOpen(true)
  }

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId)
    return client ? client.name : 'Unknown Client'
  }

  const getClientCompany = (clientId: number) => {
    const client = clients.find(c => c.id === clientId)
    return client?.company || null
  }

  useEffect(() => {
    fetchBookings()
    fetchClients()
  }, [])

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(booking.clientId).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const today = new Date().toISOString().split('T')[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your appointments and meetings</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
            </DialogHeader>
            <form onSubmit={createBooking} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select
                  value={newBooking.clientId}
                  onValueChange={(value) => setNewBooking({ ...newBooking, clientId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name} {client.company && `(${client.company})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newBooking.title}
                  onChange={(e) => setNewBooking({ ...newBooking, title: e.target.value })}
                  required
                  placeholder="Initial Consultation"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                    required
                    min={today}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newBooking.time}
                    onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Select
                    value={newBooking.duration.toString()}
                    onValueChange={(value) => setNewBooking({ ...newBooking, duration: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={newBooking.status}
                    onValueChange={(value) => setNewBooking({ ...newBooking, status: value })}
                  >
                    <SelectTrigger>
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
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional details about the booking..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Booking</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="rescheduled">Rescheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="h-full"
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <CalendarIcon className="h-5 w-5 text-primary flex-shrink-0" />
                    <CardTitle className="text-lg font-semibold truncate">
                      {booking.title}
                    </CardTitle>
                  </div>
                  <Badge variant={statusVariants[booking.status]} className="capitalize">
                    {booking.status}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Booking
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Booking
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the booking
                            "{booking.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteBooking(booking.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium truncate block">{getClientName(booking.clientId)}</span>
                    {getClientCompany(booking.clientId) && (
                      <span className="text-xs text-muted-foreground truncate block">
                        {getClientCompany(booking.clientId)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{new Date(booking.date).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{booking.time} ({booking.duration} min)</span>
                </div>

                {booking.notes && (
                  <div className="flex items-start text-sm pt-2 border-t">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground line-clamp-2">{booking.notes}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'No bookings match your filters.' 
              : 'Create your first booking to get started.'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Booking
            </Button>
          )}
        </div>
      )}
    </div>
  )
}