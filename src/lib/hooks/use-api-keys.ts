"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "./use-auth"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function useAPIKeys() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ["api-keys", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })
}
