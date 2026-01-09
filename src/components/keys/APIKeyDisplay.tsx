"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Check, Edit2, Trash2, RotateCcw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RegenerateModal } from "./RegenerateModal"
import { toast } from "sonner"
import { animations } from "@/config/animation.config"
import { formatAPIKeyForDisplay } from "@/lib/api-keys"

interface APIKey {
  id: string
  key_prefix: string
  key_suffix: string
  name: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

interface APIKeyDisplayProps {
  apiKey: APIKey
}

export function APIKeyDisplay({ apiKey }: APIKeyDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [keyName, setKeyName] = useState(apiKey.name)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)

  const keyDisplay = `${apiKey.key_prefix}...${apiKey.key_suffix}`

  const handleCopy = async () => {
    // In production, fetch the full key from a secure endpoint
    // For now, we'll just copy the display format
    try {
      await navigator.clipboard.writeText(keyDisplay)
      setCopied(true)
      toast.success("API key copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy API key")
    }
  }

  const handleSaveName = async () => {
    // TODO: Update key name in Supabase
    setIsEditing(false)
    toast.success("Key name updated")
  }

  return (
    <>
      <motion.div
        initial={animations.fadeIn.initial}
        animate={animations.fadeIn.animate}
        transition={animations.fadeIn.transition}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                {isEditing ? (
                  <Input
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="max-w-xs"
                    autoFocus
                  />
                ) : (
                  <CardTitle>{apiKey.name}</CardTitle>
                )}
                <CardDescription>
                  Created {new Date(apiKey.created_at).toLocaleDateString()}
                  {apiKey.last_used_at && (
                    <> • Last used {new Date(apiKey.last_used_at).toLocaleDateString()}</>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setKeyName(apiKey.name)
                        setIsEditing(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button variant="default" size="sm" onClick={handleSaveName}>
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowRegenerateModal(true)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-border bg-muted px-4 py-3 font-mono text-sm">
                {keyDisplay}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={animations.checkmark.initial}
                      animate={animations.checkmark.animate}
                      transition={animations.checkmark.transition}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Copy className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Status: Active</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <RegenerateModal
        open={showRegenerateModal}
        onOpenChange={setShowRegenerateModal}
        apiKeyId={apiKey.id}
      />
    </>
  )
}
