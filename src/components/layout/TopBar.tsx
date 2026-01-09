"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { animations } from "@/config/animation.config"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/lib/hooks/use-auth"
import { createClientSupabase } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"

const supabase = createClientSupabase()

interface TopBarProps {
  user?: {
    id?: string
    email?: string
    display_name?: string
    avatar_url?: string
    wallet_address?: string
  }
}

export function TopBar({ user }: TopBarProps) {
  const router = useRouter()
  const { logout } = usePrivy()
  const { user: authUser } = useAuth()
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Fetch recent notifications from usage_logs (errors, rate limits, etc.)
  const { data: notifications } = useQuery({
    queryKey: ["notifications", authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return []

      // Get recent errors or rate limits from usage logs
      const { data, error } = await supabase
        .from("usage_logs")
        .select("id, endpoint, status_code, error_message, timestamp")
        .eq("user_id", authUser.id)
        .or("status_code.gte.400,error_message.neq.null")
        .order("timestamp", { ascending: false })
        .limit(5)

      if (error) throw error

      return (data || []).map((log) => ({
        id: log.id,
        message: log.error_message || `Request to ${log.endpoint} failed with status ${log.status_code}`,
        timestamp: new Date(log.timestamp),
        type: log.status_code === 429 ? "rate_limit" : log.status_code >= 500 ? "error" : "warning",
      }))
    },
    enabled: !!authUser?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const unreadCount = notifications?.filter((n) => {
    // Consider notifications from last 24 hours as "recent"
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000
    return n.timestamp.getTime() > dayAgo
  }).length || 0

  const handleSignOut = async () => {
    await logout()
    router.push("/auth/signin")
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-sidebar">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {/* Search or other header content can go here */}
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!notifications || notifications.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex-col items-start py-3">
                    <div className="flex w-full items-start justify-between gap-2">
                      <p className="text-sm">{notification.message}</p>
                      <Badge
                        variant={
                          notification.type === "error"
                            ? "destructive"
                            : notification.type === "rate_limit"
                            ? "warning"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {notification.type === "rate_limit" ? "Rate Limit" : notification.type === "error" ? "Error" : "Warning"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </p>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-semibold">
                  {user?.display_name?.[0]?.toUpperCase() || 
                   (user?.email && !user.email.endsWith("@wallet.solixdb") ? user.email[0]?.toUpperCase() : null) ||
                   (user?.wallet_address ? user.wallet_address.slice(0, 2).toUpperCase() : null) ||
                   "U"}
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.display_name || 
                   (user?.email && !user.email.endsWith("@wallet.solixdb") ? user.email : null) ||
                   (user?.wallet_address ? `${user.wallet_address.slice(0, 4)}...${user.wallet_address.slice(-4)}` : null) ||
                   "User"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
