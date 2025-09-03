import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        brandColors: true,
        logoUrl: true,
        googlePlaceId: true,
        contactEmail: true,
        contactPhone: true,
        createdAt: true,
        _count: {
          select: {
            qrCodes: true,
            qrScans: true,
            reviewSubmissions: true,
            locations: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      clients,
      count: clients.length
    });
    
  } catch (error) {
    console.error('Get clients error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}