'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, X, Star, MessageSquare, QrCode, Calendar } from 'lucide-react'

interface QrCode {
  id: string
  label: string
  shortCode: string
}

interface Filters {
  rating: string
  dateFrom: string
  dateTo: string
  hasComment: string
  qrCodeId: string
  search: string
}

interface ReviewFiltersProps {
  filters: Filters
  qrCodes: QrCode[]
  onChange: (filters: Partial<Filters>) => void
}

export default function ReviewFilters({ filters, qrCodes, onChange }: ReviewFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  
  const handleSearchChange = (value: string) => {
    onChange({ search: value })
  }
  
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onChange({ [key]: value })
  }
  
  const clearAllFilters = () => {
    onChange({
      rating: '',
      dateFrom: '',
      dateTo: '',
      hasComment: '',
      qrCodeId: '',
      search: ''
    })
  }
  
  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => 
      value && key !== 'search'
    ).length
  }
  
  const activeFiltersCount = getActiveFiltersCount()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: 'spring', damping: 25, stiffness: 300 }}
      className="bg-white rounded-xl border border-[#E5E5E7] p-6 space-y-4"
    >
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search reviews by comment..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-[#E5E5E7] rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-sm placeholder-slate-400 transition-colors"
          />
          {filters.search && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
            </motion.button>
          )}
        </div>
        
        {/* Filter Toggle */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              showFilters || activeFiltersCount > 0
                ? 'bg-[#007AFF] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white text-[#007AFF] text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
              >
                {activeFiltersCount}
              </motion.span>
            )}
          </motion.button>
          
          {activeFiltersCount > 0 && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearAllFilters}
              className="text-sm text-slate-500 hover:text-slate-700 underline"
            >
              Clear all
            </motion.button>
          )}
        </div>
      </div>
      
      {/* Collapsible Filters */}
      <motion.div
        initial={false}
        animate={{
          height: showFilters ? 'auto' : 0,
          opacity: showFilters ? 1 : 0,
          marginTop: showFilters ? 16 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="overflow-hidden"
      >
        <div className="space-y-6">
          {/* First Row: Rating and Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rating Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Star className="w-4 h-4 text-yellow-500" />
                Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-sm bg-white"
              >
                <option value="">All ratings</option>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
                <option value="4+">4+ stars</option>
                <option value="3-">3 stars or below</option>
              </select>
            </div>
            
            {/* Date From */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Calendar className="w-4 h-4 text-blue-500" />
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-sm"
              />
            </div>
            
            {/* Date To */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Calendar className="w-4 h-4 text-blue-500" />
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          {/* Second Row: Comment and QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Has Comment Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <MessageSquare className="w-4 h-4 text-purple-500" />
                Comments
              </label>
              <select
                value={filters.hasComment}
                onChange={(e) => handleFilterChange('hasComment', e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-sm bg-white"
              >
                <option value="">All reviews</option>
                <option value="true">With comments</option>
                <option value="false">Without comments</option>
              </select>
            </div>
            
            {/* QR Code Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <QrCode className="w-4 h-4 text-emerald-500" />
                QR Code
              </label>
              <select
                value={filters.qrCodeId}
                onChange={(e) => handleFilterChange('qrCodeId', e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-sm bg-white"
              >
                <option value="">All QR codes</option>
                {qrCodes.map((qr) => (
                  <option key={qr.id} value={qr.id}>
                    {qr.label} ({qr.shortCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Quick Filter Badges */}
      {!showFilters && activeFiltersCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {filters.rating && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-md border border-yellow-200"
            >
              <Star className="w-3 h-3" />
              {filters.rating === '4+' ? '4+ stars' : filters.rating === '3-' ? '3- stars' : `${filters.rating} stars`}
              <button
                onClick={() => handleFilterChange('rating', '')}
                className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          )}
          
          {filters.dateFrom && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200"
            >
              <Calendar className="w-3 h-3" />
              From {filters.dateFrom}
              <button
                onClick={() => handleFilterChange('dateFrom', '')}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          )}
          
          {filters.dateTo && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200"
            >
              <Calendar className="w-3 h-3" />
              To {filters.dateTo}
              <button
                onClick={() => handleFilterChange('dateTo', '')}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          )}
          
          {filters.hasComment && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-200"
            >
              <MessageSquare className="w-3 h-3" />
              {filters.hasComment === 'true' ? 'With comments' : 'Without comments'}
              <button
                onClick={() => handleFilterChange('hasComment', '')}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          )}
          
          {filters.qrCodeId && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-md border border-emerald-200"
            >
              <QrCode className="w-3 h-3" />
              {qrCodes.find(qr => qr.id === filters.qrCodeId)?.label || 'QR Code'}
              <button
                onClick={() => handleFilterChange('qrCodeId', '')}
                className="ml-1 hover:bg-emerald-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}