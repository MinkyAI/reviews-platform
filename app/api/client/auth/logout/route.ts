import { NextRequest, NextResponse } from 'next/server'
import { invalidateClientSession } from '@/lib/auth/client'

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('client-session')?.value

    if (!sessionToken) {
      return NextResponse.json({
        success: true,
        message: 'Already signed out',
      })
    }

    // Invalidate the session in the database
    await invalidateClientSession(sessionToken)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Successfully signed out',
    })

    // Clear the session cookie
    response.cookies.delete('client-session')

    return response
  } catch (error) {
    console.error('Client logout error:', error)
    
    // Even if there's an error, we should still clear the cookie
    const response = NextResponse.json({
      success: true,
      message: 'Signed out locally',
    })

    response.cookies.delete('client-session')
    
    return response
  }
}