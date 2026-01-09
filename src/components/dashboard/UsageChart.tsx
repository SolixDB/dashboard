"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { animations } from "@/config/animation.config"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/lib/hooks/use-auth"
import { createClientSupabase } from "@/lib/supabase/client"

const supabase = createClientSupabase()

type ChartType = "calls" | "credits" | "errors"

export function UsageChart() {
  const [chartType, setChartType] = useState<ChartType>("calls")
  const { user } = useAuth()

  // Get last 30 days of usage
  const { data: usageData, isLoading } = useQuery({
    queryKey: ["usage-chart", user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from("usage_logs")
        .select("timestamp, credits_used, status_code")
        .eq("user_id", user.id)
        .gte("timestamp", thirtyDaysAgo.toISOString())
        .order("timestamp", { ascending: true })

      if (error) throw error

      return data || []
    },
    enabled: !!user?.id,
  })

  const chartData = useMemo(() => {
    if (!usageData || usageData.length === 0) {
      return Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        calls: 0,
        credits: 0,
        errors: 0,
      }))
    }

    // Group by date
    const grouped = usageData.reduce((acc, log) => {
      const date = new Date(log.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      if (!acc[date]) {
        acc[date] = { calls: 0, credits: 0, errors: 0 }
      }
      acc[date].calls++
      acc[date].credits += log.credits_used || 0
      if (log.status_code >= 400) {
        acc[date].errors++
      }
      return acc
    }, {} as Record<string, { calls: number; credits: number; errors: number }>)

    // Fill in all 30 days
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      return {
        date: dateStr,
        calls: grouped[dateStr]?.calls || 0,
        credits: grouped[dateStr]?.credits || 0,
        errors: grouped[dateStr]?.errors || 0,
      }
    })
  }, [usageData])

  const chartDataWithValue = chartData.map((d) => ({
    ...d,
    value:
      chartType === "calls"
        ? d.calls
        : chartType === "credits"
        ? d.credits
        : d.errors,
  }))

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
              <CardTitle>Usage Over Time</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={chartType === "calls" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("calls")}
              >
                API Calls
              </Button>
              <Button
                variant={chartType === "credits" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("credits")}
              >
                Credits Used
              </Button>
              <Button
                variant={chartType === "errors" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("errors")}
              >
                Error Rate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartDataWithValue}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1362FD" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1362FD" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                stroke="hsl(var(--border))"
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                stroke="hsl(var(--border))"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#1362FD"
                fillOpacity={1}
                fill="url(#colorValue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
