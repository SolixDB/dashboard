"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Bell, LogOut, Settings, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/use-auth";
import { createClientSupabase } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";

const supabase = createClientSupabase();

interface TopBarProps {
  user?: {
    id?: string;
    email?: string;
    display_name?: string;
    avatar_url?: string;
    wallet_address?: string;
  };
}

export function TopBar({ user }: TopBarProps) {
  const router = useRouter();
  const { logout } = usePrivy();
  const { user: authUser } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["notifications", authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return [];

      const { data, error } = await supabase
        .from("usage_logs")
        .select("id, endpoint, status_code, error_message, timestamp")
        .eq("user_id", authUser.id)
        .or("status_code.gte.400,error_message.neq.null")
        .order("timestamp", { ascending: false })
        .limit(5);

      if (error) throw error;

      return (data || []).map((log) => ({
        id: log.id,
        message:
          log.error_message ||
          `Request to ${log.endpoint} failed with status ${log.status_code}`,
        timestamp: new Date(log.timestamp),
        type:
          log.status_code === 429
            ? "rate_limit"
            : log.status_code >= 500
            ? "error"
            : "warning",
      }));
    },
    enabled: !!authUser?.id,
    refetchInterval: 30000,
  });

  const unreadCount =
    notifications?.filter((n) => {
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return n.timestamp.getTime() > dayAgo;
    }).length || 0;

  const handleSignOut = async () => {
    await logout();
    router.push("/auth/signin");
  };

  const displayName =
    user?.display_name ||
    (user?.email && !user.email.endsWith("@wallet.solixdb")
      ? user.email
      : null) ||
    (user?.wallet_address
      ? `${user.wallet_address.slice(0, 4)}...${user.wallet_address.slice(-4)}`
      : null) ||
    "User";

  const initials =
    user?.display_name?.[0]?.toUpperCase() ||
    (user?.email && !user.email.endsWith("@wallet.solixdb")
      ? user.email[0]?.toUpperCase()
      : null) ||
    "U";

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="flex items-center">
          <div className="relative hidden md:flex">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="h-8 w-56 rounded-md border border-border bg-card pl-9 pr-4 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-card border-border">
              <DropdownMenuLabel className="flex items-center justify-between text-xs">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded bg-primary px-1.5 py-0.5 font-mono text-[10px] text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              {!notifications || notifications.length === 0 ? (
                <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex-col items-start py-2 focus:bg-muted"
                  >
                    <p className="text-xs text-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </p>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-muted">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {initials}
                </div>
                <span className="hidden text-sm font-medium text-foreground md:block">
                  {displayName}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border">
              <DropdownMenuLabel className="text-xs text-foreground">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="text-xs text-muted-foreground focus:bg-muted focus:text-foreground"
              >
                <Settings className="mr-2 h-3.5 w-3.5" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-xs text-destructive focus:bg-muted focus:text-destructive"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
