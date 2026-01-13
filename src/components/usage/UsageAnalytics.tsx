"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TimeRangeSelector } from "./TimeRangeSelector"
import { MetricsGrid } from "./MetricsGrid"
import { UsageCharts } from "./UsageCharts"
import { animations } from "@/config/animation.config"
import { toast } from "sonner"

interface UsageAnalyticsProps {
  userId: string
}

export function UsageAnalytics({ userId }: UsageAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "custom">("30d")

  const handleExport = () => {
    // TODO: Generate CSV from usage data
    toast.success("Export started. CSV will be downloaded shortly.")
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={animations.fadeIn.initial}
        animate={animations.fadeIn.animate}
        transition={animations.fadeIn.transition}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        <Button
          variant="outline"
          onClick={handleExport}
          className="h-10 border-border bg-card/50 px-4 font-bold uppercase tracking-widest text-muted-foreground transition-all hover:border-primary/50 hover:bg-card hover:text-primary rounded-sm"
        >
          Export CSV
        </Button>
      </motion.div>

      <MetricsGrid timeRange={timeRange} />

      <UsageCharts timeRange={timeRange} />
    </div>
  )
}
