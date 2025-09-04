'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { QrCode, Download, Eye, Copy, Activity, Calendar } from 'lucide-react'

interface QRCodeStats {
  totalScans: number
  lastScanned?: string
  reviewsGenerated: number
  avgRating?: number
}

interface QRCodeCardProps {
  id: string
  label: string
  shortCode: string
  locationName?: string
  status: 'active' | 'archived'
  createdAt: string
  stats: QRCodeStats
  onDownload: (id: string, format: 'png' | 'svg' | 'pdf') => void
  onViewStats: (id: string) => void
}

export default function QRCodeCard({
  id,
  label,
  shortCode,
  locationName,
  status,
  createdAt,
  stats,
  onDownload,
  onViewStats
}: QRCodeCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null)

  const shortUrl = `https://rvws.co/${shortCode}`

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const handleDownload = async (format: 'png' | 'svg' | 'pdf') => {
    setDownloadLoading(format)
    try {
      await onDownload(id, format)
    } finally {
      setDownloadLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group bg-white/70 backdrop-blur-sm rounded-xl border border-[#E5E5E7] p-6 transition-all duration-200 hover:shadow-lg hover:border-[#007AFF]/20 hover:bg-white/80"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg transition-colors ${
            status === 'active' 
              ? 'bg-blue-50 border border-blue-100 text-[#007AFF]' 
              : 'bg-slate-50 border border-slate-100 text-slate-400'
          }`}>
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
            {locationName && (
              <p className="text-xs text-slate-500 mt-0.5">{locationName}</p>
            )}
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === 'active' 
            ? 'bg-green-50 text-green-700 border border-green-100' 
            : 'bg-slate-50 text-slate-600 border border-slate-100'
        }`}>
          {status}
        </div>
      </div>

      {/* QR Code URL */}
      <div className="mb-4">
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <code className="flex-1 text-xs text-slate-600 font-mono truncate">
            {shortUrl}
          </code>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyUrl}
            className="p-1.5 hover:bg-white rounded-md transition-colors group"
          >
            <Copy className={`w-3.5 h-3.5 transition-colors ${
              copied ? 'text-green-600' : 'text-slate-400 group-hover:text-slate-600'
            }`} />
          </motion.button>
        </div>
        {copied && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-green-600 mt-1 ml-3"
          >
            URL copied to clipboard!
          </motion.p>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-3.5 h-3.5 text-[#007AFF]" />
            <span className="text-xs text-[#007AFF] font-medium">Scans</span>
          </div>
          <p className="text-lg font-bold text-slate-900">{stats.totalScans.toLocaleString()}</p>
          {stats.lastScanned && (
            <p className="text-xs text-slate-500 mt-0.5">
              Last: {new Date(stats.lastScanned).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-emerald-700 font-medium">Reviews</span>
          </div>
          <p className="text-lg font-bold text-slate-900">{stats.reviewsGenerated}</p>
          {stats.avgRating && (
            <p className="text-xs text-slate-500 mt-0.5">
              Avg: {stats.avgRating.toFixed(1)}★
            </p>
          )}
        </div>
      </div>

      {/* Created Date */}
      <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
        <Calendar className="w-3.5 h-3.5" />
        Created {formatDate(createdAt)}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewStats(id)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#007AFF] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          View Stats
        </motion.button>

        <div className="flex items-center gap-1">
          {['png', 'svg', 'pdf'].map((format) => (
            <motion.button
              key={format}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDownload(format as 'png' | 'svg' | 'pdf')}
              disabled={downloadLoading === format}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadLoading === format ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 border border-slate-300 border-t-slate-600 rounded-full"
                />
              ) : (
                <Download className="w-3 h-3" />
              )}
              {format.toUpperCase()}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Hover overlay for glass effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl pointer-events-none"
      />
    </motion.div>
  )
}