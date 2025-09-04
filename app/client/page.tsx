'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function ClientRootPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard immediately
    router.replace('/client/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 200,
          duration: 0.4,
        }}
        className="text-center"
      >
        {/* Loading indicator */}
        <div className="relative">
          <div className="w-8 h-8 mx-auto mb-4 rounded-lg bg-gradient-to-r from-[#007AFF] to-[#007AFF]/70 shadow-[0_2px_8px_rgba(0,122,255,0.15)]">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-lg"
              animate={{ x: ['-100%', '100%'] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
          
          <p className="text-slate-600 font-medium">
            Redirecting to dashboard...
          </p>
        </div>
      </motion.div>
    </div>
  )
}