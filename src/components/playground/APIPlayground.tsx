"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { animations } from "@/config/animation.config"
import { motion } from "framer-motion"
import { Clock, Copy, Loader2, Play, Zap } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ExampleQueries } from "./ExampleQueries"

interface APIPlaygroundProps {
  apiKeyPrefix: string
  userId?: string
}

const endpoints = [
  {
    value: "POST /v1/query",
    method: "POST",
    url: "https://api.solixdb.xyz/v1/query",
    description: "Execute a read-only SQL query (SELECT only)",
    type: "sql" as const,
  },
  {
    value: "POST /v1/rpc",
    method: "POST",
    url: "https://api.solixdb.xyz/v1/rpc",
    description: "Execute a JSON-RPC 2.0 method call",
    type: "rpc" as const,
  },
]

interface Response {
  status: number
  data: any
  time: number
  creditsUsed: number
}

export function APIPlayground({ apiKeyPrefix, userId }: APIPlaygroundProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0].value)
  const [requestBody, setRequestBody] = useState("")
  const [response, setResponse] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)

  const currentEndpoint = endpoints.find((e) => e.value === selectedEndpoint)

  const handleSendRequest = async () => {
    if (!currentEndpoint) return

    setLoading(true)
    const startTime = Date.now()

    try {
      let keyToUse = apiKeyPrefix

      if (userId) {
        try {
          const keyResponse = await fetch('/api/auth/get-api-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          })

          if (keyResponse.ok) {
            const keyData = await keyResponse.json()
            if (keyData.apiKey) {
              keyToUse = keyData.apiKey
            }
          }
        } catch (keyError) {
          // Use prefix as fallback
        }
      }

      if (!keyToUse) {
        toast.error("API key is required.")
        setLoading(false)
        return
      }

      const url = currentEndpoint.url
      const options: RequestInit = {
        method: currentEndpoint.method,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": keyToUse,
        },
      }

      if (currentEndpoint.method === "POST" && requestBody) {
        try {
          options.body = JSON.stringify(JSON.parse(requestBody))
        } catch (e) {
          toast.error("Invalid JSON in request body")
          setLoading(false)
          return
        }
      }

      const res = await fetch(url, options)
      const data = await res.json()
      const endTime = Date.now()

      setResponse({
        status: res.status,
        data,
        time: endTime - startTime,
        creditsUsed: 1,
      })

      if (res.status >= 200 && res.status < 300) {
        toast.success("Request completed successfully")
      } else {
        toast.error(`Request failed: ${data.error?.message || data.message || 'Unknown error'}`)
      }
    } catch (error: any) {
      toast.error(`Request failed: ${error.message}`)
      setResponse({
        status: 0,
        data: { error: error.message },
        time: 0,
        creditsUsed: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCurl = () => {
    if (!currentEndpoint) return

    const curlCommand = `curl -X ${currentEndpoint.method} \\
  "${currentEndpoint.url}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKeyPrefix}"${currentEndpoint.method === "POST" && requestBody
        ? ` \\
  -d '${requestBody}'`
        : ""
      }`

    navigator.clipboard.writeText(curlCommand)
    toast.success("cURL command copied to clipboard")
  }

  const handleLoadExample = (example: { query: string; type?: "sql" | "rpc" }) => {
    setRequestBody(example.query)
    if (example.type) {
      const matchingEndpoint = endpoints.find(e => e.type === example.type)
      if (matchingEndpoint) {
        setSelectedEndpoint(matchingEndpoint.value)
      }
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    if (status >= 400 && status < 500) return "bg-amber-500/10 text-amber-500 border-amber-500/20"
    return "bg-red-500/10 text-red-500 border-red-500/20"
  }

  const getStatusBadgeVariant = (status: number) => {
    if (status >= 200 && status < 300) return "success"
    if (status >= 400 && status < 500) return "warning"
    return "error"
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Request Panel */}
      <motion.div
        initial={animations.fadeIn.initial}
        animate={animations.fadeIn.animate}
        transition={animations.fadeIn.transition}
        className="flex flex-col"
      >
        <Card className="flex-1 overflow-hidden border-border/50 bg-gradient-to-b from-card to-card/80">
          {/* Panel Header */}
          <div className="relative border-b border-border/50 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-semibold text-foreground">Request Builder</h3>
                <p className="text-sm text-muted-foreground">Configure and send API requests</p>
              </div>
            </div>
          </div>

          <CardContent className="space-y-6 p-6">
            {/* Endpoint Selection */}
            <div className="space-y-3 flex flex-col gap-1">
              <Label className="text-sm font-medium ">Endpoint</Label>
              <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                <SelectTrigger className="h-12 border-border/50 bg-muted/30 transition-colors hover:bg-muted/50 focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {endpoints.map((endpoint) => (
                    <SelectItem
                      key={endpoint.value}
                      value={endpoint.value}
                      className="py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/20 font-mono text-xs px-2"
                        >
                          {endpoint.method}
                        </Badge>
                        <span className="font-medium">{endpoint.value}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentEndpoint && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
                  {currentEndpoint.description}
                </p>
              )}
            </div>

            {/* Request Body */}
            {currentEndpoint?.method === "POST" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm font-medium">
                    Request Body
                    <span className="ml-2 font-normal text-muted-foreground">
                      {currentEndpoint.type === "sql" && "(SQL Query)"}
                      {currentEndpoint.type === "rpc" && "(JSON-RPC)"}
                    </span>
                  </Label>
                  <ExampleQueries onLoadExample={handleLoadExample} />
                </div>
                <Textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder={
                    currentEndpoint.type === "sql"
                      ? '{\n  "query": "SELECT * FROM transactions LIMIT 10",\n  "format": "json"\n}'
                      : currentEndpoint.type === "rpc"
                        ? '{\n  "jsonrpc": "2.0",\n  "id": 1,\n  "method": "getProtocols",\n  "params": []\n}'
                        : '{"query": "..."}'
                  }
                  className="min-h-[180px] resize-none border-border/50 bg-muted/30 font-mono text-sm transition-colors focus:bg-muted/50 focus:ring-primary/20"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSendRequest}
                disabled={loading}
                size="lg"
                className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/80 font-semibold shadow-lg shadow-primary/20 transition-all "
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    Send Request
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleCopyCurl}
                className="h-12 px-4 border-border/50 bg-muted/30 transition-colors hover:bg-muted/50"
              >
                Copy cURL
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Response Panel */}
      <motion.div
        initial={animations.fadeIn.initial}
        animate={animations.fadeIn.animate}
        transition={{
          ...animations.fadeIn.transition,
          delay: 0.1,
        }}
        className="flex flex-col"
      >
        <Card className="flex-1 overflow-hidden border-border/50 bg-gradient-to-b from-card to-card/80">
          {/* Panel Header */}
          <div className="relative border-b border-border/50 bg-gradient-to-r from-emerald-500/5 via-emerald-500/10 to-emerald-500/5 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">Response</h3>
                  <p className="text-sm text-muted-foreground">API response and metrics</p>
                </div>
              </div>
              {response && (
                <Badge
                  variant={getStatusBadgeVariant(response.status) as any}
                  className={`px-3 py-1 font-mono text-sm ${getStatusColor(response.status)}`}
                >
                  {response.status}
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="flex flex-col gap-4 p-6">
            {response ? (
              <>
                {/* Response Metrics */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{response.time}ms</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">{response.creditsUsed} credit</span>
                  </div>
                </div>

                {/* Response Body */}
                <div className="flex-1 overflow-hidden rounded-xl border border-border/50 bg-[#0d1117]">
                  <div className="flex items-center justify-between border-b border-border/30 bg-muted/20 px-4 py-2">
                    <span className="text-xs font-medium text-muted-foreground">Response Body</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
                        toast.success("Response copied to clipboard")
                      }}
                      className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Copy />
                    </Button>
                  </div>
                  <div className="max-h-[400px] overflow-auto p-4">
                    <pre className="font-mono text-xs leading-relaxed text-emerald-400">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/20 py-16">
                <h4 className="font-medium text-foreground">No Response Yet</h4>
                <p className="mt-1 max-w-[200px] text-center text-sm text-muted-foreground">
                  Configure your request and click Send to see the response here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
