# Supabase Integration

This directory contains all Supabase client utilities for the LumenR application.

## Files

### `client.ts`
Browser-side Supabase client for use in Client Components.

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
```

### `server.ts`
Server-side Supabase clients for use in Server Components, API routes, and server actions.

```typescript
// Regular server client (respects RLS)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Service role client (bypasses RLS - use carefully!)
import { createServiceClient } from '@/lib/supabase/server'
const supabase = createServiceClient()
```

### `storage.ts`
File storage utilities for Supabase Storage.

**Functions:**
- `uploadFile(bucket, path, file, options?)` - Upload files
- `deleteFile(bucket, paths)` - Delete one or multiple files
- `downloadFile(bucket, path)` - Download file as blob
- `listFiles(bucket, folder?, options?)` - List files in bucket
- `getPublicUrl(bucket, path)` - Get public URL
- `createSignedUrl(bucket, path, expiresIn?)` - Create temporary signed URL
- `moveFile(bucket, fromPath, toPath)` - Move file
- `copyFile(bucket, fromPath, toPath)` - Copy file

### `realtime.ts`
Real-time subscription utilities for database changes and presence.

**Functions:**
- `subscribeToTable(table, event, callback, filter?)` - Subscribe to specific event
- `subscribeToTableChanges(table, callbacks, filter?)` - Subscribe to all events
- `subscribeToInserts(table, callback)` - Subscribe to INSERT events only
- `subscribeToUpdates(table, callback)` - Subscribe to UPDATE events only
- `subscribeToDeletes(table, callback)` - Subscribe to DELETE events only
- `subscribeToPresence(roomId, userState, callbacks?)` - Track online users
- `broadcast(channelName, event, payload)` - Send broadcast messages
- `subscribeToBroadcast(channelName, event, callback)` - Listen to broadcasts
- `unsubscribe(channel)` - Clean up subscription

## Usage Patterns

### Storage Example
```typescript
import { uploadFile, getPublicUrl } from '@/lib/supabase/storage'

async function handleUpload(file: File) {
  const data = await uploadFile('documents', `uploads/${file.name}`, file, {
    upsert: false,
    cacheControl: '3600'
  })
  
  const url = getPublicUrl('documents', data.path)
  return url
}
```

### Realtime Example
```typescript
import { subscribeToTableChanges, unsubscribe } from '@/lib/supabase/realtime'

// In a component
useEffect(() => {
  const channel = subscribeToTableChanges('clients', {
    onInsert: (payload) => console.log('New client:', payload.new),
    onUpdate: (payload) => console.log('Updated:', payload.new),
    onDelete: (payload) => console.log('Deleted:', payload.old)
  })
  
  return () => {
    unsubscribe(channel)
  }
}, [])
```

## React Hooks

For easier integration in React components, use the provided hooks:

- `useSupabaseStorage(bucket)` - Storage operations with loading states
- `useSupabaseRealtime(table, event, callback, filter?)` - Automatic subscription cleanup
- `useSupabaseTableChanges(table, callbacks, filter?)` - Multi-event subscription

See `src/hooks/useSupabaseStorage.ts` and `src/hooks/useSupabaseRealtime.ts` for details.

## Environment Variables

Required environment variables (already configured in `.env`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-only)

## Demo

Visit `/supabase-features` in your application to see live examples of Storage and Realtime features.
