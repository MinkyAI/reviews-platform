'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts'
import { TrendingUp, BarChart3, Activity } from 'lucide-react'

interface ChartData {
  date: string
  scans: number
  reviews: number
  formattedDate: string
}

interface ReviewsChartProps {
  timeframe?: string
  className?: string
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    color: string
    dataKey: string
    value: number
  }>
  label?: string | number
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const date = new Date(label).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
    
    return (
      <div className="bg-white border border-[#E5E5E7] rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-slate-900 mb-2">{date}</p>
        {payload.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600 capitalize">{entry.dataKey}:</span>
            <span className="font-medium text-slate-900">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function ReviewsChart({ 
  timeframe = '30d', 
  className = '' 
}: ReviewsChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get auth token from localStorage
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
            throw new Error('Authentication expired')
          }
          throw new Error('Failed to fetch chart data')
        }

        const data = await response.json()
        
        if (!data || !data.timeSeries) {
          setChartData([])
          return
        }
        
        // Combine scans and reviews data by date
        const scansMap = new Map(data.timeSeries.scans.map((item: { date: string; count: number }) => [item.date, item.count]))
        const reviewsMap = new Map(data.timeSeries.reviews.map((item: { date: string; count: number }) => [item.date, item.count]))
        
        // Get all unique dates
        const allDates = new Set([
          ...data.timeSeries.scans.map((item: { date: string }) => item.date),
          ...data.timeSeries.reviews.map((item: { date: string }) => item.date)
        ])
        
        const processedData: ChartData[] = Array.from(allDates)
          .sort()
          .map((date: string) => {
            const scans = scansMap.get(date) || 0
            const reviews = reviewsMap.get(date) || 0
            const dateObj = new Date(date)
            
            return {
              date,
              scans: Number(scans),
              reviews: Number(reviews),
              formattedDate: dateObj.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })
            }
          })
        
        setChartData(processedData)
      } catch (err) {
        console.error('Failed to fetch chart data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load chart data')
        setChartData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeframe])

  const totalScans = chartData.reduce((sum, item) => sum + item.scans, 0)
  const totalReviews = chartData.reduce((sum, item) => sum + item.reviews, 0)
  const conversionRate = totalScans > 0 ? (totalReviews / totalScans) * 100 : 0
  const avgDailyScans = chartData.length > 0 ? Math.round(totalScans / chartData.length) : 0

  const chartTypes = [
    { type: 'area' as const, label: 'Area', icon: Activity },
    { type: 'line' as const, label: 'Line', icon: TrendingUp },
    { type: 'bar' as const, label: 'Bar', icon: BarChart3 }
  ]

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    }

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="formattedDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="scans" 
              stroke="#007AFF" 
              strokeWidth={3}
              dot={{ fill: '#007AFF', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#007AFF', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="reviews" 
              stroke="#34C759" 
              strokeWidth={3}
              dot={{ fill: '#34C759', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#34C759', strokeWidth: 2 }}
            />
          </LineChart>
        )
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="formattedDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="scans" fill="#007AFF" radius={[2, 2, 0, 0]} />
            <Bar dataKey="reviews" fill="#34C759" radius={[2, 2, 0, 0]} />
          </BarChart>
        )
      
      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#007AFF" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="reviewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34C759" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#34C759" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="formattedDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="scans"
              stackId="1"
              stroke="#007AFF"
              strokeWidth={2}
              fill="url(#scansGradient)"
            />
            <Area
              type="monotone"
              dataKey="reviews"
              stackId="2"
              stroke="#34C759"
              strokeWidth={2}
              fill="url(#reviewsGradient)"
            />
          </AreaChart>
        )
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-[#E5E5E7] p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
          <div className="h-64 bg-slate-100 rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl border border-[#E5E5E7] p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-600 font-medium mb-2">Failed to load chart data</div>
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`bg-white rounded-xl border border-[#E5E5E7] p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-[#007AFF]" />
            <h3 className="text-lg font-semibold text-slate-900">Engagement Trends</h3>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            QR code scans vs review submissions over time
          </p>
        </div>

        {/* Chart Type Selector */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
          {chartTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.type}
                onClick={() => setChartType(type.type)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  chartType === type.type
                    ? 'bg-white text-[#007AFF] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-[#007AFF]">{totalScans}</div>
          <div className="text-sm text-slate-600">Total Scans</div>
        </div>
        <div className="text-center p-3 bg-emerald-50 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600">{totalReviews}</div>
          <div className="text-sm text-slate-600">Total Reviews</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-2xl font-bold text-slate-900">{conversionRate.toFixed(1)}%</div>
          <div className="text-sm text-slate-600">Conversion Rate</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}