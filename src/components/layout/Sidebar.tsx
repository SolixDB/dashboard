"use client";

import { Link } from "next-view-transitions";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Key,
  Play,
  BarChart3,
  CreditCard,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useAuth } from "@/lib/hooks/use-auth";

interface TopBarProps {
  user?: {
    id?: string;
    email?: string;
    display_name?: string;
    avatar_url?: string;
    wallet_address?: string;
  };
}

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Playground", href: "/playground", icon: Play },
  { name: "Usage", href: "/usage", icon: BarChart3 },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Support", href: "/support", icon: HelpCircle },
];

export function Sidebar({user}: TopBarProps) {
  const pathname = usePathname();
  const { user: authUser } = useAuth();

  console.log("user here", authUser);


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
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 border-r border-border bg-background md:block">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-14 items-center border-b border-border px-5">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="SolixDB"
              width={120}
              height={32}
              className="h-6 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col h-full justify-between px-3 py-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {/* <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "")} /> */}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <Button variant="ghost" className="flex gap-2 hover:bg-muted">
                <span className="hidden text-sm font-medium text-foreground md:block">
                  {authUser.display_name}
                </span>
              </Button>
        </nav>
      </div>
    </aside>
  );
}
