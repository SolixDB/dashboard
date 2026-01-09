"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { BookOpen } from "lucide-react"

const examples = [
  {
    name: "Get Recent Transactions",
    query: JSON.stringify(
      {
        query: "SELECT signature, protocol_name, fee, timestamp FROM transactions ORDER BY timestamp DESC LIMIT 10",
        format: "json",
      },
      null,
      2
    ),
  },
  {
    name: "Count Transactions by Protocol",
    query: JSON.stringify(
      {
        query: "SELECT protocol_name, COUNT(*) as count FROM transactions GROUP BY protocol_name ORDER BY count DESC LIMIT 20",
        format: "json",
      },
      null,
      2
    ),
  },
  {
    name: "Filter by Date Range",
    query: JSON.stringify(
      {
        query: "SELECT signature, protocol_name, fee, timestamp FROM transactions WHERE timestamp >= '2024-01-01' AND timestamp <= '2024-01-31' ORDER BY timestamp DESC LIMIT 50",
        format: "json",
      },
      null,
      2
    ),
  },
  {
    name: "Average Fee by Protocol",
    query: JSON.stringify(
      {
        query: "SELECT protocol_name, AVG(fee) as avg_fee, COUNT(*) as transaction_count FROM transactions GROUP BY protocol_name ORDER BY avg_fee DESC",
        format: "json",
      },
      null,
      2
    ),
  },
]

interface ExampleQueriesProps {
  onLoadExample: (example: { query: string }) => void
}

export function ExampleQueries({ onLoadExample }: ExampleQueriesProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <BookOpen className="mr-2 h-4 w-4" />
          Load Example Query
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <p className="text-sm font-medium">Example Queries</p>
          <div className="space-y-1">
            {examples.map((example) => (
              <Button
                key={example.name}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => onLoadExample(example)}
              >
                {example.name}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
