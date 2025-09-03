import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const ctaClickSchema = z.object({
  submissionId: z.string(),
  ctaType: z.enum(['google_copy', 'google_direct', 'contact_email', 'contact_phone'])
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = ctaClickSchema.parse(body)

    const submission = await prisma.submission.findUnique({
      where: { id: validated.submissionId }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    const [ctaClick] = await prisma.$transaction([
      prisma.cTAClick.create({
        data: {
          submissionId: validated.submissionId,
          ctaType: validated.ctaType
        }
      }),
      prisma.submission.update({
        where: { id: validated.submissionId },
        data: {
          googleClicked: validated.ctaType === 'google_copy' || validated.ctaType === 'google_direct' || submission.googleClicked,
          contactClicked: validated.ctaType === 'contact_email' || validated.ctaType === 'contact_phone' || submission.contactClicked,
          clickedCTA: validated.ctaType === 'google_copy' ? 'google_copy' :
                      validated.ctaType === 'google_direct' ? 'google_direct' :
                      validated.ctaType === 'contact_email' || validated.ctaType === 'contact_phone' ? 'contact' :
                      submission.clickedCTA
        }
      })
    ])

    return NextResponse.json({
      success: true,
      ctaClickId: ctaClick.id
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('CTA click tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track CTA click' },
      { status: 500 }
    )
  }
}