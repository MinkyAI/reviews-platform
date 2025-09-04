import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import sharp from 'sharp'

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

async function processLogo(file: File): Promise<string> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Process image: resize, optimize, and convert to standard format
    const processedBuffer = await sharp(buffer)
      .resize(200, 200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({ quality: 90 })
      .toBuffer()

    // In a real implementation, you'd upload this to a storage service like S3
    // For now, we'll convert to base64 data URL (not recommended for production)
    const base64 = processedBuffer.toString('base64')
    return `data:image/png;base64,${base64}`
  } catch (error) {
    throw new Error('Failed to process logo image')
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate client authentication
    const clientId = await validateClientToken(request)
    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch client settings
    const client = await prisma.client.findUnique({
      where: {
        id: clientId
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactEmail: true,
        contactPhone: true,
        logoUrl: true,
        brandColors: true,
        createdAt: true
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      settings: {
        ...client,
        status: 'active', // In a real implementation, this would come from the database
        createdAt: client.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Validate client authentication
    const clientId = await validateClientToken(request)
    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type')
    let updateData: {
      contactEmail?: string
      contactPhone?: string
      brandColors?: any
      logoUrl?: string
    } = {}

    if (contentType?.includes('multipart/form-data')) {
      // Handle form data with file upload
      const formData = await request.formData()
      
      const contactEmail = formData.get('contactEmail') as string
      const contactPhone = formData.get('contactPhone') as string
      const brandColorsStr = formData.get('brandColors') as string
      const logoFile = formData.get('logo') as File

      if (contactEmail !== null) updateData.contactEmail = contactEmail
      if (contactPhone !== null) updateData.contactPhone = contactPhone
      
      if (brandColorsStr) {
        try {
          updateData.brandColors = JSON.parse(brandColorsStr)
        } catch (error) {
          return NextResponse.json({ error: 'Invalid brand colors format' }, { status: 400 })
        }
      }

      if (logoFile && logoFile.size > 0) {
        if (logoFile.size > 2 * 1024 * 1024) { // 2MB limit
          return NextResponse.json({ error: 'Logo file too large. Maximum size is 2MB.' }, { status: 400 })
        }

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        if (!allowedTypes.includes(logoFile.type)) {
          return NextResponse.json({ 
            error: 'Invalid file type. Only PNG, JPG, and WebP are allowed.' 
          }, { status: 400 })
        }

        try {
          updateData.logoUrl = await processLogo(logoFile)
        } catch (error) {
          return NextResponse.json({ error: 'Failed to process logo image' }, { status: 400 })
        }
      }
    } else {
      // Handle JSON request
      const body = await request.json()
      
      if (body.contactEmail !== undefined) updateData.contactEmail = body.contactEmail
      if (body.contactPhone !== undefined) updateData.contactPhone = body.contactPhone
      if (body.brandColors !== undefined) updateData.brandColors = body.brandColors
    }

    // Validate email format if provided
    if (updateData.contactEmail && updateData.contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updateData.contactEmail)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }
    }

    // Validate phone format if provided (basic validation)
    if (updateData.contactPhone && updateData.contactPhone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      const cleanPhone = updateData.contactPhone.replace(/[\s\-\(\)]/g, '')
      if (!phoneRegex.test(cleanPhone)) {
        return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 })
      }
    }

    // Update client settings
    const updatedClient = await prisma.client.update({
      where: {
        id: clientId
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        contactEmail: true,
        contactPhone: true,
        logoUrl: true,
        brandColors: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      settings: {
        ...updatedClient,
        status: 'active',
        createdAt: updatedClient.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}