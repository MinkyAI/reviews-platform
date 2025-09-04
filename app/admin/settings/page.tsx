'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Key,
  Globe,
  CreditCard,
  Users,
  Save,
  Check,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const settingsSchema = z.object({
  // Platform Settings
  platformName: z.string().min(1, 'Platform name is required'),
  platformUrl: z.string().url('Must be a valid URL'),
  supportEmail: z.string().email('Must be a valid email'),
  
  // Email Settings
  smtpHost: z.string().min(1, 'SMTP host is required'),
  smtpPort: z.string().min(1, 'SMTP port is required'),
  smtpUser: z.string().min(1, 'SMTP user is required'),
  smtpPassword: z.string().optional(),
  
  // Security Settings
  sessionDuration: z.string().min(1, 'Session duration is required'),
  maxLoginAttempts: z.string().min(1, 'Max login attempts is required'),
  passwordMinLength: z.string().min(1, 'Password minimum length is required'),
  
  // API Settings
  apiRateLimit: z.string().min(1, 'API rate limit is required'),
  apiTimeout: z.string().min(1, 'API timeout is required'),
})

type SettingsForm = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'security' | 'api'>('general')
  const [showSmtpPassword, setShowSmtpPassword] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      platformName: 'Reviews Platform',
      platformUrl: 'https://reviews.example.com',
      supportEmail: 'support@reviews.example.com',
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUser: 'noreply@reviews.example.com',
      smtpPassword: '',
      sessionDuration: '30',
      maxLoginAttempts: '5',
      passwordMinLength: '8',
      apiRateLimit: '100',
      apiTimeout: '30'
    }
  })

  const onSubmit = async (data: SettingsForm) => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
    reset(data)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api', label: 'API', icon: Database }
  ] as const

  return (
    <div className="max-w-4xl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-semibold text-slate-900">Platform Settings</h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage your platform configuration and preferences
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-6"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#007AFF] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </motion.div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
        >
          <div className="p-6 space-y-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#007AFF]/10 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-[#007AFF]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">General Settings</h3>
                    <p className="text-sm text-slate-600">Basic platform configuration</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Platform Name
                  </label>
                  <input
                    {...register('platformName')}
                    className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                  />
                  {errors.platformName && (
                    <p className="mt-1 text-sm text-red-600">{errors.platformName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Platform URL
                  </label>
                  <input
                    {...register('platformUrl')}
                    type="url"
                    className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                  />
                  {errors.platformUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.platformUrl.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Support Email
                  </label>
                  <input
                    {...register('supportEmail')}
                    type="email"
                    className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                  />
                  {errors.supportEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.supportEmail.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#007AFF]/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#007AFF]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Email Settings</h3>
                    <p className="text-sm text-slate-600">Configure email delivery</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      {...register('smtpHost')}
                      className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                    />
                    {errors.smtpHost && (
                      <p className="mt-1 text-sm text-red-600">{errors.smtpHost.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      SMTP Port
                    </label>
                    <input
                      {...register('smtpPort')}
                      className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                    />
                    {errors.smtpPort && (
                      <p className="mt-1 text-sm text-red-600">{errors.smtpPort.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    SMTP Username
                  </label>
                  <input
                    {...register('smtpUser')}
                    className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                  />
                  {errors.smtpUser && (
                    <p className="mt-1 text-sm text-red-600">{errors.smtpUser.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    SMTP Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('smtpPassword')}
                      type={showSmtpPassword ? 'text' : 'password'}
                      placeholder="Leave blank to keep current password"
                      className="w-full px-4 py-2.5 pr-12 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showSmtpPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#007AFF]/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#007AFF]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Security Settings</h3>
                    <p className="text-sm text-slate-600">Authentication and security preferences</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Session Duration (days)
                  </label>
                  <input
                    {...register('sessionDuration')}
                    type="number"
                    className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                  />
                  {errors.sessionDuration && (
                    <p className="mt-1 text-sm text-red-600">{errors.sessionDuration.message}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    How long user sessions remain valid
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    {...register('maxLoginAttempts')}
                    type="number"
                    className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                  />
                  {errors.maxLoginAttempts && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxLoginAttempts.message}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    Number of failed attempts before account lockout
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Minimum Password Length
                  </label>
                  <input
                    {...register('passwordMinLength')}
                    type="number"
                    className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                  />
                  {errors.passwordMinLength && (
                    <p className="mt-1 text-sm text-red-600">{errors.passwordMinLength.message}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    Minimum characters required for passwords
                  </p>
                </div>
              </div>
            )}

            {/* API Settings */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#007AFF]/10 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-[#007AFF]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">API Settings</h3>
                    <p className="text-sm text-slate-600">API rate limiting and performance</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rate Limit (requests per minute)
                  </label>
                  <input
                    {...register('apiRateLimit')}
                    type="number"
                    className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                  />
                  {errors.apiRateLimit && (
                    <p className="mt-1 text-sm text-red-600">{errors.apiRateLimit.message}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    Maximum API requests per minute per client
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    API Timeout (seconds)
                  </label>
                  <input
                    {...register('apiTimeout')}
                    type="number"
                    className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                  />
                  {errors.apiTimeout && (
                    <p className="mt-1 text-sm text-red-600">{errors.apiTimeout.message}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    Maximum time to wait for API responses
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">API Keys</p>
                      <p className="text-sm text-amber-700 mt-1">
                        API keys can be managed individually for each client in the Clients section.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 rounded-b-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              {isDirty && !isSaved && (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  Unsaved changes
                </span>
              )}
              {isSaved && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1 text-emerald-600"
                >
                  <Check className="w-4 h-4" />
                  Settings saved successfully
                </motion.span>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !isDirty}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 bg-[#007AFF] hover:bg-[#0051D5] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-[0_2px_8px_rgba(0,122,255,0.15)] hover:shadow-[0_4px_16px_rgba(0,122,255,0.2)]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </form>

      {/* Additional Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Subscription</h3>
                <p className="text-sm text-slate-600">Professional Plan</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
              Active
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Next billing date</span>
              <span className="font-medium text-slate-900">Jan 15, 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Monthly cost</span>
              <span className="font-medium text-slate-900">$299</span>
            </div>
          </div>
        </motion.div>

        {/* Usage Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#007AFF]/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-[#007AFF]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Usage This Month</h3>
              <p className="text-sm text-slate-600">Resource utilization</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Active Clients</span>
                <span className="font-medium text-slate-900">24 / 50</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#007AFF] to-[#0051D5] h-2 rounded-full" style={{ width: '48%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">QR Codes Generated</span>
                <span className="font-medium text-slate-900">856 / 5000</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#007AFF] to-[#0051D5] h-2 rounded-full" style={{ width: '17%' }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}