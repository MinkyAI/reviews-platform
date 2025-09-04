import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import { generateQRCodeBatch, validateQRCodeData } from '@/lib/qr-utils';
import { z } from 'zod';

const prisma = new PrismaClient();

const generateQRBatchSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  locationId: z.string().optional(),
  count: z.number().min(1).max(100, 'Maximum 100 QR codes per batch'),
  labelPrefix: z.string().min(1, 'Label prefix is required'),
  batchName: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = generateQRBatchSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }
    
    const { clientId, locationId, count, labelPrefix, batchName } = validation.data;
    
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    if (locationId) {
      const location = await prisma.location.findFirst({
        where: {
          id: locationId,
          clientId
        }
      });
      
      if (!location) {
        return NextResponse.json(
          { error: 'Location not found or does not belong to this client' },
          { status: 404 }
        );
      }
    }
    
    const batchId = nanoid(12);
    // const qrCodeData: QRCodeData[] = [];
    
    try {
      const generatedCodes = await generateQRCodeBatch({
        count,
        labelPrefix,
        clientId,
        locationId,
        batchId
      });
      
      const validationErrors = validateQRCodeData(generatedCodes);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: 'QR code validation failed', details: validationErrors },
          { status: 400 }
        );
      }
      
      const qrCodeRecords = generatedCodes.map(qr => ({
        clientId,
        locationId: locationId || null,
        label: qr.label,
        shortCode: qr.shortCode,
        batchId,
        status: 'active' as const
      }));
      
      await prisma.qrCode.createMany({
        data: qrCodeRecords
      });
      
      const createdQRCodes = await prisma.qrCode.findMany({
        where: { batchId },
        include: {
          client: {
            select: { name: true, brandColors: true, logoUrl: true }
          },
          location: {
            select: { name: true, address: true }
          }
        }
      });
      
      const qrCodesWithData = createdQRCodes.map((qr, index) => ({
        ...qr,
        qrCodeDataUrl: generatedCodes[index]?.qrCodeDataUrl,
        url: generatedCodes[index]?.url
      }));
      
      return NextResponse.json({
        success: true,
        batchId,
        batchName: batchName || `Batch ${new Date().toLocaleDateString()}`,
        count: createdQRCodes.length,
        qrCodes: qrCodesWithData,
        client: {
          name: client.name,
          brandColors: client.brandColors,
          logoUrl: client.logoUrl
        }
      });
      
    } catch (generationError) {
      console.error('QR code generation error:', generationError);
      return NextResponse.json(
        { error: 'Failed to generate QR codes' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('QR batch generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const skip = (page - 1) * limit;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }
    
    const where = {
      clientId,
      batchId: { not: null }
    };
    
    const [batches, totalCount] = await Promise.all([
      prisma.qrCode.findMany({
        where,
        select: {
          batchId: true,
          createdAt: true,
          client: {
            select: { name: true }
          },
          location: {
            select: { name: true }
          }
        },
        distinct: ['batchId'],
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.qrCode.groupBy({
        by: ['batchId'],
        where,
        _count: true
      })
    ]);
    
    const batchesWithCounts = await Promise.all(
      batches.map(async (batch) => {
        const qrCodeCount = await prisma.qrCode.count({
          where: { batchId: batch.batchId }
        });
        
        const activeCount = await prisma.qrCode.count({
          where: {
            batchId: batch.batchId,
            status: 'active'
          }
        });
        
        const totalScans = await prisma.qrScan.count({
          where: {
            qrCode: {
              batchId: batch.batchId
            }
          }
        });
        
        return {
          batchId: batch.batchId,
          createdAt: batch.createdAt,
          clientId: clientId,
          clientName: batch.client.name,
          locationName: batch.location?.name,
          totalCodes: qrCodeCount,
          activeCodes: activeCount,
          totalScans
        };
      })
    );
    
    return NextResponse.json({
      batches: batchesWithCounts,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        pages: Math.ceil(totalCount.length / limit)
      }
    });
    
  } catch (error) {
    console.error('Get QR batches error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}