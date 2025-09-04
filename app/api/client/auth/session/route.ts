import { NextRequest, NextResponse } from 'next/server'
import { validateClientSession } from '@/lib/auth/client'

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('client-session')?.value

    if (!sessionToken) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        session: null,
        client: null,
      })
    }

    // Validate the session
    const sessionInfo = await validateClientSession(sessionToken)

    if (!sessionInfo) {
      // Invalid or expired session - clear the cookie
      const response = NextResponse.json({
        authenticated: false,
        user: null,
        session: null,
        client: null,
      })

      response.cookies.delete('client-session')
      return response
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: sessionInfo.user.id,
        email: sessionInfo.user.email,
        name: sessionInfo.user.name,
        role: sessionInfo.user.role,
        clientId: sessionInfo.user.clientId,
        lastLoginAt: sessionInfo.user.lastLoginAt,
      },
      session: {
        expiresAt: sessionInfo.session.expiresAt,
      },
      client: {
        id: sessionInfo.client.id,
        name: sessionInfo.client.name,
      },
    })
  } catch (error) {
    console.error('Client session validation error:', error)
    
    // On error, clear session cookie and return unauthenticated
    const response = NextResponse.json(
      {
        authenticated: false,
        user: null,
        session: null,
        client: null,
        error: 'Unable to validate session. Please sign in again.',
      },
      { status: 500 }
    )

    response.cookies.delete('client-session')
    return response
  }
}