"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { animations } from "@/config/animation.config"

export default function SignInPage() {
  const { login, authenticated, ready } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (authenticated && ready) {
      router.push('/')
    }
  }, [authenticated, ready, router])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Gradient Background with Mesh Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1362FD] via-[#1362FD] to-[#5A91FF] opacity-10" />
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(19, 98, 253, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(90, 145, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(19, 98, 253, 0.2) 0%, transparent 50%)
          `,
        }}
      />
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={animations.fadeIn.initial}
          animate={animations.fadeIn.animate}
          transition={{ ...animations.fadeIn.transition, delay: 0.1 }}
          className="mb-12 flex flex-col items-center space-y-6 text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <Image
              src="/logo.png"
              alt="SolixDB"
              width={160}
              height={42}
              className="h-12 w-auto"
              priority
            />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Welcome to SolixDB
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="max-w-md text-lg text-muted-foreground sm:text-xl"
          >
            Access powerful blockchain data indexing tools for Solana DeFi
          </motion.p>
        </motion.div>

        {/* Signin Card */}
        <motion.div
          initial={animations.pageTransition.initial}
          animate={animations.pageTransition.animate}
          transition={{ ...animations.pageTransitionConfig, delay: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="space-y-2 text-center pb-6">
              <CardTitle className="text-2xl font-semibold">Get Started</CardTitle>
              <CardDescription className="text-base">
                Sign in to access your dashboard and API keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                variant="default"
                className="w-full bg-[#0D4FD9] hover:bg-[#0A3EB5] text-white"
                onClick={login}
                size="lg"
              >
                Sign In with Privy
              </Button>
              
              <div className="space-y-2">
                <p className="text-center text-sm text-muted-foreground">
                  Connect with your preferred method
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-md bg-muted px-2 py-1">Google</span>
                  <span className="rounded-md bg-muted px-2 py-1">GitHub</span>
                  <span className="rounded-md bg-muted px-2 py-1">Email</span>
                  <span className="rounded-md bg-muted px-2 py-1">Solana Wallet</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
