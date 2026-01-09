"use client"

import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileTab } from "./ProfileTab"
import { PreferencesTab } from "./PreferencesTab"
import { SecurityTab } from "./SecurityTab"
import { DangerZoneTab } from "./DangerZoneTab"
import { animations } from "@/config/animation.config"
interface SettingsPageProps {
  user: {
    id: string
    email?: string | null
    [key: string]: any
  }
  profile: any
}

export function SettingsPage({ user, profile }: SettingsPageProps) {
  return (
    <motion.div
      initial={animations.pageTransition.initial}
      animate={animations.pageTransition.animate}
      transition={animations.pageTransitionConfig}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab user={user} profile={profile} />
        </TabsContent>
        <TabsContent value="preferences">
          <PreferencesTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="danger">
          <DangerZoneTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
