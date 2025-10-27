import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/lib/config';

let browserClient: ReturnType<typeof createClient> | null = null;
let serverAdminClient: ReturnType<typeof createClient> | null = null;

export function getOptimizedBrowserClient() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(
      ENV.SUPABASE_URL,
      ENV.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    );
  }

  return browserClient;
}

export function getOptimizedServerClient() {
  if (!serverAdminClient) {
    serverAdminClient = createClient(
      ENV.SUPABASE_URL,
      ENV.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return serverAdminClient;
}
