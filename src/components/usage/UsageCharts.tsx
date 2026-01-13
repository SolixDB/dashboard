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
import {
  Activity,
  CreditCard,
  Globe,
  AlertCircle
} from "lucide-react"
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
        <Card className="border-border bg-card shadow-lg shadow-black/20 ring-1 ring-white/5 rounded">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold text-foreground">API Calls Volume</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Success & traffic over time</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={apiCallsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} opacity={0.4} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip
                  cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-sm border border-border bg-card p-3 shadow-xl backdrop-blur-md">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {label}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <p className="text-sm font-bold text-foreground">
                              {Number(payload[0].value || 0).toLocaleString()} calls
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--primary)' }}
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
        transition={{ ...animations.fadeIn.transition, delay: 0.1 }}
      >
        <Card className="border-border bg-card shadow-lg shadow-black/20 ring-1 ring-white/5 rounded">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold text-foreground">Credits Consumption</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Resource usage monitoring</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={creditsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} opacity={0.4} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip
                  cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-sm border border-border bg-card p-3 shadow-xl backdrop-blur-md">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {label}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-500" />
                            <p className="text-sm font-bold text-foreground">
                              {Number(payload[0].value || 0).toLocaleString()} credits
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="credits" fill="var(--primary)" radius={[2, 2, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Endpoint Distribution */}
      <motion.div
        initial={animations.fadeIn.initial}
        animate={animations.fadeIn.animate}
        transition={{ ...animations.fadeIn.transition, delay: 0.2 }}
      >
        <Card className="border-border bg-card shadow-lg shadow-black/20 ring-1 ring-white/5 rounded">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold text-foreground">Endpoint Distribution</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Top performing routes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={endpointData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {endpointData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-sm border border-border bg-card p-3 shadow-xl backdrop-blur-md">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {payload[0].name}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full border border-white/20" style={{ backgroundColor: String(payload[0].payload.fill || '#000') }} />
                            <p className="text-sm font-bold text-foreground">
                              {Number(payload[0].value || 0).toLocaleString()} hits
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{value.split('/').pop() || value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Traffic Quality */}
      <motion.div
        initial={animations.fadeIn.initial}
        animate={animations.fadeIn.animate}
        transition={{ ...animations.fadeIn.transition, delay: 0.3 }}
      >
        <Card className="border-border bg-card shadow-lg shadow-black/20 ring-1 ring-white/5 rounded">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold text-foreground">Traffic Quality</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Status code breakdown (%)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusCodeData} layout="vertical" margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" horizontal={false} opacity={0.4} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 700 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'var(--primary)', opacity: 0.05 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-sm border border-border bg-card p-3 shadow-xl backdrop-blur-md">
                          <p className="text-sm font-bold text-foreground">
                            {payload[0].name}: {Number(payload[0].value || 0).toFixed(1)}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={32}>
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
