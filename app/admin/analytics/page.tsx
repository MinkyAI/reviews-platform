'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Calendar, TrendingUp, Users, Star, MousePointer, MessageSquare } from 'lucide-react'
import DashboardMetrics from '@/components/admin/DashboardMetrics'
import SubmissionsChart from '@/components/admin/charts/SubmissionsChart'

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('30d')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Analytics Overview</h1>
          <p className="text-sm text-slate-600 mt-1">
            Monitor performance across all clients and locations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeframe('7d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeframe === '7d'
                ? 'bg-[#007AFF] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            7 days
          </button>
          <button
            onClick={() => setTimeframe('30d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeframe === '30d'
                ? 'bg-[#007AFF] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            30 days
          </button>
          <button
            onClick={() => setTimeframe('90d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeframe === '90d'
                ? 'bg-[#007AFF] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            90 days
          </button>
        </div>
      </motion.div>

      {/* Metrics Dashboard */}
      <DashboardMetrics timeframe={timeframe} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6"
        >
          <SubmissionsChart timeframe={timeframe} />
        </motion.div>

        {/* Top Performing Clients */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Top Performing Clients</h3>
            <TrendingUp className="w-5 h-5 text-[#007AFF]" />
          </div>
          
          <div className="space-y-4">
            {[
              { name: "Mario's Italian Kitchen", reviews: 156, rating: 4.8, trend: +12 },
              { name: "Blue Moon Cafe", reviews: 134, rating: 4.6, trend: +8 },
              { name: "Ocean View Restaurant", reviews: 98, rating: 4.9, trend: +15 },
              { name: "Sunset Grill", reviews: 87, rating: 4.4, trend: -3 },
              { name: "Downtown Diner", reviews: 76, rating: 4.7, trend: +5 }
            ].map((client, index) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF]/20 to-[#007AFF]/5 rounded-lg flex items-center justify-center text-[#007AFF] font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{client.name}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {client.reviews} reviews
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {client.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${client.trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {client.trend > 0 ? '+' : ''}{client.trend}%
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scan to Review Conversion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600">Conversion Rate</h3>
            <MousePointer className="w-4 h-4 text-[#007AFF]" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-slate-900">68.4%</div>
              <p className="text-xs text-emerald-600">+5.2% from last period</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-[#007AFF] to-[#0051D5] h-2 rounded-full" style={{ width: '68.4%' }} />
            </div>
          </div>
        </motion.div>

        {/* Average Rating Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600">Rating Distribution</h3>
            <Star className="w-4 h-4 text-[#007AFF]" />
          </div>
          <div className="space-y-2">
            {[
              { stars: 5, count: 234, percent: 45 },
              { stars: 4, count: 156, percent: 30 },
              { stars: 3, count: 78, percent: 15 },
              { stars: 2, count: 36, percent: 7 },
              { stars: 1, count: 15, percent: 3 }
            ].map((rating) => (
              <div key={rating.stars} className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 w-4">{rating.stars}★</span>
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-1.5 rounded-full"
                    style={{ width: `${rating.percent}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-10 text-right">{rating.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Active Clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600">Active Clients</h3>
            <Users className="w-4 h-4 text-[#007AFF]" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-slate-900">24 / 28</div>
              <p className="text-xs text-slate-500">85.7% activity rate</p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-8 rounded ${
                    i < 24 ? 'bg-gradient-to-b from-[#007AFF] to-[#0051D5]' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}