'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Building2, Mail, Phone, MapPin, Zap, QrCode } from 'lucide-react'
import confetti from 'canvas-confetti'

const clientFormSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  contactEmail: z.string().email('Please enter a valid contact email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  monthlyPrice: z.number().min(0, 'Monthly price must be positive').optional(),
  googlePlaceId: z.string().optional(),
  qrBatchCount: z.number().min(1, 'Must generate at least 1 QR code').max(100, 'Cannot generate more than 100 QR codes at once').default(5),
  qrLabelingScheme: z.enum(['sequential', 'location', 'custom']).default('sequential'),
})

type ClientFormData = z.infer<typeof clientFormSchema>

interface ClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: {
    id: string
    name: string
    email: string
    contactEmail?: string
    contactPhone?: string
    googlePlaceId?: string
  } | null
  onSuccess: (client: any) => void
}

export function ClientModal({ open, onOpenChange, client, onSuccess }: ClientModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const isEditing = Boolean(client)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      contactEmail: client?.contactEmail || '',
      contactPhone: client?.contactPhone || '',
      googlePlaceId: client?.googlePlaceId || '',
      qrBatchCount: 5,
      qrLabelingScheme: 'sequential',
    }
  })

  const watchedFields = watch()

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true)
    
    try {
      const url = isEditing ? `/api/admin/clients/${client.id}` : '/api/admin/clients'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${isEditing ? 'update' : 'create'} client`)
      }

      const result = await response.json()
      
      if (!isEditing && result.tempPassword) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        alert(`Client created! Temporary password: ${result.tempPassword}`)
      }
      
      onSuccess(result.client)
      onOpenChange(false)
      reset()
      setStep(1)
      
    } catch (error) {
      console.error('Client operation failed:', error)
      alert(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, 2))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md mx-4 z-50"
          >
            <div className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.08)] p-0 overflow-hidden">
              <div className="border-b border-gray-200/50 p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                      {isEditing ? 'Edit Client' : 'Add New Client'}
                    </Dialog.Title>
                    <p className="text-sm text-gray-600 mt-1">
                      {isEditing ? 'Update client information' : 'Create a new client account with QR codes'}
                    </p>
                  </div>
                  
                  <Dialog.Close asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </motion.button>
                  </Dialog.Close>
                </div>

                {!isEditing && (
                  <div className="flex items-center justify-center mt-4 space-x-2">
                    <div className={`w-8 h-1 rounded-full transition-colors ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    <div className={`w-8 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <AnimatePresence mode="wait">
                  {(step === 1 || isEditing) && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          <Building2 className="inline w-4 h-4 mr-2" />
                          Company Name
                        </label>
                        <input
                          {...register('name')}
                          placeholder="Enter the business name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="inline w-4 h-4 mr-2" />
                          Login Email
                        </label>
                        <input
                          {...register('email')}
                          type="email"
                          placeholder="client@restaurant.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="inline w-4 h-4 mr-2" />
                          Contact Email (Optional)
                        </label>
                        <input
                          {...register('contactEmail')}
                          type="email"
                          placeholder="info@restaurant.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        {errors.contactEmail && (
                          <p className="text-red-500 text-sm mt-1">{errors.contactEmail.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="inline w-4 h-4 mr-2" />
                          Contact Phone (Optional)
                        </label>
                        <input
                          {...register('contactPhone')}
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="googlePlaceId" className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="inline w-4 h-4 mr-2" />
                          Google Place ID (Optional)
                        </label>
                        <input
                          {...register('googlePlaceId')}
                          placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && !isEditing && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div>
                        <label htmlFor="qrBatchCount" className="block text-sm font-medium text-gray-700 mb-2">
                          <QrCode className="inline w-4 h-4 mr-2" />
                          QR Code Quantity
                        </label>
                        <input
                          {...register('qrBatchCount', { valueAsNumber: true })}
                          type="number"
                          min="1"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        {errors.qrBatchCount && (
                          <p className="text-red-500 text-sm mt-1">{errors.qrBatchCount.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="qrLabelingScheme" className="block text-sm font-medium text-gray-700 mb-2">
                          <Zap className="inline w-4 h-4 mr-2" />
                          Labeling Scheme
                        </label>
                        <select
                          {...register('qrLabelingScheme')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="sequential">Sequential (QR-001, QR-002, ...)</option>
                          <option value="location">Location-based ({watchedFields.name?.replace(/\s+/g, '-').toLowerCase()}-1, ...)</option>
                          <option value="custom">Custom ({watchedFields.name?.slice(0, 3).toUpperCase()}-timestamp-1, ...)</option>
                        </select>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Preview:</strong> {watchedFields.qrBatchCount || 5} QR codes will be generated using {' '}
                          {watchedFields.qrLabelingScheme === 'sequential' && 'sequential numbering'}
                          {watchedFields.qrLabelingScheme === 'location' && `location prefix "${watchedFields.name?.replace(/\s+/g, '-').toLowerCase()}"`}
                          {watchedFields.qrLabelingScheme === 'custom' && `custom format "${watchedFields.name?.slice(0, 3).toUpperCase()}-timestamp-#"`}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  {!isEditing && (
                    <motion.button
                      type="button"
                      onClick={prevStep}
                      disabled={step === 1}
                      whileHover={{ scale: step === 1 ? 1 : 1.02 }}
                      whileTap={{ scale: step === 1 ? 1 : 0.98 }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Back
                    </motion.button>
                  )}

                  <div className="flex space-x-3 ml-auto">
                    <Dialog.Close asChild>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        Cancel
                      </motion.button>
                    </Dialog.Close>

                    {!isEditing && step === 1 ? (
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        Continue →
                      </motion.button>
                    ) : (
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {isLoading && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                          />
                        )}
                        {isLoading 
                          ? (isEditing ? 'Saving...' : 'Creating...') 
                          : (isEditing ? 'Save Changes' : 'Create Client')
                        }
                      </motion.button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}