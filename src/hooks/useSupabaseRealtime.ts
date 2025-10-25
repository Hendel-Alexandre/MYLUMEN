'use client'

import { useEffect, useRef } from 'react'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { subscribeToTable, subscribeToTableChanges, unsubscribe } from '@/lib/supabase/realtime'

/**
 * Hook to subscribe to realtime changes on a table
 */
export function useSupabaseRealtime<T = any>(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  filter?: string
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    channelRef.current = subscribeToTable(table, event, callback, filter)

    return () => {
      if (channelRef.current) {
        unsubscribe(channelRef.current)
      }
    }
  }, [table, event, filter])

  return channelRef.current
}

/**
 * Hook to subscribe to all changes on a table (INSERT, UPDATE, DELETE)
 */
export function useSupabaseTableChanges<T = any>(
  table: string,
  callbacks: {
    onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void
    onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void
    onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void
  },
  filter?: string
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    channelRef.current = subscribeToTableChanges(table, callbacks, filter)

    return () => {
      if (channelRef.current) {
        unsubscribe(channelRef.current)
      }
    }
  }, [table, filter])

  return channelRef.current
}
