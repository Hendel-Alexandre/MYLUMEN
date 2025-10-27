import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ENV } from '@/lib/config'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    ENV.SUPABASE_URL,
    ENV.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Create a Supabase client with service role key for admin operations
 * WARNING: Only use this in server-side code. Never expose the service role key to the client.
 */
export function createServiceClient() {
  return createServerClient(
    ENV.SUPABASE_URL,
    ENV.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {},
    }
  )
}