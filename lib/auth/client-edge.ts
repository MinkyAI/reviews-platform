// Edge Runtime compatible client authentication utilities for middleware
import { prisma } from '@/lib/db'

export interface ClientSessionInfo {
  user: {
    id: string
    email: string
    name: string
    role: string
    clientId: string
    lastLoginAt: Date | null
  }
  session: {
    token: string
    expiresAt: Date
  }
  client: {
    id: string
    name: string
  }
}

export async function validateClientSession(token: string): Promise<ClientSessionInfo | null> {
  try {
    const session = await prisma.clientSession.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        // Clean up expired session
        await prisma.clientSession.delete({
          where: { id: session.id },
        })
      }
      return null
    }

    if (!session.user.isActive) {
      return null
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        clientId: session.user.clientId,
        lastLoginAt: session.user.lastLoginAt,
      },
      session: {
        token: session.token,
        expiresAt: session.expiresAt,
      },
      client: {
        id: session.user.client.id,
        name: session.user.client.name,
      },
    }
  } catch (error) {
    console.error('Client session validation error:', error)
    return null
  }
}