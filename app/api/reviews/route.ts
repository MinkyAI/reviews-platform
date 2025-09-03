import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSessionId, hashIP } from '@/lib/utils'
import { z } from 'zod'

const submitReviewSchema = z.object({
  qrCode: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  sessionId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = submitReviewSchema.parse(body)

    const qrCode = await prisma.qrCode.findUnique({
      where: { shortCode: validated.qrCode },
      include: { client: true }
    })

    if (!qrCode || qrCode.status !== 'active') {
      return NextResponse.json(
        { error: 'Invalid or inactive QR code' },
        { status: 404 }
      )
    }

    const sessionId = validated.sessionId || generateSessionId()
    const userAgent = req.headers.get('user-agent') || undefined
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1'
    const ipHash = hashIP(ip)

    const scan = await prisma.qrScan.create({
      data: {
        qrId: qrCode.id,
        clientId: qrCode.clientId,
        sessionId,
        userAgent,
        ipHash,
      }
    })

    const submission = await prisma.reviewSubmission.create({
      data: {
        qrId: qrCode.id,
        clientId: qrCode.clientId,
        scanId: scan.id,
        rating: validated.rating,
        comment: validated.comment,
      },
      include: {
        client: {
          select: {
            name: true,
            googlePlaceId: true,
            contactEmail: true,
            contactPhone: true,
            logoUrl: true,
            brandColors: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      sessionId,
      client: submission.client,
      rating: submission.rating
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Review submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const qrCode = searchParams.get('qrCode')
  
  if (!qrCode) {
    return NextResponse.json(
      { error: 'QR code is required' },
      { status: 400 }
    )
  }

  try {
    const qrRecord = await prisma.qrCode.findUnique({
      where: { shortCode: qrCode },
      include: {
        client: {
          select: {
            name: true,
            googlePlaceId: true,
            contactEmail: true,
            contactPhone: true,
            logoUrl: true,
            brandColors: true
          }
        }
      }
    })

    if (!qrRecord || qrRecord.status !== 'active') {
      return NextResponse.json(
        { error: 'Invalid or inactive QR code' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      client: qrRecord.client,
      qrCodeId: qrRecord.id
    })
  } catch (error) {
    console.error('QR code lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup QR code' },
      { status: 500 }
    )
  }
}