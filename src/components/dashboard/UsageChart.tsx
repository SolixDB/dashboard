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
    <Card className="border-border bg-card shadow-lg shadow-black/20 ring-1 ring-white/5">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Usage Activity</h3>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">Statistics for the last 30 days</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {total.toLocaleString()}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              total {chartType}
            </p>
          </div>
        </div>

        {/* Tabs - Segmented Control */}
        <div className="flex w-fit gap-1 rounded border border-border bg-background/50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setChartType(tab.id)}
              className={cn(
                "rounded-sm px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-200",
                chartType === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {isLoading ? (
          <div className="flex h-[280px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--border)"
                vertical={false}
                opacity={0.4}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                dy={10}
                interval="preserveStartEnd"
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
                      <div className="rounded-lg border border-border bg-card p-3 shadow-xl backdrop-blur-md">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {label}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <p className="text-sm font-bold text-foreground">
                            {payload[0].value?.toLocaleString() || 0} {chartType}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={chartType}
                stroke="var(--primary)"
                fill="url(#chartGradient)"
                strokeWidth={2.5}
                activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--primary)' }}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
