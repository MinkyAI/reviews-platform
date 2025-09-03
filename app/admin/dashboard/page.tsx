'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Shield, Users, QrCode, BarChart3, Activity, Clock, Star, TrendingUp } from 'lucide-react'
import DashboardMetrics from '@/components/admin/DashboardMetrics'
import SubmissionsChart from '@/components/admin/charts/SubmissionsChart'

interface RecentActivity {
  id: string
  type: 'scan' | 'review' | 'client'
  clientName: string
  message: string
  timestamp: string
  avatar?: string
}

interface TopClient {
  id: string
  name: string
  reviewCount: number
  avgRating: number
  change: number
}

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState('30d')
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [topClients, setTopClients] = useState<TopClient[]>([])

  useEffect(() => {
    const mockRecentActivity: RecentActivity[] = [
      {
        id: '1',
        type: 'review',
        clientName: 'Mario\'s Italian Kitchen',
        message: 'New 5-star review submitted',
        timestamp: '2 minutes ago'
      },
      {
        id: '2',
        type: 'scan',
        clientName: 'Blue Moon Cafe',
        message: 'QR code scanned 12 times today',
        timestamp: '15 minutes ago'
      },
      {
        id: '3',
        type: 'client',
        clientName: 'Ocean View Restaurant',
        message: 'New client onboarded',
        timestamp: '1 hour ago'
      },
      {
        id: '4',
        type: 'review',
        clientName: 'Sunset Grill',
        message: 'Customer clicked Google Reviews',
        timestamp: '2 hours ago'
      },
      {
        id: '5',
        type: 'scan',
        clientName: 'Downtown Diner',
        message: 'High scan activity detected',
        timestamp: '3 hours ago'
      }
    ]

    const mockTopClients: TopClient[] = [
      {
        id: '1',
        name: 'Mario\'s Italian Kitchen',
        reviewCount: 47,
        avgRating: 4.8,
        change: 23.5
      },
      {
        id: '2',
        name: 'Blue Moon Cafe',
        reviewCount: 32,
        avgRating: 4.6,
        change: 12.3
      },
      {
        id: '3',
        name: 'Ocean View Restaurant',
        reviewCount: 28,
        avgRating: 4.9,
        change: 18.7
      },
      {
        id: '4',
        name: 'Sunset Grill',
        reviewCount: 24,
        avgRating: 4.4,
        change: 8.9
      },
      {
        id: '5',
        name: 'Downtown Diner',
        reviewCount: 19,
        avgRating: 4.3,
        change: -2.1
      }
    ]

    setRecentActivity(mockRecentActivity)
    setTopClients(mockTopClients)
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <Star className="w-4 h-4 text-yellow-500" />
      case 'scan':
        return <QrCode className="w-4 h-4 text-blue-500" />
      case 'client':
        return <Users className="w-4 h-4 text-green-500" />
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
      case 'client':
        return 'bg-green-50 border-green-100'
      default:
        return 'bg-slate-50 border-slate-100'
    }
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
          Welcome back! Here's what's happening with your reviews platform.
        </p>
      </motion.div>

      {/* KPI Metrics */}
      <DashboardMetrics />

      {/* Charts and Analytics */}
      <SubmissionsChart timeframe={timeframe} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-xl border border-[#E5E5E7] p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#007AFF]" />
              <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            </div>
            <button className="text-sm text-[#007AFF] hover:text-[#007AFF]/80 font-medium transition-colors">
              View all →
            </button>
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
                  <p className="text-sm font-medium text-slate-900">
                    {activity.clientName}
                  </p>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {activity.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {activity.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Performing Clients */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-xl border border-[#E5E5E7] p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-[#007AFF]" />
              <h3 className="text-lg font-semibold text-slate-900">Top Performers</h3>
            </div>
            <button className="text-sm text-[#007AFF] hover:text-[#007AFF]/80 font-medium transition-colors">
              View all →
            </button>
          </div>
          
          <div className="space-y-4">
            {topClients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {client.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{client.reviewCount} reviews</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {client.avgRating}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={`text-xs font-medium px-2 py-1 rounded-md ${
                  client.change > 0 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-red-500 bg-red-50'
                }`}>
                  {client.change > 0 ? '+' : ''}{client.change.toFixed(1)}%
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Health Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-xl border border-[#E5E5E7] p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-[#007AFF]" />
          <h3 className="text-lg font-semibold text-slate-900">System Health</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Authentication', status: 'healthy', uptime: '99.9%' },
            { name: 'Database', status: 'healthy', uptime: '99.8%' },
            { name: 'QR Generation', status: 'healthy', uptime: '100%' },
            { name: 'Analytics API', status: 'healthy', uptime: '99.7%' }
          ].map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-100"
            >
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-medium text-slate-900">{service.name}</p>
                <p className="text-xs text-emerald-600">
                  {service.uptime} uptime
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}