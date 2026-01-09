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

    // In production, fetch full key from secure endpoint
    // For now, return prefix (this should be replaced with actual key fetching)
    const { data } = await supabase
      .from("api_keys")
      .select("key_prefix")
      .eq("user_id", syncedUser.id)
      .eq("is_active", true)
      .single()

    if (!data) throw new Error("No API key found")

    return data.key_prefix // TODO: Replace with full key from secure endpoint
  }

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
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }
}

export const apiClient = new APIClient()
