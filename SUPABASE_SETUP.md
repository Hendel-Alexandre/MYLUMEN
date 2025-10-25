# Supabase Features Integration Guide

## 🎉 What's Been Set Up

Your Supabase SDK integration is now complete! You now have access to:

1. **Supabase Auth** - Full authentication system
2. **Supabase Storage** - File upload and management
3. **Supabase Realtime** - Real-time subscriptions and presence

## 📁 Files Created

### Client Libraries
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server-side client
- `src/lib/supabase/middleware.ts` - Middleware for session management
- `src/lib/supabase/auth.ts` - Authentication helpers
- `src/lib/supabase/storage.ts` - Storage helpers
- `src/lib/supabase/realtime.ts` - Realtime subscriptions

### API Routes
- `src/app/api/supabase/storage/upload/route.ts` - File upload endpoint

## 🔧 Environment Variables Required

Add these to your `.env` file:

```env
# These should already exist
NEXT_PUBLIC_SUPABASE_URL=https://qhbrkcqopqjjaemifjtt.supabase.co

# New variables needed:
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  # Optional, for admin operations
```

### How to Get Your API Keys:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/qhbrkcqopqjjaemifjtt)
2. Navigate to **Settings** → **API**
3. Copy:
   - **anon (public)** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role (secret)** key → `SUPABASE_SERVICE_ROLE_KEY`

## 📚 Usage Examples

### 1. Authentication

```typescript
'use client'
import { signUp, signIn, signOut, getUser } from '@/lib/supabase/auth'

// Sign up
const handleSignUp = async () => {
  const data = await signUp('user@example.com', 'password123', {
    name: 'John Doe'
  })
}

// Sign in
const handleSignIn = async () => {
  const data = await signIn('user@example.com', 'password123')
}

// Sign out
const handleSignOut = async () => {
  await signOut()
}

// Get current user
const user = await getUser()
```

### 2. File Storage

```typescript
'use client'
import { uploadFile, deleteFile, getPublicUrl } from '@/lib/supabase/storage'

// Upload a file
const handleUpload = async (file: File) => {
  const publicUrl = await uploadFile('documents', `user-123/${file.name}`, file)
  console.log('File uploaded:', publicUrl)
}

// Delete a file
await deleteFile('documents', 'user-123/file.pdf')

// Get public URL
const url = getPublicUrl('documents', 'user-123/file.pdf')
```

### 3. Realtime Subscriptions

```typescript
'use client'
import { useEffect } from 'react'
import { subscribeToTable, unsubscribe } from '@/lib/supabase/realtime'

function MyComponent() {
  useEffect(() => {
    // Subscribe to changes
    const channel = subscribeToTable('clients', (payload) => {
      console.log('Change received!', payload)
      
      if (payload.eventType === 'INSERT') {
        console.log('New row:', payload.new)
      }
      if (payload.eventType === 'UPDATE') {
        console.log('Updated row:', payload.new)
      }
      if (payload.eventType === 'DELETE') {
        console.log('Deleted row:', payload.old)
      }
    })

    // Cleanup
    return () => {
      unsubscribe(channel)
    }
  }, [])

  return <div>Subscribed to realtime updates</div>
}
```

### 4. Using Storage API Endpoint

```typescript
'use client'

const handleFileUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', 'documents')
  formData.append('folder', 'receipts/')

  const response = await fetch('/api/supabase/storage/upload', {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()
  console.log('Uploaded:', data.publicUrl)
}
```

### 5. Collaborative Features (Presence)

```typescript
'use client'
import { subscribeToPresence } from '@/lib/supabase/realtime'

const channel = subscribeToPresence('room-123', {
  id: 'user-123',
  name: 'John Doe',
  online_at: new Date().toISOString()
})

// Track who's online in real-time
```

## 🛠️ Setting Up Storage Buckets

Before using storage, create buckets in Supabase:

1. Go to **Storage** in your Supabase Dashboard
2. Click **New Bucket**
3. Create buckets like:
   - `documents` - For business documents
   - `receipts` - For receipt images
   - `avatars` - For profile pictures
   - `invoices` - For invoice PDFs

### Bucket Policies

Make buckets public or configure Row Level Security (RLS):

```sql
-- Example: Allow authenticated users to upload to their own folder
create policy "Users can upload to own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## 🔐 Enabling Realtime

To enable realtime for your tables:

1. Go to **Database** → **Replication** in Supabase Dashboard
2. Enable replication for tables you want to subscribe to:
   - `clients`
   - `invoices`
   - `quotes`
   - etc.

## 🚀 Next Steps

1. **Add API keys** to your `.env` file
2. **Create storage buckets** for your app
3. **Enable realtime replication** for relevant tables
4. **Test the integrations** using the examples above

## 💡 Common Use Cases

### Use Supabase Auth for:
- User authentication and session management
- OAuth integrations (Google, GitHub, etc.)
- Password reset flows
- Email verification

### Use Supabase Storage for:
- Uploading receipts and invoices
- Storing profile pictures
- Managing document attachments
- PDF generation and storage

### Use Supabase Realtime for:
- Live dashboard updates
- Collaborative editing
- Real-time notifications
- Online presence indicators
- Chat features

## 📖 Documentation

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)

---

**Note:** Your PostgreSQL database connection remains unchanged. These features complement your existing database setup.
