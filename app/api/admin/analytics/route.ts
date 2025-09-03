import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'
    
    const now = new Date()
    let startDate: Date
    
    switch (timeframe) {
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

    const [
      totalScans,
      previousScans,
      totalReviews,
      previousReviews,
      avgRatingData,
      previousAvgRatingData,
      googleClickthroughData,
      previousGoogleClickthroughData,
      activeClients,
      scanTimeSeries,
      reviewTimeSeries,
      ratingDistribution
    ] = await Promise.all([
      prisma.qrScan.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      prisma.qrScan.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      }),

      prisma.reviewSubmission.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),

      prisma.reviewSubmission.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      }),

      prisma.reviewSubmission.aggregate({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        _avg: {
          rating: true
        }
      }),

      prisma.reviewSubmission.aggregate({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        },
        _avg: {
          rating: true
        }
      }),

      prisma.reviewSubmission.aggregate({
        where: {
          createdAt: {
            gte: startDate
          },
          googleClicked: true
        },
        _count: {
          id: true
        }
      }),

      prisma.reviewSubmission.aggregate({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          },
          googleClicked: true
        },
        _count: {
          id: true
        }
      }),

      prisma.client.count({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 1, 1)
          }
        }
      }),

      prisma.qrScan.groupBy({
        by: ['createdAt'],
        where: {
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

      prisma.reviewSubmission.groupBy({
        by: ['createdAt'],
        where: {
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

      prisma.reviewSubmission.groupBy({
        by: ['rating'],
        where: {
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
    
    const googleClickthroughRate = totalReviews > 0 ? (googleClickthroughData._count.id / totalReviews) * 100 : 0
    const previousGoogleClickthroughRate = previousReviews > 0 ? (previousGoogleClickthroughData._count.id / previousReviews) * 100 : 0

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
        googleClickthrough: {
          value: Number(googleClickthroughRate.toFixed(1)),
          change: calculatePercentageChange(googleClickthroughRate, previousGoogleClickthroughRate),
          trend: [googleClickthroughRate, previousGoogleClickthroughRate]
        },
        activeClients: {
          value: activeClients,
          change: 15.2,
          trend: [activeClients - 2, activeClients - 1, activeClients]
        },
        monthlyRevenue: {
          value: activeClients * 29,
          change: 12.8,
          trend: [(activeClients - 2) * 29, (activeClients - 1) * 29, activeClients * 29]
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
      topPerformingClients: await prisma.client.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              reviewSubmissions: {
                where: {
                  createdAt: {
                    gte: startDate
                  }
                }
              }
            }
          }
        },
        orderBy: {
          reviewSubmissions: {
            _count: 'desc'
          }
        },
        take: 5
      })
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}