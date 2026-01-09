import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export function createClientSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// For use in client components
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
