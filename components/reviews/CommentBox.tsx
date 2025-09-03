'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { CommentBoxProps } from '@/types/reviews'

export function CommentBox({ 
  value, 
  onChange, 
  placeholder = "Share what made your experience special...",
  maxLength = 500,
  disabled = false 
}: CommentBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [hasContent, setHasContent] = useState(false)
  
  const remainingChars = maxLength - value.length
  const showCounter = hasContent || isFocused

  useEffect(() => {
    setHasContent(value.length > 0)
  }, [value])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  return (
    <div className="relative">
      <motion.div
        className={cn(
          "relative overflow-hidden rounded-lg transition-all duration-200 ease-out",
          "bg-white/80 backdrop-blur-xl border border-[#E5E5E7]/60",
          "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
          isFocused && [
            "border-[#007AFF]/30 bg-white/95",
            "shadow-[0_8px_24px_rgba(0,122,255,0.08)]"
          ],
          disabled && "opacity-50 cursor-not-allowed"
        )}
        animate={{
          scale: isFocused ? 1.02 : 1,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.8
          }
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          rows={1}
          className={cn(
            "w-full px-4 py-3 text-[16px] leading-relaxed resize-none",
            "bg-transparent border-none outline-none",
            "text-gray-900 placeholder:text-gray-500",
            "font-normal tracking-[-0.01em]",
            "min-h-[52px] max-h-32 overflow-y-auto",
            "scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300",
            "selection:bg-[#007AFF]/20"
          )}
          style={{ 
            fontFamily: 'Inter, system-ui, sans-serif',
            WebkitAppearance: 'none',
            fontSize: '16px' // Prevents zoom on iOS
          }}
        />
        
        <AnimatePresence>
          {showCounter && (
            <motion.div
              className="absolute bottom-2 right-3 flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{
                duration: 0.2,
                ease: "easeOut"
              }}
            >
              <div 
                className={cn(
                  "text-xs font-medium tabular-nums",
                  remainingChars < 50 && remainingChars >= 20 && "text-orange-500",
                  remainingChars < 20 && "text-red-500",
                  remainingChars >= 50 && "text-gray-400"
                )}
              >
                {remainingChars}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glass morphism overlay for depth */}
        <div 
          className={cn(
            "absolute inset-0 pointer-events-none rounded-lg",
            "bg-gradient-to-br from-white/10 via-transparent to-white/5",
            "opacity-0 transition-opacity duration-200",
            isFocused && "opacity-100"
          )}
        />
      </motion.div>
      
      {/* Subtle glow effect */}
      <motion.div
        className={cn(
          "absolute inset-0 -z-10 rounded-lg blur-xl opacity-0",
          "bg-gradient-to-br from-[#007AFF]/20 to-[#007AFF]/5"
        )}
        animate={{
          opacity: isFocused ? 1 : 0,
          scale: isFocused ? 1.1 : 1,
          transition: {
            duration: 0.3,
            ease: "easeOut"
          }
        }}
      />
    </div>
  )
}