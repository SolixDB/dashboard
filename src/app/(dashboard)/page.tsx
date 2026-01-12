"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { APIKeyDialog } from "@/components/dashboard/APIKeyDialog";
import { syncPrivyUser } from "@/lib/auth";

export default function DashboardPage() {
  const { authenticated, ready, user: privyUser } = usePrivy();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      router.push("/auth/signin");
      return;
    }

    const loadUser = async () => {
      setLoading(true);
      try {
        const syncedUser = await syncPrivyUser(privyUser);
        if (syncedUser) {
          setUserProfile(syncedUser);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [authenticated, ready, privyUser, router]);

  if (!ready || loading || !userProfile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const displayName =
    userProfile.display_name ||
    (userProfile.email && !userProfile.email.endsWith("@wallet.solixdb")
      ? userProfile.email.split("@")[0]
      : null) ||
    (userProfile.wallet_address
      ? `${userProfile.wallet_address.slice(0, 4)}...${userProfile.wallet_address.slice(-4)}`
      : null) ||
    "User";

  const plan = userProfile.plan || "free";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="flex w-full items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">
              Good Morning, {displayName}
            </h1>
            <span className="rounded border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground">
              {plan.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Here is what SolixDB captured while you were working today.
          </p>
        </div>

        <APIKeyDialog userId={userProfile.id} />
      </header>

      {/* Stats Overview */}
      <section>
        <StatsCards />
      </section>

      {/* Charts Section */}
      <section className="grid gap-6 lg:grid-cols-2">
        <UsageChart />
        <RecentActivity />
      </section>
    </div>
  );
}
