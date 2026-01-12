"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/use-auth";
import { useBilling } from "@/lib/hooks/use-billing";
import { createClientSupabase } from "@/lib/supabase/client";
import { useMemo } from "react";

const supabase = createClientSupabase();

export function StatsCards() {
  const { user } = useAuth();
  const { data: billing } = useBilling();

  const { data: todayUsage } = useQuery({
    queryKey: ["today-usage", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("usage_logs")
        .select("status_code, response_time_ms, credits_used")
        .eq("user_id", user.id)
        .gte("timestamp", today.toISOString());

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const stats = useMemo(() => {
    const totalCredits = billing?.credits?.total_credits || 0;
    const usedCredits = billing?.credits?.used_credits || 0;
    const remaining = totalCredits - usedCredits;

    const todayCalls = todayUsage?.length || 0;

    const avgResponseTime =
      todayUsage && todayUsage.length > 0
        ? Math.round(
            todayUsage.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) /
              todayUsage.length
          )
        : 0;

    const successCount =
      todayUsage?.filter(
        (log) => log.status_code >= 200 && log.status_code < 300
      ).length || 0;
    const successRate =
      todayUsage && todayUsage.length > 0
        ? (successCount / todayUsage.length) * 100
        : 100;

    return [
      {
        label: "API Calls Today",
        value: todayCalls.toLocaleString(),
        suffix: "requests",
      },
      {
        label: "Success Rate",
        value: successRate.toFixed(0),
        suffix: "%",
      },
      {
        label: "Avg Response",
        value: avgResponseTime.toLocaleString(),
        suffix: "ms",
      },
      {
        label: "Credits Left",
        value: remaining.toLocaleString(),
        suffix: `/ ${totalCredits.toLocaleString()}`,
      },
    ];
  }, [billing, todayUsage]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-semibold text-foreground">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{stat.suffix}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
