"use client"

import { motion } from "framer-motion"
import { Card } from "./card"
import { animations } from "@/config/animation.config"
import { cn } from "@/lib/utils"
import { HTMLAttributes } from "react"

export function AnimatedCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={animations.cardHover.rest}
      whileHover={animations.cardHover.hover}
      transition={animations.cardHover.hover.transition}
    >
      <Card className={cn(className)} {...props} />
    </motion.div>
  )
}
