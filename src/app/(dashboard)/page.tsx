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
    <div className="min-h-screen space-y-10 pb-12">
      {/* Page Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {displayName}
            </h1>
            <div className="flex items-center gap-1.5 rounded-sm bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary ring-1 ring-primary/20">
              <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
              {plan}
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Monitor and manage your database activity in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <APIKeyDialog userId={userProfile.id} />
        </div>
      </header>

      {/* Stats Overview */}
      <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <StatsCards />
      </section>

      {/* Charts Section */}
      <section className="grid gap-6 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <UsageChart />
        <RecentActivity />
      </section>
    </div>
  );
}
