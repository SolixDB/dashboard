"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { animations } from "@/config/animation.config"
import { UpgradeModal } from "./UpgradeModal"
import { EnterpriseForm } from "./EnterpriseForm"
import { useState } from "react"

interface PlanComparisonProps {
  currentPlan: "free" | "x402" | "enterprise"
}

const plans = [
  {
    name: "Free",
    price: "$0",
    credits: "1,000",
    rateLimit: "10 req/min",
    complexity: "Basic",
    support: "Community",
    export: false,
    webhooks: false,
    teamMembers: 1,
  },
  {
    name: "x402",
    price: "$49/mo",
    credits: "25,000",
    rateLimit: "100 req/min",
    complexity: "Advanced",
    support: "Email (24h)",
    export: "CSV",
    webhooks: true,
    teamMembers: 5,
  },
  {
    name: "Enterprise",
    price: "Contact Sales",
    credits: "Custom",
    rateLimit: "Custom",
    complexity: "Unlimited",
    support: "Priority + SLA",
    export: "CSV + Parquet",
    webhooks: true,
    teamMembers: "Unlimited",
  },
]

export function PlanComparison({ currentPlan }: PlanComparisonProps) {
  const [showUpgrade, setShowUpgrade] = useState(false)
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
        <Card>
          <CardHeader>
            <CardTitle>Plan Comparison</CardTitle>
            <CardDescription>Compare features across all plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-left text-sm font-medium">Feature</th>
                    {plans.map((plan) => (
                      <th key={plan.name} className="p-4 text-center text-sm font-medium">
                        {plan.name}
                        {plan.name === currentPlan && (
                          <Badge variant="outline" className="ml-2">
                            Current
                          </Badge>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-4 text-sm font-medium">Monthly Credits</td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="p-4 text-center text-sm">
                        {plan.credits}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-sm font-medium">Rate Limits</td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="p-4 text-center text-sm">
                        {plan.rateLimit}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-sm font-medium">Query Complexity</td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="p-4 text-center text-sm">
                        {plan.complexity}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-sm font-medium">Support</td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="p-4 text-center text-sm">
                        {plan.support}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-sm font-medium">Data Export</td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="p-4 text-center text-sm">
                        {plan.export ? "✓" : "✗"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-sm font-medium">Webhooks</td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="p-4 text-center text-sm">
                        {plan.webhooks ? "✓" : "✗"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-sm font-medium">Team Members</td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="p-4 text-center text-sm">
                        {plan.teamMembers}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4"></td>
                    {plans.map((plan) => (
                      <td key={plan.name} className="p-4 text-center">
                        {plan.name === currentPlan ? (
                          <Badge variant="outline">Current Plan</Badge>
                        ) : plan.name === "Enterprise" ? (
                          <Button
                            variant="outline"
                            onClick={() => setShowEnterprise(true)}
                          >
                            Contact Sales
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            disabled
                            className="opacity-50 cursor-not-allowed"
                          >
                            Upgrade (Coming Soon)
                          </Button>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upgrade functionality disabled - not yet finalized */}
      {/* <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} /> */}
      <EnterpriseForm open={showEnterprise} onOpenChange={setShowEnterprise} />
    </>
  )
}
