import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Please check your email format and ensure password is at least 6 characters.' },
        { status: 422 }
      )
    }

    const { email, password } = validation.data
    const supabase = await createClient()

    // Attempt to sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase auth error:', error)
      
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Invalid credentials. Please check your email and password.' },
          { status: 401 }
        )
      }
      
      if (error.message.includes('too many requests')) {
        return NextResponse.json(
          { error: 'Too many login attempts. Please wait a moment before trying again.' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { error: 'Unable to sign in. Please try again in a moment.' },
        { status: 500 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please check your email and password.' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch (error) {
    console.error('Login route error:', error)
    return NextResponse.json(
      { error: 'Unable to sign in. Please try again in a moment.' },
      { status: 500 }
    )
  }
}