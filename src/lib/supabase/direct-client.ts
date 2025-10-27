import { createClient } from '@supabase/supabase-js'
import { ENV } from '@/lib/config'

// Browser client for client-side operations (singleton)
export const supabase = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY
)

// Server client with service role (singleton - use only in API routes/server components)
export const supabaseAdmin = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Type-safe database helpers
export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: any
        Insert: any
        Update: any
      }
    }
  }
}
