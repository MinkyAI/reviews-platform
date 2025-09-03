import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateStatusSchema = z.object({
  status: z.enum(['active', 'archived'])
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const validation = updateStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }
    
    const { status } = validation.data;
    
    const qrCode = await prisma.qrCode.findUnique({
      where: { id }
    });
    
    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }
    
    const updatedQRCode = await prisma.qrCode.update({
      where: { id },
      data: { status },
      include: {
        client: {
          select: { name: true }
        },
        location: {
          select: { name: true }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      qrCode: updatedQRCode
    });
    
  } catch (error) {
    console.error('Update QR code status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}