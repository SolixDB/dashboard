import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { decryptAPIKey } from '@/lib/api-keys'

/**
 * Secure endpoint to get full API key
 * 
 * Returns the decrypted API key if encrypted storage is enabled,
 * otherwise returns key info (prefix/suffix) for display.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Get API key info including encrypted_key if available
    const { data: apiKeyData, error } = await supabase
      .from('api_keys')
      .select('id, key_prefix, key_suffix, name, is_active, created_at, encrypted_key')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (error || !apiKeyData) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    // Try to decrypt the key if encrypted storage is enabled
    const masterKey = process.env.API_KEY_ENCRYPTION_KEY
    if (apiKeyData.encrypted_key && masterKey) {
      try {
        const decryptedKey = await decryptAPIKey(apiKeyData.encrypted_key, masterKey)
        return NextResponse.json({
          apiKey: decryptedKey,
          keyInfo: {
            prefix: apiKeyData.key_prefix,
            suffix: apiKeyData.key_suffix,
            name: apiKeyData.name,
            displayFormat: `${apiKeyData.key_prefix}...${apiKeyData.key_suffix}`,
          },
        })
      } catch (decryptError) {
        console.error('Error decrypting API key:', decryptError)
        // Fall through to return key info only
      }
    }

    // If no encrypted key or decryption failed, return key info for display
    return NextResponse.json({
      keyInfo: {
        prefix: apiKeyData.key_prefix,
        suffix: apiKeyData.key_suffix,
        name: apiKeyData.name,
        displayFormat: `${apiKeyData.key_prefix}...${apiKeyData.key_suffix}`,
      },
      message: 'API keys are stored as hashes for security. Please enter your full key manually in the playground, or regenerate a new key if you have lost it.',
      note: 'To enable automatic key retrieval, set API_KEY_ENCRYPTION_KEY environment variable.',
    })
  } catch (error) {
    console.error('Error getting API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
