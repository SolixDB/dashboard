"use client";

import { Link } from "next-view-transitions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
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
    <Card className="border-border bg-card shadow-lg shadow-black/20 ring-1 ring-white/5">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">Real-time API traffic</p>
        </div>
        <Link
          href="/usage"
          className="rounded-sm bg-background/50 border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
        >
          View all
        </Link>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex h-[320px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="flex h-[320px] flex-col items-center justify-center space-y-2 text-center">
            <p className="text-sm font-medium text-muted-foreground">No traffic detected yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded border border-border/50 bg-background/30 p-3"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-[10px] font-bold",
                      activity.status >= 200 && activity.status < 300
                        ? "bg-emerald-500/10 text-emerald-500"
                        : activity.status >= 400
                          ? "bg-red-500/10 text-red-500"
                          : "bg-amber-500/10 text-amber-500"
                    )}
                  >
                    {activity.method.slice(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[11px] font-medium text-foreground">
                      {activity.endpoint}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        activity.status >= 200 && activity.status < 300
                          ? "bg-emerald-500"
                          : activity.status >= 400
                            ? "bg-red-500"
                            : "bg-amber-500"
                      )} />
                      <p className="text-[10px] font-medium text-muted-foreground">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-[10px] font-semibold text-foreground">
                    {activity.responseTime}ms
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold",
                    activity.status >= 200 && activity.status < 300
                      ? "text-emerald-500"
                      : "text-red-500"
                  )}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
