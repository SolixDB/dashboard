"use client"

import { useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { SupportPage } from "@/components/support/SupportPage"
import { syncPrivyUser } from "@/lib/auth"

export default function SupportPageRoute() {
  const { authenticated, ready, user: privyUser } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return

    if (!authenticated) {
      router.push("/auth/signin")
      return
    }

    // Sync user on mount
    syncPrivyUser(privyUser).catch(console.error)
  }, [authenticated, ready, privyUser, router])

  if (!ready || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return <SupportPage />
}
