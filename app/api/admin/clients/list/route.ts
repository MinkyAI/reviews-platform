import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            reviewSubmissions: true,
            qrCodes: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    const formattedClients = clients.map(client => {
      const now = new Date()
      const updatedAt = new Date(client.updatedAt)
      const diffMs = now.getTime() - updatedAt.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      let lastActivity = 'just now'
      if (diffDays > 0) {
        lastActivity = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      } else if (diffHours > 0) {
        lastActivity = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      } else {
        const diffMins = Math.floor(diffMs / (1000 * 60))
        if (diffMins > 0) {
          lastActivity = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
        }
      }

      return {
        id: client.id,
        name: client.name,
        status: client._count.qrCodes > 0 ? 'active' : 'pending',
        reviewCount: client._count.reviewSubmissions,
        lastActivity
      }
    })

    return NextResponse.json({ clients: formattedClients })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}