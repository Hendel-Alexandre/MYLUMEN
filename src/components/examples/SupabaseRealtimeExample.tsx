'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSupabaseTableChanges } from '@/hooks/useSupabaseRealtime'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface RealtimeLog {
  id: string
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  timestamp: string
  data: any
}

export function SupabaseRealtimeExample({ table }: { table: string }) {
  const [logs, setLogs] = useState<RealtimeLog[]>([])

  useSupabaseTableChanges(
    table,
    {
      onInsert: (payload: RealtimePostgresChangesPayload<any>) => {
        setLogs(prev => [
          {
            id: crypto.randomUUID(),
            type: 'INSERT',
            timestamp: new Date().toLocaleTimeString(),
            data: payload.new,
          },
          ...prev.slice(0, 9), // Keep last 10 logs
        ])
      },
      onUpdate: (payload: RealtimePostgresChangesPayload<any>) => {
        setLogs(prev => [
          {
            id: crypto.randomUUID(),
            type: 'UPDATE',
            timestamp: new Date().toLocaleTimeString(),
            data: payload.new,
          },
          ...prev.slice(0, 9),
        ])
      },
      onDelete: (payload: RealtimePostgresChangesPayload<any>) => {
        setLogs(prev => [
          {
            id: crypto.randomUUID(),
            type: 'DELETE',
            timestamp: new Date().toLocaleTimeString(),
            data: payload.old,
          },
          ...prev.slice(0, 9),
        ])
      },
    }
  )

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Supabase Realtime Example</h3>
        <p className="text-sm text-muted-foreground">
          Listening to changes on the <code className="bg-muted px-1 py-0.5 rounded">{table}</code> table
        </p>
      </div>

      <div className="space-y-2">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No changes detected yet. Make changes to the {table} table to see realtime updates.
          </p>
        ) : (
          logs.map(log => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 bg-muted rounded-lg"
            >
              <Badge
                variant={
                  log.type === 'INSERT'
                    ? 'default'
                    : log.type === 'UPDATE'
                    ? 'secondary'
                    : 'destructive'
                }
                className="shrink-0"
              >
                {log.type}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">{log.timestamp}</p>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
