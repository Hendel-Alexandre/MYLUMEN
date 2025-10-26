import { supabase } from '@/integrations/supabase/client';

const RECEIPT_BUCKET = 'receipts';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadReceiptImageOptions {
  file: File | Blob;
  userId: string;
  fileName?: string;
}

export interface UploadReceiptImageResult {
  success: boolean;
  path?: string;
  publicUrl?: string;
  error?: string;
}

export async function uploadReceiptImage({
  file,
  userId,
  fileName
}: UploadReceiptImageOptions): Promise<UploadReceiptImageResult> {
  try {
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase client not available'
      };
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      };
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = fileName?.split('.').pop() || 'jpg';
    const uniqueFileName = `${timestamp}-${randomString}.${fileExt}`;
    
    // Organize by user ID
    const filePath = `${userId}/${uniqueFileName}`;

    // Upload to Supabase Storage (file is already a Blob/File, no need to convert)
    const { data, error } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Receipt image upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(RECEIPT_BUCKET)
      .getPublicUrl(data.path);

    return {
      success: true,
      path: data.path,
      publicUrl
    };

  } catch (error) {
    console.error('Receipt image upload exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload receipt image'
    };
  }
}

export async function deleteReceiptImage(path: string): Promise<boolean> {
  try {
    if (!supabase) {
      console.error('Supabase client not available');
      return false;
    }

    const { error } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .remove([path]);

    if (error) {
      console.error('Receipt image delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Receipt image delete exception:', error);
    return false;
  }
}

export async function getReceiptImageSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    if (!supabase) {
      console.error('Supabase client not available');
      return null;
    }

    const { data, error } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Receipt image signed URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Receipt image signed URL exception:', error);
    return null;
  }
}
