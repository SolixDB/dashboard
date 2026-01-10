"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "./use-auth"

export function useBilling() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ["billing", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated")

      // Fetch credits from server-side API route (uses service role)
      const response = await fetch('/api/billing/get-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch credits' }))
        throw new Error(error.error || 'Failed to fetch credits')
      }

      return response.json()
    },
    enabled: !!user?.id,
  })
}
