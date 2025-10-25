# 🚀 Supabase Direct Usage Guide

Your Supabase is fully configured and ready to use! This guide shows you how to use Supabase directly for database queries, storage, and real-time features.

## 📁 Files Created

- **`src/lib/supabase/direct-client.ts`** - Supabase client instances (browser & admin)
- **`src/lib/supabase/usage-examples.ts`** - Complete examples for all operations
- **`src/lib/supabase/client.ts`** - SSR-compatible client (already existed)

---

## 🔧 Quick Start

### 1. Import the Client

```typescript
// For client-side components
import { supabase } from '@/lib/supabase/direct-client'

// For server-side (API routes, Server Components) with admin privileges
import { supabaseAdmin } from '@/lib/supabase/direct-client'
```

---

## 💾 Database Operations

### Fetch Data (SELECT)

```typescript
'use client'

import { supabase } from '@/lib/supabase/direct-client'
import { useEffect, useState } from 'react'

export default function ClientsList() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClients() {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error:', error)
      } else {
        setClients(data)
      }
      setLoading(false)
    }
    
    fetchClients()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {clients.map(client => (
        <div key={client.id}>{client.name}</div>
      ))}
    </div>
  )
}
```

### Create Data (INSERT)

```typescript
import { supabase } from '@/lib/supabase/direct-client'

async function createClient() {
  const { data, error } = await supabase
    .from('clients')
    .insert([
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Corp'
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating client:', error)
    throw error
  }

  console.log('Created client:', data)
  return data
}
```

### Update Data (UPDATE)

```typescript
import { supabase } from '@/lib/supabase/direct-client'

async function updateClient(id: string) {
  const { data, error } = await supabase
    .from('clients')
    .update({ 
      name: 'Jane Doe',
      status: 'active'
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Delete Data (DELETE)

```typescript
import { supabase } from '@/lib/supabase/direct-client'

async function deleteClient(id: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
```

### Complex Queries with Joins

```typescript
// Get client with all their invoices
const { data, error } = await supabase
  .from('clients')
  .select(`
    *,
    invoices (
      id,
      invoice_number,
      total,
      status,
      due_date
    )
  `)
  .eq('id', clientId)
  .single()
```

### Filter and Search

```typescript
// Search by multiple fields
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
  .order('created_at', { ascending: false })
  .limit(20)

// Filter by status and date range
const { data, error } = await supabase
  .from('invoices')
  .select('*')
  .eq('status', 'pending')
  .gte('created_at', '2025-01-01')
  .lte('created_at', '2025-12-31')
```

---

## 📦 Storage Operations

### Upload File

```typescript
import { supabase } from '@/lib/supabase/direct-client'

async function uploadReceipt(file: File) {
  const fileName = `receipts/${Date.now()}-${file.name}`
  
  const { data, error } = await supabase
    .storage
    .from('documents') // bucket name
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('documents')
    .getPublicUrl(fileName)
  
  console.log('File uploaded:', publicUrl)
  return { path: fileName, url: publicUrl }
}
```

### Upload from Form

```typescript
'use client'

import { supabase } from '@/lib/supabase/direct-client'
import { useState } from 'react'

export default function FileUploadForm() {
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    
    try {
      const fileName = `uploads/${Date.now()}-${file.name}`
      
      const { data, error } = await supabase
        .storage
        .from('documents')
        .upload(fileName, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('documents')
        .getPublicUrl(fileName)

      alert('File uploaded successfully: ' + publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input 
        type="file" 
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  )
}
```

### Download File

```typescript
import { supabase } from '@/lib/supabase/direct-client'

async function downloadFile(path: string) {
  const { data, error } = await supabase
    .storage
    .from('documents')
    .download(path)

  if (error) throw error

  // Create download link
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = path.split('/').pop() || 'download'
  a.click()
}
```

### List Files

```typescript
import { supabase } from '@/lib/supabase/direct-client'

async function listFiles(folder: string = '') {
  const { data, error } = await supabase
    .storage
    .from('documents')
    .list(folder, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' }
    })

  if (error) throw error
  return data
}
```

### Delete File

```typescript
import { supabase } from '@/lib/supabase/direct-client'

async function deleteFile(path: string) {
  const { error } = await supabase
    .storage
    .from('documents')
    .remove([path])

  if (error) throw error
  return true
}
```

---

## 🔴 Real-Time Subscriptions

### Subscribe to Table Changes

```typescript
'use client'

import { supabase } from '@/lib/supabase/direct-client'
import { useEffect, useState } from 'react'

export default function LiveInvoices() {
  const [invoices, setInvoices] = useState([])

  useEffect(() => {
    // Initial fetch
    fetchInvoices()

    // Subscribe to changes
    const subscription = supabase
      .channel('invoices-channel')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'invoices'
        },
        (payload) => {
          console.log('Change received!', payload)
          
          if (payload.eventType === 'INSERT') {
            setInvoices(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setInvoices(prev => prev.map(inv => 
              inv.id === payload.new.id ? payload.new : inv
            ))
          } else if (payload.eventType === 'DELETE') {
            setInvoices(prev => prev.filter(inv => inv.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  async function fetchInvoices() {
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setInvoices(data)
  }

  return (
    <div>
      <h2>Live Invoices ({invoices.length})</h2>
      {invoices.map(invoice => (
        <div key={invoice.id}>
          {invoice.invoice_number} - ${invoice.total}
        </div>
      ))}
    </div>
  )
}
```

### Subscribe to Specific Record

```typescript
import { supabase } from '@/lib/supabase/direct-client'

function subscribeToClient(clientId: string) {
  const subscription = supabase
    .channel(`client-${clientId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'clients',
        filter: `id=eq.${clientId}`
      },
      (payload) => {
        console.log('Client updated:', payload.new)
      }
    )
    .subscribe()

  return subscription
}
```

---

## 🔐 Using in API Routes (Server-Side)

### Standard Query (respects RLS)

```typescript
// src/app/api/clients/route.ts
import { supabase } from '@/lib/supabase/direct-client'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ clients: data })
}
```

### Admin Query (bypasses RLS)

```typescript
// src/app/api/admin/users/route.ts
import { supabaseAdmin } from '@/lib/supabase/direct-client'
import { NextResponse } from 'next/server'

export async function GET() {
  // This bypasses Row Level Security
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: data })
}
```

---

## 📊 Your Current Tables

Based on your Drizzle schema, you have these tables available:

- **clients** - Customer information
- **products** - Product catalog
- **services** - Service offerings
- **quotes** - Price quotes for clients
- **invoices** - Billing invoices
- **contracts** - Legal agreements
- **receipts** - Expense receipts
- **payments** - Payment records
- **business_profiles** - Company settings
- **bookings** - Appointment scheduling

---

## 🎯 Common Patterns

### Form Submission with Supabase

```typescript
'use client'

import { supabase } from '@/lib/supabase/direct-client'
import { useState } from 'react'
import { toast } from 'sonner'

export default function CreateClientForm() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Client created successfully!')
      // Reset form or redirect
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="phone" placeholder="Phone" />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Client'}
      </button>
    </form>
  )
}
```

---

## 🛡️ Error Handling

```typescript
import { supabase } from '@/lib/supabase/direct-client'

async function safeQuery() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')

    if (error) {
      // Handle Supabase error
      console.error('Supabase error:', error.message)
      throw new Error('Failed to fetch clients')
    }

    return data
  } catch (error) {
    // Handle other errors
    console.error('Unexpected error:', error)
    throw error
  }
}
```

---

## 🔗 Next Steps

1. **Create Storage Buckets** in Supabase Dashboard:
   - Go to Storage → New Bucket
   - Create: `documents`, `receipts`, `avatars`
   - Set permissions (public/private)

2. **Set Up Row Level Security (RLS)**:
   - Go to Database → Tables → Select table
   - Enable RLS and create policies

3. **Create Custom Functions**:
   - Use SQL Editor for complex operations
   - Example: aggregations, transactions

4. **Enable Real-Time**:
   - Go to Database → Replication
   - Enable real-time for specific tables

---

## 📚 Resources

- **Supabase Dashboard**: https://fhjknsvhwzrxarbfiqpx.supabase.co
- **Your Examples**: `src/lib/supabase/usage-examples.ts`
- **Supabase Docs**: https://supabase.com/docs
- **JavaScript Client Docs**: https://supabase.com/docs/reference/javascript

---

## 💡 Pro Tips

1. **Use `.single()` when expecting one result** - throws error if multiple found
2. **Always handle errors** - Supabase returns `{ data, error }` tuple
3. **Use `supabaseAdmin` carefully** - bypasses all security rules
4. **Optimize queries** - select only needed columns: `.select('id, name, email')`
5. **Use real-time sparingly** - can impact performance with many subscriptions

---

Your Supabase is ready to use! Import the client and start building. 🚀
