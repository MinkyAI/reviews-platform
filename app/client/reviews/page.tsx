'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Star, Download, Search, Filter, ChevronLeft, ChevronRight, MessageSquare, ExternalLink, Phone, Mail } from 'lucide-react'
import ReviewsTable from '@/components/client/ReviewsTable'
import ReviewFilters from '@/components/client/ReviewFilters'

interface QrCode {
  id: string
  label: string
  shortCode: string
}

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  googleClicked: boolean
  contactClicked: boolean
  clickedCTA: 'google_copy' | 'google_direct' | 'contact' | 'none'
  qrCode: QrCode
}

interface ReviewsResponse {
  reviews: Review[]
  totalCount: number
  totalPages: number
  currentPage: number
}

interface Filters {
  rating: string
  dateFrom: string
  dateTo: string
  hasComment: string
  qrCodeId: string
  search: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [qrCodes, setQrCodes] = useState<QrCode[]>([])
  const [filters, setFilters] = useState<Filters>({
    rating: '',
    dateFrom: '',
    dateTo: '',
    hasComment: '',
    qrCodeId: '',
    search: ''
  })

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })
      
      const response = await fetch(`/api/client/reviews?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      
      const data: ReviewsResponse = await response.json()
      setReviews(data.reviews)
      setTotalCount(data.totalCount)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, filters])

  const fetchQrCodes = useCallback(async () => {
    try {
      const response = await fetch('/api/client/qr-codes')
      if (response.ok) {
        const data = await response.json()
        setQrCodes(data.qrCodes || [])
      }
    } catch (error) {
      console.error('Failed to fetch QR codes:', error)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  useEffect(() => {
    fetchQrCodes()
  }, [fetchQrCodes])

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleExportCSV = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })
      params.set('export', 'csv')
      
      const response = await fetch(`/api/client/reviews?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to export reviews')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reviews-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to export CSV:', error)
    }
  }, [filters])

  const summaryStats = useMemo(() => {
    return {
      totalReviews: totalCount,
      averageRating: reviews.length > 0 ? 
        reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0,
      positiveReviews: reviews.filter(r => r.rating >= 4).length,
      withComments: reviews.filter(r => r.comment).length,
      googleClicks: reviews.filter(r => r.googleClicked).length,
      contactClicks: reviews.filter(r => r.contactClicked).length
    }
  }, [reviews, totalCount])

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
            <h1 className="text-3xl font-bold text-slate-900">Customer Reviews</h1>
            <p className="text-slate-500 mt-2">
              Monitor and analyze customer feedback from your QR code campaigns
            </p>
          </div>
          
          <motion.button
            onClick={handleExportCSV}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-lg font-medium hover:bg-[#0056CC] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </motion.button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', damping: 25, stiffness: 300 }}
        className="grid grid-cols-2 lg:grid-cols-6 gap-4"
      >
        <div className="bg-white rounded-xl border border-[#E5E5E7] p-4">
          <div className="text-2xl font-bold text-slate-900">
            {summaryStats.totalReviews}
          </div>
          <div className="text-sm text-slate-500">Total Reviews</div>
        </div>
        
        <div className="bg-white rounded-xl border border-[#E5E5E7] p-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-2xl font-bold text-slate-900">
              {summaryStats.averageRating.toFixed(1)}
            </span>
          </div>
          <div className="text-sm text-slate-500">Average Rating</div>
        </div>
        
        <div className="bg-white rounded-xl border border-[#E5E5E7] p-4">
          <div className="text-2xl font-bold text-emerald-600">
            {summaryStats.positiveReviews}
          </div>
          <div className="text-sm text-slate-500">4+ Stars</div>
        </div>
        
        <div className="bg-white rounded-xl border border-[#E5E5E7] p-4">
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span className="text-2xl font-bold text-slate-900">
              {summaryStats.withComments}
            </span>
          </div>
          <div className="text-sm text-slate-500">With Comments</div>
        </div>
        
        <div className="bg-white rounded-xl border border-[#E5E5E7] p-4">
          <div className="flex items-center gap-1">
            <ExternalLink className="w-4 h-4 text-emerald-500" />
            <span className="text-2xl font-bold text-slate-900">
              {summaryStats.googleClicks}
            </span>
          </div>
          <div className="text-sm text-slate-500">Google Clicks</div>
        </div>
        
        <div className="bg-white rounded-xl border border-[#E5E5E7] p-4">
          <div className="flex items-center gap-1">
            <Phone className="w-4 h-4 text-purple-500" />
            <span className="text-2xl font-bold text-slate-900">
              {summaryStats.contactClicks}
            </span>
          </div>
          <div className="text-sm text-slate-500">Contact Clicks</div>
        </div>
      </motion.div>

      {/* Filters */}
      <ReviewFilters
        filters={filters}
        qrCodes={qrCodes}
        onChange={handleFilterChange}
      />

      {/* Reviews Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-xl border border-[#E5E5E7] overflow-hidden"
      >
        <div className="p-6 border-b border-[#E5E5E7]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Customer Reviews</h3>
              <p className="text-sm text-slate-500">
                {totalCount} total reviews found
              </p>
            </div>
            
            {/* Pagination Info */}
            {totalPages > 1 && (
              <div className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        </div>

        <ReviewsTable
          reviews={reviews}
          loading={loading}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-[#E5E5E7]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} reviews
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                  whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </motion.button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1
                    const isActive = page === currentPage
                    
                    return (
                      <motion.button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-[#007AFF] text-white'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </motion.button>
                    )
                  })}
                </div>
                
                <motion.button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                  whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}