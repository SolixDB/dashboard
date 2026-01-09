"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { animations } from "@/config/animation.config"

interface CreditsProgressProps {
  total: number
  used: number
}

export function CreditsProgress({ total, used }: CreditsProgressProps) {
  const percentage = (used / total) * 100
  const remaining = total - used

  // Determine color based on usage
  const getColor = () => {
    if (percentage < 50) return "#10B981" // green
    if (percentage < 80) return "#F59E0B" // yellow
    return "#EF4444" // red
  }

  const circumference = 2 * Math.PI * 45 // radius = 45
  const offset = circumference - (percentage / 100) * circumference

  return (
    <motion.div
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={{
        ...animations.fadeIn.transition,
        delay: 0.1,
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Credits Usage</CardTitle>
          <CardDescription>Monthly credit consumption</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="relative h-32 w-32">
              <svg className="h-32 w-32 -rotate-90 transform">
                {/* Background circle */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45"
                  fill="none"
                  stroke={getColor()}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{
                    duration: 1,
                    ease: "easeOut",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold">{remaining.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">remaining</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              {used.toLocaleString()} / {total.toLocaleString()} credits used
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {percentage.toFixed(1)}% of monthly limit
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
