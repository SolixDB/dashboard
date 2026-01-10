"use client"

import { useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { APIKeyDisplay } from "@/components/keys/APIKeyDisplay"
import { SecurityNotice } from "@/components/keys/SecurityNotice"
import { motion } from "framer-motion"
import { animations } from "@/config/animation.config"
import { createClient } from "@supabase/supabase-js"
import { syncPrivyUser } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function APIKeysPage() {
  const { authenticated, ready, user: privyUser } = usePrivy()
  const router = useRouter()
  const [apiKey, setApiKey] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return

    if (!authenticated) {
      router.push("/auth/signin")
      return
    }

    const loadAPIKey = async () => {
      setLoading(true)
      try {
        const syncedUser = await syncPrivyUser(privyUser)
        if (syncedUser?.id) {
          // First get the key metadata from Supabase
          const { data: keyData } = await supabase
            .from("api_keys")
            .select("*")
            .eq("user_id", syncedUser.id)
            .eq("is_active", true)
            .single()
          
          if (keyData) {
            // Try to get the full key from the secure endpoint
            try {
              const response = await fetch('/api/auth/get-api-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: syncedUser.id }),
              })
              
              if (response.ok) {
                const result = await response.json()
                // If we got the full key, add it to the key data
                if (result.apiKey) {
                  setApiKey({ ...keyData, fullKey: result.apiKey })
                } else {
                  setApiKey(keyData)
                }
              } else {
                setApiKey(keyData)
              }
            } catch (error) {
              console.error('Error fetching full API key:', error)
              setApiKey(keyData)
            }
          }
        }
      } catch (error) {
        console.error('Error loading API key:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAPIKey()
  }, [authenticated, ready, privyUser, router])

  if (!ready || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="text-muted-foreground mt-1">
          Manage your API keys for accessing SolixDB services.
        </p>
      </div>

      <SecurityNotice />

      {apiKey ? (
        <APIKeyDisplay apiKey={apiKey} />
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            No API key found. Please contact support.
          </p>
        </div>
      )}
    </motion.div>
  )
}
