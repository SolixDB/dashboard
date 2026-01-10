"use client"

import { ReactNode, useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { MobileNav } from "@/components/layout/MobileNav"
import { Toaster } from "@/components/ui/sonner"
import { syncPrivyUser, getCurrentUser } from "@/lib/auth"
import { APIKeyGeneratedModal } from "@/components/keys/APIKeyGeneratedModal"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const { authenticated, ready, user: privyUser } = usePrivy()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generatedAPIKey, setGeneratedAPIKey] = useState<string | null>(null)
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false)

  useEffect(() => {
    if (!ready) return

    if (!authenticated || !privyUser) {
      router.push('/auth/signin')
      return
    }

    // Sync Privy user with database
    const syncUser = async () => {
      setLoading(true)
      try {
        const syncedUser = await syncPrivyUser(privyUser)
        if (syncedUser) {
          setUserProfile(syncedUser)
          
          // Check if a new API key was generated
          if (syncedUser.apiKeyGenerated && syncedUser.apiKey) {
            // Check if user has already seen their key
            const hasSeenKey = localStorage.getItem('apiKeySeen')
            if (!hasSeenKey) {
              setGeneratedAPIKey(syncedUser.apiKey)
              setShowAPIKeyModal(true)
            }
          }
        }
      } catch (error) {
        console.error('Error syncing user:', error)
      } finally {
        setLoading(false)
      }
    }

    syncUser()
  }, [authenticated, ready, privyUser, router])

  if (!ready || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!authenticated || !userProfile) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col md:pl-60">
        <TopBar user={userProfile} />
        <main className="flex-1 p-6 pb-20 md:pb-6">
          {children}
        </main>
        <MobileNav />
      </div>
      <Toaster />
      {generatedAPIKey && (
        <APIKeyGeneratedModal
          open={showAPIKeyModal}
          onOpenChange={setShowAPIKeyModal}
          apiKey={generatedAPIKey}
        />
      )}
    </div>
  )
}
