import { create } from "zustand"

interface UsageData {
  totalCalls: number
  totalCredits: number
  avgResponseTime: number
  errorRate: number
}

interface UsageState {
  usage: UsageData | null
  setUsage: (usage: UsageData | null) => void
}

export const useUsageStore = create<UsageState>((set) => ({
  usage: null,
  setUsage: (usage) => set({ usage }),
}))
