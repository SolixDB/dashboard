"use client"

import { usePrivy } from "@privy-io/react-auth"
import { createClient } from "@supabase/supabase-js"
import { syncPrivyUser } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.solixdb.xyz"

export class APIClient {
  private async getAPIKey(privyUser: any): Promise<string> {
    if (!privyUser) throw new Error("Not authenticated")

    // Sync user to get database user ID
    const syncedUser = await syncPrivyUser(privyUser)
    if (!syncedUser?.id) throw new Error("Not authenticated")

    // Try to fetch API key info from secure server endpoint
    // Note: Keys are stored as hashes, so we can only get prefix/suffix
    try {
      const response = await fetch('/api/auth/get-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: syncedUser.id }),
      })

      if (response.ok) {
        const data = await response.json()
        // If the endpoint returns a full key (future implementation), use it
        if (data.apiKey) {
          return data.apiKey
        }
      }
    } catch (error) {
      console.error('Error fetching API key:', error)
    }

    // Fallback: get prefix from client (won't work for actual API calls)
    const { data } = await supabase
      .from("api_keys")
      .select("key_prefix, key_suffix")
      .eq("user_id", syncedUser.id)
      .eq("is_active", true)
      .single()

    if (!data) throw new Error("No API key found")
    
    // Since we can't retrieve the full key (it's hashed), throw an error
    // The playground will handle this by allowing manual entry
    throw new Error("API key not available. Please enter your full API key manually or regenerate a new key.")
  }

  /**
   * Execute a SQL query
   */
  async query(
    query: string,
    format: 'json' | 'csv' = 'json',
    privyUser: any
  ): Promise<{ data: any[] | string; count: number; query: string }> {
    const apiKey = await this.getAPIKey(privyUser)

    const response = await fetch(`${API_URL}/v1/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ query, format }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.message || error.error || `API request failed: ${response.statusText}`)
    }

    if (format === 'csv') {
      const csv = await response.text()
      return { data: csv, count: 0, query }
    }

    return response.json()
  }

  /**
   * Execute a JSON-RPC method call
   */
  async rpc<T = any>(
    method: string,
    params: any[] | Record<string, any> = [],
    privyUser: any,
    id: string | number = 1
  ): Promise<T> {
    const apiKey = await this.getAPIKey(privyUser)

    const response = await fetch(`${API_URL}/v1/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        params: Array.isArray(params) ? params : [params],
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.message || error.error || `API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message || 'RPC method execution failed')
    }

    return data.result
  }

  /**
   * Generic request method (for backward compatibility)
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    privyUser: any
  ): Promise<T> {
    const apiKey = await this.getAPIKey(privyUser)

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.message || error.error || `API request failed: ${response.statusText}`)
    }

    return response.json()
  }
}

export const apiClient = new APIClient()
