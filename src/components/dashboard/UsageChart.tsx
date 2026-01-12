"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/use-auth";
import { createClientSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const supabase = createClientSupabase();

type ChartType = "calls" | "credits" | "errors";

const tabs: { id: ChartType; label: string }[] = [
  { id: "calls", label: "Calls" },
  { id: "credits", label: "Credits" },
  { id: "errors", label: "Errors" },
];

export function UsageChart() {
  const [chartType, setChartType] = useState<ChartType>("calls");
  const { user } = useAuth();

  const { data: usageData, isLoading } = useQuery({
    queryKey: ["usage-chart", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("usage_logs")
        .select("timestamp, credits_used, status_code")
        .eq("user_id", user.id)
        .gte("timestamp", thirtyDaysAgo.toISOString())
        .order("timestamp", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const chartData = useMemo(() => {
    if (!usageData || usageData.length === 0) {
      return Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric" }
        ),
        calls: 0,
        credits: 0,
        errors: 0,
      }));
    }

    const grouped = usageData.reduce((acc, log) => {
      const date = new Date(log.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!acc[date]) acc[date] = { calls: 0, credits: 0, errors: 0 };
      acc[date].calls++;
      acc[date].credits += log.credits_used || 0;
      if (log.status_code >= 400) acc[date].errors++;
      return acc;
    }, {} as Record<string, { calls: number; credits: number; errors: number }>);

    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return {
        date: dateStr,
        calls: grouped[dateStr]?.calls || 0,
        credits: grouped[dateStr]?.credits || 0,
        errors: grouped[dateStr]?.errors || 0,
      };
    });
  }, [usageData]);

  const total = chartData.reduce((sum, d) => sum + d[chartType], 0);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-foreground">Activity</h3>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-semibold text-foreground">
              {total.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">total {chartType}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-md border border-border bg-muted/50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setChartType(tab.id)}
              className={cn(
                "flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors",
                chartType === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex h-[240px] items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1362FD" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#1362FD" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
                itemStyle={{ color: "#1362FD" }}
              />
              <Area
                type="monotone"
                dataKey={chartType}
                stroke="#1362FD"
                fill="url(#chartGradient)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
