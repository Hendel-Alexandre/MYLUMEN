'use client'

import { useState } from 'react'
import { uploadFile, deleteFile, getPublicUrl } from '@/lib/supabase/storage'

export function useSupabaseStorage(bucket: string) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const upload = async (
    path: string,
    file: File,
    options?: {
      cacheControl?: string
      contentType?: string
      upsert?: boolean
    }
  ) => {
    setUploading(true)
    setError(null)

    try {
      const data = await uploadFile(bucket, path, file, options)
      const publicUrl = getPublicUrl(bucket, data.path)
      return { data, publicUrl }
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const remove = async (paths: string | string[]) => {
    setDeleting(true)
    setError(null)

    try {
      const data = await deleteFile(bucket, paths)
      return data
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setDeleting(false)
    }
  }

  const getUrl = (path: string) => {
    return getPublicUrl(bucket, path)
  }

  return {
    upload,
    remove,
    getUrl,
    uploading,
    deleting,
    error,
  }
}