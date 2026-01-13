"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { BookOpen } from "lucide-react"

const examples = [
  // SQL Query Examples
  {
    name: "Get Recent Transactions (SQL)",
    query: JSON.stringify(
      {
        query: "SELECT signature, protocol_name, fee, slot, block_time FROM transactions WHERE block_time >= 1759276800 AND block_time <= 1764547200 ORDER BY block_time DESC LIMIT 10",
        format: "json",
      },
      null,
      2
    ),
    type: "sql" as const,
  },
  {
    name: "Count Transactions by Protocol (SQL)",
    query: JSON.stringify(
      {
        query: "SELECT protocol_name, COUNT(*) as count FROM transactions GROUP BY protocol_name ORDER BY count DESC LIMIT 20",
        format: "json",
      },
      null,
      2
    ),
    type: "sql" as const,
  },
  {
    name: "Average Fee by Protocol (SQL)",
    query: JSON.stringify(
      {
        query: "SELECT protocol_name, AVG(fee) as avg_fee, COUNT(*) as transaction_count FROM transactions GROUP BY protocol_name ORDER BY avg_fee DESC",
        format: "json",
      },
      null,
      2
    ),
    type: "sql" as const,
  },
  // JSON-RPC Examples
  {
    name: "Get Available Protocols (RPC)",
    query: JSON.stringify(
      {
        jsonrpc: "2.0",
        id: 1,
        method: "getProtocols",
        params: [],
      },
      null,
      2
    ),
    type: "rpc" as const,
  },
  {
    name: "Get Transaction by Signature (RPC)",
    query: JSON.stringify(
      {
        jsonrpc: "2.0",
        id: 2,
        method: "getTransaction",
        params: ["iFcm6d51nn2WPu6ZmyC7MavN8pDZnWZLQy1fvVikm3ou5vV9Zsnfo8rQKfZfUyRkAQhsh8eMpbfx92QNXbfysRp"],
      },
      null,
      2
    ),
    type: "rpc" as const,
  },
  {
    name: "Get Protocol Statistics (RPC)",
    query: JSON.stringify(
      {
        jsonrpc: "2.0",
        id: 3,
        method: "getProtocolStats",
        params: [{
          protocolName: "drift_v2",
          blockTime: {
            gte: 1759276800,
            lte: 1764547200,
          },
        }],
      },
      null,
      2
    ),
    type: "rpc" as const,
  },
  {
    name: "Get Top Protocols (RPC)",
    query: JSON.stringify(
      {
        jsonrpc: "2.0",
        id: 4,
        method: "getTopProtocols",
        params: [{
          limit: 10,
          sortBy: "transactions",
        }],
      },
      null,
      2
    ),
    type: "rpc" as const,
  },
  {
    name: "Get Transactions with Filters (RPC)",
    query: JSON.stringify(
      {
        jsonrpc: "2.0",
        id: 5,
        method: "getTransactions",
        params: [{
          filters: {
            status: "succeeded",
            protocols: ["drift_v2", "kamino_lending"],
          },
          limit: 50,
          sortOrder: "desc",
        }],
      },
      null,
      2
    ),
    type: "rpc" as const,
  },
  {
    name: "Get Transaction by Signature (SQL)",
    query: JSON.stringify(
      {
        query: "SELECT signature, slot, protocol_name, fee, block_time, success FROM transactions WHERE signature = 'iFcm6d51nn2WPu6ZmyC7MavN8pDZnWZLQy1fvVikm3ou5vV9Zsnfo8rQKfZfUyRkAQhsh8eMpbfx92QNXbfysRp' LIMIT 1",
        format: "json",
      },
      null,
      2
    ),
    type: "sql" as const,
  },
  {
    name: "Get Transactions by Slot Range (SQL)",
    query: JSON.stringify(
      {
        query: "SELECT signature, slot, protocol_name, fee, block_time FROM transactions WHERE slot >= 370364680 AND slot <= 383639269 ORDER BY slot DESC LIMIT 20",
        format: "json",
      },
      null,
      2
    ),
    type: "sql" as const,
  },
  {
    name: "Get Transactions by BlockTime Range (SQL)",
    query: JSON.stringify(
      {
        query: "SELECT signature, slot, protocol_name, fee, block_time FROM transactions WHERE block_time >= 1759276800 AND block_time <= 1764547200 ORDER BY block_time DESC LIMIT 20",
        format: "json",
      },
      null,
      2
    ),
    type: "sql" as const,
  },
]

interface ExampleQueriesProps {
  onLoadExample: (example: { query: string; type?: "sql" | "rpc" }) => void
}

export function ExampleQueries({ onLoadExample }: ExampleQueriesProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-fit bg-primary/40 text-primary-foreground">
          Load Example Query
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-2">
          <p className="text-sm font-medium">Example Queries</p>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">SQL Queries</p>
              {examples.filter(e => e.type === "sql").map((example) => (
                <Button
                  key={example.name}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left text-xs"
                  onClick={() => onLoadExample(example)}
                >
                  {example.name}
                </Button>
              ))}
            </div>
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">JSON-RPC Methods</p>
              {examples.filter(e => e.type === "rpc").map((example) => (
                <Button
                  key={example.name}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left text-xs"
                  onClick={() => onLoadExample(example)}
                >
                  {example.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
