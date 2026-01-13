"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { BillingPage } from "@/components/billing/BillingPage";
import { createClient } from "@supabase/supabase-js";
import { syncPrivyUser } from "@/lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function BillingPageRoute() {
  const { authenticated, ready, user: privyUser } = usePrivy();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      router.push("/auth/signin");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const syncedUser = await syncPrivyUser(privyUser);
        if (syncedUser) {
          setUserProfile(syncedUser);

          const currentMonth = new Date();
          currentMonth.setDate(1);
          const monthStr = currentMonth.toISOString().split("T")[0];

          const { data } = await supabase
            .from("monthly_credits")
            .select("*")
            .eq("user_id", syncedUser.id)
            .eq("month", monthStr)
            .single();

          if (!data) {
            const planCredits =
              syncedUser.plan === "free"
                ? 1000
                : syncedUser.plan === "x402"
                ? 25000
                : 100000;
            const { data: newCredits } = await supabase
              .from("monthly_credits")
              .insert({
                user_id: syncedUser.id,
                month: monthStr,
                plan: syncedUser.plan || "free",
                total_credits: planCredits,
                used_credits: 0,
              })
              .select()
              .single();
            setCredits(newCredits || { total_credits: planCredits, used_credits: 0 });
          } else {
            setCredits(data);
          }
        }
      } catch (error) {
        console.error("Error loading billing data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authenticated, ready, privyUser, router]);

  if (!ready || loading || !userProfile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const defaultCredits = credits || {
    total_credits:
      userProfile.plan === "free" ? 1000 : userProfile.plan === "x402" ? 25000 : 100000,
    used_credits: 0,
  };

  return <BillingPage plan={userProfile.plan || "free"} credits={defaultCredits} />;
}
