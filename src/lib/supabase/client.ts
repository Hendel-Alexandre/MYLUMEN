import { createBrowserClient } from '@supabase/ssr'
import { ENV } from '@/lib/config'

export function createClient() {
  return createBrowserClient(
    ENV.SUPABASE_URL,
    ENV.SUPABASE_ANON_KEY
  )
}
