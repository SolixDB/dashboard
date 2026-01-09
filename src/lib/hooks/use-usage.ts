"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "./use-auth"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface UsageParams {
  timeRange?: "24h" | "7d" | "30d"
  startDate?: Date
  endDate?: Date
}

export function useUsage(params?: UsageParams) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ["usage", params, user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated")

      // Calculate date range
      const now = new Date()
      let startDate: Date

      if (params?.startDate && params?.endDate) {
        startDate = params.startDate
      } else {
        const days = params?.timeRange === "24h" ? 1 : params?.timeRange === "7d" ? 7 : 30
        startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      }

      const { data, error } = await supabase
        .from("usage_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("timestamp", startDate.toISOString())
        .order("timestamp", { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })
}
