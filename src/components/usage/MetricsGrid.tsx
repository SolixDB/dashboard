"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { animations } from "@/config/animation.config"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/lib/hooks/use-auth"
import { createClientSupabase } from "@/lib/supabase/client"
import { useMemo } from "react"

const supabase = createClientSupabase()

interface MetricsGridProps {
  timeRange: string
}

import {
  Activity,
  CreditCard,
  Zap,
  AlertCircle,
  Globe,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

export function MetricsGrid({ timeRange }: MetricsGridProps) {
  const { user } = useAuth()

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = new Date()
    const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : 30
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return { startDate, endDate: now }
  }, [timeRange])

  const { data: usageData, isLoading } = useQuery({
    queryKey: ["usage-metrics", user?.id, timeRange],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from("usage_logs")
        .select("endpoint, status_code, response_time_ms, credits_used, timestamp")
        .eq("user_id", user.id)
        .gte("timestamp", dateRange.startDate.toISOString())
        .lte("timestamp", dateRange.endDate.toISOString())

      if (error) throw error
      return data || []
    },
    enabled: !!user?.id,
  })

  const metrics = useMemo(() => {
    const totalCalls = usageData?.length || 0
    const totalCredits = usageData?.reduce((sum, log) => sum + (log.credits_used || 0), 0) || 0
    const avgResponseTime = totalCalls > 0
      ? Math.round(usageData?.reduce((sum, log) => sum + (log.response_time_ms || 0), 0)! / totalCalls)
      : 0
    const errorCount = usageData?.filter(log => log.status_code >= 400).length || 0
    const errorRate = totalCalls > 0 ? (errorCount / totalCalls) * 100 : 0

    // Most used endpoint
    const endpointCounts = usageData?.reduce((acc, log) => {
      acc[log.endpoint] = (acc[log.endpoint] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}
    const mostUsedEndpoint = Object.entries(endpointCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

    // Peak usage hour
    const hourCounts = usageData?.reduce((acc, log) => {
      const hour = new Date(log.timestamp).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>) || {}

    const peakHourEntry = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]
    const peakHour = peakHourEntry ? Number(peakHourEntry[0]) : undefined
    const peakHourFormatted = peakHour !== undefined
      ? `${peakHour % 12 || 12}:00 ${peakHour >= 12 ? "PM" : "AM"}`
      : "N/A"

    return [
      {
        label: "Total API Calls",
        value: totalCalls.toLocaleString(),
        icon: Activity,
        color: "text-blue-500",
        suffix: "requests"
      },
      {
        label: "Total Credits Used",
        value: totalCredits.toLocaleString(),
        icon: CreditCard,
        color: "text-purple-500",
        suffix: "credits"
      },
      {
        label: "Avg Response Time",
        value: `${avgResponseTime}ms`,
        icon: Zap,
        color: "text-amber-500",
        suffix: "latency"
      },
      {
        label: "Error Rate",
        value: `${errorRate.toFixed(1)}%`,
        icon: AlertCircle,
        color: "text-red-500",
        suffix: "failure rate"
      },
      {
        label: "Most Used Endpoint",
        value: mostUsedEndpoint === "N/A" ? "N/A" : mostUsedEndpoint.split('/').pop() || mostUsedEndpoint,
        icon: Globe,
        color: "text-emerald-500",
        suffix: "top route"
      },
      {
        label: "Peak Usage Hour",
        value: peakHourFormatted,
        icon: Clock,
        color: "text-sky-500",
        suffix: "busy period"
      },
    ]
  }, [usageData])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border bg-card ring-1 ring-white/5 h-32 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={animations.staggerItem.initial}
          animate={animations.staggerItem.animate}
          transition={{
            ...animations.staggerItem.transition,
            delay: index * 0.05,
          }}
        >
          <Card className="relative overflow-hidden border-border bg-card ring-1 ring-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {metric.label}
                </p>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {metric.value}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  {metric.suffix}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
