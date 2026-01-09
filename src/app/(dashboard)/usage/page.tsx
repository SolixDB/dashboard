"use client"

import { useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { UsageAnalytics } from "@/components/usage/UsageAnalytics"
import { syncPrivyUser } from "@/lib/auth"

export default function UsagePage() {
  const { authenticated, ready, user: privyUser } = usePrivy()
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return

    if (!authenticated) {
      router.push("/auth/signin")
      return
    }

    const loadUser = async () => {
      setLoading(true)
      try {
        const syncedUser = await syncPrivyUser(privyUser)
        if (syncedUser?.id) {
          setUserId(syncedUser.id)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [authenticated, ready, privyUser, router])

  if (!ready || loading || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usage & Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your API usage, track credits, and analyze performance metrics.
        </p>
      </div>

      <UsageAnalytics userId={userId} />
    </div>
  )
}
