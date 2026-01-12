"use client"

import { motion } from "framer-motion"
import { PlanCard } from "./PlanCard"
import { CreditsProgress } from "./CreditsProgress"
import { PlanComparison } from "./PlanComparison"
import { animations } from "@/config/animation.config"

interface BillingPageProps {
  plan: "free" | "x402" | "enterprise"
  credits: {
    total_credits: number
    used_credits: number
  }
}

export function BillingPage({ plan, credits }: BillingPageProps) {
  return (
    <motion.div
      initial={animations.pageTransition.initial}
      animate={animations.pageTransition.animate}
      transition={animations.pageTransitionConfig}
      className="space-y-8"
    >
      {/* Page Header */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
          <p className="text-muted-foreground mt-2 max-w-lg">
            Manage your subscription, track usage, and explore available plans.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <PlanCard plan={plan} />
        <CreditsProgress
          total={credits.total_credits}
          used={credits.used_credits}
        />
      </div>

      {/* Plan Comparison */}
      <PlanComparison currentPlan={plan} />
    </motion.div>
  )
}
