import { create } from "zustand"

interface UserProfile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  plan: "free" | "x402" | "enterprise"
}

interface UserState {
  profile: UserProfile | null
  setProfile: (profile: UserProfile | null) => void
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}))
