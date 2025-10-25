import { createClient } from './client'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

/**
 * Subscribe to realtime changes on a table
 * @param table - Table name to subscribe to
 * @param event - Event type to listen for ('INSERT', 'UPDATE', 'DELETE', or '*')
 * @param callback - Callback function for changes
 * @param filter - Optional filter (e.g., 'id=eq.123')
 * @returns Realtime channel
 */
export function subscribeToTable<T = any>(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  filter?: string
): RealtimeChannel {
  const supabase = createClient()
  
  const channel = supabase
    .channel(`${table}-${event}-changes`)
    .on(
      'postgres_changes',
      { event, schema: 'public', table, filter },
      callback
    )
    .subscribe()

  return channel
}

/**
 * Subscribe to all changes on a table (INSERT, UPDATE, DELETE)
 * @param table - Table name to subscribe to
 * @param callbacks - Object with optional callbacks for each event type
 * @param filter - Optional filter (e.g., 'id=eq.123')
 */
export function subscribeToTableChanges<T = any>(
  table: string,
  callbacks: {
    onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void
    onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void
    onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void
  },
  filter?: string
): RealtimeChannel {
  const supabase = createClient()
  
  const channel = supabase.channel(`${table}-all-changes`)

  if (callbacks.onInsert) {
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table, filter },
      callbacks.onInsert
    )
  }

  if (callbacks.onUpdate) {
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table, filter },
      callbacks.onUpdate
    )
  }

  if (callbacks.onDelete) {
    channel.on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table, filter },
      callbacks.onDelete
    )
  }

  channel.subscribe()
  
  return channel
}

/**
 * Subscribe to INSERT events on a table
 * @param table - Table name to subscribe to
 * @param callback - Callback function for inserts
 * @returns Realtime channel
 */
export function subscribeToInserts<T = any>(
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
): RealtimeChannel {
  return subscribeToTable(table, 'INSERT', callback)
}

/**
 * Subscribe to UPDATE events on a table
 * @param table - Table name to subscribe to
 * @param callback - Callback function for updates
 * @returns Realtime channel
 */
export function subscribeToUpdates<T = any>(
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
): RealtimeChannel {
  return subscribeToTable(table, 'UPDATE', callback)
}

/**
 * Subscribe to DELETE events on a table
 * @param table - Table name to subscribe to
 * @param callback - Callback function for deletes
 * @returns Realtime channel
 */
export function subscribeToDeletes<T = any>(
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
): RealtimeChannel {
  return subscribeToTable(table, 'DELETE', callback)
}

/**
 * Unsubscribe from a realtime channel
 * @param channel - Realtime channel to unsubscribe from
 */
export async function unsubscribe(channel: RealtimeChannel) {
  const supabase = createClient()
  await supabase.removeChannel(channel)
}

/**
 * Subscribe to presence in a room (for collaborative features)
 * @param roomId - Room ID to join
 * @param userState - Initial user state
 * @param callbacks - Callbacks for sync, join, and leave events
 * @returns Realtime channel
 */
export function subscribeToPresence(
  roomId: string,
  userState: any,
  callbacks?: {
    onSync?: () => void
    onJoin?: (key: string, currentPresence: any, newPresence: any) => void
    onLeave?: (key: string, currentPresence: any, leftPresence: any) => void
  }
): RealtimeChannel {
  const supabase = createClient()
  
  const channel = supabase.channel(roomId, {
    config: {
      presence: {
        key: userState.id,
      },
    },
  })

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      callbacks?.onSync?.()
      console.log('Presence state:', state)
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      callbacks?.onJoin?.(key, channel.presenceState(), newPresences)
      console.log('User joined:', key, newPresences)
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      callbacks?.onLeave?.(key, channel.presenceState(), leftPresences)
      console.log('User left:', key, leftPresences)
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(userState)
      }
    })

  return channel
}

/**
 * Send a broadcast message to a channel
 * @param channelName - Channel name
 * @param event - Event name
 * @param payload - Message payload
 */
export async function broadcast(channelName: string, event: string, payload: any) {
  const supabase = createClient()
  
  const channel = supabase.channel(channelName)
  await channel.subscribe()
  await channel.send({
    type: 'broadcast',
    event,
    payload,
  })
  
  return channel
}

/**
 * Subscribe to broadcast messages
 * @param channelName - Channel name
 * @param event - Event name to listen for
 * @param callback - Callback function when messages are received
 */
export function subscribeToBroadcast(
  channelName: string,
  event: string,
  callback: (payload: any) => void
): RealtimeChannel {
  const supabase = createClient()
  
  const channel = supabase
    .channel(channelName)
    .on('broadcast', { event }, callback)
    .subscribe()

  return channel
}