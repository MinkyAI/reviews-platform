'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Mail, Phone, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OutcomeProps } from '@/types/reviews'

export function OutcomeNegative({ client, rating, comment, onCTAClick }: OutcomeProps) {
  const [selectedContact, setSelectedContact] = useState<string | null>(null)

  const getMessage = () => {
    if (rating === 1) {
      return {
        title: "We're truly sorry to hear this",
        subtitle: "Your experience doesn't reflect our standards, and we want to make it right immediately."
      }
    } else if (rating === 2) {
      return {
        title: "We know we can do better",
        subtitle: "This isn't the experience we want for you. Let's talk about how we can improve."
      }
    } else if (rating === 3) {
      return {
        title: "We value your honest feedback",
        subtitle: "Help us understand how we can turn your next visit into a great experience."
      }
    }
    return {
      title: "Thank you for your feedback",
      subtitle: "We appreciate you taking the time to share your thoughts with us."
    }
  }

  const { title, subtitle } = getMessage()

  const handleContactClick = (method: 'email' | 'phone') => {
    setSelectedContact(method)
    onCTAClick(method === 'email' ? 'contact_email' : 'contact_phone')
    
    if (method === 'email' && client.contactEmail) {
      const subject = encodeURIComponent(`Feedback from ${client.name} customer`)
      const body = encodeURIComponent(`Hi ${client.name} team,\n\nI recently visited and wanted to share some feedback...\n\n${comment ? `My experience: ${comment}` : ''}`)
      window.open(`mailto:${client.contactEmail}?subject=${subject}&body=${body}`)
    } else if (method === 'phone' && client.contactPhone) {
      window.open(`tel:${client.contactPhone}`)
    }
  }

  const openGoogleReviews = () => {
    if (!client.googlePlaceId) return
    
    const googleUrl = `https://www.google.com/maps/place/?q=place_id:${client.googlePlaceId}&openReviewDialog=true`
    window.open(googleUrl, '_blank')
    onCTAClick('google_direct')
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
      {/* Empathetic Message */}
      <motion.div
        className={cn(
          "text-center p-6 rounded-2xl",
          "bg-gradient-to-br from-orange-50/80 to-orange-100/40",
          "border border-orange-200/60",
          "backdrop-blur-xl shadow-[0_8px_32px_rgba(251,146,60,0.08)]"
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
            "bg-gradient-to-br from-orange-100 to-orange-200",
            "flex items-center justify-center shadow-sm"
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
          <Heart className="w-8 h-8 text-orange-600" strokeWidth={2} />
        </motion.div>
        
        <motion.h2
          className="text-xl font-semibold text-gray-900 mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {title}
        </motion.h2>
        
        <motion.p
          className="text-gray-700 text-sm leading-relaxed mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          {subtitle}
        </motion.p>

        <motion.p
          className="text-gray-600 text-xs leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          We genuinely care about your experience and want to hear from you directly.
        </motion.p>
      </motion.div>

      {/* Contact Options */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <h3 className="text-sm font-medium text-gray-900 text-center mb-4">
          Let&apos;s make this right together
        </h3>

        {/* Email Contact */}
        {client.contactEmail && (
          <motion.button
            onClick={() => handleContactClick('email')}
            className={cn(
              "w-full p-4 rounded-xl text-left transition-all duration-200",
              "bg-white/80 backdrop-blur-xl border border-[#E5E5E7]/60",
              "hover:bg-white/95 hover:border-[#007AFF]/20",
              "hover:shadow-[0_8px_24px_rgba(0,122,255,0.08)]",
              "focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF]/30",
              "active:scale-[0.98] group",
              selectedContact === 'email' && "bg-[#007AFF]/5 border-[#007AFF]/30"
            )}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                "bg-gradient-to-br from-[#007AFF]/10 to-[#007AFF]/5",
                "group-hover:from-[#007AFF]/15 group-hover:to-[#007AFF]/10",
                "transition-all duration-200"
              )}>
                <Mail className="w-6 h-6 text-[#007AFF]" strokeWidth={2} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm mb-1">
                  Email us directly
                </p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {client.contactEmail}
                </p>
              </div>
            </div>
          </motion.button>
        )}

        {/* Phone Contact */}
        {client.contactPhone && (
          <motion.button
            onClick={() => handleContactClick('phone')}
            className={cn(
              "w-full p-4 rounded-xl text-left transition-all duration-200",
              "bg-white/80 backdrop-blur-xl border border-[#E5E5E7]/60",
              "hover:bg-white/95 hover:border-[#34C759]/20",
              "hover:shadow-[0_8px_24px_rgba(52,199,89,0.08)]",
              "focus:outline-none focus:ring-2 focus:ring-[#34C759]/20 focus:border-[#34C759]/30",
              "active:scale-[0.98] group",
              selectedContact === 'phone' && "bg-[#34C759]/5 border-[#34C759]/30"
            )}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                "bg-gradient-to-br from-[#34C759]/10 to-[#34C759]/5",
                "group-hover:from-[#34C759]/15 group-hover:to-[#34C759]/10",
                "transition-all duration-200"
              )}>
                <Phone className="w-6 h-6 text-[#34C759]" strokeWidth={2} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm mb-1">
                  Call us now
                </p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {client.contactPhone}
                </p>
              </div>
            </div>
          </motion.button>
        )}
      </motion.div>

      {/* Optional Google Review Link (smaller, less prominent) */}
      {client.googlePlaceId && (
        <motion.div
          className="pt-4 border-t border-gray-200/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.3 }}
        >
          <button
            onClick={openGoogleReviews}
            className={cn(
              "w-full p-3 rounded-lg text-center transition-all duration-200",
              "bg-transparent hover:bg-gray-50",
              "text-gray-500 hover:text-gray-700 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-gray-200",
              "active:scale-[0.98]"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
              <span>Or leave a Google review anyway</span>
            </div>
          </button>
        </motion.div>
      )}

      {/* Reassuring footer */}
      <motion.p
        className="text-center text-xs text-gray-500 leading-relaxed pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.3 }}
      >
        Every piece of feedback helps {client.name} improve. We&apos;re grateful you took the time to share.
      </motion.p>
    </motion.div>
  )
}