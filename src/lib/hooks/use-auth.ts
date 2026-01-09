"use client"

import { usePrivy } from "@privy-io/react-auth"
import { createClient } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { syncPrivyUser } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function useAuth() {
  const { authenticated, ready, user: privyUser } = usePrivy()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) {
      setLoading(true)
      return
    }

    if (!authenticated || !privyUser) {
      setUser(null)
      setLoading(false)
      return
    }

    // Sync Privy user with database
    const syncUser = async () => {
      setLoading(true)
      try {
        const syncedUser = await syncPrivyUser(privyUser)
        if (syncedUser) {
          setUser(syncedUser)
        }
      } catch (error) {
        console.error('Error syncing user:', error)
      } finally {
        setLoading(false)
      }
    }

    syncUser()
  }, [authenticated, ready, privyUser])

  return {
    user,
    privyUser,
    loading: !ready || loading,
    isAuthenticated: authenticated && ready,
  }
}
