'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Settings, Upload, Palette, Mail, Phone, Building, CheckCircle, AlertCircle, Eye } from 'lucide-react'
import { BrandColors } from '@/types/reviews'

interface ClientSettings {
  id: string
  name: string
  email: string
  contactEmail?: string
  contactPhone?: string
  logoUrl?: string
  brandColors?: BrandColors
  status: string
  createdAt: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ClientSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    contactEmail: '',
    contactPhone: '',
    brandColors: {
      primary: '#007AFF',
      secondary: '#34C759',
      accent: '#FF9500'
    } as BrandColors
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('clientAuthToken')
      if (!token) {
        window.location.href = '/client/login'
        return
      }

      const response = await fetch('/api/client/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
        setFormData({
          contactEmail: data.settings.contactEmail || '',
          contactPhone: data.settings.contactPhone || '',
          brandColors: data.settings.brandColors || {
            primary: '#007AFF',
            secondary: '#34C759',
            accent: '#FF9500'
          }
        })
      } else {
        throw new Error('Failed to fetch settings')
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      // Mock data for development
      const mockSettings: ClientSettings = {
        id: '1',
        name: 'Sunset Bistro',
        email: 'owner@sunsetbistro.com',
        contactEmail: 'info@sunsetbistro.com',
        contactPhone: '+1 (555) 123-4567',
        logoUrl: null,
        brandColors: {
          primary: '#007AFF',
          secondary: '#34C759',
          accent: '#FF9500'
        },
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z'
      }
      setSettings(mockSettings)
      setFormData({
        contactEmail: mockSettings.contactEmail || '',
        contactPhone: mockSettings.contactPhone || '',
        brandColors: mockSettings.brandColors || {
          primary: '#007AFF',
          secondary: '#34C759',
          accent: '#FF9500'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleColorChange = (colorType: keyof BrandColors, value: string) => {
    setFormData(prev => ({
      ...prev,
      brandColors: {
        ...prev.brandColors,
        [colorType]: value
      }
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const token = localStorage.getItem('clientAuthToken')
      const formDataToSend = new FormData()
      
      formDataToSend.append('contactEmail', formData.contactEmail)
      formDataToSend.append('contactPhone', formData.contactPhone)
      formDataToSend.append('brandColors', JSON.stringify(formData.brandColors))
      
      if (logoFile) {
        formDataToSend.append('logo', logoFile)
      }

      const response = await fetch('/api/client/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-500 mt-2">
              Manage your account preferences and branding
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 rounded-lg border border-[#E5E5E7] transition-colors"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Exit Preview' : 'Preview Changes'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#007AFF] hover:bg-[#0056CC] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : saved ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Account Information (Read-only) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#E5E5E7] p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <Building className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Account Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={settings.name}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Contact support to change</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Status
                </label>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    settings.status === 'active' 
                      ? 'bg-green-50 text-green-700 border border-green-100' 
                      : 'bg-slate-50 text-slate-600 border border-slate-100'
                  }`}>
                    {settings.status.charAt(0).toUpperCase() + settings.status.slice(1)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#E5E5E7] p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                <Mail className="w-5 h-5 text-[#007AFF]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Contact Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="info@yourrestaurant.com"
                  className="w-full px-4 py-3 bg-white border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Shown to customers for contact</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 bg-white border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Shown to customers for contact</p>
              </div>
            </div>
          </motion.div>

          {/* Branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#E5E5E7] p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Branding</h3>
            </div>
            
            {/* Logo Upload */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
                  {logoPreview || settings.logoUrl ? (
                    <img 
                      src={logoPreview || settings.logoUrl!} 
                      alt="Logo preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 rounded-lg border border-[#E5E5E7] cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            {/* Brand Colors */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Brand Colors
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['primary', 'secondary', 'accent'] as const).map((colorType) => (
                  <div key={colorType}>
                    <label className="block text-xs font-medium text-slate-600 mb-2 capitalize">
                      {colorType}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.brandColors[colorType] || '#007AFF'}
                        onChange={(e) => handleColorChange(colorType, e.target.value)}
                        className="w-12 h-10 border border-[#E5E5E7] rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.brandColors[colorType] || '#007AFF'}
                        onChange={(e) => handleColorChange(colorType, e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-white border border-[#E5E5E7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#E5E5E7] p-6 sticky top-8"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Preview</h3>
            
            {/* Mobile Preview */}
            <div className="bg-slate-100 rounded-xl p-4 mb-6">
              <div className="bg-white rounded-lg p-6 shadow-sm" style={{
                background: previewMode ? `linear-gradient(135deg, ${formData.brandColors.primary}10, ${formData.brandColors.secondary}10)` : undefined
              }}>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto mb-3 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {logoPreview || settings.logoUrl ? (
                      <img 
                        src={logoPreview || settings.logoUrl!} 
                        alt="Logo preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <h4 className="font-semibold text-slate-900">{settings.name}</h4>
                </div>
                
                <div className="space-y-3 text-sm">
                  <button 
                    className="w-full py-3 rounded-lg text-white font-medium transition-colors"
                    style={{ backgroundColor: previewMode ? formData.brandColors.primary : '#007AFF' }}
                  >
                    Leave Google Review
                  </button>
                  <button 
                    className="w-full py-3 rounded-lg font-medium border-2 transition-colors"
                    style={previewMode ? {
                      borderColor: formData.brandColors.secondary,
                      color: formData.brandColors.secondary
                    } : {
                      borderColor: '#34C759',
                      color: '#34C759'
                    }}
                  >
                    Contact Us
                  </button>
                </div>

                {(formData.contactEmail || formData.contactPhone) && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm">
                    {formData.contactEmail && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4" />
                        {formData.contactEmail}
                      </div>
                    )}
                    {formData.contactPhone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4" />
                        {formData.contactPhone}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#007AFF] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-[#007AFF] mb-1">
                    Branding Tips
                  </h4>
                  <p className="text-sm text-blue-700">
                    Your logo and colors will appear on the review page that customers see when they scan your QR codes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}