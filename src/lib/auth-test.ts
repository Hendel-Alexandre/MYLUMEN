// Test file to verify Supabase auth works
import { supabase } from '@/integrations/supabase/client'

export async function testAuth() {
  try {
    // Test 1: Check if supabase client is initialized
    console.log('[Test] Supabase client:', supabase ? 'OK' : 'FAILED')
    
    // Test 2: Check auth methods exist
    console.log('[Test] Auth methods:', supabase.auth ? 'OK' : 'FAILED')
    
    // Test 3: Get current session
    const { data, error } = await supabase.auth.getSession()
    console.log('[Test] Get session:', error ? `FAILED: ${error.message}` : 'OK')
    
    return true
  } catch (error) {
    console.error('[Test] Auth test failed:', error)
    return false
  }
}
