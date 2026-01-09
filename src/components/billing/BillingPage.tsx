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
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Billing & Plans</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and view usage details.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PlanCard plan={plan} />
        <CreditsProgress
          total={credits.total_credits}
          used={credits.used_credits}
        />
      </div>

      <PlanComparison currentPlan={plan} />
    </motion.div>
  )
}
