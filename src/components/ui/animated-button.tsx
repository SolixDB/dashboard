"use client"

import { motion } from "framer-motion"
import { Button, type ButtonProps } from "./button"
import { animations } from "@/config/animation.config"
import { cn } from "@/lib/utils"

export function AnimatedButton({ className, ...props }: ButtonProps) {
  return (
    <motion.div
      whileHover={animations.buttonHover}
      whileTap={animations.buttonTap}
    >
      <Button className={cn(className)} {...props} />
    </motion.div>
  )
}
