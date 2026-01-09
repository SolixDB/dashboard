"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Copy, Download, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { animations } from "@/config/animation.config"
import { toast } from "sonner"
import { ExampleQueries } from "./ExampleQueries"

interface APIPlaygroundProps {
  apiKeyPrefix: string
}

// Only SQL endpoint - POST /api/v1/query
const endpoints = [
  {
    value: "POST /api/v1/query",
    method: "POST",
    url: "https://api.solixdb.xyz/api/v1/query",
    description: "Execute a read-only SQL query (SELECT only)",
  },
]

interface Response {
  status: number
  data: any
  time: number
  creditsUsed: number
}

export function APIPlayground({ apiKeyPrefix }: APIPlaygroundProps) {
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
      const url = currentEndpoint.url
      const options: RequestInit = {
        method: currentEndpoint.method,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKeyPrefix, // In production, fetch full key securely
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
        creditsUsed: 1, // TODO: Get from response headers
      })

      toast.success("Request completed successfully")
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
  -H "x-api-key: ${apiKeyPrefix}"${
      currentEndpoint.method === "POST" && requestBody
        ? ` \\
  -d '${requestBody}'`
        : ""
    }`

    navigator.clipboard.writeText(curlCommand)
    toast.success("cURL command copied to clipboard")
  }

  const handleLoadExample = (example: { query: string }) => {
    setRequestBody(example.query)
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
            </div>

            {currentEndpoint?.method === "POST" && (
              <div className="space-y-2">
                <Label>Request Body (JSON)</Label>
                <Textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder='{"query": "..."}'
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
