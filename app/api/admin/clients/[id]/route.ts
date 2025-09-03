import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
// import bcrypt from 'bcryptjs'

const updateClientSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  contactEmail: z.string().email('Please enter a valid contact email').optional(),
  contactPhone: z.string().optional(),
  googlePlaceId: z.string().optional(),
  brandColors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
  }).optional(),
  logoUrl: z.string().url('Please enter a valid logo URL').optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        contactEmail: true,
        contactPhone: true,
        googlePlaceId: true,
        logoUrl: true,
        brandColors: true,
        createdAt: true,
        updatedAt: true,
        locations: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            country: true,
            createdAt: true,
          }
        },
        qrCodes: {
          where: { status: 'active' },
          select: {
            id: true,
            label: true,
            shortCode: true,
            batchId: true,
            createdAt: true,
            _count: {
              select: {
                qrScans: true,
                reviewSubmissions: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            qrCodes: {
              where: { status: 'active' }
            },
            locations: true,
            reviewSubmissions: true,
            qrScans: true,
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client account not found' },
        { status: 404 }
      )
    }

    const recentReviews = await prisma.reviewSubmission.findMany({
      where: { clientId },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        qrCode: {
          select: { label: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const analyticsData = await prisma.$queryRaw<Array<{
      date: string
      scans: number
      reviews: number
    }>>`
      SELECT 
        DATE(created_at) as date,
        COUNT(CASE WHEN table_name = 'qr_scans' THEN 1 END) as scans,
        COUNT(CASE WHEN table_name = 'review_submissions' THEN 1 END) as reviews
      FROM (
        SELECT created_at, 'qr_scans' as table_name FROM "QrScan" WHERE client_id = ${clientId}
        UNION ALL
        SELECT created_at, 'review_submissions' as table_name FROM "ReviewSubmission" WHERE client_id = ${clientId}
      ) combined
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `

    return NextResponse.json({
      client: {
        ...client,
        status: client._count.qrCodes > 0 ? 'active' : 'inactive',
        qrCodeCount: client._count.qrCodes,
        locationCount: client._count.locations,
        reviewCount: client._count.reviewSubmissions,
        scanCount: client._count.qrScans,
      },
      recentReviews,
      analytics: analyticsData
    })

  } catch (error) {
    console.error('Failed to fetch client:', error)
    return NextResponse.json(
      { error: 'Unable to retrieve client information at this time' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
    const body = await request.json()
    const validatedData = updateClientSchema.parse(body)

    const existingClient = await prisma.client.findUnique({
      where: { id: clientId }
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client account not found' },
        { status: 404 }
      )
    }

    if (validatedData.email && validatedData.email !== existingClient.email) {
      const emailTaken = await prisma.client.findUnique({
        where: { email: validatedData.email }
      })

      if (emailTaken) {
        return NextResponse.json(
          { error: 'This email address is already in use by another client' },
          { status: 400 }
        )
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactEmail: true,
        contactPhone: true,
        googlePlaceId: true,
        logoUrl: true,
        brandColors: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      client: updatedClient,
      message: 'Client information updated successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Please review your changes and try again',
          details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        },
        { status: 400 }
      )
    }

    console.error('Failed to update client:', error)
    return NextResponse.json(
      { error: 'Unable to save changes at this time' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
    const { searchParams } = new URL(request.url)
    const permanent = searchParams.get('permanent') === 'true'

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { 
        id: true, 
        name: true,
        _count: {
          select: {
            qrCodes: true,
            reviewSubmissions: true,
            qrScans: true,
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client account not found' },
        { status: 404 }
      )
    }

    if (permanent) {
      await prisma.$transaction(async (tx) => {
        await tx.cTAClick.deleteMany({
          where: {
            submission: {
              clientId: clientId
            }
          }
        })

        await tx.reviewSubmission.deleteMany({
          where: { clientId: clientId }
        })

        await tx.qrScan.deleteMany({
          where: { clientId: clientId }
        })

        await tx.qrCode.deleteMany({
          where: { clientId: clientId }
        })

        await tx.location.deleteMany({
          where: { clientId: clientId }
        })

        await tx.client.delete({
          where: { id: clientId }
        })
      })

      return NextResponse.json({
        message: `${client.name} and all associated data have been permanently deleted`
      })
    } else {
      const archivedClient = await prisma.client.update({
        where: { id: clientId },
        data: {
          email: `archived_${Date.now()}_${client.id}@deleted.local`,
          updatedAt: new Date(),
        }
      })

      await prisma.qrCode.updateMany({
        where: { clientId: clientId },
        data: { status: 'archived' }
      })

      return NextResponse.json({
        message: `${client.name} has been archived successfully`,
        client: {
          id: archivedClient.id,
          name: archivedClient.name,
          status: 'archived'
        }
      })
    }

  } catch (error) {
    console.error('Failed to delete client:', error)
    return NextResponse.json(
      { error: 'Unable to process deletion request at this time' },
      { status: 500 }
    )
  }
}