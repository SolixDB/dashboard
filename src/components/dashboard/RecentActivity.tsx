"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { animations } from "@/config/animation.config"
import { formatDistanceToNow } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/lib/hooks/use-auth"
import { createClientSupabase } from "@/lib/supabase/client"

const supabase = createClientSupabase()

interface ActivityLog {
  timestamp: Date
  endpoint: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  status: number
  responseTime: number
  creditsUsed: number
}

function getStatusBadge(status: number) {
  if (status >= 200 && status < 300) {
    return <Badge variant="success">{status}</Badge>
  }
  if (status >= 400 && status < 500) {
    return <Badge variant="warning">{status}</Badge>
  }
  if (status >= 500) {
    return <Badge variant="error">{status}</Badge>
  }
  return <Badge>{status}</Badge>
}

export function RecentActivity() {
  const { user } = useAuth()

  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activity", user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from("usage_logs")
        .select("endpoint, method, status_code, response_time_ms, credits_used, timestamp")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })
        .limit(10)

      if (error) throw error

      return (data || []).map((log) => ({
        timestamp: new Date(log.timestamp),
        endpoint: log.endpoint,
        method: log.method as "GET" | "POST" | "PUT" | "DELETE",
        status: log.status_code || 200,
        responseTime: log.response_time_ms || 0,
        creditsUsed: log.credits_used || 0,
      })) as ActivityLog[]
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  return (
    <motion.div
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last 10 API calls</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : !activities || activities.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No recent activity
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={animations.staggerItem.initial}
                  animate={animations.staggerItem.animate}
                  transition={{
                    ...animations.staggerItem.transition,
                    delay: index * 0.05,
                  }}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{activity.endpoint}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.method}
                      </Badge>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">
                      {activity.responseTime}ms
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.creditsUsed} credit{activity.creditsUsed !== 1 ? "s" : ""}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
