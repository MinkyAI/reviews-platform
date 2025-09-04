'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle, Store } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  clientId: z.string().min(1, 'Client identification is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function ClientLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientInfo, setClientInfo] = useState<{ name: string; id: string } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get clientId from URL parameters
  const urlClientId = searchParams.get('clientId') || ''

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      clientId: urlClientId,
    },
  })

  // Set clientId when URL param changes
  useEffect(() => {
    if (urlClientId) {
      setValue('clientId', urlClientId)
      // In a real app, you'd fetch client info here
      setClientInfo({ name: 'Restaurant Name', id: urlClientId })
    }
  }, [urlClientId, setValue])

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/client/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid credentials. Please check your email and password, or contact your administrator.')
        } else if (response.status === 429) {
          setError('Too many login attempts. Please wait a moment before trying again.')
        } else if (response.status === 422) {
          setError('Please check your input: email format and password requirements.')
        } else if (response.status === 400) {
          setError('Client access is required. Please contact your administrator.')
        } else {
          setError(result.error || 'Unable to sign in. Please try again in a moment.')
        }
        return
      }

      router.push('/client/dashboard')
      router.refresh()
    } catch {
      setError('Network connection error. Please check your internet and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 200,
            duration: 0.6,
          }}
          className="relative"
        >
          {/* Glass morphism card */}
          <div className="relative bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl pointer-events-none" />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Client identification */}
                  {clientInfo && (
                    <div className="mb-4 p-3 bg-[#007AFF]/5 border border-[#007AFF]/10 rounded-lg flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#007AFF]/10 rounded-lg flex items-center justify-center">
                        <Store className="w-4 h-4 text-[#007AFF]" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm text-slate-600">Signing in to</div>
                        <div className="font-medium text-slate-900">{clientInfo.name}</div>
                      </div>
                    </div>
                  )}

                  <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                    Welcome back
                  </h1>
                  <p className="text-slate-600">
                    Sign in to access your restaurant dashboard
                  </p>
                </motion.div>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 bg-red-50/80 border border-red-200/50 rounded-lg flex items-center gap-2 text-red-700 text-sm backdrop-blur-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Hidden clientId field */}
                <input type="hidden" {...register('clientId')} />

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all duration-200 backdrop-blur-sm placeholder:text-slate-400"
                    placeholder="your.email@restaurant.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      {...register('password')}
                      className="w-full px-4 py-3 pr-12 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all duration-200 backdrop-blur-sm placeholder:text-slate-400"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </motion.div>

                {errors.clientId && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-amber-50/80 border border-amber-200/50 rounded-lg flex items-center gap-2 text-amber-700 text-sm backdrop-blur-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.clientId.message}</span>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#007AFF] hover:bg-[#007AFF]/90 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-[0_2px_8px_rgba(0,122,255,0.15)] hover:shadow-[0_4px_16px_rgba(0,122,255,0.2)] relative overflow-hidden"
                  >
                    {isLoading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    )}
                    <span className="relative">
                      {isLoading ? 'Signing in...' : 'Continue to dashboard →'}
                    </span>
                  </motion.button>
                </motion.div>
              </form>

              {/* Support link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-slate-500">
                  Need help accessing your account?{' '}
                  <button 
                    type="button"
                    className="text-[#007AFF] hover:text-[#007AFF]/80 transition-colors duration-200 font-medium"
                    onClick={() => {
                      // In a real app, this would open a support modal or redirect to help
                      setError('Please contact your restaurant administrator for password reset assistance.')
                    }}
                  >
                    Contact support
                  </button>
                </p>
              </motion.div>
            </div>
          </div>

          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#007AFF]/5 to-transparent rounded-2xl blur-xl -z-10" />
        </motion.div>
      </div>
    </div>
  )
}