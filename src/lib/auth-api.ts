import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function getAuthUser(request: NextRequest): Promise<{ userId: string | null; error: string | null }> {
  try {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[AUTH] Supabase not configured');
      return { userId: null, error: 'Authentication service not configured' };
    }

    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { userId: null, error: 'No authorization token provided' };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Get user from token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('[AUTH] Invalid token:', error?.message);
      return { userId: null, error: 'Invalid or expired token' };
    }

    return { userId: user.id, error: null };
  } catch (error) {
    console.error('[AUTH] Authentication failed:', error);
    return { userId: null, error: 'Authentication failed' };
  }
}

export function requireAuth(handler: (request: NextRequest, userId: string) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const { userId, error } = await getAuthUser(request);

    if (error || !userId) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Authentication required', 
          code: 'UNAUTHORIZED' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(request, userId);
  };
}