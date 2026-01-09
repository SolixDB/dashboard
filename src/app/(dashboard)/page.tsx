"use client"

import { useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { UsageChart } from "@/components/dashboard/UsageChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { Badge } from "@/components/ui/badge"
import { animations } from "@/config/animation.config"
import { syncPrivyUser } from "@/lib/auth"

export default function DashboardPage() {
  const { authenticated, ready, user: privyUser } = usePrivy()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return

    if (!authenticated) {
      router.push('/auth/signin')
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

  const displayName = userProfile.display_name || 
    (userProfile.email && !userProfile.email.endsWith("@wallet.solixdb") 
      ? userProfile.email.split("@")[0] 
      : null) ||
    (userProfile.wallet_address 
      ? `${userProfile.wallet_address.slice(0, 4)}...${userProfile.wallet_address.slice(-4)}` 
      : null) ||
    "User"
  const plan = userProfile.plan || "free"

  return (
    <motion.div
      initial={animations.pageTransition.initial}
      animate={animations.pageTransition.animate}
      transition={animations.pageTransitionConfig}
      className="space-y-6"
    >
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your API usage and activity.
          </p>
        </div>
        <Badge
          variant={plan === "enterprise" ? "default" : plan === "x402" ? "secondary" : "outline"}
          className="text-sm px-4 py-1.5"
        >
          {plan === "free" ? "Free Plan" : plan === "x402" ? "x402 Plan" : "Enterprise"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UsageChart />
        <RecentActivity />
      </div>
    </motion.div>
  )
}
