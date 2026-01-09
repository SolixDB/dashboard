import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateAPIKey, hashAPIKey } from '@/lib/api-keys'

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return NextResponse.json(
        { error: 'Supabase URL not configured. Please set NEXT_PUBLIC_SUPABASE_URL environment variable.' },
        { status: 500 }
      )
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'placeholder-service-key') {
      return NextResponse.json(
        { 
          error: 'Supabase secret key not configured. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.',
          hint: 'Get your secret key from Supabase Dashboard → Settings → API → Secret keys section'
        },
        { status: 500 }
      )
    }

    const privyUser = await request.json()

    if (!privyUser) {
      return NextResponse.json(
        { error: 'No Privy user provided' },
        { status: 400 }
      )
    }

    // Get email or wallet address from Privy user
    const email = privyUser.email?.address || null
    const walletAddress = privyUser.wallet?.address || null

    if (!email && !walletAddress) {
      return NextResponse.json(
        { error: 'No email or wallet address found in Privy user' },
        { status: 400 }
      )
    }

    if (!privyUser.id) {
      return NextResponse.json(
        { error: 'No Privy user ID found' },
        { status: 400 }
      )
    }

    // Use service role client for server-side operations
    const supabase = createServiceRoleClient()

    // Check if user exists by auth_provider_id (Privy user ID)
    let { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id, email, display_name, avatar_url, plan, wallet_address')
      .eq('auth_provider_id', privyUser.id)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is expected for new users
      console.error('Error checking for existing user:', selectError)
      return NextResponse.json(
        { error: 'Error checking for existing user', details: selectError },
        { status: 500 }
      )
    }

    if (!existingUser) {
      // Create new user
      const displayName =
        privyUser.name ||
        privyUser.email?.address?.split('@')[0] ||
        (walletAddress
          ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
          : 'User')

      // For wallet-only users, create a placeholder email (required by schema constraint)
      // The UI will display wallet_address instead of this fake email
      const userData = {
        email:
          email ||
          (walletAddress
            ? `${walletAddress.slice(0, 8)}@wallet.solixdb`
            : null),
        display_name: displayName,
        avatar_url: privyUser.image || null,
        wallet_address: walletAddress || null,
        auth_provider: 'privy',
        auth_provider_id: privyUser.id,
      }

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert(userData)
        .select('id, email, display_name, avatar_url, plan, wallet_address')
        .single()

      if (insertError) {
        console.error('Error creating user:', insertError)
        return NextResponse.json(
          {
            error: 'Error creating user',
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
          },
          { status: 500 }
        )
      }

      existingUser = newUser

      // Auto-generate API key for new user
      const apiKey = generateAPIKey()
      const keyHash = await hashAPIKey(apiKey)
      const keySuffix = apiKey.slice(-4)

      await supabase.from('api_keys').insert({
        user_id: existingUser.id,
        key_hash: keyHash,
        key_prefix: 'slxdb_live_',
        key_suffix: keySuffix,
        name: 'Default Key',
        is_active: true,
      })

      // Initialize monthly credits - get from plan configuration
      const currentMonth = new Date()
      currentMonth.setDate(1)
      const monthStr = currentMonth.toISOString().split('T')[0]

      // Get plan credits from database or use defaults
      const planCredits = existingUser.plan === 'free' ? 1000 : existingUser.plan === 'x402' ? 25000 : 100000

      await supabase.from('monthly_credits').insert({
        user_id: existingUser.id,
        month: monthStr,
        plan: existingUser.plan || 'free',
        total_credits: planCredits,
        used_credits: 0,
      })
    }

    return NextResponse.json(existingUser)
  } catch (error) {
    console.error('Error syncing Privy user:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
