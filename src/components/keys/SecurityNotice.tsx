"use client"

import { Shield, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { animations } from "@/config/animation.config"

export function SecurityNotice() {
  return (
    <motion.div
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={animations.fadeIn.transition}
    >
      <Card className="border-warning/20 bg-warning/5">
        <CardContent className="flex items-start gap-4 p-4">
          <Shield className="h-5 w-5 shrink-0 text-warning mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">Keep your API key secure</p>
            <p className="text-xs text-muted-foreground">
              Never share your API key publicly or commit it to version control.
              If compromised, regenerate immediately.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
