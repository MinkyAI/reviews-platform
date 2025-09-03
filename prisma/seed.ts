import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create a test client (restaurant)
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const client = await prisma.client.create({
    data: {
      name: 'The Gourmet Kitchen',
      email: 'test@restaurant.com',
      password: hashedPassword,
      googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4', // Example Place ID
      contactEmail: 'contact@gourmetkitchen.com',
      contactPhone: '+1 (555) 123-4567',
      logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      brandColors: {
        primary: '#007AFF',
        secondary: '#34C759',
        accent: '#FF9500'
      }
    }
  })

  console.log('✅ Created client:', client.name)

  // Create a location
  const location = await prisma.location.create({
    data: {
      clientId: client.id,
      name: 'Main Street Location',
      address: '123 Main St',
      city: 'San Francisco',
      country: 'USA',
      postalCode: '94102'
    }
  })

  console.log('✅ Created location:', location.name)

  // Create multiple QR codes
  const qrCodes = await Promise.all([
    prisma.qrCode.create({
      data: {
        clientId: client.id,
        locationId: location.id,
        label: 'Table 1',
        shortCode: 'TEST123',
        batchId: 'batch-001',
        status: 'active'
      }
    }),
    prisma.qrCode.create({
      data: {
        clientId: client.id,
        locationId: location.id,
        label: 'Table 2',
        shortCode: 'TABLE02',
        batchId: 'batch-001',
        status: 'active'
      }
    }),
    prisma.qrCode.create({
      data: {
        clientId: client.id,
        locationId: location.id,
        label: 'Bar Area',
        shortCode: 'BAR001',
        batchId: 'batch-001',
        status: 'active'
      }
    }),
    prisma.qrCode.create({
      data: {
        clientId: client.id,
        locationId: location.id,
        label: 'Outdoor Patio',
        shortCode: 'PATIO01',
        batchId: 'batch-002',
        status: 'active'
      }
    })
  ])

  console.log(`✅ Created ${qrCodes.length} QR codes`)

  // Create some sample scans and reviews for analytics
  const testQrCode = qrCodes[0]
  
  // Create a few sample reviews with different ratings
  const sampleReviews = [
    { rating: 5, comment: 'Absolutely amazing experience! The food was incredible and the service was top-notch.' },
    { rating: 5, comment: 'Best restaurant in town! Will definitely come back.' },
    { rating: 4, comment: 'Great food, lovely atmosphere. Just a bit noisy.' },
    { rating: 3, comment: 'Good but not exceptional. Expected more for the price.' },
    { rating: 5, comment: 'Perfect evening! Everything was wonderful.' },
  ]

  for (const review of sampleReviews) {
    const scan = await prisma.qrScan.create({
      data: {
        qrId: testQrCode.id,
        clientId: client.id,
        sessionId: `session-${Math.random().toString(36).substring(7)}`,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        ipHash: Math.random().toString(36).substring(2, 18)
      }
    })

    await prisma.reviewSubmission.create({
      data: {
        qrId: testQrCode.id,
        clientId: client.id,
        scanId: scan.id,
        rating: review.rating,
        comment: review.comment,
        googleClicked: review.rating === 5 ? Math.random() > 0.5 : false,
        clickedCTA: review.rating === 5 ? 'google_copy' : 'none'
      }
    })
  }

  console.log('✅ Created sample reviews')
  
  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📱 Test QR Codes:')
  console.log('   - TEST123 (Table 1)')
  console.log('   - TABLE02 (Table 2)')
  console.log('   - BAR001 (Bar Area)')
  console.log('   - PATIO01 (Outdoor Patio)')
  console.log('\n🔑 Test Login:')
  console.log('   Email: test@restaurant.com')
  console.log('   Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })