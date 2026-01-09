"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-6 left-6">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="SolixDB"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>
      </div>
      <motion.div
        initial={animations.pageTransition.initial}
        animate={animations.pageTransition.animate}
        transition={animations.pageTransitionConfig}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Welcome to SolixDB</CardTitle>
            <CardDescription>
              Sign in to access your dashboard and API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="default"
              className="w-full"
              onClick={login}
              size="lg"
            >
              <Image
                src="/solana.svg"
                alt="Solana"
                width={20}
                height={20}
                className="h-5 w-5 mr-2"
              />
              Sign In with Privy
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Connect with Google, GitHub, Email, or Solana Wallet
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
