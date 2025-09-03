import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, contactEmail, contactPhone, googlePlaceId } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    // Check if client with email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email }
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'A client with this email already exists' },
        { status: 400 }
      );
    }

    // Hash the temporary password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create the new client
    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        password: hashedPassword,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        googlePlaceId: googlePlaceId || null,
      },
      include: {
        _count: {
          select: {
            qrCodes: true,
            qrScans: true,
            reviewSubmissions: true,
            locations: true
          }
        }
      }
    });

    // Format the response
    const clientResponse = {
      id: newClient.id,
      name: newClient.name,
      email: newClient.email,
      contactEmail: newClient.contactEmail,
      contactPhone: newClient.contactPhone,
      googlePlaceId: newClient.googlePlaceId,
      status: 'pending',
      qrCodeCount: newClient._count.qrCodes,
      locationCount: newClient._count.locations,
      reviewCount: newClient._count.reviewSubmissions,
      lastActivity: new Date(newClient.createdAt).toLocaleDateString(),
      createdAt: newClient.createdAt
    };

    return NextResponse.json({
      success: true,
      client: clientResponse,
      tempPassword: tempPassword // Send back the temporary password to display to admin
    }, { status: 201 });

  } catch (error) {
    console.error('Create client error:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}