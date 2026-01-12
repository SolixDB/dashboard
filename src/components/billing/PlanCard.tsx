"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { animations } from "@/config/animation.config"

interface PlanCardProps {
  plan: "free" | "x402" | "enterprise"
}

const planDetails = {
  free: {
    name: "Free",
    price: "$0",
    period: "/month",
    accent: "from-slate-500/20 to-slate-600/20",
    badgeClass: "bg-muted text-muted-foreground",
    features: [
      "1,000 monthly credits",
      "Basic query complexity",
      "Community support",
    ],
  },
  x402: {
    name: "x402",
    price: "$49",
    period: "/month",
    accent: "from-primary/20 to-primary/10",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    features: [
      "25,000 monthly credits",
      "Advanced query complexity",
      "Email support (24h)",
      "Data export (CSV)",
      "Webhooks",
      "5 team members",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    period: "",
    accent: "from-amber-500/20 to-orange-500/10",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    features: [
      "Custom monthly credits",
      "Unlimited query complexity",
      "Priority support + SLA",
      "Data export (CSV + Parquet)",
      "Webhooks",
      "Unlimited team members",
    ],
  },
}

export function PlanCard({ plan }: PlanCardProps) {
  const details = planDetails[plan]

  return (
    <motion.div
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={animations.fadeIn.transition}
    >
      <Card className="relative overflow-hidden border-border/50">
        {/* Gradient accent */}
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${details.accent}`} />

        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Current Plan</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{details.price}</span>
                {details.period && (
                  <span className="text-muted-foreground text-sm">{details.period}</span>
                )}
              </div>
            </div>
            <Badge variant="outline" className={details.badgeClass}>
              {details.name}
            </Badge>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Included Features
            </p>
            <ul className="space-y-2.5">
              {details.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-xs">
                    ✓
                  </span>
                  <span className="text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
