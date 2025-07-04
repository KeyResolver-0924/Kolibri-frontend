'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type UserContextType = {
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()

  const refreshUser = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError

      if (!session) {
        router.replace('/login')
        return
      }

      // Check if session is expired or about to expire (within 5 minutes)
      if (session.expires_at && session.expires_at <= Math.floor(Date.now() / 1000) + 300) {
        const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError) {
          // If refresh fails, redirect to login
          router.replace('/login')
          return
        }

        if (!newSession) {
          router.replace('/login')
          return
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      router.replace('/login')
    }
  }, [supabase, router])

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login')
      } else if (event === 'TOKEN_REFRESHED') {
        await refreshUser()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, refreshUser, router])

  return (
    <UserContext.Provider value={{ refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
} 