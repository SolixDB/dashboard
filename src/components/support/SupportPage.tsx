"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { FAQAccordion } from "./FAQAccordion"
import { QuickLinks } from "./QuickLinks"
import { animations } from "@/config/animation.config"
import { Search } from "lucide-react"
import { useState } from "react"

export function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <motion.div
      initial={animations.pageTransition.initial}
      animate={animations.pageTransition.animate}
      transition={animations.pageTransitionConfig}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Support</h1>
        <p className="text-muted-foreground mt-1">
          Get help, browse FAQs, or contact our support team.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <QuickLinks />

      <FAQAccordion />
    </motion.div>
  )
}
