'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, Trash2, Loader2 } from 'lucide-react'
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage'
import { toast } from 'sonner'

export function SupabaseStorageExample() {
  const { upload, remove, getUrl, uploading, deleting } = useSupabaseStorage('documents')
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ path: string; url: string }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const fileName = `${Date.now()}-${file.name}`

    try {
      const { data, publicUrl } = await upload(fileName, file, {
        upsert: false,
      })

      setUploadedFiles(prev => [...prev, { path: data.path, url: publicUrl }])
      toast.success('File uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload file')
      console.error('Upload error:', error)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (path: string) => {
    try {
      await remove(path)
      setUploadedFiles(prev => prev.filter(f => f.path !== path))
      toast.success('File deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete file')
      console.error('Delete error:', error)
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Supabase Storage Example</h3>
        <p className="text-sm text-muted-foreground">
          Upload and manage files using Supabase Storage
        </p>
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        </label>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex-1 truncate"
              >
                {file.path}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(file.path)}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
