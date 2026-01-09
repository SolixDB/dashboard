"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { animations } from "@/config/animation.config"
import { syncPrivyUser } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function OnboardingPage() {
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { authenticated, ready, user: privyUser } = usePrivy()

  useEffect(() => {
    if (!ready) return

    if (!authenticated) {
      router.push('/auth/signin')
      return
    }
  }, [authenticated, ready, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!privyUser) {
        router.push('/auth/signin')
        return
      }

      const syncedUser = await syncPrivyUser(privyUser)
      if (!syncedUser?.id) {
        throw new Error('Failed to sync user')
      }

      // Update user profile
      const { error } = await supabase
        .from('users')
        .update({ display_name: displayName || privyUser.email?.address?.split('@')[0] || 'User' })
        .eq('id', syncedUser.id)

      if (error) throw error

      router.push('/')
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!ready || !authenticated) {
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
              Let's set up your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
