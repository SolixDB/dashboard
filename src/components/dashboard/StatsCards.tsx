"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, CheckCircle2, Zap, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/use-auth";
import { useBilling } from "@/lib/hooks/use-billing";
import { createClientSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

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
        icon: Activity,
        color: "text-blue-500",
      },
      {
        label: "Success Rate",
        value: successRate.toFixed(0),
        suffix: "%",
        icon: CheckCircle2,
        color: "text-emerald-500",
      },
      {
        label: "Avg Response",
        value: avgResponseTime.toLocaleString(),
        suffix: "ms",
        icon: Zap,
        color: "text-amber-500",
      },
      {
        label: "Credits Left",
        value: remaining.toLocaleString(),
        suffix: `/ ${totalCredits.toLocaleString()}`,
        icon: CreditCard,
        color: "text-purple-500",
      },
    ];
  }, [billing, todayUsage]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="relative overflow-hidden border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {stat.value}
              </span>
              <span className="text-xs font-semibold text-muted-foreground/70">
                {stat.suffix}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
