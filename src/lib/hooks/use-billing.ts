"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "./use-auth"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function useBilling() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ["billing", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated")

      // Get current month credits
      const currentMonth = new Date()
      currentMonth.setDate(1)
      const monthStr = currentMonth.toISOString().split("T")[0]

      const { data: credits, error: creditsError } = await supabase
        .from("monthly_credits")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", monthStr)
        .single()

      if (creditsError && creditsError.code !== "PGRST116") throw creditsError

      // If no credits record exists, create one with plan defaults
      if (!credits) {
        const planCredits = user.plan === "free" ? 1000 : user.plan === "x402" ? 25000 : 100000
        const { data: newCredits } = await supabase
          .from("monthly_credits")
          .insert({
            user_id: user.id,
            month: monthStr,
            plan: user.plan || "free",
            total_credits: planCredits,
            used_credits: 0,
          })
          .select()
          .single()

        return {
          plan: user.plan || "free",
          credits: newCredits || {
            total_credits: planCredits,
            used_credits: 0,
          },
        }
      }

      return {
        plan: user.plan || "free",
        credits: credits,
      }
    },
    enabled: !!user?.id,
  })
}
