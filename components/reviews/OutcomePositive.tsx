'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Copy, ExternalLink, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OutcomeProps } from '@/types/reviews'

export function OutcomePositive({ client, rating, comment, onCTAClick }: OutcomeProps) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Trigger confetti after component mounts
    const timer = setTimeout(() => {
      triggerConfetti()
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const triggerConfetti = () => {
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000
    }

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#007AFF', '#34C759', '#FFD700', '#FF9500']
    })

    fire(0.2, {
      spread: 60,
      colors: ['#007AFF', '#34C759', '#FFD700', '#FF9500']
    })

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#007AFF', '#34C759', '#FFD700', '#FF9500']
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#007AFF', '#34C759', '#FFD700', '#FF9500']
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#007AFF', '#34C759', '#FFD700', '#FF9500']
    })
  }

  const copyComment = async () => {
    if (!comment) return
    
    try {
      await navigator.clipboard.writeText(comment)
      setCopied(true)
      onCTAClick('google_copy')
      
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy comment:', err)
    }
  }

  const openGoogleReviews = () => {
    if (!client.googlePlaceId) return
    
    const googleUrl = `https://www.google.com/maps/place/?q=place_id:${client.googlePlaceId}&openReviewDialog=true`
    window.open(googleUrl, '_blank')
    onCTAClick('google_direct')
  }

  const getSuccessMessage = () => {
    if (rating === 5) {
      return "We're thrilled you loved it!"
    } else if (rating === 4) {
      return "Thank you for the great review!"
    }
    return "Thanks for your positive feedback!"
  }

  if (!mounted) {
    return null
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {/* Success Message */}
      <motion.div
        className={cn(
          "text-center p-6 rounded-2xl",
          "bg-gradient-to-br from-[#34C759]/5 to-[#34C759]/10",
          "border border-[#34C759]/20",
          "backdrop-blur-xl shadow-[0_8px_32px_rgba(52,199,89,0.12)]"
        )}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.2,
          duration: 0.5,
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
      >
        <motion.div
          className={cn(
            "w-16 h-16 mx-auto mb-4 rounded-full",
            "bg-gradient-to-br from-[#34C759] to-[#30D158]",
            "flex items-center justify-center shadow-lg"
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.4,
            duration: 0.3,
            type: "spring",
            stiffness: 400,
            damping: 15
          }}
        >
          <Check className="w-8 h-8 text-white" strokeWidth={3} />
        </motion.div>
        
        <motion.h2
          className="text-xl font-semibold text-gray-900 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {getSuccessMessage()}
        </motion.h2>
        
        <motion.p
          className="text-gray-600 text-sm leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          Your feedback helps {client.name} continue delivering amazing experiences.
        </motion.p>
      </motion.div>

      {/* Copy Comment Button */}
      <AnimatePresence>
        {comment && comment.trim() && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeInOut"
            }}
            className="overflow-hidden"
          >
            <motion.button
              onClick={copyComment}
              className={cn(
                "w-full p-4 rounded-xl text-left transition-all duration-200",
                "bg-white/80 backdrop-blur-xl border border-[#E5E5E7]/60",
                "hover:bg-white/95 hover:border-[#007AFF]/20",
                "hover:shadow-[0_8px_24px_rgba(0,122,255,0.08)]",
                "focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF]/30",
                "active:scale-[0.98] group"
              )}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              disabled={copied}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  "bg-gradient-to-br from-[#007AFF]/10 to-[#007AFF]/5",
                  "group-hover:from-[#007AFF]/15 group-hover:to-[#007AFF]/10",
                  "transition-all duration-200"
                )}>
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="w-5 h-5 text-[#34C759]" strokeWidth={2.5} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Copy className="w-5 h-5 text-[#007AFF]" strokeWidth={2} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm mb-1">
                    {copied ? 'Comment copied!' : 'Copy your comment'}
                  </p>
                  <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                    {copied ? 'Ready to paste on Google Reviews' : 'Tap to copy for Google Reviews'}
                  </p>
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Review Button */}
      {client.googlePlaceId && (
        <motion.button
          onClick={openGoogleReviews}
          className={cn(
            "w-full p-4 rounded-xl text-center transition-all duration-200",
            "bg-gradient-to-r from-[#007AFF] to-[#0051D5]",
            "hover:from-[#0056B3] hover:to-[#003C9B]",
            "shadow-[0_4px_16px_rgba(0,122,255,0.3)]",
            "hover:shadow-[0_8px_24px_rgba(0,122,255,0.4)]",
            "focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30",
            "active:scale-[0.98] group text-white font-semibold"
          )}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.7,
            duration: 0.4,
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <ExternalLink className="w-5 h-5" strokeWidth={2} />
            <span>Leave Google Review →</span>
          </div>
        </motion.button>
      )}

      {/* Subtle footer text */}
      <motion.p
        className="text-center text-xs text-gray-400 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        Sharing your experience helps other customers find great places like {client.name}
      </motion.p>
    </motion.div>
  )
}