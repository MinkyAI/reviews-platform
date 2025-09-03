'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange: (rating: number) => void
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
  disabled?: boolean
}

export function StarRating({ 
  value, 
  onChange, 
  size = 'large', 
  animated = true,
  disabled = false 
}: StarRatingProps) {
  const [hover, setHover] = useState(0)
  
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating)
    }
  }

  return (
    <div 
      className="flex gap-2"
      role="radiogroup"
      aria-label="Rate your experience"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value)
        
        return (
          <motion.button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={cn(
              "relative touch-manipulation transition-transform",
              sizeClasses[size],
              !disabled && "cursor-pointer active:scale-[0.85]",
              disabled && "cursor-not-allowed opacity-50"
            )}
            whileTap={!disabled ? { scale: 0.85 } : undefined}
            initial={false}
            animate={animated ? {
              scale: filled ? 1.1 : 1,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 17,
                mass: 0.5
              }
            } : undefined}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            role="radio"
            aria-checked={value === star}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <defs>
                <linearGradient id={`goldGradient-${star}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFED4E" />
                </linearGradient>
              </defs>
              <motion.path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                stroke={filled ? "none" : "#E5E5E7"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{
                  fill: filled ? `url(#goldGradient-${star})` : "transparent",
                  strokeWidth: filled ? 0 : 1.5,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut"
                }}
              />
            </svg>
            
            <AnimatePresence>
              {animated && filled && value === star && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ 
                    scale: 2, 
                    opacity: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    <path
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      fill="url(#goldGradient-${star})"
                      opacity="0.3"
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )
      })}
    </div>
  )
}