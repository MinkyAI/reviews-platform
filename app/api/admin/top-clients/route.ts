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
    const limit = parseInt(searchParams.get('limit') || '5')
    const timeframe = searchParams.get('timeframe') || '30d' // 7d, 30d, 90d
    
    // Calculate date range
    const now = new Date()
    let dateFrom = new Date()
    
    switch (timeframe) {
      case '7d':
        dateFrom.setDate(now.getDate() - 7)
        break
      case '90d':
        dateFrom.setDate(now.getDate() - 90)
        break
      case '30d':
      default:
        dateFrom.setDate(now.getDate() - 30)
        break
    }

    // Calculate previous period for trend comparison
    const periodLength = now.getTime() - dateFrom.getTime()
    const previousDateFrom = new Date(dateFrom.getTime() - periodLength)
    const previousDateTo = new Date(dateFrom.getTime())

    // Get all clients with review counts for current and previous periods
    const clients = await prisma.client.findMany({
      include: {
        reviewSubmissions: {
          select: {
            rating: true,
            createdAt: true
          },
          where: {
            createdAt: {
              gte: previousDateFrom // Get reviews from both periods
            }
          }
        },
        qrCodes: {
          select: {
            id: true
          }
        },
        _count: {
          select: {
            reviewSubmissions: true,
            qrScans: true
          }
        }
      }
    })

    // Calculate metrics for each client
    const clientMetrics = clients.map(client => {
      // Separate reviews by period
      const currentReviews = client.reviewSubmissions.filter(
        r => r.createdAt >= dateFrom
      )
      const previousReviews = client.reviewSubmissions.filter(
        r => r.createdAt >= previousDateFrom && r.createdAt < dateFrom
      )

      // Calculate average ratings
      const currentAvgRating = currentReviews.length > 0
        ? currentReviews.reduce((sum, r) => sum + r.rating, 0) / currentReviews.length
        : 0

      const previousAvgRating = previousReviews.length > 0
        ? previousReviews.reduce((sum, r) => sum + r.rating, 0) / previousReviews.length
        : 0

      // Calculate review count change
      const reviewCountChange = previousReviews.length > 0
        ? ((currentReviews.length - previousReviews.length) / previousReviews.length) * 100
        : currentReviews.length > 0 ? 100 : 0

      // Calculate positive review percentage
      const positiveReviews = currentReviews.filter(r => r.rating >= 4).length
      const positivePercentage = currentReviews.length > 0
        ? (positiveReviews / currentReviews.length) * 100
        : 0

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        reviewCount: currentReviews.length,
        totalReviews: client._count.reviewSubmissions,
        avgRating: Math.round(currentAvgRating * 10) / 10,
        previousAvgRating: Math.round(previousAvgRating * 10) / 10,
        change: Math.round(reviewCountChange * 10) / 10,
        positivePercentage: Math.round(positivePercentage),
        qrCodeCount: client.qrCodes.length,
        scanCount: client._count.qrScans,
        // Score for ranking (weighted by review count and rating)
        score: currentReviews.length * currentAvgRating
      }
    })

    // Sort by score (combination of review count and rating)
    clientMetrics.sort((a, b) => b.score - a.score)

    // Get top clients
    const topClients = clientMetrics.slice(0, limit).map(client => ({
      id: client.id,
      name: client.name,
      reviewCount: client.reviewCount,
      avgRating: client.avgRating,
      change: client.change,
      trend: client.avgRating > client.previousAvgRating ? 'up' : 
             client.avgRating < client.previousAvgRating ? 'down' : 'stable',
      positivePercentage: client.positivePercentage,
      metrics: {
        totalReviews: client.totalReviews,
        qrCodes: client.qrCodeCount,
        totalScans: client.scanCount
      }
    }))

    // Get overall statistics
    const overallStats = {
      totalClients: clients.length,
      activeClients: clientMetrics.filter(c => c.reviewCount > 0).length,
      avgReviewsPerClient: Math.round(
        clientMetrics.reduce((sum, c) => sum + c.reviewCount, 0) / clients.length * 10
      ) / 10,
      avgRating: Math.round(
        clientMetrics.reduce((sum, c) => sum + c.avgRating, 0) / 
        clientMetrics.filter(c => c.reviewCount > 0).length * 10
      ) / 10 || 0
    }

    return NextResponse.json({
      success: true,
      topClients,
      timeframe,
      stats: overallStats
    })

  } catch (error) {
    console.error('Failed to fetch top clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top clients data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}