'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { BarChart3, Activity, Clock, Star, TrendingUp } from 'lucide-react'
import DashboardMetrics from '@/components/client/DashboardMetrics'
import ReviewsChart from '@/components/client/charts/ReviewsChart'

interface RecentActivity {
  id: string
  type: 'scan' | 'review' | 'google' | 'contact'
  message: string
  timestamp: string
  rating?: number
}

interface ClientInfo {
  id: string
  name: string
}

export default function ClientDashboard() {
  const [timeframe, setTimeframe] = useState('30d')
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true)
        
        // Get auth token
        const token = localStorage.getItem('clientAuthToken')
        if (!token) {
          // Redirect to login if no token
          window.location.href = '/client/login'
          return
        }

        // Fetch client analytics to get client info
        const response = await fetch(`/api/client/analytics?timeframe=${timeframe}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          setClientInfo(data.client)
        }

        // Mock recent activity for now - in a real app this would come from the API
        const mockRecentActivity: RecentActivity[] = [
          {
            id: '1',
            type: 'review',
            message: 'New 5-star review submitted',
            timestamp: '2 minutes ago',
            rating: 5
          },
          {
            id: '2',
            type: 'scan',
            message: 'QR code scanned from Table 7',
            timestamp: '15 minutes ago'
          },
          {
            id: '3',
            type: 'google',
            message: 'Customer clicked "Leave Google Review"',
            timestamp: '1 hour ago'
          },
          {
            id: '4',
            type: 'review',
            message: 'New 4-star review with feedback',
            timestamp: '2 hours ago',
            rating: 4
          },
          {
            id: '5',
            type: 'contact',
            message: 'Customer clicked contact information',
            timestamp: '3 hours ago'
          },
          {
            id: '6',
            type: 'scan',
            message: 'QR code scanned from Table 12',
            timestamp: '4 hours ago'
          }
        ]

        setRecentActivity(mockRecentActivity)
      } catch (error) {
        console.error('Failed to fetch client data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [timeframe])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <Star className="w-4 h-4 text-yellow-500" />
      case 'scan':
        return <BarChart3 className="w-4 h-4 text-[#007AFF]" />
      case 'google':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'contact':
        return <Activity className="w-4 h-4 text-purple-500" />
      default:
        return <Activity className="w-4 h-4 text-slate-500" />
    }
  }

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'review':
        return 'bg-yellow-50 border-yellow-100'
      case 'scan':
        return 'bg-blue-50 border-blue-100'
      case 'google':
        return 'bg-green-50 border-green-100'
      case 'contact':
        return 'bg-purple-50 border-purple-100'
      default:
        return 'bg-slate-50 border-slate-100'
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-slate-200 rounded-xl" />
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
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">
          Welcome back{clientInfo ? `, ${clientInfo.name}` : ''}! Here's your performance overview.
        </p>
      </motion.div>

      {/* KPI Metrics */}
      <DashboardMetrics />

      {/* Charts and Analytics */}
      <ReviewsChart timeframe={timeframe} />

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-xl border border-[#E5E5E7] p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#007AFF]" />
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          </div>
          <div className="text-sm text-slate-500">
            Live updates
          </div>
        </div>
        
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <motion.div 
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`flex items-start gap-4 p-3 rounded-lg border transition-colors hover:bg-slate-50 ${getActivityBg(activity.type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-slate-900">
                    {activity.message}
                  </p>
                  {activity.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-yellow-600">
                        {activity.rating}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {activity.timestamp}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-xl border border-[#E5E5E7] p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-[#007AFF]" />
          <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              name: 'Download QR Code', 
              description: 'Get your latest QR code',
              color: 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100'
            },
            { 
              name: 'View All Reviews', 
              description: 'See customer feedback',
              color: 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100'
            },
            { 
              name: 'Analytics Report', 
              description: 'Download detailed report',
              color: 'bg-purple-50 border-purple-100 text-purple-700 hover:bg-purple-100'
            },
            { 
              name: 'Settings', 
              description: 'Update your preferences',
              color: 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
            }
          ].map((action, index) => (
            <motion.button
              key={action.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-start gap-2 p-4 rounded-lg border transition-all text-left ${action.color}`}
            >
              <div className="text-sm font-medium">{action.name}</div>
              <div className="text-xs opacity-70">{action.description}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}