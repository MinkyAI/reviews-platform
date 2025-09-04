'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, QrCode, Star, MousePointerClick, Phone, TrendingUp } from 'lucide-react'
import KPICard from '../admin/KPICard'

interface AnalyticsData {
  kpis: {
    totalScans: {
      value: number
      change: number
      trend: number[]
    }
    totalReviews: {
      value: number
      change: number
      trend: number[]
    }
    averageRating: {
      value: number
      change: number
      trend: number[]
    }
    positivePercentage: {
      value: number
      change: number
      trend: number[]
    }
    googleClicks: {
      value: number
      change: number
      trend: number[]
    }
    contactClicks: {
      value: number
      change: number
      trend: number[]
    }
  }
  client: {
    id: string
    name: string
  }
}

interface DashboardMetricsProps {
  className?: string
}

export default function DashboardMetrics({ className = '' }: DashboardMetricsProps) {
  const [timeframe, setTimeframe] = useState('30d')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const timeframes = [
    { label: 'Today', value: '1d' },
    { label: '7 days', value: '7d' },
    { label: '30 days', value: '30d' },
    { label: '90 days', value: '90d' },
  ]

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get auth token from localStorage or session
      const token = localStorage.getItem('clientAuthToken')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`/api/client/analytics?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please log in again.')
        }
        throw new Error('Failed to fetch analytics')
      }
      
      const analyticsData = await response.json()
      setData(analyticsData)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [timeframe])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalytics()
    }, 60000) // Update every minute for client dashboard

    return () => clearInterval(interval)
  }, [fetchAnalytics])

  const handleRefresh = () => {
    fetchAnalytics()
  }

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl border border-[#E5E5E7] p-6"
        >
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-2/3 mb-4" />
            <div className="h-8 bg-slate-200 rounded w-1/2 mb-3" />
            <div className="h-3 bg-slate-200 rounded w-1/3 mb-4" />
            <div className="h-8 bg-slate-100 rounded" />
          </div>
        </motion.div>
      ))}
    </div>
  )

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 font-medium mb-2">Failed to load analytics</div>
          <div className="text-red-500 text-sm mb-4">{error}</div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {data?.client?.name ? `${data.client.name} Analytics` : 'Your Analytics'}
          </h2>
          {lastUpdated && (
            <p className="text-sm text-slate-500 mt-1">
              Last updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-white border border-[#E5E5E7] rounded-lg p-1">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeframe === tf.value
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E5E7] rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingSkeleton />
        ) : data ? (
          <motion.div
            key={timeframe}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4"
          >
            <KPICard
              title="Total Scans"
              value={data.kpis.totalScans.value}
              change={data.kpis.totalScans.change}
              trend={data.kpis.totalScans.trend}
              icon={QrCode}
              delay={0}
            />

            <KPICard
              title="Reviews Submitted"
              value={data.kpis.totalReviews.value}
              change={data.kpis.totalReviews.change}
              trend={data.kpis.totalReviews.trend}
              icon={TrendingUp}
              delay={0.1}
            />

            <KPICard
              title="Average Rating"
              value={data.kpis.averageRating.value}
              change={data.kpis.averageRating.change}
              trend={data.kpis.averageRating.trend}
              icon={Star}
              delay={0.2}
            />

            <KPICard
              title="Positive Reviews"
              value={data.kpis.positivePercentage.value}
              change={data.kpis.positivePercentage.change}
              trend={data.kpis.positivePercentage.trend}
              format="percentage"
              icon={Star}
              delay={0.3}
            />

            <KPICard
              title="Google Clicks"
              value={data.kpis.googleClicks.value}
              change={data.kpis.googleClicks.change}
              trend={data.kpis.googleClicks.trend}
              icon={MousePointerClick}
              delay={0.4}
            />

            <KPICard
              title="Contact Clicks"
              value={data.kpis.contactClicks.value}
              change={data.kpis.contactClicks.change}
              trend={data.kpis.contactClicks.trend}
              icon={Phone}
              delay={0.5}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}