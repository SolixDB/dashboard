"use client"

import { motion } from "framer-motion"
import { Input, type InputProps } from "./input"
import { animations } from "@/config/animation.config"
import { cn } from "@/lib/utils"

export function AnimatedInput({ className, ...props }: InputProps) {
  return (
    <motion.div
      initial={{ scale: 1 }}
      whileFocus={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Input className={cn(className)} {...props} />
    </motion.div>
  )
}
