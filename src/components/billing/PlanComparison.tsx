"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { animations } from "@/config/animation.config"
import { EnterpriseForm } from "./EnterpriseForm"
import { useState } from "react"

interface PlanComparisonProps {
  currentPlan: "free" | "x402" | "enterprise"
}

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started",
    price: "$0",
    period: "/month",
    features: [
      { label: "Monthly Credits", value: "1,000" },
      { label: "Rate Limit", value: "10 req/min" },
      { label: "Query Complexity", value: "Basic" },
      { label: "Support", value: "Community" },
      { label: "Data Export", value: "—" },
      { label: "Webhooks", value: "—" },
      { label: "Team Members", value: "1" },
    ],
  },
  {
    id: "x402",
    name: "x402",
    description: "For growing projects",
    price: "$49",
    period: "/month",
    popular: true,
    features: [
      { label: "Monthly Credits", value: "25,000" },
      { label: "Rate Limit", value: "100 req/min" },
      { label: "Query Complexity", value: "Advanced" },
      { label: "Support", value: "Email (24h)" },
      { label: "Data Export", value: "CSV" },
      { label: "Webhooks", value: "✓" },
      { label: "Team Members", value: "5" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large-scale operations",
    price: "Custom",
    period: "",
    features: [
      { label: "Monthly Credits", value: "Custom" },
      { label: "Rate Limit", value: "Custom" },
      { label: "Query Complexity", value: "Unlimited" },
      { label: "Support", value: "Priority + SLA" },
      { label: "Data Export", value: "CSV + Parquet" },
      { label: "Webhooks", value: "✓" },
      { label: "Team Members", value: "Unlimited" },
    ],
  },
]

export function PlanComparison({ currentPlan }: PlanComparisonProps) {
  const [showEnterprise, setShowEnterprise] = useState(false)

  return (
    <>
      <motion.div
        initial={animations.fadeIn.initial}
        animate={animations.fadeIn.animate}
        transition={{
          ...animations.fadeIn.transition,
          delay: 0.2,
        }}
      >
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Compare Plans</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose the plan that best fits your needs
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-4 grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan
            const isPopular = plan.popular

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden border-border/50 ${isCurrent ? "ring-2 ring-primary/20" : ""
                  } ${isPopular ? "border-primary/30" : ""}`}
              >
                {/* Popular badge */}
                {isPopular && !isCurrent && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                      Popular
                    </div>
                  </div>
                )}

                {/* Current badge */}
                {isCurrent && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                      Current
                    </div>
                  </div>
                )}

                <CardContent className="p-6">
                  {/* Plan Header */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground text-sm">{plan.period}</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{feature.label}</span>
                        <span className={`font-medium ${feature.value === "—" ? "text-muted-foreground/50" : ""
                          }`}>
                          {feature.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.id === "enterprise" ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowEnterprise(true)}
                    >
                      Contact Sales
                    </Button>
                  ) : (
                    <Button
                      variant={isPopular ? "default" : "outline"}
                      className="w-full"
                      disabled
                    >
                      Upgrade (Coming Soon)
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </motion.div>

      <EnterpriseForm open={showEnterprise} onOpenChange={setShowEnterprise} />
    </>
  )
}
