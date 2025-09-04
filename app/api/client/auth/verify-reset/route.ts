import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validatePasswordResetToken, completePasswordReset } from '@/lib/auth/client'

const verifyResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

// GET: Verify if a reset token is valid
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    // Validate the token
    const tokenData = await validatePasswordResetToken(token)

    if (!tokenData) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'This password reset link is invalid or has expired. Please request a new one.' 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      clientId: tokenData.clientId,
    })
  } catch (error) {
    console.error('Password reset token validation error:', error)
    
    return NextResponse.json(
      { 
        valid: false,
        error: 'Unable to verify reset token. Please try again or request a new reset link.' 
      },
      { status: 500 }
    )
  }
}

// POST: Complete password reset with new password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = verifyResetSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message).join(', ')
      return NextResponse.json(
        { error: `Please check your input: ${errors}` },
        { status: 422 }
      )
    }

    const { token, password } = validation.data

    // Validate the token first
    const tokenData = await validatePasswordResetToken(token)

    if (!tokenData) {
      return NextResponse.json(
        { error: 'This password reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Complete the password reset
    const success = await completePasswordReset(token, password)

    if (!success) {
      return NextResponse.json(
        { error: 'Unable to reset password. The link may have expired or already been used.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You can now sign in with your new password.',
    })
  } catch (error) {
    console.error('Password reset completion error:', error)
    
    // Handle specific database errors
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { error: 'Unable to connect to our systems. Please try again in a moment.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Unable to reset password. Please try again or request a new reset link.' },
      { status: 500 }
    )
  }
}