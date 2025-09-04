'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { QrCode, Plus, Filter, Search, AlertCircle, RefreshCw } from 'lucide-react'
import QRCodeCard from '@/components/client/QRCodeCard'

interface QRCodeData {
  id: string
  label: string
  shortCode: string
  locationName?: string
  status: 'active' | 'archived'
  createdAt: string
  stats: {
    totalScans: number
    lastScanned?: string
    reviewsGenerated: number
    avgRating?: number
  }
}

export default function QRCodesPage() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchQRCodes()
  }, [])

  const fetchQRCodes = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('clientAuthToken')
      if (!token) {
        window.location.href = '/client/login'
        return
      }

      const response = await fetch('/api/client/qr-codes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setQrCodes(data.qrCodes || [])
      } else {
        throw new Error('Failed to fetch QR codes')
      }
    } catch (error) {
      console.error('Failed to fetch QR codes:', error)
      // Mock data for development
      setQrCodes([
        {
          id: '1',
          label: 'Table 1',
          shortCode: 'tbl-001',
          locationName: 'Main Dining Room',
          status: 'active',
          createdAt: '2024-01-15T10:00:00Z',
          stats: {
            totalScans: 234,
            lastScanned: '2024-01-20T14:30:00Z',
            reviewsGenerated: 89,
            avgRating: 4.6
          }
        },
        {
          id: '2',
          label: 'Table 7',
          shortCode: 'tbl-007',
          locationName: 'Main Dining Room',
          status: 'active',
          createdAt: '2024-01-15T10:00:00Z',
          stats: {
            totalScans: 156,
            lastScanned: '2024-01-19T16:45:00Z',
            reviewsGenerated: 67,
            avgRating: 4.4
          }
        },
        {
          id: '3',
          label: 'Bar Counter',
          shortCode: 'bar-001',
          locationName: 'Bar Area',
          status: 'active',
          createdAt: '2024-01-15T10:00:00Z',
          stats: {
            totalScans: 89,
            lastScanned: '2024-01-20T11:20:00Z',
            reviewsGenerated: 34,
            avgRating: 4.8
          }
        },
        {
          id: '4',
          label: 'Patio Table 3',
          shortCode: 'pat-003',
          locationName: 'Outdoor Patio',
          status: 'archived',
          createdAt: '2023-12-10T10:00:00Z',
          stats: {
            totalScans: 45,
            lastScanned: '2023-12-28T12:15:00Z',
            reviewsGenerated: 18,
            avgRating: 4.2
          }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchQRCodes()
    setRefreshing(false)
  }

  const handleDownload = async (id: string, format: 'png' | 'svg' | 'pdf') => {
    try {
      const token = localStorage.getItem('clientAuthToken')
      const response = await fetch(`/api/client/qr-codes/${id}/download?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `qr-code-${id}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error('Failed to download QR code')
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleViewStats = (id: string) => {
    // This would navigate to a detailed stats view
    console.log('View stats for QR code:', id)
  }

  const filteredQRCodes = qrCodes.filter(qr => {
    const matchesSearch = qr.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         qr.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (qr.locationName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    
    const matchesStatus = statusFilter === 'all' || qr.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.stats.totalScans, 0)
  const totalReviews = qrCodes.reduce((sum, qr) => sum + qr.stats.reviewsGenerated, 0)
  const activeQRCodes = qrCodes.filter(qr => qr.status === 'active').length

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-80 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

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
            <h1 className="text-3xl font-bold text-slate-900">QR Codes</h1>
            <p className="text-slate-500 mt-2">
              Manage your QR codes and track their performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 rounded-lg border border-[#E5E5E7] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', damping: 25, stiffness: 300 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#E5E5E7] p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
              <QrCode className="w-5 h-5 text-[#007AFF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{activeQRCodes}</p>
              <p className="text-sm text-slate-500">Active QR Codes</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#E5E5E7] p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="w-5 h-5 text-emerald-600 font-bold text-sm flex items-center justify-center">
                {totalScans.toLocaleString()}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalScans.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Total Scans</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#E5E5E7] p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="w-5 h-5 text-yellow-600 font-bold text-sm flex items-center justify-center">
                ★
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalReviews}</p>
              <p className="text-sm text-slate-500">Reviews Generated</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', damping: 25, stiffness: 300 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search QR codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'archived')}
            className="px-4 py-2.5 bg-white border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </motion.div>

      {/* QR Codes Grid */}
      {filteredQRCodes.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredQRCodes.map((qrCode, index) => (
            <motion.div
              key={qrCode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <QRCodeCard
                {...qrCode}
                onDownload={handleDownload}
                onViewStats={handleViewStats}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#E5E5E7] p-12 text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-slate-50 rounded-full">
              <QrCode className="w-8 h-8 text-slate-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No QR codes found' : 'No QR codes yet'}
          </h3>
          <p className="text-slate-500 mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'QR codes assigned to your account will appear here.'
            }
          </p>
          {(!searchQuery && statusFilter === 'all') && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#007AFF] flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-[#007AFF] mb-1">
                    Need QR codes?
                  </h4>
                  <p className="text-sm text-blue-700">
                    Contact your account manager to request new QR codes for your locations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}