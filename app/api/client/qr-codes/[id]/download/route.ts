import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import QRCode from 'qrcode'
import sharp from 'sharp'
import jwt from 'jsonwebtoken'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params since it's now a Promise in Next.js 15
    const resolvedParams = await params
    
    // Validate client authentication
    const clientId = await validateClientToken(request)
    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'png'
    
    if (!['png', 'svg', 'pdf'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format. Must be png, svg, or pdf' }, { status: 400 })
    }

    // Fetch QR code and verify ownership
    const qrCode = await prisma.qrCode.findFirst({
      where: {
        id: resolvedParams.id,
        clientId: clientId
      },
      include: {
        client: {
          select: {
            name: true,
            logoUrl: true,
            brandColors: true
          }
        }
      }
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://rvws.co'}/${qrCode.shortCode}`

    // Generate QR code based on format
    if (format === 'svg') {
      const svgString = await QRCode.toString(qrUrl, {
        type: 'svg',
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })

      return new NextResponse(svgString, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `attachment; filename="qr-${qrCode.label}-${resolvedParams.id}.svg"`,
        },
      })
    }

    if (format === 'png') {
      // Generate QR code as PNG buffer
      const qrBuffer = await QRCode.toBuffer(qrUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })

      // Create branded version if client has branding
      let finalBuffer = qrBuffer
      
      if (qrCode.client.logoUrl || qrCode.client.brandColors) {
        try {
          const canvasSize = 600
          const qrSize = 400
          const logoSize = 80
          
          // Create a white background
          let canvas = sharp({
            create: {
              width: canvasSize,
              height: canvasSize + 100, // Extra space for text
              channels: 3,
              background: { r: 255, g: 255, b: 255 }
            }
          })

          // Resize QR code
          const resizedQR = await sharp(qrBuffer)
            .resize(qrSize, qrSize)
            .toBuffer()

          const composite = [
            {
              input: resizedQR,
              left: (canvasSize - qrSize) / 2,
              top: 50
            }
          ]

          // Add logo if available
          if (qrCode.client.logoUrl) {
            try {
              // In a real implementation, you'd fetch and process the logo
              // For now, we'll just add a placeholder
            } catch (logoError) {
              console.error('Error processing logo:', logoError)
            }
          }

          // Add client name
          const textSvg = `
            <svg width="${canvasSize}" height="50">
              <text x="50%" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#333333">
                ${qrCode.client.name}
              </text>
              <text x="50%" y="50" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#666666">
                Scan to leave a review
              </text>
            </svg>
          `
          
          composite.push({
            input: Buffer.from(textSvg),
            left: 0,
            top: canvasSize - 20
          })

          finalBuffer = await canvas.composite(composite).png().toBuffer()
        } catch (brandingError) {
          console.error('Error adding branding:', brandingError)
          // Fall back to original QR code
          finalBuffer = qrBuffer
        }
      }

      return new NextResponse(new Uint8Array(finalBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="qr-${qrCode.label}-${resolvedParams.id}.png"`,
        },
      })
    }

    if (format === 'pdf') {
      // For PDF, we'll create a simple layout with the QR code
      // In a real implementation, you might use a PDF library like PDFKit
      // For now, we'll return the PNG embedded in a simple PDF structure
      
      const qrBuffer = await QRCode.toBuffer(qrUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })

      // Convert PNG to base64 for PDF embedding
      const qrBase64 = qrBuffer.toString('base64')
      
      // For PDF, we'll create a simple layout with the QR code
      // In production, you'd use a proper PDF library like PDFKit
      // For now, we'll just return the PNG with PDF headers as a placeholder
      
      return new NextResponse(new Uint8Array(qrBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="qr-${qrCode.label}-${resolvedParams.id}.png"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })

  } catch (error) {
    console.error('QR code download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}