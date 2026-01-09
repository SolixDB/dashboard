"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { animations } from "@/config/animation.config"

interface PlanCardProps {
  plan: "free" | "x402" | "enterprise"
}

const planDetails = {
  free: {
    name: "Free",
    price: "$0",
    features: [
      "1,000 monthly credits",
      "Basic query complexity",
      "Community support",
    ],
  },
  x402: {
    name: "x402",
    price: "$49/mo",
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
    price: "Contact Sales",
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription</CardDescription>
            </div>
            <Badge variant={plan === "enterprise" ? "default" : plan === "x402" ? "secondary" : "outline"}>
              {details.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-3xl font-bold">{details.price}</p>
            {plan !== "enterprise" && (
              <p className="text-sm text-muted-foreground">per month</p>
            )}
          </div>
          <ul className="space-y-2">
            {details.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span className="text-green-400">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  )
}
