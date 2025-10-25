import { useEffect, useState } from 'react'
import { FileText, DollarSign, Receipt, MessageSquare, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { apiGet } from '@/lib/api'

interface TimelineEvent {
  id: string
  type: 'quote' | 'invoice' | 'payment' | 'receipt' | 'note' | 'booking'
  title: string
  description: string
  amount?: number
  status?: string
  created_at: string
}

interface ClientTimelineProps {
  clientId: string
}

export const ClientTimeline = ({ clientId }: ClientTimelineProps) => {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTimeline()
  }, [clientId])

  const fetchTimeline = async () => {
    const { data, ok } = await apiGet(`/api/core/clients/${clientId}/timeline`)
    
    if (ok && data) {
      setEvents(data.events || [])
    }
    
    setLoading(false)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'quote':
        return <FileText className="h-4 w-4" />
      case 'invoice':
        return <FileText className="h-4 w-4" />
      case 'payment':
        return <DollarSign className="h-4 w-4" />
      case 'receipt':
        return <Receipt className="h-4 w-4" />
      case 'note':
        return <MessageSquare className="h-4 w-4" />
      case 'booking':
        return <Calendar className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'quote':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
      case 'invoice':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400'
      case 'payment':
        return 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400'
      case 'receipt':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400'
      case 'note':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-950 dark:text-gray-400'
      case 'booking':
        return 'bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400'
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-950 dark:text-gray-400'
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null

    const statusColors: Record<string, string> = {
      paid: 'bg-green-500',
      pending: 'bg-yellow-500',
      overdue: 'bg-red-500',
      draft: 'bg-gray-500',
      sent: 'bg-blue-500',
      accepted: 'bg-green-500',
      rejected: 'bg-red-500'
    }

    return (
      <Badge className={`${statusColors[status.toLowerCase()] || 'bg-gray-500'} text-white text-xs`}>
        {status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Loading client history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>Complete history of all interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-border" />

              {/* Timeline events */}
              <div className="space-y-6">
                {events.map((event, index) => (
                  <div key={event.id} className="relative flex gap-4">
                    {/* Icon */}
                    <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${getIconColor(event.type)}`}>
                      {getIcon(event.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{event.title}</p>
                            {getStatusBadge(event.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.description}
                          </p>
                          {event.amount && (
                            <p className="text-sm font-medium text-foreground">
                              ${event.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                        <time className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(event.created_at).toLocaleDateString()} at{' '}
                          {new Date(event.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}