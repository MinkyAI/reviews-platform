import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createPasswordResetToken } from '@/lib/auth/client'

const resetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  clientId: z.string().min(1, 'Client ID is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = resetRequestSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message).join(', ')
      return NextResponse.json(
        { error: `Please check your input: ${errors}` },
        { status: 422 }
      )
    }

    const { email, clientId } = validation.data

    // Find the user
    const user = await prisma.clientUser.findUnique({
      where: {
        clientId_email: {
          clientId,
          email,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Always return success to prevent email enumeration attacks
    const successResponse = NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    })

    // If user doesn't exist or is inactive, still return success
    if (!user || !user.isActive) {
      return successResponse
    }

    try {
      // Create password reset token
      const resetToken = await createPasswordResetToken(user.id)

      // In a real application, you would send an email here
      // For now, we'll log the token (remove this in production)
      console.log(`Password reset token for ${email} (Client: ${user.client.name}): ${resetToken}`)
      
      // TODO: Send email with reset link
      // await sendPasswordResetEmail(user.email, user.name, user.client.name, resetToken)

      return successResponse
    } catch (error) {
      console.error('Error creating password reset token:', error)
      
      // Still return success to prevent information leakage
      return successResponse
    }
  } catch (error) {
    console.error('Password reset request error:', error)
    
    // Handle specific database errors
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { error: 'Unable to connect to our systems. Please try again in a moment.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Unable to process password reset request. Please try again in a moment.' },
      { status: 500 }
    )
  }
}