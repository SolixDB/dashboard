import { createClientSupabase } from './supabase/client'

/**
 * Generate a new API key
 * Format: slxdb_live_ + 32 random alphanumeric characters
 */
export function generateAPIKey(): string {
  const prefix = 'slxdb_live_'
  const randomChars = Array.from({ length: 32 }, () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    return chars.charAt(Math.floor(Math.random() * chars.length))
  }).join('')
  
  return prefix + randomChars
}

/**
 * Hash an API key using Supabase's built-in crypto
 * Note: In production, use Supabase Edge Functions or server-side hashing
 */
export async function hashAPIKey(key: string): Promise<string> {
  // Use Web Crypto API for hashing (available in Edge Runtime)
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  // Create a new ArrayBuffer from the Uint8Array
  const buffer = new ArrayBuffer(data.length)
  const view = new Uint8Array(buffer)
  view.set(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Verify an API key against its hash
 */
export async function verifyAPIKey(key: string, hash: string): Promise<boolean> {
  const keyHash = await hashAPIKey(key)
  return keyHash === hash
}

/**
 * Get the display format of an API key
 * Shows: slxdb_live_abc12345...xyz6789
 */
export function formatAPIKeyForDisplay(key: string): string {
  if (!key.startsWith('slxdb_live_')) {
    return key // Return as-is if not in expected format
  }
  
  const prefix = 'slxdb_live_'
  const suffix = key.slice(-4)
  const middle = key.slice(prefix.length, -4)
  
  if (middle.length <= 8) {
    return key // If key is short, show full
  }
  
  return `${prefix}${middle.slice(0, 8)}...${suffix}`
}

/**
 * Auto-generate API key for a user on first login
 */
export async function autoGenerateAPIKey(userId: string): Promise<string | null> {
  const supabase = createClientSupabase()
  
  // Check if user already has an active key
  const { data: existingKey } = await supabase
    .from('api_keys')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()
  
  if (existingKey) {
    return null // User already has a key
  }
  
  // Generate new key
  const apiKey = generateAPIKey()
  const keyHash = await hashAPIKey(apiKey)
  const keySuffix = apiKey.slice(-4)
  
  // Insert into database
  const { error } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      key_hash: keyHash,
      key_prefix: 'slxdb_live_',
      key_suffix: keySuffix,
      name: 'Default Key',
      is_active: true,
    })
  
  if (error) {
    console.error('Error generating API key:', error)
    return null
  }
  
  return apiKey
}
