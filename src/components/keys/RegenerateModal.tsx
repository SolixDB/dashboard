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
import { AlertTriangle } from "lucide-react"
import { animations } from "@/config/animation.config"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface RegenerateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiKeyId: string
}

export function RegenerateModal({
  open,
  onOpenChange,
  apiKeyId,
}: RegenerateModalProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegenerate = async () => {
    setLoading(true)
    try {
      // TODO: Call API to regenerate key
      // This should:
      // 1. Deactivate old key
      // 2. Generate new key
      // 3. Return new key to user (only shown once)
      
      toast.success("API key regenerated successfully")
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast.error("Failed to regenerate API key")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <motion.div
          initial={animations.modal.initial}
          animate={animations.modal.animate}
          exit={animations.modal.exit}
          transition={animations.modal.transition}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Regenerate API Key
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to regenerate your API key? This action cannot be undone.
              Your current key will be immediately deactivated and all applications using it will
              stop working. You will need to update your applications with the new key.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRegenerate}
              disabled={loading}
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Regenerate Key"
              )}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
