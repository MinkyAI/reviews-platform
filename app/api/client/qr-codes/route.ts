import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

interface JWTPayload {
  clientId: string
  userId: string
  iat: number
  exp: number
}

async function validateClientToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    
    return decoded.clientId
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate client authentication
    const clientId = await validateClientToken(request)
    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch QR codes for the client
    const qrCodes = await prisma.qrCode.findMany({
      where: {
        clientId: clientId
      },
      include: {
        location: {
          select: {
            name: true
          }
        },
        qrScans: {
          select: {
            scanTimestamp: true
          },
          orderBy: {
            scanTimestamp: 'desc'
          },
          take: 1
        },
        reviewSubmissions: {
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            qrScans: true,
            reviewSubmissions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for frontend
    const qrCodesData = qrCodes.map(qr => {
      const avgRating = qr.reviewSubmissions.length > 0
        ? qr.reviewSubmissions.reduce((sum, review) => sum + review.rating, 0) / qr.reviewSubmissions.length
        : undefined

      return {
        id: qr.id,
        label: qr.label,
        shortCode: qr.shortCode,
        locationName: qr.location?.name,
        status: qr.status,
        createdAt: qr.createdAt.toISOString(),
        stats: {
          totalScans: qr._count.qrScans,
          lastScanned: qr.qrScans[0]?.scanTimestamp?.toISOString(),
          reviewsGenerated: qr._count.reviewSubmissions,
          avgRating: avgRating ? Math.round(avgRating * 10) / 10 : undefined
        }
      }
    })

    return NextResponse.json({
      success: true,
      qrCodes: qrCodesData
    })

  } catch (error) {
    console.error('QR codes fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}