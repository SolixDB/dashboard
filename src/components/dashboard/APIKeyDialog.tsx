"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Key, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";
import { RegenerateModal } from "@/components/keys/RegenerateModal";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface APIKeyDialogProps {
  userId: string;
}

interface APIKey {
  id: string;
  key_prefix: string;
  key_suffix: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
  fullKey?: string;
}

export function APIKeyDialog({ userId }: APIKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState<APIKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  const loadAPIKey = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data: keyData } = await supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      if (keyData) {
        try {
          const response = await fetch("/api/auth/get-api-key", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
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
        } catch {
          setApiKey(keyData);
        }
      }
    } catch (error) {
      console.error("Error loading API key:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !apiKey) {
      loadAPIKey();
    }
  }, [open, userId]);

  const handleCopy = async () => {
    if (!apiKey) return;

    try {
      const textToCopy = apiKey.fullKey || `${apiKey.key_prefix}...${apiKey.key_suffix}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("API key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy API key");
    }
  };

  const keyDisplay = apiKey?.fullKey || (apiKey ? `${apiKey.key_prefix}...${apiKey.key_suffix}` : "");

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-border bg-card/50 px-4 font-bold uppercase tracking-widest text-muted-foreground transition-all hover:border-primary/50 hover:bg-card hover:text-primary"
          >
            <span className="hidden sm:inline">API Key</span>
            <span className="sm:hidden">Key</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-card border-border overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/50 via-primary to-primary/50" />
          <DialogHeader className="pt-4">
            <DialogTitle className="text-xl font-bold text-foreground">
              API Authentication
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              These keys allow other apps to access your SolixDB data. Keep them secret!
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : apiKey ? (
            <div className="space-y-6 py-2">
              {/* API Key Display */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Your Secret Key
                  </label>
                  <button
                    onClick={() => setShowRegenerateModal(true)}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:opacity-80 transition-opacity"
                  >
                    Regenerate
                  </button>
                </div>
                <div className="flex items-center gap-2 p-1 rounded border border-border bg-muted/30">
                  <div className="flex-1 px-3 py-2 font-mono text-xs text-foreground break-all select-all">
                    {keyDisplay}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="shrink-0 px-2 h-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* Usage Example */}
              {apiKey.fullKey && (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Implementation Guide
                  </label>
                  <div className="rounded border border-border bg-background/50 divide-y divide-border">
                    <div className="p-4 space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Query Parameter</p>
                      <div className="bg-muted/50 rounded-sm p-3 border border-border/50">
                        <code className="font-mono text-[11px] text-primary break-all">
                          ?API_KEY={apiKey.fullKey}
                        </code>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">HTTP Header</p>
                      <div className="bg-muted/50 rounded-sm p-3 border border-border/50">
                        <code className="font-mono text-[11px] text-primary">
                          x-api-key: {apiKey.fullKey}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Info */}
              <div className="flex items-center justify-between px-1 text-[10px] font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span>Key is active and ready</span>
                </div>
                <span>Issued {new Date(apiKey.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                <Key className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                No API key found for this account.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {apiKey && (
        <RegenerateModal
          open={showRegenerateModal}
          onOpenChange={setShowRegenerateModal}
          apiKeyId={apiKey.id}
        />
      )}
    </>
  );
}
