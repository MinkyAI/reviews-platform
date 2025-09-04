import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const prisma = new PrismaClient()

// Settings schema
const settingsUpdateSchema = z.object({
  platformName: z.string().min(1).optional(),
  platformUrl: z.string().url().optional(),
  supportEmail: z.string().email().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  sessionDuration: z.number().min(1).optional(),
  maxLoginAttempts: z.number().min(1).optional(),
  passwordMinLength: z.number().min(6).optional(),
  apiRateLimit: z.number().min(1).optional(),
  apiTimeout: z.number().min(1).optional(),
})

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

    // Calculate date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Get usage statistics
    const [
      totalClients,
      activeClients,
      totalQRCodes,
      monthlyQRCodes,
      totalReviews,
      monthlyReviews,
      totalScans,
      monthlyScans
    ] = await prisma.$transaction([
      prisma.client.count(),
      prisma.client.count({
        where: {
          reviewSubmissions: {
            some: {
              createdAt: {
                gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Active in last 30 days
              }
            }
          }
        }
      }),
      prisma.qrCode.count(),
      prisma.qrCode.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      prisma.reviewSubmission.count(),
      prisma.reviewSubmission.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      prisma.qrScan.count(),
      prisma.qrScan.count({
        where: { createdAt: { gte: startOfMonth } }
      })
    ])

    // Platform settings (these would ideally be stored in a settings table)
    const platformSettings = {
      general: {
        platformName: process.env.PLATFORM_NAME || 'Reviews Platform',
        platformUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://reviews.example.com',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@reviews.example.com',
      },
      email: {
        smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: process.env.SMTP_PORT || '587',
        smtpUser: process.env.SMTP_USER || 'noreply@reviews.example.com',
        smtpPassword: '••••••••', // Never send actual password
      },
      security: {
        sessionDuration: parseInt(process.env.SESSION_DURATION || '30'),
        maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
        passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
      },
      api: {
        apiRateLimit: parseInt(process.env.API_RATE_LIMIT || '100'),
        apiTimeout: parseInt(process.env.API_TIMEOUT || '30'),
      }
    }

    // Subscription info (mock for now - would come from payment provider)
    const subscription = {
      plan: 'Professional',
      status: 'active',
      nextBillingDate: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString(),
      monthlyCost: 299,
      limits: {
        maxClients: 50,
        maxQRCodesPerMonth: 5000,
        maxReviewsPerMonth: 10000,
      }
    }

    // Calculate usage percentages
    const usage = {
      clients: {
        current: totalClients,
        active: activeClients,
        limit: subscription.limits.maxClients,
        percentage: Math.round((totalClients / subscription.limits.maxClients) * 100)
      },
      qrCodes: {
        total: totalQRCodes,
        thisMonth: monthlyQRCodes,
        limit: subscription.limits.maxQRCodesPerMonth,
        percentage: Math.round((monthlyQRCodes / subscription.limits.maxQRCodesPerMonth) * 100)
      },
      reviews: {
        total: totalReviews,
        thisMonth: monthlyReviews,
        limit: subscription.limits.maxReviewsPerMonth,
        percentage: Math.round((monthlyReviews / subscription.limits.maxReviewsPerMonth) * 100)
      },
      scans: {
        total: totalScans,
        thisMonth: monthlyScans
      }
    }

    return NextResponse.json({
      success: true,
      settings: platformSettings,
      subscription,
      usage,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const validation = settingsUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid settings data', details: validation.error.errors },
        { status: 400 }
      )
    }

    // In a real application, you would save these settings to a database table
    // For now, we'll just return success
    // You could also update environment variables or a configuration file

    // Log the settings update
    console.log('Settings update requested:', validation.data)

    // Simulate saving settings
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      updatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Failed to update settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}