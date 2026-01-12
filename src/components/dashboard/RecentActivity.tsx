"use client";

import { Link } from "next-view-transitions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/use-auth";
import { createClientSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const supabase = createClientSupabase();

interface ActivityLog {
  timestamp: Date;
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
}

export function RecentActivity() {
  const { user } = useAuth();

  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activity", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("usage_logs")
        .select("endpoint, method, status_code, response_time_ms, timestamp")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })
        .limit(8);

      if (error) throw error;

      return (data || []).map((log) => ({
        timestamp: new Date(log.timestamp),
        endpoint: log.endpoint,
        method: log.method,
        status: log.status_code || 200,
        responseTime: log.response_time_ms || 0,
      })) as ActivityLog[];
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-foreground">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">Latest API requests</p>
        </div>
        <Link
          href="/usage"
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex h-[240px] items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
            No recent activity
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      activity.status >= 200 && activity.status < 300
                        ? "bg-emerald-500"
                        : activity.status >= 400
                        ? "bg-red-500"
                        : "bg-amber-500"
                    )}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-foreground">
                      {activity.endpoint}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {activity.responseTime}ms
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
