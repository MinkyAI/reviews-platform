'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StarRating } from '@/components/reviews/StarRating'
import { CommentBox } from '@/components/reviews/CommentBox'
import { OutcomePositive } from '@/components/reviews/OutcomePositive'
import { OutcomeNegative } from '@/components/reviews/OutcomeNegative'
import type { QRCodeData, ReviewSubmission, CTAType, Client } from '@/types/reviews'

interface PageProps {
  params: Promise<{
    code: string
  }>
}

type ViewState = 'loading' | 'form' | 'positive' | 'negative' | 'error'

export default function ReviewPage({ params }: PageProps) {
  const [code, setCode] = useState<string>('')
  const [client, setClient] = useState<Client | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [view, setView] = useState<ViewState>('loading')
  const [submissionData, setSubmissionData] = useState<ReviewSubmission | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    params.then(({ code: codeParam }) => {
      setCode(codeParam)
      loadQRCodeData(codeParam)
    })
  }, [params])

  const loadQRCodeData = async (qrCode: string) => {
    try {
      const response = await fetch(`/api/reviews?qrCode=${encodeURIComponent(qrCode)}`)
      const data: QRCodeData = await response.json()
      
      if (!data.success) {
        setError('This review link is no longer available')
        setView('error')
        return
      }
      
      setClient(data.client)
      setView('form')
    } catch {
      setError('Unable to load review form. Please try again later.')
      setView('error')
    }
  }

  const handleSubmitReview = async () => {
    if (rating === 0 || !client) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrCode: code,
          rating,
          comment: comment.trim() || undefined,
          sessionId
        })
      })
      
      const data: ReviewSubmission = await response.json()
      
      if (!data.success) {
        setError('Failed to submit review. Please try again.')
        setIsSubmitting(false)
        return
      }
      
      setSubmissionData(data)
      setSessionId(data.sessionId)
      
      // Show appropriate outcome based on rating
      setView(rating >= 4 ? 'positive' : 'negative')
    } catch {
      setError('Unable to submit review. Please check your connection and try again.')
      setIsSubmitting(false)
    }
  }

  const handleCTAClick = async (ctaType: CTAType) => {
    if (!submissionData?.submissionId) return
    
    try {
      await fetch('/api/cta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submissionData.submissionId,
          ctaType
        })
      })
    } catch (err) {
      console.error('Failed to track CTA click:', err)
    }
  }

  const canSubmit = rating > 0 && !isSubmitting
  const showCommentBox = rating > 0

  if (view === 'loading') {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Loader2 className="w-8 h-8 text-[#007AFF] animate-spin mb-4" />
        <p className="text-gray-600 text-sm">Loading review form...</p>
      </motion.div>
    )
  }

  if (view === 'error') {
    return (
      <motion.div
        className={cn(
          "p-8 rounded-2xl text-center",
          "bg-white/80 backdrop-blur-xl border border-red-200/60",
          "shadow-[0_8px_32px_rgba(239,68,68,0.08)]"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          {error || 'This review link is no longer available.'}
        </p>
      </motion.div>
    )
  }

  if (view === 'positive' && client && submissionData) {
    return (
      <OutcomePositive
        client={client}
        rating={rating}
        comment={comment}
        onCTAClick={handleCTAClick}
      />
    )
  }

  if (view === 'negative' && client && submissionData) {
    return (
      <OutcomeNegative
        client={client}
        rating={rating}
        comment={comment}
        onCTAClick={handleCTAClick}
      />
    )
  }

  if (view === 'form' && client) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Header Card */}
        <motion.div
          className={cn(
            "p-6 rounded-2xl text-center",
            "bg-white/80 backdrop-blur-xl border border-[#E5E5E7]/60",
            "shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
          )}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.1,
            duration: 0.5,
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
        >
          {client.logoUrl && (
            <motion.img
              src={client.logoUrl}
              alt={`${client.name} logo`}
              className="w-16 h-16 mx-auto mb-4 rounded-xl object-cover shadow-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.3,
                type: "spring",
                stiffness: 400,
                damping: 15
              }}
            />
          )}
          
          <motion.h1
            className="text-2xl font-semibold text-gray-900 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            How was your experience?
          </motion.h1>
          
          <motion.p
            className="text-gray-600 text-sm leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            Your honest feedback helps {client.name} serve you better
          </motion.p>
        </motion.div>

        {/* Rating Section */}
        <motion.div
          className={cn(
            "p-6 rounded-2xl",
            "bg-white/80 backdrop-blur-xl border border-[#E5E5E7]/60",
            "shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
          )}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.2,
            duration: 0.5,
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
        >
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star className="w-5 h-5 text-[#007AFF]" fill="currentColor" />
              <span className="text-lg font-medium text-gray-900">Rate your visit</span>
            </div>
            <p className="text-gray-500 text-sm">Tap the stars below</p>
          </motion.div>

          <motion.div
            className="flex justify-center mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.6,
              duration: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            <StarRating
              value={rating}
              onChange={setRating}
              size="large"
              animated={true}
            />
          </motion.div>

          <AnimatePresence>
            {rating > 0 && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-[#007AFF] text-sm font-medium">
                  {rating === 5 && "Amazing! ⭐"}
                  {rating === 4 && "Great! ⭐"}
                  {rating === 3 && "Good ⭐"}
                  {rating === 2 && "Could be better"}
                  {rating === 1 && "We can do better"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Comment Section */}
        <AnimatePresence>
          {showCommentBox && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
              className="overflow-hidden"
            >
              <motion.div
                className={cn(
                  "p-6 rounded-2xl",
                  "bg-white/80 backdrop-blur-xl border border-[#E5E5E7]/60",
                  "shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
                )}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.1,
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
              >
                <motion.div
                  className="mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Tell us more (optional)
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Share details that would help others
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <CommentBox
                    value={comment}
                    onChange={setComment}
                    placeholder="Share what made your experience special..."
                    maxLength={500}
                    disabled={isSubmitting}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <AnimatePresence>
          {canSubmit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.button
                onClick={handleSubmitReview}
                disabled={!canSubmit}
                className={cn(
                  "w-full p-4 rounded-xl font-semibold text-white text-center",
                  "bg-gradient-to-r from-[#007AFF] to-[#0051D5]",
                  "hover:from-[#0056B3] hover:to-[#003C9B]",
                  "shadow-[0_4px_16px_rgba(0,122,255,0.3)]",
                  "hover:shadow-[0_8px_24px_rgba(0,122,255,0.4)]",
                  "focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30",
                  "transition-all duration-200 active:scale-[0.98]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                )}
                whileHover={canSubmit ? { y: -2 } : {}}
                whileTap={canSubmit ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center justify-center gap-3">
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : null}
                  <span>
                    {isSubmitting ? 'Submitting...' : 'Share your review →'}
                  </span>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className={cn(
                "p-4 rounded-xl border border-red-200/60",
                "bg-red-50/80 backdrop-blur-xl text-red-700 text-sm text-center"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          className="text-center text-xs text-gray-400 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          Your feedback is secure and helps improve the experience for everyone
        </motion.p>
      </motion.div>
    )
  }

  return null
}