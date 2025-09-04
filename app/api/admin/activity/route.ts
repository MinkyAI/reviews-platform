import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // 'all' | 'scans' | 'reviews' | 'clients'

    // Fetch recent activities based on type
    const activities: any[] = []
    const now = new Date()

    if (type === 'all' || type === 'scans') {
      // Get recent QR scans
      const recentScans = await prisma.qrScan.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          qrCode: {
            select: { label: true, shortCode: true }
          },
          client: {
            select: { name: true, id: true }
          }
        }
      })

      recentScans.forEach(scan => {
        activities.push({
          id: `scan-${scan.id}`,
          type: 'scan',
          clientId: scan.client.id,
          clientName: scan.client.name,
          message: `QR code "${scan.qrCode.label}" scanned`,
          timestamp: scan.createdAt,
          metadata: {
            qrCode: scan.qrCode.shortCode,
            sessionId: scan.sessionId
          }
        })
      })
    }

    if (type === 'all' || type === 'reviews') {
      // Get recent review submissions
      const recentReviews = await prisma.reviewSubmission.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: { name: true, id: true }
          },
          qrCode: {
            select: { label: true, shortCode: true }
          }
        }
      })

      recentReviews.forEach(review => {
        let message = `New ${review.rating}-star review`
        if (review.rating === 5) {
          message = 'New 5-star review submitted'
        } else if (review.rating >= 4) {
          message = `Good review received (${review.rating} stars)`
        } else if (review.rating <= 2) {
          message = `Customer feedback needs attention (${review.rating} stars)`
        }

        activities.push({
          id: `review-${review.id}`,
          type: 'review',
          clientId: review.client.id,
          clientName: review.client.name,
          message,
          timestamp: review.createdAt,
          metadata: {
            rating: review.rating,
            hasComment: !!review.comment,
            qrCode: review.qrCode.shortCode,
            googleClicked: review.googleClicked,
            contactClicked: review.contactClicked
          }
        })
      })
    }

    if (type === 'all' || type === 'clients') {
      // Get recently added clients
      const recentClients = await prisma.client.findMany({
        take: Math.min(limit, 5),
        orderBy: { createdAt: 'desc' },
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: {
          _count: {
            select: {
              qrCodes: true,
              locations: true
            }
          }
        }
      })

      recentClients.forEach(client => {
        activities.push({
          id: `client-${client.id}`,
          type: 'client',
          clientId: client.id,
          clientName: client.name,
          message: 'New client onboarded',
          timestamp: client.createdAt,
          metadata: {
            email: client.email,
            qrCodesCount: client._count.qrCodes,
            locationsCount: client._count.locations
          }
        })
      })
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Limit the total number of activities
    const limitedActivities = activities.slice(0, limit)

    // Format timestamps as relative time
    const formattedActivities = limitedActivities.map(activity => {
      const timeDiff = now.getTime() - new Date(activity.timestamp).getTime()
      const minutes = Math.floor(timeDiff / 60000)
      const hours = Math.floor(timeDiff / 3600000)
      const days = Math.floor(timeDiff / 86400000)

      let relativeTime = 'just now'
      if (days > 0) {
        relativeTime = days === 1 ? '1 day ago' : `${days} days ago`
      } else if (hours > 0) {
        relativeTime = hours === 1 ? '1 hour ago' : `${hours} hours ago`
      } else if (minutes > 0) {
        relativeTime = minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
      }

      return {
        ...activity,
        timestamp: relativeTime
      }
    })

    // Get summary statistics
    const stats = await prisma.$transaction([
      prisma.qrScan.count({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),
      prisma.reviewSubmission.count({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.client.count({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      activities: formattedActivities,
      summary: {
        scansToday: stats[0],
        reviewsToday: stats[1],
        newClientsThisWeek: stats[2]
      }
    })

  } catch (error) {
    console.error('Failed to fetch activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}