"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { animations } from "@/config/animation.config"

interface CreditsProgressProps {
  total: number
  used: number
}

export function CreditsProgress({ total, used }: CreditsProgressProps) {
  const percentage = Math.min((used / total) * 100, 100)
  const remaining = total - used

  const getProgressColor = () => {
    if (percentage < 50) return "bg-emerald-500"
    if (percentage < 80) return "bg-amber-500"
    return "bg-red-500"
  }

  const getStatusText = () => {
    if (percentage < 50) return "Healthy usage"
    if (percentage < 80) return "Moderate usage"
    return "High usage"
  }

  return (
    <motion.div
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={{
        ...animations.fadeIn.transition,
        delay: 0.1,
      }}
    >
      <Card className="relative overflow-hidden border-border/50">
        {/* Gradient accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20" />

        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Credits Usage</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{remaining.toLocaleString()}</span>
              <span className="text-muted-foreground text-sm">remaining</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className={`h-full rounded-full ${getProgressColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {used.toLocaleString()} / {total.toLocaleString()} used
              </span>
              <span className="text-muted-foreground">
                {percentage.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </span>
              <span className={`text-sm font-medium ${percentage < 50 ? "text-emerald-500" :
                  percentage < 80 ? "text-amber-500" : "text-red-500"
                }`}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
