import { NextRequest, NextResponse } from 'next/server'
import { validateClientSession } from '@/lib/auth/client'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'
    
    // Get session token from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const sessionInfo = await validateClientSession(token)
    
    if (!sessionInfo) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    const clientId = sessionInfo.client.id
    const now = new Date()
    let startDate: Date
    
    switch (timeframe) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))

    // Fetch all analytics data in parallel for this specific client
    const [
      totalScans,
      previousScans,
      totalReviews,
      previousReviews,
      avgRatingData,
      previousAvgRatingData,
      positiveReviews,
      previousPositiveReviews,
      googleClicks,
      previousGoogleClicks,
      contactClicks,
      previousContactClicks,
      scanTimeSeries,
      reviewTimeSeries,
      ratingDistribution
    ] = await Promise.all([
      // Total scans for this client
      prisma.qrScan.count({
        where: {
          clientId,
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Previous period scans
      prisma.qrScan.count({
        where: {
          clientId,
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      }),

      // Total reviews for this client
      prisma.reviewSubmission.count({
        where: {
          clientId,
          createdAt: {
            gte: startDate
          }
        }
      }),

      // Previous period reviews
      prisma.reviewSubmission.count({
        where: {
          clientId,
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      }),

      // Average rating for this client
      prisma.reviewSubmission.aggregate({
        where: {
          clientId,
          createdAt: {
            gte: startDate
          }
        },
        _avg: {
          rating: true
        }
      }),

      // Previous period average rating
      prisma.reviewSubmission.aggregate({
        where: {
          clientId,
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        },
        _avg: {
          rating: true
        }
      }),

      // Positive reviews (rating >= 4) for this client
      prisma.reviewSubmission.count({
        where: {
          clientId,
          rating: { gte: 4 },
          createdAt: {
            gte: startDate
          }
        }
      }),

      // Previous period positive reviews
      prisma.reviewSubmission.count({
        where: {
          clientId,
          rating: { gte: 4 },
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      }),

      // Google clicks for this client
      prisma.reviewSubmission.count({
        where: {
          clientId,
          googleClicked: true,
          createdAt: {
            gte: startDate
          }
        }
      }),

      // Previous period Google clicks
      prisma.reviewSubmission.count({
        where: {
          clientId,
          googleClicked: true,
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      }),

      // Contact clicks for this client
      prisma.reviewSubmission.count({
        where: {
          clientId,
          contactClicked: true,
          createdAt: {
            gte: startDate
          }
        }
      }),

      // Previous period contact clicks
      prisma.reviewSubmission.count({
        where: {
          clientId,
          contactClicked: true,
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      }),

      // Scan time series for this client
      prisma.qrScan.groupBy({
        by: ['createdAt'],
        where: {
          clientId,
          createdAt: {
            gte: startDate
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),

      // Review time series for this client
      prisma.reviewSubmission.groupBy({
        by: ['createdAt'],
        where: {
          clientId,
          createdAt: {
            gte: startDate
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),

      // Rating distribution for this client
      prisma.reviewSubmission.groupBy({
        by: ['rating'],
        where: {
          clientId,
          createdAt: {
            gte: startDate
          }
        },
        _count: {
          rating: true
        },
        orderBy: {
          rating: 'asc'
        }
      })
    ])

    const avgRating = avgRatingData._avg.rating || 0
    const previousAvgRating = previousAvgRatingData._avg.rating || 0
    
    const positivePercentage = totalReviews > 0 ? (positiveReviews / totalReviews) * 100 : 0
    const previousPositivePercentage = previousReviews > 0 ? (previousPositiveReviews / previousReviews) * 100 : 0

    const calculatePercentageChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const formatTimeSeries = (data: Array<{ createdAt: Date | string; _count?: { id: number } }>, days: number) => {
      const dailyData = new Map()
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
        const dateKey = date.toISOString().split('T')[0]
        dailyData.set(dateKey, 0)
      }

      data.forEach(item => {
        const dateKey = new Date(item.createdAt).toISOString().split('T')[0]
        if (dailyData.has(dateKey)) {
          const count = (item as any)._count?.id || 1
          dailyData.set(dateKey, dailyData.get(dateKey) + count)
        }
      })

      return Array.from(dailyData.entries()).map(([date, count]) => ({
        date,
        count
      }))
    }

    const days = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))

    const analytics = {
      kpis: {
        totalScans: {
          value: totalScans,
          change: calculatePercentageChange(totalScans, previousScans),
          trend: scanTimeSeries.slice(-7).map(item => item._count.id)
        },
        totalReviews: {
          value: totalReviews,
          change: calculatePercentageChange(totalReviews, previousReviews),
          trend: reviewTimeSeries.slice(-7).map(item => item._count.id)
        },
        averageRating: {
          value: Number(avgRating.toFixed(1)),
          change: calculatePercentageChange(avgRating, previousAvgRating),
          trend: ratingDistribution.map(item => item._count.rating)
        },
        positivePercentage: {
          value: Number(positivePercentage.toFixed(1)),
          change: calculatePercentageChange(positivePercentage, previousPositivePercentage),
          trend: [positivePercentage, previousPositivePercentage]
        },
        googleClicks: {
          value: googleClicks,
          change: calculatePercentageChange(googleClicks, previousGoogleClicks),
          trend: [googleClicks, previousGoogleClicks]
        },
        contactClicks: {
          value: contactClicks,
          change: calculatePercentageChange(contactClicks, previousContactClicks),
          trend: [contactClicks, previousContactClicks]
        }
      },
      timeSeries: {
        scans: formatTimeSeries(scanTimeSeries, days),
        reviews: formatTimeSeries(reviewTimeSeries, days)
      },
      ratingDistribution: ratingDistribution.map(item => ({
        rating: item.rating,
        count: item._count.rating
      })),
      client: {
        id: sessionInfo.client.id,
        name: sessionInfo.client.name
      }
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Client Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}