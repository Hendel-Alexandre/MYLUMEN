import { createClient } from '@supabase/supabase-js'
import { ENV } from '@/lib/config'

export function createServiceClient() {
  return createClient(
    ENV.SUPABASE_URL,
    ENV.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
