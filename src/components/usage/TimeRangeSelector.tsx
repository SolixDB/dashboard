"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TimeRange = "24h" | "7d" | "30d" | "custom"

interface TimeRangeSelectorProps {
  value: TimeRange
  onChange: (value: TimeRange) => void
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const ranges: { label: string; value: TimeRange }[] = [
    { label: "Last 24 hours", value: "24h" },
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
    { label: "Custom", value: "custom" },
  ]

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded border border-border bg-background/50 p-1">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={cn(
            "rounded-sm px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-200",
            value === range.value
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}
