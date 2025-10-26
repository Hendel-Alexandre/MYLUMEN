'use client';

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  signIn: (email: string, password: string, captchaToken?: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, firstName: string, lastName: string, businessName: string, captchaToken?: string) => Promise<{ error?: any }>
  signOut: () => Promise<void>
  updateUserStatus: (status: 'Available' | 'Away' | 'Busy') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    // Skip if no supabase client
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setUser(session?.user ?? null)
        
        // Store bearer token in localStorage for API calls
        if (session?.access_token) {
          localStorage.setItem('bearer_token', session.access_token)
        } else {
          localStorage.removeItem('bearer_token')
        }
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('[Auth] Init error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setUser(session?.user ?? null)
      
      // Update bearer token on auth state change
      if (session?.access_token) {
        localStorage.setItem('bearer_token', session.access_token)
      } else {
        localStorage.removeItem('bearer_token')
      }
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
    })

    initAuth()

    return () => {
      mounted = false;
      subscription?.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) return;
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        console.error('[Auth] Error fetching user profile:', error)
        setUserProfile(null)
      } else {
        setUserProfile({
          id: user?.id,
          email: user?.email,
          first_name: user?.user_metadata?.first_name || '',
          last_name: user?.user_metadata?.last_name || '',
          business_name: user?.user_metadata?.business_name || '',
          status: 'Available'
        })
      }
    } catch (error) {
      console.error('[Auth] Error fetching user profile:', error)
      setUserProfile(null)
    }
  }

  const signIn = async (email: string, password: string, captchaToken?: string) => {
    if (!supabase) return { error: { message: 'Auth not available' } };
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password,
        options: { captchaToken }
      })
      
      return { error }
    } catch (error) {
      console.error('[Auth] Sign in exception:', error)
      return { error }
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    businessName: string, 
    captchaToken?: string
  ) => {
    if (!supabase) return { error: { message: 'Auth not available' } };
    
    try {
      const trimmedEmail = email.trim().toLowerCase()
      const redirectUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/`
      
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email: trimmedEmail, 
        password,
        options: {
          emailRedirectTo: redirectUrl,
          captchaToken,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            business_name: businessName.trim()
          }
        }
      })

      if (authError) return { error: authError }
      if (!authData.user) return { error: { message: 'No user created' } }

      if (typeof window !== 'undefined' && businessName.trim()) {
        localStorage.setItem('business_name', businessName.trim())
        localStorage.setItem('pending_business_name', businessName.trim())
      }

      return { error: null }
    } catch (error) {
      console.error('[Auth] Sign up exception:', error)
      return { error }
    }
  }

  const signOut = async () => {
    if (!supabase) return;
    
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('[Auth] Sign out failed:', error)
    }
  }

  const updateUserStatus = async (status: 'Available' | 'Away' | 'Busy') => {
    if (!user || !supabase) return

    try {
      setUserProfile((prev: any) => ({ ...prev, status }))
    } catch (error) {
      console.error('[Auth] Failed to update user status:', error)
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}