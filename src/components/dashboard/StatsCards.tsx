"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Activity, Clock, CheckCircle } from "lucide-react"
import { animations } from "@/config/animation.config"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/lib/hooks/use-auth"
import { useBilling } from "@/lib/hooks/use-billing"
import { createClientSupabase } from "@/lib/supabase/client"
import { useMemo } from "react"

const supabase = createClientSupabase()

interface StatsCard {
  title: string
  value: string | number
  change?: { value: number; isPositive: boolean }
  icon: typeof Zap
  color: string
  progress?: number
}

export function StatsCards() {
  const { user } = useAuth()
  const { data: billing } = useBilling()

  // Get today's usage
  const { data: todayUsage } = useQuery({
    queryKey: ["today-usage", user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from("usage_logs")
        .select("status_code, response_time_ms, credits_used")
        .eq("user_id", user.id)
        .gte("timestamp", today.toISOString())

      if (error) throw error

      return data || []
    },
    enabled: !!user?.id,
  })

  // Get yesterday's usage for comparison
  const { data: yesterdayUsage } = useQuery({
    queryKey: ["yesterday-usage", user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      const yesterdayEnd = new Date(yesterday)
      yesterdayEnd.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from("usage_logs")
        .select("status_code, response_time_ms")
        .eq("user_id", user.id)
        .gte("timestamp", yesterday.toISOString())
        .lte("timestamp", yesterdayEnd.toISOString())

      if (error) throw error

      return data || []
    },
    enabled: !!user?.id,
  })

  const stats = useMemo(() => {
    const credits = billing?.credits || { total_credits: 1000, used_credits: 0 }
    const remaining = credits.total_credits - credits.used_credits
    const progress = credits.total_credits > 0 ? (credits.used_credits / credits.total_credits) * 100 : 0

    const todayCalls = todayUsage?.length || 0
    const yesterdayCalls = yesterdayUsage?.length || 0
    const callsChange = yesterdayCalls > 0 ? ((todayCalls - yesterdayCalls) / yesterdayCalls) * 100 : 0

    const avgResponseTime = todayUsage && todayUsage.length > 0
      ? Math.round(todayUsage.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / todayUsage.length)
      : 0

    const yesterdayAvgResponseTime = yesterdayUsage && yesterdayUsage.length > 0
      ? Math.round(yesterdayUsage.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / yesterdayUsage.length)
      : 0

    const responseTimeChange = yesterdayAvgResponseTime > 0
      ? ((yesterdayAvgResponseTime - avgResponseTime) / yesterdayAvgResponseTime) * 100
      : 0

    const successCount = todayUsage?.filter(log => log.status_code >= 200 && log.status_code < 300).length || 0
    const successRate = todayUsage && todayUsage.length > 0
      ? (successCount / todayUsage.length) * 100
      : 100

    return [
      {
        title: "Credits Remaining",
        value: `${remaining.toLocaleString()} / ${credits.total_credits.toLocaleString()}`,
        progress: 100 - progress,
        icon: Zap,
        color: "from-yellow-500 to-orange-500",
      },
      {
        title: "API Calls Today",
        value: todayCalls.toLocaleString(),
        change: { value: Math.abs(callsChange), isPositive: callsChange >= 0 },
        icon: Activity,
        color: "from-green-500 to-emerald-500",
      },
      {
        title: "Avg Response Time",
        value: `${avgResponseTime}ms`,
        change: { value: Math.abs(responseTimeChange), isPositive: responseTimeChange >= 0 },
        icon: Clock,
        color: "from-blue-500 to-cyan-500",
      },
      {
        title: "Success Rate",
        value: `${successRate.toFixed(1)}%`,
        icon: CheckCircle,
        color: "from-purple-500 to-pink-500",
      },
    ] as StatsCard[]
  }, [billing, todayUsage, yesterdayUsage])

  const cards = stats
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={animations.staggerItem.initial}
          animate={animations.staggerItem.animate}
          transition={{
            ...animations.staggerItem.transition,
            delay: index * 0.1,
          }}
        >
          <motion.div
            whileHover={animations.cardHover.hover}
            initial={animations.cardHover.rest}
          >
            <Card className="relative overflow-hidden">
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-10",
                  card.color
                )}
              />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold">{card.value}</p>
                    {card.change && (
                      <p
                        className={cn(
                          "text-xs",
                          card.change.isPositive
                            ? "text-green-400"
                            : "text-red-400"
                        )}
                      >
                        {card.change.isPositive ? "+" : ""}
                        {card.change.value}% from last period
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-lg bg-gradient-to-br p-3",
                      card.color
                    )}
                  >
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                {card.progress !== undefined && (
                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className={cn(
                          "h-full bg-gradient-to-r",
                          card.color
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${card.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
