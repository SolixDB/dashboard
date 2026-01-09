"use client"

import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { animations } from "@/config/animation.config"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/lib/hooks/use-auth"
import { createClientSupabase } from "@/lib/supabase/client"
import { useMemo } from "react"

const supabase = createClientSupabase()

interface UsageChartsProps {
  timeRange: string
}

const COLORS = ["#1362FD", "#5A91FF", "#06B6D4", "#8B5CF6"]

export function UsageCharts({ timeRange }: UsageChartsProps) {
  const { user } = useAuth()

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = new Date()
    const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : 30
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return { startDate, endDate: now, days }
  }, [timeRange])

  const { data: usageData, isLoading } = useQuery({
    queryKey: ["usage-charts", user?.id, timeRange],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from("usage_logs")
        .select("endpoint, status_code, credits_used, timestamp")
        .eq("user_id", user.id)
        .gte("timestamp", dateRange.startDate.toISOString())
        .lte("timestamp", dateRange.endDate.toISOString())
        .order("timestamp", { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.id,
  })

  // Process data for charts
  const { apiCallsData, creditsData, endpointData, statusCodeData } = useMemo(() => {
    if (!usageData || usageData.length === 0) {
      const emptyData = Array.from({ length: dateRange.days }, (_, i) => ({
        date: new Date(Date.now() - (dateRange.days - 1 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        calls: 0,
        credits: 0,
      }))
      return {
        apiCallsData: emptyData,
        creditsData: emptyData,
        endpointData: [],
        statusCodeData: [],
      }
    }

    // Group by date
    const grouped = usageData.reduce((acc, log) => {
      const date = new Date(log.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      if (!acc[date]) {
        acc[date] = { calls: 0, credits: 0 }
      }
      acc[date].calls++
      acc[date].credits += log.credits_used || 0
      return acc
    }, {} as Record<string, { calls: number; credits: number }>)

    // Fill in all days
    const apiCallsData = Array.from({ length: dateRange.days }, (_, i) => {
      const date = new Date(Date.now() - (dateRange.days - 1 - i) * 24 * 60 * 60 * 1000)
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      return {
        date: dateStr,
        calls: grouped[dateStr]?.calls || 0,
      }
    })

    const creditsData = Array.from({ length: dateRange.days }, (_, i) => {
      const date = new Date(Date.now() - (dateRange.days - 1 - i) * 24 * 60 * 60 * 1000)
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      return {
        date: dateStr,
        credits: grouped[dateStr]?.credits || 0,
      }
    })

    // Endpoint distribution
    const endpointCounts = usageData.reduce((acc, log) => {
      acc[log.endpoint] = (acc[log.endpoint] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const endpointData = Object.entries(endpointCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }))

    // Status code distribution
    const statusCounts = usageData.reduce((acc, log) => {
      const code = Math.floor(log.status_code / 100)
      const key = `${code}xx`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const total = usageData.length
    const statusCodeData = [
      { name: "2xx", value: total > 0 ? (statusCounts["2xx"] || 0) / total * 100 : 0, color: "#10B981" },
      { name: "4xx", value: total > 0 ? (statusCounts["4xx"] || 0) / total * 100 : 0, color: "#F59E0B" },
      { name: "5xx", value: total > 0 ? (statusCounts["5xx"] || 0) / total * 100 : 0, color: "#EF4444" },
    ].filter(item => item.value > 0)

    return { apiCallsData, creditsData, endpointData, statusCodeData }
  }, [usageData, dateRange.days])
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* API Calls Over Time */}
      <motion.div
        initial={animations.fadeIn.initial}
        animate={animations.fadeIn.animate}
        transition={animations.fadeIn.transition}
      >
        <Card>
          <CardHeader>
            <CardTitle>API Calls Over Time</CardTitle>
            <CardDescription>Daily API call volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={apiCallsData}>
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
                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke="#1362FD"
                  strokeWidth={2}
                  dot={{ fill: "#1362FD", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Credits Consumption */}
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
            <CardTitle>Credits Consumption</CardTitle>
            <CardDescription>Daily credits used</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={creditsData}>
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
                <Bar dataKey="credits" fill="#1362FD" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Endpoint Distribution */}
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
            <CardTitle>Endpoint Distribution</CardTitle>
            <CardDescription>Top 5 endpoints by usage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={endpointData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {endpointData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Status Codes */}
      <motion.div
        initial={animations.fadeIn.initial}
        animate={animations.fadeIn.animate}
        transition={{
          ...animations.fadeIn.transition,
          delay: 0.3,
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Status Codes</CardTitle>
            <CardDescription>Response status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusCodeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  stroke="hsl(var(--border))"
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
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
                <Bar dataKey="value" fill="#1362FD" radius={[0, 8, 8, 0]}>
                  {statusCodeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
