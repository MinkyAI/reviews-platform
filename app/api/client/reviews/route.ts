import { NextRequest, NextResponse } from 'next/server'
import { validateClientSession } from '@/lib/auth/client'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get session from headers
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    let sessionInfo = null
    
    // Try token from Authorization header first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      sessionInfo = await validateClientSession(token)
    }
    
    // If no valid session from header, try cookie-based session
    if (!sessionInfo && cookieHeader) {
      // Extract session token from cookie
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=')
        acc[name] = value
        return acc
      }, {} as Record<string, string>)
      
      if (cookies.clientSessionToken) {
        sessionInfo = await validateClientSession(cookies.clientSessionToken)
      }
    }
    
    if (!sessionInfo) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const clientId = sessionInfo.client.id
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const rating = searchParams.get('rating')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const hasComment = searchParams.get('hasComment')
    const qrCodeId = searchParams.get('qrCodeId')
    const search = searchParams.get('search')
    const exportFormat = searchParams.get('export')
    
    // Build where clause
    const whereClause: Prisma.ReviewSubmissionWhereInput = {
      clientId,
    }
    
    // Rating filter
    if (rating) {
      if (rating === '4+') {
        whereClause.rating = { gte: 4 }
      } else if (rating === '3-') {
        whereClause.rating = { lte: 3 }
      } else if (!isNaN(parseInt(rating))) {
        whereClause.rating = parseInt(rating)
      }
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      whereClause.createdAt = {}
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom + 'T00:00:00.000Z')
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
      }
    }
    
    // Comment filter
    if (hasComment === 'true') {
      whereClause.comment = { not: null }
    } else if (hasComment === 'false') {
      whereClause.comment = null
    }
    
    // QR Code filter
    if (qrCodeId) {
      whereClause.qrId = qrCodeId
    }
    
    // Search filter
    if (search) {
      whereClause.comment = {
        contains: search,
        mode: 'insensitive'
      }
    }
    
    // Handle CSV export
    if (exportFormat === 'csv') {
      const reviews = await prisma.reviewSubmission.findMany({
        where: whereClause,
        include: {
          qrCode: {
            select: {
              label: true,
              shortCode: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      // Generate CSV content
      const csvHeaders = [
        'Date',
        'Time',
        'Rating',
        'Comment',
        'QR Code',
        'QR Short Code',
        'Google Clicked',
        'Contact Clicked',
        'Action Taken'
      ]
      
      const csvRows = reviews.map(review => [
        new Date(review.createdAt).toISOString().split('T')[0],
        new Date(review.createdAt).toTimeString().split(' ')[0],
        review.rating.toString(),
        review.comment || '',
        review.qrCode.label,
        review.qrCode.shortCode,
        review.googleClicked ? 'Yes' : 'No',
        review.contactClicked ? 'Yes' : 'No',
        review.clickedCTA === 'google_copy' ? 'Google Copy' :
        review.clickedCTA === 'google_direct' ? 'Google Direct' :
        review.clickedCTA === 'contact' ? 'Contact' : 'None'
      ])
      
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => 
          row.map(field => 
            typeof field === 'string' && (field.includes(',') || field.includes('\n') || field.includes('"'))
              ? `"${field.replace(/"/g, '""')}"` 
              : field
          ).join(',')
        )
      ].join('\n')
      
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="reviews-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }
    
    // Get total count for pagination
    const totalCount = await prisma.reviewSubmission.count({
      where: whereClause
    })
    
    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit)
    const offset = (page - 1) * limit
    
    // Fetch reviews with pagination
    const reviews = await prisma.reviewSubmission.findMany({
      where: whereClause,
      include: {
        qrCode: {
          select: {
            id: true,
            label: true,
            shortCode: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    })
    
    return NextResponse.json({
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        googleClicked: review.googleClicked,
        contactClicked: review.contactClicked,
        clickedCTA: review.clickedCTA,
        qrCode: {
          id: review.qrCode.id,
          label: review.qrCode.label,
          shortCode: review.qrCode.shortCode
        }
      })),
      totalCount,
      totalPages,
      currentPage: page
    })
    
  } catch (error) {
    console.error('Client Reviews API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}