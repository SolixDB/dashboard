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
    if (!usageData || usageData.length === 0) {
      return [
        { label: "Total API Calls", value: "0", change: null },
        { label: "Total Credits Used", value: "0", change: null },
        { label: "Avg Response Time", value: "0ms", change: null },
        { label: "Error Rate", value: "0%", change: null },
        { label: "Most Used Endpoint", value: "N/A", change: null },
        { label: "Peak Usage Hour", value: "N/A", change: null },
      ]
    }

    const totalCalls = usageData.length
    const totalCredits = usageData.reduce((sum, log) => sum + (log.credits_used || 0), 0)
    const avgResponseTime = Math.round(
      usageData.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / totalCalls
    )
    const errorCount = usageData.filter(log => log.status_code >= 400).length
    const errorRate = (errorCount / totalCalls) * 100

    // Most used endpoint
    const endpointCounts = usageData.reduce((acc, log) => {
      acc[log.endpoint] = (acc[log.endpoint] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const mostUsedEndpoint = Object.entries(endpointCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

    // Peak usage hour
    const hourCounts = usageData.reduce((acc, log) => {
      const hour = new Date(log.timestamp).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    const peakHourFormatted = peakHour !== undefined
      ? `${peakHour % 12 || 12}:00 ${peakHour >= 12 ? "PM" : "AM"}`
      : "N/A"

    return [
      { label: "Total API Calls", value: totalCalls.toLocaleString(), change: null },
      { label: "Total Credits Used", value: totalCredits.toLocaleString(), change: null },
      { label: "Avg Response Time", value: `${avgResponseTime}ms`, change: null },
      { label: "Error Rate", value: `${errorRate.toFixed(1)}%`, change: null },
      { label: "Most Used Endpoint", value: mostUsedEndpoint, change: null },
      { label: "Peak Usage Hour", value: peakHourFormatted, change: null },
    ]
  }, [usageData])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse bg-muted" />
            </CardContent>
          </Card>
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
          <Card>
            <CardContent className="p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold">{metric.value}</p>
                {metric.change && (
                  <p className="text-xs text-green-400">{metric.change}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
