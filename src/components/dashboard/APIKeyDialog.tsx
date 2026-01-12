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
            className="gap-2 border-border text-muted-foreground hover:text-foreground"
          >
            <Key className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">API Key</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">API Key</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Use this key to authenticate your API requests.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : apiKey ? (
            <div className="space-y-4">
              {/* API Key Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Your Key
                  </label>
                  <button
                    onClick={() => setShowRegenerateModal(true)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Regenerate
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md border border-border bg-background px-3 py-2.5 font-mono text-xs text-foreground break-all">
                    {keyDisplay}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="shrink-0 h-9 w-9"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Usage Example */}
              {apiKey.fullKey && (
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Usage
                  </label>
                  <div className="rounded-md border border-border bg-background p-3 space-y-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Query parameter:</p>
                      <code className="font-mono text-[11px] text-foreground break-all">
                        ?API_KEY={apiKey.fullKey}
                      </code>
                    </div>
                    <div className="border-t border-border pt-2">
                      <p className="text-[10px] text-muted-foreground mb-1">Header:</p>
                      <code className="font-mono text-[11px] text-foreground">
                        x-api-key: {apiKey.fullKey}
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Info */}
              <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                <span>Created {new Date(apiKey.created_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No API key found. Please contact support.
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
