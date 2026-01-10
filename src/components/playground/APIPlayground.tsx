"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Copy, Loader2, Play } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ExampleQueries } from "./ExampleQueries"

interface APIPlaygroundProps {
  apiKeyPrefix: string
  userId?: string
}

// API endpoints
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
  const [apiKey, setApiKey] = useState("")
  const [useManualKey, setUseManualKey] = useState(false)

  const currentEndpoint = endpoints.find((e) => e.value === selectedEndpoint)

  const handleSendRequest = async () => {
    if (!currentEndpoint) return

    setLoading(true)
    const startTime = Date.now()

    try {
      // Get API key - use manual entry if provided, otherwise try to fetch
      let keyToUse = apiKey
      
      if (!useManualKey || !keyToUse) {
        // Try to fetch full key from secure endpoint (if userId is available)
        if (userId) {
          try {
            const keyResponse = await fetch('/api/auth/get-api-key', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId }),
            })
            
            if (keyResponse.ok) {
              const keyData = await keyResponse.json()
              // If the endpoint returns a full key (future implementation), use it
              if (keyData.apiKey) {
                keyToUse = keyData.apiKey
              } else {
                // Keys are hashed, so we can't retrieve the full key
                // Prompt user to enter manually
                keyToUse = apiKeyPrefix
                if (!useManualKey) {
                  toast.warning("API keys are stored securely and cannot be retrieved. Please enter your full API key manually.")
                  setUseManualKey(true)
                }
              }
            } else {
              keyToUse = apiKeyPrefix
              toast.warning("Could not fetch API key. Please enter your full API key manually.")
            }
          } catch (keyError) {
            keyToUse = apiKeyPrefix
            toast.warning("Could not fetch API key. Please enter your full API key manually.")
          }
        } else {
          // No userId, use prefix and prompt for manual entry
          keyToUse = apiKeyPrefix
          if (!useManualKey) {
            toast.warning("Please enter your full API key manually.")
            setUseManualKey(true)
          }
        }
      }

      if (!keyToUse) {
        toast.error("API key is required. Please enter your full API key.")
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

      // Extract rate limit info from headers
      const rateLimitRemaining = res.headers.get('X-RateLimit-Remaining')
      const rateLimitPlan = res.headers.get('X-RateLimit-Plan')

      setResponse({
        status: res.status,
        data,
        time: endTime - startTime,
        creditsUsed: 1, // TODO: Get from response headers or calculate
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

    const keyToUse = useManualKey && apiKey ? apiKey : apiKeyPrefix
    const curlCommand = `curl -X ${currentEndpoint.method} \\
  "${currentEndpoint.url}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${keyToUse}"${
      currentEndpoint.method === "POST" && requestBody
        ? ` \\
  -d '${requestBody}'`
        : ""
    }`

    navigator.clipboard.writeText(curlCommand)
    toast.success("cURL command copied to clipboard")
  }

  const handleLoadExample = (example: { query: string; type?: "sql" | "rpc" }) => {
    setRequestBody(example.query)
    // Auto-select the correct endpoint if example has a type
    if (example.type) {
      const matchingEndpoint = endpoints.find(e => e.type === example.type)
      if (matchingEndpoint) {
        setSelectedEndpoint(matchingEndpoint.value)
      }
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Request Panel */}
      <motion.div
        initial={animations.fadeIn.initial}
        animate={animations.fadeIn.animate}
        transition={animations.fadeIn.transition}
      >
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
            <CardDescription>Configure and send API requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Endpoint</Label>
              <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {endpoints.map((endpoint) => (
                    <SelectItem key={endpoint.value} value={endpoint.value}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <span>{endpoint.value}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentEndpoint && (
                <p className="text-xs text-muted-foreground">
                  {currentEndpoint.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>API Key</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUseManualKey(!useManualKey)}
                  className="h-auto p-0 text-xs"
                >
                  {useManualKey ? "Use auto-fetch" : "Enter manually"}
                </Button>
              </div>
              {useManualKey ? (
                <Textarea
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your full API key (slxdb_live_...)"
                  className="font-mono text-sm min-h-[60px]"
                />
              ) : (
                <div className="rounded-lg border border-border bg-muted p-2 text-sm font-mono">
                  {apiKeyPrefix}... (auto-fetched)
                </div>
              )}
            </div>

            {currentEndpoint?.method === "POST" && (
              <div className="space-y-2">
                <Label>
                  Request Body (JSON)
                  {currentEndpoint.type === "sql" && " - SQL Query"}
                  {currentEndpoint.type === "rpc" && " - JSON-RPC"}
                </Label>
                <Textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder={
                    currentEndpoint.type === "sql"
                      ? '{"query": "SELECT * FROM transactions LIMIT 10", "format": "json"}'
                      : currentEndpoint.type === "rpc"
                      ? '{"jsonrpc": "2.0", "id": 1, "method": "getProtocols", "params": []}'
                      : '{"query": "..."}'
                  }
                  className="font-mono text-sm min-h-[200px]"
                />
              </div>
            )}

            <ExampleQueries onLoadExample={handleLoadExample} />

            <div className="flex gap-2">
              <Button
                onClick={handleSendRequest}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Send Request
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCopyCurl}>
                <Copy className="h-4 w-4" />
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
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Response</CardTitle>
                <CardDescription>API response and metrics</CardDescription>
              </div>
              {response && (
                <Badge
                  variant={
                    response.status >= 200 && response.status < 300
                      ? "success"
                      : response.status >= 400 && response.status < 500
                      ? "warning"
                      : "error"
                  }
                >
                  {response.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {response ? (
              <>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Response Time: {response.time}ms</span>
                  <span>Credits Used: {response.creditsUsed}</span>
                </div>
                <div className="rounded-lg border border-border bg-muted p-4">
                  <pre className="overflow-auto text-xs font-mono">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(response.data, null, 2)
                    )
                    toast.success("Response copied to clipboard")
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Response
                </Button>
              </>
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-lg border border-border bg-muted">
                <p className="text-sm text-muted-foreground">
                  Send a request to see the response here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
