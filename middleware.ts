import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { validateClientSession } from '@/lib/auth/client-edge'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const pathname = request.nextUrl.pathname

  // Handle admin routes
  if (pathname.startsWith('/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If user is not signed in and the current path is /admin (but not /admin/login)
    if (!user && pathname.startsWith('/admin') && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // If user is signed in and trying to access login page, redirect to admin dashboard
    if (user && pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    return response
  }

  // Handle client routes
  if (pathname.startsWith('/client')) {
    try {
      // Get client session token from cookie
      const clientSessionToken = request.cookies.get('client-session')?.value

      // If no session token and not on login page, redirect to login
      if (!clientSessionToken && pathname !== '/client/login') {
        return NextResponse.redirect(new URL('/client/login', request.url))
      }

      // If has session token and on login page, validate and redirect if valid
      if (clientSessionToken && pathname === '/client/login') {
        const sessionInfo = await validateClientSession(clientSessionToken)
        if (sessionInfo) {
          return NextResponse.redirect(new URL('/client', request.url))
        }
        // If session is invalid, continue to login page (token will be cleaned up by the login page)
      }

      // If has session token and not on login page, validate session
      if (clientSessionToken && pathname !== '/client/login') {
        const sessionInfo = await validateClientSession(clientSessionToken)
        
        if (!sessionInfo) {
          // Invalid or expired session - clear cookie and redirect to login
          const response = NextResponse.redirect(new URL('/client/login', request.url))
          response.cookies.delete('client-session')
          return response
        }

        // Valid session - add client and user info to headers for API validation
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('X-Client-Id', sessionInfo.user.clientId)
        requestHeaders.set('X-User-Id', sessionInfo.user.id)

        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }

      return response
    } catch (error) {
      console.error('Client middleware authentication error:', error)
      
      // On error, redirect to login and clear session cookie
      const response = NextResponse.redirect(new URL('/client/login', request.url))
      response.cookies.delete('client-session')
      return response
    }
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*',
  ]
}