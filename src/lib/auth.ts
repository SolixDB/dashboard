import { createClientSupabase } from './supabase/client'

/**
 * Sync Privy user with Supabase database
 * This should be called after Privy authentication
 * 
 * This function calls a server-side API route that uses the service role key
 * to securely sync the user with the database.
 */
export async function syncPrivyUser(privyUser: any) {
  if (!privyUser) {
    console.error('syncPrivyUser: No Privy user provided')
    return null
  }

  try {
    // Call the server-side API route to sync the user
    const response = await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(privyUser),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Error syncing user:', errorData)
      return null
    }

    const user = await response.json()
    return user
  } catch (error) {
    console.error('Error syncing Privy user:', error)
    return null
  }
}

export async function getCurrentUser(userId: string) {
  if (!userId) return null

  const supabase = createClientSupabase()
  const { data: user } = await supabase
    .from('users')
    .select('id, email, display_name, avatar_url, plan, wallet_address')
    .eq('id', userId)
    .single()

  return user
}
