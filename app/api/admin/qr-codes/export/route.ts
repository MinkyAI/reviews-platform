import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateQRCode, generateQRCodesPDF, QRCodeData, PDFLayoutOptions } from '@/lib/qr-utils';
import { z } from 'zod';

const prisma = new PrismaClient();

const exportQRCodesSchema = z.object({
  qrCodeIds: z.array(z.string()).optional(),
  batchId: z.string().optional(),
  clientId: z.string().min(1, 'Client ID is required'),
  format: z.enum(['A4', 'Letter']).default('A4'),
  orientation: z.enum(['portrait', 'landscape']).default('portrait'),
  codesPerRow: z.number().min(1).max(6).default(3),
  codesPerPage: z.number().min(1).max(20).default(9),
  includeUrl: z.boolean().default(true),
  includeLabel: z.boolean().default(true),
  exportType: z.enum(['pdf', 'images']).default('pdf')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = exportQRCodesSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }
    
    const {
      qrCodeIds,
      batchId,
      clientId,
      format,
      orientation,
      codesPerRow,
      codesPerPage,
      includeUrl,
      includeLabel,
      exportType
    } = validation.data;
    
    if (!qrCodeIds && !batchId) {
      return NextResponse.json(
        { error: 'Either qrCodeIds or batchId must be provided' },
        { status: 400 }
      );
    }
    
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        brandColors: true,
        logoUrl: true
      }
    });
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    const whereClause: Record<string, unknown> = { clientId };
    
    if (batchId) {
      whereClause.batchId = batchId;
    } else if (qrCodeIds) {
      whereClause.id = { in: qrCodeIds };
    }
    
    const qrCodes = await prisma.qrCode.findMany({
      where: whereClause,
      include: {
        location: {
          select: { name: true, address: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    if (qrCodes.length === 0) {
      return NextResponse.json(
        { error: 'No QR codes found' },
        { status: 404 }
      );
    }
    
    const qrCodeData: QRCodeData[] = await Promise.all(
      qrCodes.map(async (qr) => {
        const { dataUrl } = await generateQRCode(qr.shortCode, {
          type: 'image/png',
          width: 256,
          color: client.brandColors ? {
            dark: (client.brandColors as Record<string, string>)?.primary || '#000000',
            light: '#FFFFFF'
          } : undefined
        });
        
        return {
          id: qr.id,
          shortCode: qr.shortCode,
          url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/r/${qr.shortCode}`,
          label: qr.label,
          qrCodeDataUrl: dataUrl
        };
      })
    );
    
    if (exportType === 'images') {
      return NextResponse.json({
        success: true,
        qrCodes: qrCodeData,
        count: qrCodeData.length
      });
    }
    
    const pdfOptions: PDFLayoutOptions = {
      format,
      orientation,
      codesPerRow,
      codesPerPage,
      includeUrl,
      includeLabel,
      brandColors: client.brandColors ? {
        primary: (client.brandColors as Record<string, string>)?.primary
      } : undefined,
      logo: client.logoUrl || undefined
    };
    
    const pdfBuffer = await generateQRCodesPDF(
      qrCodeData,
      client.name,
      pdfOptions
    );
    
    const filename = batchId 
      ? `qr-codes-batch-${batchId}-${Date.now()}.pdf`
      : `qr-codes-${client.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    
    return new Response(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.byteLength.toString()
      }
    });
    
  } catch (error) {
    console.error('QR codes export error:', error);
    return NextResponse.json(
      { error: 'Failed to export QR codes' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    const clientId = searchParams.get('clientId');
    
    // Build where clause - if no parameters, get all QR codes
    const whereClause: Record<string, unknown> = {};
    
    if (batchId) {
      whereClause.batchId = batchId;
    }
    if (clientId && clientId !== 'all') {
      whereClause.clientId = clientId;
    }
    // If no parameters or clientId === 'all', whereClause remains empty to fetch all
    
    const qrCodes = await prisma.qrCode.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            name: true,
            brandColors: true,
            logoUrl: true
          }
        },
        location: {
          select: {
            name: true,
            address: true
          }
        },
        _count: {
          select: {
            qrScans: true,
            reviewSubmissions: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    if (qrCodes.length === 0) {
      return NextResponse.json(
        { error: 'No QR codes found' },
        { status: 404 }
      );
    }
    
    const qrCodesWithStats = qrCodes.map(qr => ({
      id: qr.id,
      shortCode: qr.shortCode,
      label: qr.label,
      status: qr.status,
      batchId: qr.batchId,
      clientId: qr.clientId,
      createdAt: qr.createdAt,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/r/${qr.shortCode}`,
      client: qr.client,
      location: qr.location,
      stats: {
        totalScans: qr._count.qrScans,
        totalSubmissions: qr._count.reviewSubmissions
      }
    }));
    
    const groupedByBatch = qrCodesWithStats.reduce((acc, qr) => {
      const key = qr.batchId || 'individual';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(qr);
      return acc;
    }, {} as Record<string, typeof qrCodesWithStats>);
    
    return NextResponse.json({
      success: true,
      qrCodes: qrCodesWithStats,
      groupedByBatch,
      count: qrCodesWithStats.length,
      batches: Object.keys(groupedByBatch).filter(key => key !== 'individual').length
    });
    
  } catch (error) {
    console.error('Get QR codes for export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}