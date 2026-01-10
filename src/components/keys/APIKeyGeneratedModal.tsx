"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check, AlertCircle } from "lucide-react"
import { animations } from "@/config/animation.config"
import { toast } from "sonner"

interface APIKeyGeneratedModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiKey: string
}

export function APIKeyGeneratedModal({
  open,
  onOpenChange,
  apiKey,
}: APIKeyGeneratedModalProps) {
  const [copied, setCopied] = useState(false)
  const [hasSeen, setHasSeen] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      toast.success("API key copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy API key")
    }
  }

  const handleContinue = () => {
    setHasSeen(true)
    onOpenChange(false)
    // Store in localStorage that user has seen their key
    localStorage.setItem('apiKeySeen', 'true')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        asChild
        onPointerDownOutside={(e) => {
          // Prevent closing by clicking outside - user must acknowledge
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing with Escape - user must acknowledge
          e.preventDefault()
        }}
      >
        <motion.div
          initial={animations.modal.initial}
          animate={animations.modal.animate}
          exit={animations.modal.exit}
          transition={animations.modal.transition}
          className="sm:max-w-[600px]"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Your API Key Has Been Generated
            </DialogTitle>
            <DialogDescription>
              <strong>Important:</strong> This is the only time you'll be able to see your full API key.
              Make sure to copy it now and store it securely. If you lose it, you'll need to regenerate a new key.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your API Key</label>
              <div className="rounded-lg border-2 border-primary bg-muted p-4">
                <div className="flex items-start justify-between gap-4">
                  <code className="flex-1 break-all font-mono text-sm leading-relaxed">
                    {apiKey}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Usage Example</label>
              <div className="rounded-lg border border-border bg-muted p-3">
                <code className="text-xs font-mono break-all">
                  https://api.solixdb.xyz?API_KEY={apiKey}
                </code>
              </div>
              <p className="text-xs text-muted-foreground">
                You can also use the <code className="px-1 py-0.5 bg-muted rounded text-xs">x-api-key</code> header: <code className="px-1 py-0.5 bg-muted rounded text-xs">x-api-key: {apiKey}</code>
              </p>
            </div>
            
            <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
              <p className="text-sm text-warning-foreground">
                <strong>Security Notice:</strong> Never share your API key publicly or commit it to version control.
                Treat it like a password. If you suspect it's been compromised, regenerate it immediately.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleContinue}
              className="w-full sm:w-auto"
            >
              I've Saved My API Key
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
