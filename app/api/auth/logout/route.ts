import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Sign out from Supabase Auth
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Supabase signout error:', error)
      return NextResponse.json(
        { error: 'Unable to sign out. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully signed out',
    })
  } catch (error) {
    console.error('Logout route error:', error)
    return NextResponse.json(
      { error: 'Unable to sign out. Please try again.' },
      { status: 500 }
    )
  }
}