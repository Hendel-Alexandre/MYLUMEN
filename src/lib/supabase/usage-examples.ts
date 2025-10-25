/**
 * Supabase Direct Client Usage Examples
 * 
 * This file demonstrates how to use Supabase directly for:
 * - Database queries (CRUD operations)
 * - Storage operations (file upload/download)
 * - Real-time subscriptions
 * - Auth operations
 */

import { supabase, supabaseAdmin } from './direct-client'

// ============================================
// DATABASE OPERATIONS
// ============================================

// 1. SELECT - Fetch all records
export async function getAllClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
  
  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }
  
  return data
}

// 2. SELECT with filters and joins
export async function getClientWithInvoices(clientId: string) {
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
  
  if (error) {
    console.error('Error:', error)
    return null
  }
  
  return data
}

// 3. INSERT - Create new record
export async function createClient(clientData: {
  name: string
  email: string
  phone?: string
  company?: string
}) {
  const { data, error } = await supabase
    .from('clients')
    .insert([clientData])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating client:', error)
    throw error
  }
  
  return data
}

// 4. UPDATE - Update existing record
export async function updateClient(id: string, updates: Partial<{
  name: string
  email: string
  phone: string
  status: string
}>) {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating client:', error)
    throw error
  }
  
  return data
}

// 5. DELETE - Remove record
export async function deleteClient(id: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting client:', error)
    throw error
  }
  
  return true
}

// 6. Complex query with multiple filters
export async function searchInvoices(filters: {
  status?: string
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?: string
}) {
  let query = supabase
    .from('invoices')
    .select(`
      *,
      clients (
        id,
        name,
        email
      )
    `)
    .order('created_at', { ascending: false })
  
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters.minAmount) {
    query = query.gte('total', filters.minAmount)
  }
  
  if (filters.maxAmount) {
    query = query.lte('total', filters.maxAmount)
  }
  
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate)
  }
  
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error searching invoices:', error)
    return []
  }
  
  return data
}

// ============================================
// STORAGE OPERATIONS
// ============================================

// 1. Upload file
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
) {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    console.error('Error uploading file:', error)
    throw error
  }
  
  return data
}

// 2. Get public URL for a file
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

// 3. Download file
export async function downloadFile(bucket: string, path: string) {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .download(path)
  
  if (error) {
    console.error('Error downloading file:', error)
    throw error
  }
  
  return data
}

// 4. List files in a bucket
export async function listFiles(bucket: string, folder: string = '') {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .list(folder, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' }
    })
  
  if (error) {
    console.error('Error listing files:', error)
    return []
  }
  
  return data
}

// 5. Delete file
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase
    .storage
    .from(bucket)
    .remove([path])
  
  if (error) {
    console.error('Error deleting file:', error)
    throw error
  }
  
  return true
}

// 6. Upload receipt with OCR metadata
export async function uploadReceipt(file: File, metadata: {
  userId: string
  amount: number
  merchant?: string
  date?: string
}) {
  const fileName = `${metadata.userId}/${Date.now()}-${file.name}`
  
  // Upload file
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('receipts')
    .upload(fileName, file)
  
  if (uploadError) throw uploadError
  
  // Create database record
  const { data: receiptData, error: dbError } = await supabase
    .from('receipts')
    .insert([{
      user_id: metadata.userId,
      file_path: fileName,
      file_url: getPublicUrl('receipts', fileName),
      amount: metadata.amount,
      merchant: metadata.merchant,
      receipt_date: metadata.date
    }])
    .select()
    .single()
  
  if (dbError) throw dbError
  
  return receiptData
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

// 1. Subscribe to table changes
export function subscribeToInvoices(callback: (payload: any) => void) {
  const subscription = supabase
    .channel('invoices-channel')
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE, or * for all
        schema: 'public',
        table: 'invoices'
      },
      callback
    )
    .subscribe()
  
  return subscription
}

// 2. Subscribe to specific record changes
export function subscribeToClient(clientId: string, callback: (payload: any) => void) {
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
      callback
    )
    .subscribe()
  
  return subscription
}

// 3. Unsubscribe from real-time updates
export function unsubscribe(subscription: any) {
  supabase.removeChannel(subscription)
}

// ============================================
// AUTH OPERATIONS (if needed)
// ============================================

// 1. Sign up
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  
  if (error) throw error
  return data
}

// 2. Sign in
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

// 3. Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// 4. Get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// 5. Get session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ============================================
// ADVANCED QUERIES
// ============================================

// 1. Full-text search
export async function searchClients(searchTerm: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
  
  if (error) {
    console.error('Error searching clients:', error)
    return []
  }
  
  return data
}

// 2. Aggregations
export async function getInvoiceStats() {
  const { data, error } = await supabase
    .rpc('get_invoice_stats') // Custom PostgreSQL function
  
  if (error) {
    console.error('Error getting stats:', error)
    return null
  }
  
  return data
}

// 3. Transactions (using RPC)
export async function createInvoiceWithItems(invoice: any, items: any[]) {
  const { data, error } = await supabase
    .rpc('create_invoice_with_items', {
      invoice_data: invoice,
      items_data: items
    })
  
  if (error) throw error
  return data
}

// ============================================
// ADMIN OPERATIONS (Server-side only)
// ============================================

// Use supabaseAdmin for operations that bypass RLS
export async function adminGetAllUsers() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
  
  if (error) throw error
  return data
}

export async function adminDeleteUser(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) throw error
}
