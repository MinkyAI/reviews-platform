import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get the current session and user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Supabase session error:', sessionError)
      return NextResponse.json(
        { error: 'Unable to retrieve session' },
        { status: 500 }
      )
    }

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        session: null,
      })
    }

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error('Supabase user error:', userError)
      return NextResponse.json(
        { error: 'Unable to retrieve user information' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      } : null,
      session: {
        access_token: session.access_token,
        expires_at: session.expires_at,
      },
    })
  } catch (error) {
    console.error('Session route error:', error)
    return NextResponse.json(
      { error: 'Unable to retrieve session information' },
      { status: 500 }
    )
  }
}