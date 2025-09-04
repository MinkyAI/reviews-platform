import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateClientSession } from '@/lib/auth/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Validate client session
    const token = request.cookies.get('client-session')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await validateClientSession(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Fetch recent activities for this client only
    const activities: any[] = []
    const now = new Date()

    // Get recent QR scans for this client
    const recentScans = await prisma.qrScan.findMany({
      where: { clientId: session.client.id },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        qrCode: {
          select: { label: true, shortCode: true }
        }
      }
    })

    recentScans.forEach(scan => {
      activities.push({
        id: `scan-${scan.id}`,
        type: 'scan',
        message: `Customer scanned "${scan.qrCode.label}"`,
        timestamp: scan.createdAt,
        icon: 'scan',
        metadata: {
          qrCode: scan.qrCode.shortCode,
          sessionId: scan.sessionId
        }
      })
    })

    // Get recent review submissions for this client
    const recentReviews = await prisma.reviewSubmission.findMany({
      where: { clientId: session.client.id },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        qrCode: {
          select: { label: true, shortCode: true }
        }
      }
    })

    recentReviews.forEach(review => {
      let message = `${review.rating}-star review received`
      let type = 'review'
      
      if (review.rating === 5) {
        message = 'Excellent 5-star review received!'
        type = 'review-positive'
      } else if (review.rating >= 4) {
        message = `Good ${review.rating}-star review received`
        type = 'review-positive'
      } else if (review.rating <= 2) {
        message = `${review.rating}-star feedback needs attention`
        type = 'review-negative'
      }

      if (review.googleClicked) {
        message += ' (customer went to Google)'
      } else if (review.contactClicked) {
        message += ' (customer contacted you)'
      }

      activities.push({
        id: `review-${review.id}`,
        type,
        message,
        timestamp: review.createdAt,
        metadata: {
          rating: review.rating,
          hasComment: !!review.comment,
          comment: review.comment,
          qrCode: review.qrCode.shortCode,
          qrLabel: review.qrCode.label,
          googleClicked: review.googleClicked,
          contactClicked: review.contactClicked
        }
      })
    })

    // Get CTA clicks for this client
    const recentCTAClicks = await prisma.cTAClick.findMany({
      where: {
        submission: {
          clientId: session.client.id
        }
      },
      take: Math.floor(limit / 2),
      orderBy: { clickedAt: 'desc' },
      include: {
        submission: {
          select: {
            rating: true,
            qrCode: {
              select: { label: true }
            }
          }
        }
      }
    })

    recentCTAClicks.forEach(click => {
      let message = ''
      if (click.ctaType === 'google_direct' || click.ctaType === 'google_copy') {
        message = `Customer clicked to leave Google review`
      } else if (click.ctaType === 'contact_email' || click.ctaType === 'contact_phone') {
        message = `Customer used contact information`
      }

      if (message) {
        activities.push({
          id: `cta-${click.id}`,
          type: 'action',
          message,
          timestamp: click.clickedAt,
          metadata: {
            ctaType: click.ctaType,
            fromRating: click.submission.rating,
            qrLabel: click.submission.qrCode.label
          }
        })
      }
    })

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Limit and format timestamps
    const limitedActivities = activities.slice(0, limit).map(activity => {
      const timeDiff = now.getTime() - new Date(activity.timestamp).getTime()
      const minutes = Math.floor(timeDiff / 60000)
      const hours = Math.floor(timeDiff / 3600000)
      const days = Math.floor(timeDiff / 86400000)

      let relativeTime = 'just now'
      if (days > 0) {
        relativeTime = days === 1 ? 'Yesterday' : `${days} days ago`
      } else if (hours > 0) {
        relativeTime = hours === 1 ? '1 hour ago' : `${hours} hours ago`
      } else if (minutes > 0) {
        relativeTime = minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
      }

      return {
        ...activity,
        timestamp: relativeTime,
        rawTimestamp: activity.timestamp
      }
    })

    // Get summary statistics for today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [todayScans, todayReviews, positiveToday] = await prisma.$transaction([
      prisma.qrScan.count({
        where: {
          clientId: session.client.id,
          createdAt: { gte: todayStart }
        }
      }),
      prisma.reviewSubmission.count({
        where: {
          clientId: session.client.id,
          createdAt: { gte: todayStart }
        }
      }),
      prisma.reviewSubmission.count({
        where: {
          clientId: session.client.id,
          createdAt: { gte: todayStart },
          rating: { gte: 4 }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      activities: limitedActivities,
      summary: {
        todayScans,
        todayReviews,
        positiveToday,
        conversionRate: todayScans > 0 ? Math.round((todayReviews / todayScans) * 100) : 0
      }
    })

  } catch (error) {
    console.error('Failed to fetch client activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}