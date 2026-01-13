"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { APIKeyDisplay } from "@/components/keys/APIKeyDisplay";
import { SecurityNotice } from "@/components/keys/SecurityNotice";
import { createClient } from "@supabase/supabase-js";
import { syncPrivyUser } from "@/lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function APIKeysPage() {
  const { authenticated, ready, user: privyUser } = usePrivy();
  const router = useRouter();
  const [apiKey, setApiKey] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      router.push("/auth/signin");
      return;
    }

    const loadAPIKey = async () => {
      setLoading(true);
      try {
        const syncedUser = await syncPrivyUser(privyUser);
        if (syncedUser?.id) {
          const { data: keyData } = await supabase
            .from("api_keys")
            .select("*")
            .eq("user_id", syncedUser.id)
            .eq("is_active", true)
            .single();

          if (keyData) {
            try {
              const response = await fetch("/api/auth/get-api-key", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: syncedUser.id }),
              });

              if (response.ok) {
                const result = await response.json();
                if (result.apiKey) {
                  setApiKey({ ...keyData, fullKey: result.apiKey });
                } else {
                  setApiKey(keyData);
                }
              } else {
                setApiKey(keyData);
              }
            } catch (error) {
              console.error("Error fetching full API key:", error);
              setApiKey(keyData);
            }
          }
        }
      } catch (error) {
        console.error("Error loading API key:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAPIKey();
  }, [authenticated, ready, privyUser, router]);

  if (!ready || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">API Keys</h1>
        <p className="text-sm text-muted-foreground">
          Manage your API keys for accessing SolixDB services.
        </p>
      </header>

      {/* Security Notice */}
      <SecurityNotice />

      {/* API Key Display */}
      {apiKey ? (
        <APIKeyDisplay apiKey={apiKey} />
      ) : (
        <div className="rounded-md border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No API key found. Please contact support.
          </p>
        </div>
      )}
    </div>
  );
}
