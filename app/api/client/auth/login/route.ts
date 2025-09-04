import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateClient, createClientSession, getClientIdFromHeaders } from '@/lib/auth/client'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  clientId: z.string().min(1, 'Client ID is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message).join(', ')
      return NextResponse.json(
        { error: `Please check your input: ${errors}` },
        { status: 422 }
      )
    }

    const { email, password, clientId } = validation.data

    // Alternative: Get clientId from header if not in body
    const headerClientId = getClientIdFromHeaders(request.headers)
    const finalClientId = clientId || headerClientId

    if (!finalClientId) {
      return NextResponse.json(
        { error: 'Client access is required. Please contact your administrator.' },
        { status: 400 }
      )
    }

    // Authenticate the client user
    const user = await authenticateClient(email, password, finalClientId)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please check your email and password, or contact your administrator.' },
        { status: 401 }
      )
    }

    // Get client IP and user agent for session tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || undefined

    // Create a new session
    const sessionData = await createClientSession(
      user.id,
      finalClientId,
      ipAddress,
      userAgent
    )

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: user.clientId,
      },
      session: {
        expiresAt: sessionData.expiresAt,
      },
    })

    // Set HTTP-only cookie for session
    response.cookies.set({
      name: 'client-session',
      value: sessionData.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    })

    return response
  } catch (error) {
    console.error('Client login error:', error)
    
    // Handle specific database errors
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { error: 'Unable to connect to our systems. Please try again in a moment.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Unable to sign in. Please try again in a moment.' },
      { status: 500 }
    )
  }
}