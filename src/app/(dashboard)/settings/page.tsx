"use client"

import { useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { SettingsPage } from "@/components/settings/SettingsPage"
import { syncPrivyUser } from "@/lib/auth"

export default function SettingsPageRoute() {
  const { authenticated, ready, user: privyUser } = usePrivy()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<any>(null)
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
        if (syncedUser) {
          setUserProfile(syncedUser)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [authenticated, ready, privyUser, router])

  if (!ready || loading || !userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return <SettingsPage user={userProfile} profile={userProfile} />
}
