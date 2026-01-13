import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Use service role client for server-side operations
    const supabase = createServiceRoleClient()

    // Get current month credits
    const currentMonth = new Date()
    currentMonth.setDate(1)
    const monthStr = currentMonth.toISOString().split("T")[0]

    // First, get ALL records for this user to see what exists
    const { data: allCredits } = await supabase
      .from("monthly_credits")
      .select("*")
      .eq("user_id", userId)

    // Try to find matching month record
    let credits = null
    if (allCredits && allCredits.length > 0) {
      // Try exact string match first
      credits = allCredits.find((c: any) => c.month === monthStr)
      
      // If no exact match, try date comparison (handle timezone/format issues)
      if (!credits) {
        const targetDate = new Date(monthStr)
        credits = allCredits.find((c: any) => {
          const recordDate = new Date(c.month)
          return recordDate.getFullYear() === targetDate.getFullYear() &&
                 recordDate.getMonth() === targetDate.getMonth()
        })
      }
      
      // If still no match, use the most recent record (in case of schema issues)
      if (!credits && allCredits.length > 0) {
        // Sort by month descending and take the first (most recent)
        const sorted = [...allCredits].sort((a: any, b: any) => {
          return new Date(b.month).getTime() - new Date(a.month).getTime()
        })
        credits = sorted[0]
        console.log('Using most recent record:', credits.month)
      }
    }

    // If record exists, check if month needs updating
    if (credits) {
      const recordMonth = new Date(credits.month)
      const currentMonthDate = new Date(monthStr)
      
      // If the record is from a different month, update it to current month
      if (recordMonth.getFullYear() !== currentMonthDate.getFullYear() ||
          recordMonth.getMonth() !== currentMonthDate.getMonth()) {
        console.log('Updating old record month from', credits.month, 'to', monthStr)
        
        const { data: updatedCredits, error: updateError } = await supabase
          .from("monthly_credits")
          .update({ month: monthStr })
          .eq("id", credits.id)
          .select()
          .single()
        
        if (updateError) {
          console.error('Error updating month:', updateError)
          // Return original record if update fails
          return NextResponse.json({
            plan: credits.plan || "free",
            credits: credits,
          })
        }
        
        return NextResponse.json({
          plan: updatedCredits.plan || "free",
          credits: updatedCredits,
        })
      }
      
      // Month is current, return as-is
      return NextResponse.json({
        plan: credits.plan || "free",
        credits: credits,
      })
    }


    // Record doesn't exist - get user plan and create/update it
    // Use upsert to handle race conditions
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("plan")
        .eq("id", userId)
        .single()

      if (userError || !user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

    const planCredits = user.plan === "free" ? 1000 : user.plan === "x402" ? 25000 : 100000
    
    // Use upsert to handle race conditions - if record was created between check and insert
    const { data: newCredits, error: upsertError } = await supabase
      .from("monthly_credits")
      .upsert({
        user_id: userId,
        month: monthStr,
        plan: user.plan || "free",
        total_credits: planCredits,
        used_credits: 0,
      }, {
        onConflict: 'user_id,month'
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Error upserting credits record:', upsertError)
      
      // If duplicate key error, it means there's a unique constraint on user_id only
      // Fetch ALL records and return the most recent one
      if (upsertError.code === '23505') {
        console.log('Duplicate key error - unique constraint on user_id only, fetching existing record')
        const { data: allExistingCredits } = await supabase
          .from("monthly_credits")
          .select("*")
          .eq("user_id", userId)
        
        if (allExistingCredits && allExistingCredits.length > 0) {
          // Return the most recent record (sorted by month descending)
          const sorted = [...allExistingCredits].sort((a: any, b: any) => {
            return new Date(b.month).getTime() - new Date(a.month).getTime()
          })
          const mostRecent = sorted[0]
          console.log('Returning most recent record:', mostRecent.month, 'Total:', mostRecent.total_credits, 'Used:', mostRecent.used_credits)
          return NextResponse.json({
            plan: mostRecent.plan || "free",
            credits: mostRecent,
          })
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to create/update credits record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      plan: user.plan || "free",
      credits: newCredits || {
        total_credits: planCredits,
        used_credits: 0,
      },
    })
  } catch (error: any) {
    console.error('Error in get-credits route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
