"use client"

import { useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { APIPlayground } from "@/components/playground/APIPlayground"
import { createClient } from "@supabase/supabase-js"
import { syncPrivyUser } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function PlaygroundPage() {
  const { authenticated, ready, user: privyUser } = usePrivy()
  const router = useRouter()
  const [apiKeyPrefix, setApiKeyPrefix] = useState("")
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
          const { data: apiKey } = await supabase
            .from("api_keys")
            .select("key_prefix, key_suffix")
            .eq("user_id", syncedUser.id)
            .eq("is_active", true)
            .single()

          setApiKeyPrefix(apiKey?.key_prefix || "")
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Playground</h1>
        <p className="text-muted-foreground mt-1">
          Test API endpoints and explore the SolixDB API interactively.
        </p>
      </div>

      <APIPlayground apiKeyPrefix={apiKeyPrefix} />
    </div>
  )
}
