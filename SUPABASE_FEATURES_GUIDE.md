# 🚀 Supabase Features Integration Guide

Your LumenR application now has full Supabase integration with Auth, Storage, and Realtime capabilities!

## ✅ What's Configured

### Environment Variables
All required Supabase credentials are configured in your `.env` file:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Client-side anon key
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Server-side admin key

### Packages Installed
- ✅ `@supabase/supabase-js` - Main Supabase client library
- ✅ `@supabase/ssr` - Server-side rendering support for Next.js

---

## 📦 Supabase Storage

Upload, download, and manage files in Supabase Storage buckets.

### Setup Storage Buckets

Before using storage, create buckets in your Supabase Dashboard:

1. Go to **Storage** in your Supabase Dashboard
2. Click **New Bucket**
3. Enter bucket name (e.g., `documents`, `avatars`, `receipts`)
4. Configure privacy settings:
   - **Public**: Anyone can access files (good for images, public assets)
   - **Private**: Only authenticated users can access (good for documents)

### Usage Examples

#### Basic Upload
```typescript
import { uploadFile, getPublicUrl } from '@/lib/supabase/storage'

// Upload a file
const file = event.target.files[0]
const fileName = `${Date.now()}-${file.name}`
const data = await uploadFile('documents', fileName, file)
const url = getPublicUrl('documents', data.path)
```

#### Using the Hook
```typescript
'use client'
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage'

export function FileUploader() {
  const { upload, uploading, error } = useSupabaseStorage('documents')
  
  const handleUpload = async (file: File) => {
    const { data, publicUrl } = await upload(`uploads/${file.name}`, file, {
      upsert: false,
      cacheControl: '3600'
    })
    console.log('Uploaded:', publicUrl)
  }
  
  return (
    <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
  )
}
```

#### Advanced Storage Operations
```typescript
import { 
  downloadFile, 
  deleteFile, 
  listFiles,
  createSignedUrl,
  moveFile,
  copyFile 
} from '@/lib/supabase/storage'

// Download a file
const blob = await downloadFile('documents', 'file.pdf')

// Delete files
await deleteFile('documents', 'file.pdf') // Single file
await deleteFile('documents', ['file1.pdf', 'file2.pdf']) // Multiple files

// List files in a folder
const files = await listFiles('documents', 'uploads/', {
  limit: 50,
  sortBy: { column: 'created_at', order: 'desc' }
})

// Create signed URL for private access (expires in 1 hour)
const { signedUrl } = await createSignedUrl('documents', 'private.pdf', 3600)

// Move file
await moveFile('documents', 'old/file.pdf', 'new/file.pdf')

// Copy file
await copyFile('documents', 'original.pdf', 'copy.pdf')
```

### Storage Component Example

Check out `src/components/examples/SupabaseStorageExample.tsx` for a complete working example.

---

## ⚡ Supabase Realtime

Subscribe to database changes in real-time and build collaborative features.

### Enable Realtime on Tables

Before using realtime, enable it in Supabase Dashboard:

1. Go to **Database** → **Replication**
2. Enable replication for tables you want to track
3. Or run this SQL for a specific table:
```sql
ALTER TABLE clients REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
```

### Usage Examples

#### Subscribe to All Changes
```typescript
import { subscribeToTable, unsubscribe } from '@/lib/supabase/realtime'

const channel = subscribeToTable('clients', '*', (payload) => {
  console.log('Change detected:', payload)
  console.log('Event type:', payload.eventType) // INSERT, UPDATE, DELETE
  console.log('New data:', payload.new)
  console.log('Old data:', payload.old)
})

// Cleanup
await unsubscribe(channel)
```

#### Using the Hook
```typescript
'use client'
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime'

export function ClientList() {
  const [clients, setClients] = useState([])
  
  useSupabaseRealtime('clients', 'INSERT', (payload) => {
    setClients(prev => [...prev, payload.new])
  })
  
  return <div>{/* Render clients */}</div>
}
```

#### Subscribe to Specific Events
```typescript
import { subscribeToTableChanges } from '@/lib/supabase/realtime'

const channel = subscribeToTableChanges('invoices', {
  onInsert: (payload) => {
    console.log('New invoice:', payload.new)
  },
  onUpdate: (payload) => {
    console.log('Invoice updated:', payload.new)
  },
  onDelete: (payload) => {
    console.log('Invoice deleted:', payload.old)
  }
}, 'status=eq.pending') // Optional filter
```

#### Presence (Online Users)
```typescript
import { subscribeToPresence } from '@/lib/supabase/realtime'

const channel = subscribeToPresence('room-123', {
  id: 'user-1',
  name: 'John Doe',
  avatar: 'https://...'
}, {
  onSync: () => {
    console.log('Presence synced')
  },
  onJoin: (key, currentPresence, newPresence) => {
    console.log('User joined:', newPresence)
  },
  onLeave: (key, currentPresence, leftPresence) => {
    console.log('User left:', leftPresence)
  }
})
```

#### Broadcast Messages
```typescript
import { broadcast, subscribeToBroadcast } from '@/lib/supabase/realtime'

// Send a message
await broadcast('chat-room', 'new-message', {
  text: 'Hello!',
  userId: 'user-1'
})

// Listen for messages
const channel = subscribeToBroadcast('chat-room', 'new-message', (payload) => {
  console.log('Received:', payload)
})
```

### Realtime Component Example

Check out `src/components/examples/SupabaseRealtimeExample.tsx` for a complete working example.

---

## 🔐 Supabase Auth (Optional)

Your app currently uses a custom auth system. If you want to migrate to Supabase Auth:

### Setup
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

---

## 🎯 Quick Start Examples

### Example 1: Receipt Upload with Storage
```typescript
'use client'
import { useState } from 'react'
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage'

export function ReceiptUploader() {
  const { upload, uploading } = useSupabaseStorage('receipts')
  const [receipts, setReceipts] = useState([])
  
  const handleUpload = async (file: File) => {
    const fileName = `receipts/${Date.now()}-${file.name}`
    const { publicUrl } = await upload(fileName, file)
    
    // Save to database
    await fetch('/api/lumenr/receipts', {
      method: 'POST',
      body: JSON.stringify({
        fileName: file.name,
        fileUrl: publicUrl,
        uploadedAt: new Date().toISOString()
      })
    })
    
    setReceipts(prev => [...prev, { url: publicUrl }])
  }
  
  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => handleUpload(e.target.files[0])}
        disabled={uploading}
      />
      {receipts.map((receipt, i) => (
        <img key={i} src={receipt.url} alt="Receipt" />
      ))}
    </div>
  )
}
```

### Example 2: Real-time Client Updates
```typescript
'use client'
import { useState, useEffect } from 'react'
import { useSupabaseTableChanges } from '@/hooks/useSupabaseRealtime'

export function ClientDashboard() {
  const [clients, setClients] = useState([])
  
  // Fetch initial data
  useEffect(() => {
    fetch('/api/lumenr/clients')
      .then(res => res.json())
      .then(data => setClients(data))
  }, [])
  
  // Listen to real-time updates
  useSupabaseTableChanges('clients', {
    onInsert: (payload) => {
      setClients(prev => [...prev, payload.new])
    },
    onUpdate: (payload) => {
      setClients(prev => prev.map(c => 
        c.id === payload.new.id ? payload.new : c
      ))
    },
    onDelete: (payload) => {
      setClients(prev => prev.filter(c => c.id !== payload.old.id))
    }
  })
  
  return (
    <div>
      {clients.map(client => (
        <div key={client.id}>{client.name}</div>
      ))}
    </div>
  )
}
```

---

## 📚 Available Files

### Core Libraries
- `src/lib/supabase/client.ts` - Browser client creation
- `src/lib/supabase/server.ts` - Server client creation (with service role)
- `src/lib/supabase/storage.ts` - Storage utilities
- `src/lib/supabase/realtime.ts` - Realtime utilities

### React Hooks
- `src/hooks/useSupabaseStorage.ts` - Storage hook with loading states
- `src/hooks/useSupabaseRealtime.ts` - Realtime subscription hooks

### Examples
- `src/components/examples/SupabaseStorageExample.tsx` - Storage demo
- `src/components/examples/SupabaseRealtimeExample.tsx` - Realtime demo
- `src/app/supabase-features/page.tsx` - Demo page

---

## 🎨 Live Demo

Visit `/supabase-features` in your app to see working examples of Storage and Realtime features.

---

## 📖 Next Steps

1. **Create Storage Buckets** in Supabase Dashboard
2. **Enable Realtime** on tables you want to track
3. **Integrate into existing features**:
   - Add file uploads to receipts page
   - Add realtime updates to client dashboard
   - Add collaborative features with presence

## 🔗 Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

---

**Your Supabase integration is complete and ready to use!** 🎉
