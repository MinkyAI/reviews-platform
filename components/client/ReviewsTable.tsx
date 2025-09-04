'use client'

import { motion } from 'framer-motion'
import { Star, MessageSquare, ExternalLink, Phone, Mail, QrCode, Clock } from 'lucide-react'
import { format } from 'date-fns'

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

interface ReviewsTableProps {
  reviews: Review[]
  loading: boolean
}

export default function ReviewsTable({ reviews, loading }: ReviewsTableProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-slate-200'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-slate-700">
          {rating}
        </span>
      </div>
    )
  }

  const renderActionsTaken = (review: Review) => {
    const actions = []
    
    if (review.googleClicked) {
      actions.push({
        icon: <ExternalLink className="w-4 h-4" />,
        label: 'Google Review',
        color: 'text-emerald-600 bg-emerald-50',
        type: review.clickedCTA === 'google_direct' ? 'Direct' : 'Copy Link'
      })
    }
    
    if (review.contactClicked) {
      const isPhone = review.clickedCTA === 'contact'
      actions.push({
        icon: isPhone ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />,
        label: isPhone ? 'Called' : 'Emailed',
        color: 'text-purple-600 bg-purple-50',
        type: 'Contact'
      })
    }
    
    if (actions.length === 0) {
      return (
        <span className="text-sm text-slate-400 italic">No actions taken</span>
      )
    }
    
    return (
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-1 px-2 py-1 rounded-md ${action.color}`}
          >
            {action.icon}
            <span className="text-xs font-medium">
              {action.label}
            </span>
          </motion.div>
        ))}
      </div>
    )
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return {
        date: format(date, 'MMM d, yyyy'),
        time: format(date, 'h:mm a')
      }
    } catch (error) {
      return { date: 'Invalid date', time: '' }
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-10 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-4 w-40 bg-slate-200 rounded" />
                <div className="h-4 w-28 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="p-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No reviews found
          </h3>
          <p className="text-slate-500">
            No customer reviews match your current filters. Try adjusting your search criteria or check back later for new reviews.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E7]">
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-900">
                  Date & Time
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-900">
                  Rating
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-900">
                  Comment
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-900">
                  QR Code
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-900">
                  Actions Taken
                </th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, index) => {
                const { date, time } = formatDateTime(review.createdAt)
                
                return (
                  <motion.tr
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-[#E5E5E7] hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-slate-900">{date}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {time}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      {renderStars(review.rating)}
                    </td>
                    
                    <td className="py-4 px-6 max-w-xs">
                      {review.comment ? (
                        <div className="group relative">
                          <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                            {review.comment}
                          </p>
                          {review.comment.length > 100 && (
                            <div className="absolute top-full left-0 z-10 invisible group-hover:visible bg-slate-900 text-white text-xs rounded-lg p-3 shadow-lg max-w-sm mt-2">
                              {review.comment}
                              <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">No comment</span>
                      )}
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-medium text-sm text-slate-900">
                            {review.qrCode.label}
                          </div>
                          <div className="text-xs text-slate-500">
                            {review.qrCode.shortCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      {renderActionsTaken(review)}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden p-4 space-y-4">
        {reviews.map((review, index) => {
          const { date, time } = formatDateTime(review.createdAt)
          
          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-[#E5E5E7] rounded-xl p-4 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-slate-900">{date}</div>
                  <div className="text-sm text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {time}
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              
              {/* QR Code Info */}
              <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-lg">
                <QrCode className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-medium text-sm text-slate-900">
                    {review.qrCode.label}
                  </div>
                  <div className="text-xs text-slate-500">
                    {review.qrCode.shortCode}
                  </div>
                </div>
              </div>
              
              {/* Comment */}
              {review.comment && (
                <div className="py-3 px-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div>
                <div className="text-xs font-medium text-slate-500 mb-2">
                  ACTIONS TAKEN
                </div>
                {renderActionsTaken(review)}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Utility for line clamping
const styles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}