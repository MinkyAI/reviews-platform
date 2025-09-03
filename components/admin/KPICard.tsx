'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface KPICardProps {
  title: string
  value: string | number
  change: number
  trend: number[]
  format?: 'number' | 'currency' | 'percentage'
  icon?: React.ComponentType<{ className?: string }>
  delay?: number
}

export default function KPICard({ 
  title, 
  value, 
  change, 
  trend, 
  format = 'number', 
  icon: Icon,
  delay = 0 
}: KPICardProps) {
  
  const formatValue = (val: string | number): string => {
    const numValue = typeof val === 'string' ? parseFloat(val) : val
    
    switch (format) {
      case 'currency':
        if (numValue >= 1000000) {
          return `$${(numValue / 1000000).toFixed(1)}M`
        }
        if (numValue >= 1000) {
          return `$${(numValue / 1000).toFixed(1)}k`
        }
        return `$${numValue.toLocaleString()}`
      
      case 'percentage':
        return `${numValue}%`
      
      case 'number':
      default:
        if (numValue >= 1000000) {
          return `${(numValue / 1000000).toFixed(1)}M`
        }
        if (numValue >= 1000) {
          return `${(numValue / 1000).toFixed(1)}k`
        }
        return numValue.toLocaleString()
    }
  }

  const formatChange = (changeValue: number): string => {
    const sign = changeValue > 0 ? '+' : ''
    return `${sign}${changeValue.toFixed(1)}%`
  }

  const getTrendIcon = () => {
    if (change > 0) return TrendingUp
    if (change < 0) return TrendingDown
    return Minus
  }

  const getTrendColor = () => {
    if (change > 0) return 'text-emerald-600'
    if (change < 0) return 'text-red-500'
    return 'text-slate-400'
  }

  const getTrendBgColor = () => {
    if (change > 0) return 'bg-emerald-50'
    if (change < 0) return 'bg-red-50'
    return 'bg-slate-50'
  }

  const sparklineData = trend.map((value, index) => ({
    index,
    value
  }))

  const TrendIcon = getTrendIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300,
        delay
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="group relative"
    >
      <div className="bg-white rounded-xl border border-[#E5E5E7] p-6 overflow-hidden transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] cursor-pointer">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600">{title}</h3>
            {Icon && (
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#007AFF]/10 to-[#5856D6]/10">
                <Icon className="w-4 h-4 text-[#007AFF]" />
              </div>
            )}
          </div>

          {/* Value */}
          <div className="mb-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300,
                delay: delay + 0.1
              }}
              className="text-3xl font-bold text-slate-900 mb-1"
            >
              {formatValue(value)}
            </motion.div>
            
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${getTrendBgColor()}`}>
                <TrendIcon className={`w-3 h-3 ${getTrendColor()}`} />
                <span className={`text-xs font-medium ${getTrendColor()}`}>
                  {formatChange(change)}
                </span>
              </div>
              <span className="text-xs text-slate-500">vs last period</span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="h-12 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={change > 0 ? '#10b981' : change < 0 ? '#ef4444' : '#64748b'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  )
}