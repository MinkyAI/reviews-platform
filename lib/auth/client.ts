import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db'
import type { ClientUser } from '@prisma/client'

export interface ClientAuthResult {
  user: {
    id: string
    email: string
    name: string
    role: string
    clientId: string
  }
  session: {
    token: string
    expiresAt: Date
  }
}

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

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateSecureToken(): string {
  return randomBytes(32).toString('hex')
}

export async function createClientSession(
  userId: string,
  clientId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  await prisma.clientSession.create({
    data: {
      userId,
      clientId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    },
  })

  // Update last login time
  await prisma.clientUser.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  })

  return { token, expiresAt }
}

export async function validateClientSession(token: string): Promise<ClientSessionInfo | null> {
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
}

export async function invalidateClientSession(token: string): Promise<void> {
  await prisma.clientSession.deleteMany({
    where: { token },
  })
}

export async function authenticateClient(
  email: string,
  password: string,
  clientId: string
): Promise<ClientUser | null> {
  const user = await prisma.clientUser.findUnique({
    where: {
      clientId_email: {
        clientId,
        email,
      },
    },
  })

  if (!user || !user.isActive) {
    return null
  }

  // For this system, we'll check against the client's password in the Client table
  // since ClientUser doesn't have a password field
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!client) {
    return null
  }

  const isValidPassword = await verifyPassword(password, client.password)
  if (!isValidPassword) {
    return null
  }

  return user
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.passwordReset.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}

export async function validatePasswordResetToken(token: string): Promise<{
  userId: string
  clientId: string
} | null> {
  const resetRequest = await prisma.passwordReset.findUnique({
    where: { token },
    include: {
      user: true,
    },
  })

  if (!resetRequest || resetRequest.used || resetRequest.expiresAt < new Date()) {
    return null
  }

  return {
    userId: resetRequest.user.id,
    clientId: resetRequest.user.clientId,
  }
}

export async function completePasswordReset(
  token: string,
  newPassword: string
): Promise<boolean> {
  const resetRequest = await prisma.passwordReset.findUnique({
    where: { token },
    include: {
      user: true,
    },
  })

  if (!resetRequest || resetRequest.used || resetRequest.expiresAt < new Date()) {
    return false
  }

  const hashedPassword = await hashPassword(newPassword)

  // Update the client's password (since ClientUser references Client's password)
  await prisma.client.update({
    where: { id: resetRequest.user.clientId },
    data: { password: hashedPassword },
  })

  // Mark the reset token as used
  await prisma.passwordReset.update({
    where: { token },
    data: { used: true },
  })

  return true
}

export function getClientIdFromHeaders(headers: Headers): string | null {
  return headers.get('x-client-id') || null
}