import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import crypto from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16)
}

export function generateSessionId(): string {
  return crypto.randomBytes(16).toString('hex')
}

export function buildGoogleReviewUrl(placeId: string, lang?: string): string {
  const baseUrl = 'https://search.google.com/local/writereview'
  const params = new URLSearchParams({ placeid: placeId })
  
  if (lang) {
    params.append('hl', lang)
  }
  
  return `${baseUrl}?${params.toString()}`
}