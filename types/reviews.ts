export interface BrandColors {
  primary?: string
  secondary?: string
  accent?: string
}

export interface Client {
  name: string
  googlePlaceId: string | null
  contactEmail: string | null
  contactPhone: string | null
  logoUrl: string | null
  brandColors: BrandColors | null
}

export interface ReviewSubmission {
  success: boolean
  submissionId: string
  sessionId: string
  client: Client
  rating: number
}

export interface QRCodeData {
  success: boolean
  client: Client
  qrCodeId: string
}

export type CTAType = 'google_copy' | 'google_direct' | 'contact_email' | 'contact_phone'

export interface CommentBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  disabled?: boolean
}

export interface OutcomeProps {
  client: Client
  rating: number
  comment?: string
  onCTAClick: (ctaType: CTAType) => void
}