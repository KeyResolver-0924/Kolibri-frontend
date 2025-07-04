'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LogoutPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const logout = async () => {
      try {
        // Clear any local storage or state if needed
        localStorage.clear()
        
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error('Error during logout:', error)
        }

        // Use replace to prevent back navigation to authenticated routes
        router.replace('/login')
      } catch (error) {
        console.error('Logout error:', error)
        // Ensure we redirect to login even if there's an error
        router.replace('/login')
      }
    }
    logout()
  }, [router, supabase.auth])

  // Return null or a loading state while logout is processing
  return null
} 