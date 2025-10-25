'use client'

import { supabase } from '@/lib/supabase/direct-client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Database, RefreshCw, Plus, Trash2 } from 'lucide-react'

/**
 * Example component showing how to use Supabase directly
 * This demonstrates:
 * - Fetching data
 * - Creating records
 * - Deleting records
 * - Real-time subscriptions
 * - Error handling
 */

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  created_at: string
}

export default function SupabaseExample() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  // Fetch clients on mount
  useEffect(() => {
    fetchClients()
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        (payload) => {
          console.log('Real-time update:', payload)
          
          if (payload.eventType === 'INSERT') {
            setClients(prev => [payload.new as Client, ...prev])
            toast.success('New client added!')
          } else if (payload.eventType === 'DELETE') {
            setClients(prev => prev.filter(c => c.id !== payload.old.id))
            toast.info('Client removed')
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  async function fetchClients() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      setClients(data || [])
    } catch (error: any) {
      console.error('Error fetching clients:', error)
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  async function createDemoClient() {
    setCreating(true)
    try {
      const demoNames = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown']
      const randomName = demoNames[Math.floor(Math.random() * demoNames.length)]
      const randomEmail = `${randomName.toLowerCase().replace(' ', '.')}@example.com`

      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            name: randomName,
            email: randomEmail,
            phone: '+1234567890',
            company: 'Demo Corp'
          }
        ])
        .select()
        .single()

      if (error) throw error

      toast.success(`Created: ${randomName}`)
    } catch (error: any) {
      console.error('Error creating client:', error)
      toast.error(error.message || 'Failed to create client')
    } finally {
      setCreating(false)
    }
  }

  async function deleteClient(id: string, name: string) {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success(`Deleted: ${name}`)
    } catch (error: any) {
      console.error('Error deleting client:', error)
      toast.error('Failed to delete client')
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Database className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Supabase Direct Client</h3>
            <p className="text-sm text-muted-foreground">
              Live database connection with real-time updates
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Connected
        </Badge>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={createDemoClient}
          disabled={creating}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {creating ? 'Creating...' : 'Create Demo Client'}
        </Button>
        <Button
          onClick={fetchClients}
          disabled={loading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Recent Clients ({clients.length})</h4>
          {clients.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">No clients yet</p>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {clients.map(client => (
              <div
                key={client.id}
                className="p-4 bg-muted/50 rounded-lg flex items-center justify-between hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                  {client.company && (
                    <p className="text-xs text-muted-foreground mt-1">{client.company}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteClient(client.id, client.name)}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          💡 This component demonstrates live database operations. Changes are reflected in real-time!
        </p>
      </div>
    </Card>
  )
}
