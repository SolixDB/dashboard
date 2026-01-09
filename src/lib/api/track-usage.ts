"use server"

import { createServiceRoleClient } from "@/lib/supabase/server"

interface TrackUsageParams {
  userId: string
  apiKeyId?: string
  endpoint: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  statusCode: number
  responseTimeMs: number
  creditsUsed: number
  errorMessage?: string
}

export async function trackUsage(params: TrackUsageParams) {
  const supabase = createServiceRoleClient()

  // Insert usage log
  const { error: logError } = await supabase.from("usage_logs").insert({
    user_id: params.userId,
    api_key_id: params.apiKeyId,
    endpoint: params.endpoint,
    method: params.method,
    status_code: params.statusCode,
    response_time_ms: params.responseTimeMs,
    credits_used: params.creditsUsed,
    error_message: params.errorMessage,
  })

  if (logError) {
    console.error("Error logging usage:", logError)
    return
  }

  // Update monthly credits
  const currentMonth = new Date()
  currentMonth.setDate(1)
  const monthStr = currentMonth.toISOString().split("T")[0]

  // Get or create monthly credits record
  const { data: existingCredits } = await supabase
    .from("monthly_credits")
    .select("*")
    .eq("user_id", params.userId)
    .eq("month", monthStr)
    .single()

  if (existingCredits) {
    // Update existing record
    const { error: updateError } = await supabase
      .from("monthly_credits")
      .update({
        used_credits: existingCredits.used_credits + params.creditsUsed,
      })
      .eq("id", existingCredits.id)

    if (updateError) {
      console.error("Error updating monthly credits:", updateError)
    }
  } else {
    // Get user plan to determine total credits
    const { data: user } = await supabase
      .from("users")
      .select("plan")
      .eq("id", params.userId)
      .single()

    if (!user) {
      console.error("User not found")
      return
    }

    const totalCredits =
      user.plan === "free"
        ? 1000
        : user.plan === "x402"
        ? 25000
        : 100000

    // Create new monthly credits record
    const { error: createError } = await supabase
      .from("monthly_credits")
      .insert({
        user_id: params.userId,
        month: monthStr,
        plan: user.plan,
        total_credits: totalCredits,
        used_credits: params.creditsUsed,
      })

    if (createError) {
      console.error("Error creating monthly credits:", createError)
    }
  }

  // Update API key last_used_at
  if (params.apiKeyId) {
    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", params.apiKeyId)
  }
}
