"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClientSupabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

const supabase = createClientSupabase()

interface ProfileTabProps {
  user: {
    id: string
    email?: string | null
    display_name?: string | null
    [key: string]: any
  }
  profile: any
}

export function ProfileTab({ user, profile }: ProfileTabProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || user?.display_name || "")
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  // Update display name when user or profile changes
  useEffect(() => {
    setDisplayName(profile?.display_name || user?.display_name || "")
  }, [profile?.display_name, user?.display_name])

  const handleSave = async () => {
    if (displayName === (profile?.display_name || user?.display_name || "")) {
      return // No changes
    }

    setLoading(true)
    const previousName = displayName

    // Optimistic update
    setDisplayName(displayName)

    try {
      const { data, error } = await supabase
        .from("users")
        .update({ display_name: displayName })
        .eq("id", user.id)
        .select("display_name")
        .single()

      if (error) throw error

      // Invalidate queries to refetch user data
      queryClient.invalidateQueries({ queryKey: ["user", user.id] })
      queryClient.invalidateQueries({ queryKey: ["auth"] })

      toast.success("Display name updated successfully")
    } catch (error: any) {
      // Revert on error
      setDisplayName(previousName)
      toast.error(`Failed to update profile: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            {user.email?.endsWith("@wallet.solixdb") ? "Wallet Address" : "Email"}
          </Label>
          <Input 
            id="email" 
            value={
              user.email?.endsWith("@wallet.solixdb") 
                ? (user.wallet_address || user.email) 
                : (user.email || "")
            } 
            disabled 
          />
          <p className="text-xs text-muted-foreground">
            {user.email?.endsWith("@wallet.solixdb")
              ? "Your Solana wallet address"
              : "Email cannot be changed. It's managed by your authentication provider."}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
          />
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
