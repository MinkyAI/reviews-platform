import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
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
        updatedAt: true,
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
    
    // Add derived fields for the UI
    const clientsWithStatus = clients.map(client => ({
      ...client,
      status: client._count.qrCodes > 0 ? 'active' : 'pending',
      qrCodeCount: client._count.qrCodes,
      locationCount: client._count.locations,
      reviewCount: client._count.reviewSubmissions,
      lastActivity: new Date(client.updatedAt || client.createdAt).toLocaleDateString()
    }));
    
    return NextResponse.json({
      success: true,
      clients: clientsWithStatus,
      pagination: {
        page: 1,
        limit: 10,
        total: clientsWithStatus.length,
        pages: Math.ceil(clientsWithStatus.length / 10)
      }
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