import { createClient } from './client'

/**
 * Upload a file to Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @param file - File to upload
 * @param options - Upload options
 * @returns Object with data and public URL
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: {
    cacheControl?: string
    contentType?: string
    upsert?: boolean
  }
) {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      contentType: options?.contentType || file.type,
      upsert: options?.upsert || false
    })

  if (error) {
    throw error
  }

  return data
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param paths - File path(s) to delete
 */
export async function deleteFile(bucket: string, paths: string | string[]) {
  const supabase = createClient()
  
  const pathsArray = Array.isArray(paths) ? paths : [paths]
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove(pathsArray)

  if (error) {
    throw error
  }

  return data
}

/**
 * List files in a storage bucket
 * @param bucket - Storage bucket name
 * @param folder - Folder path (optional)
 * @param options - List options
 */
export async function listFiles(
  bucket: string,
  folder?: string,
  options?: {
    limit?: number
    offset?: number
    sortBy?: { column: string; order: 'asc' | 'desc' }
  }
) {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, {
      limit: options?.limit || 100,
      offset: options?.offset || 0,
      sortBy: options?.sortBy || { column: 'name', order: 'asc' }
    })

  if (error) {
    throw error
  }

  return data
}

/**
 * Get public URL for a file
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 */
export function getPublicUrl(bucket: string, path: string) {
  const supabase = createClient()
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * Download a file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 */
export async function downloadFile(bucket: string, path: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path)

  if (error) {
    throw error
  }

  return data
}

/**
 * Create a signed URL for private file access
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @param expiresIn - Time in seconds until the URL expires (default: 3600)
 */
export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
) {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw error
  }

  return data
}

/**
 * Move a file within the same bucket
 * @param bucket - Storage bucket name
 * @param fromPath - Current file path
 * @param toPath - New file path
 */
export async function moveFile(bucket: string, fromPath: string, toPath: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .move(fromPath, toPath)

  if (error) {
    throw error
  }

  return data
}

/**
 * Copy a file within the same bucket
 * @param bucket - Storage bucket name
 * @param fromPath - Source file path
 * @param toPath - Destination file path
 */
export async function copyFile(bucket: string, fromPath: string, toPath: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .copy(fromPath, toPath)

  if (error) {
    throw error
  }

  return data
}