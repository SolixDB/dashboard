"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { UsageAnalytics } from "@/components/usage/UsageAnalytics";
import { syncPrivyUser } from "@/lib/auth";

export default function UsagePage() {
  const { authenticated, ready, user: privyUser } = usePrivy();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
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
        if (syncedUser?.id) {
          setUserId(syncedUser.id);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [authenticated, ready, privyUser, router]);

  if (!ready || loading || !userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-10 pb-12">
      {/* Page Header */}
      <header className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Usage & Analytics
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          Monitor your API usage, track credits, and analyze performance metrics in real-time.
        </p>
      </header>

      {/* Usage Analytics */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <UsageAnalytics userId={userId} />
      </section>
    </div>
  );
}
