'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  QrCode, 
  Settings, 
  LayoutDashboard, 
  ChevronLeft,
  MessageSquare,
  Store
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClientPortalStore } from '@/lib/stores/client-portal'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/client',
    icon: LayoutDashboard,
    key: 'dashboard'
  },
  {
    name: 'Reviews',
    href: '/client/reviews',
    icon: MessageSquare,
    key: 'reviews'
  },
  {
    name: 'QR Codes',
    href: '/client/qr-codes',
    icon: QrCode,
    key: 'qr-codes'
  },
  {
    name: 'Settings',
    href: '/client/settings',
    icon: Settings,
    key: 'settings'
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const { 
    sidebarOpen, 
    toggleSidebar, 
    activeNavItem, 
    setActiveNavItem,
    restaurantName
  } = useClientPortalStore()

  // Set active nav item based on current path
  useEffect(() => {
    const currentPath = pathname.replace('/client/', '') || 'dashboard'
    if (currentPath === '' || currentPath === 'dashboard') {
      setActiveNavItem('dashboard')
    } else if (currentPath.startsWith('reviews')) {
      setActiveNavItem('reviews')
    } else if (currentPath.startsWith('qr-codes')) {
      setActiveNavItem('qr-codes')
    } else if (currentPath.startsWith('settings')) {
      setActiveNavItem('settings')
    }
  }, [pathname, setActiveNavItem])

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 80,
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300,
        }}
        className={cn(
          'h-screen z-50 md:z-10 flex-shrink-0',
          'bg-white/80 backdrop-blur-xl border-r border-[#E5E5E7]',
          'shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
          'md:relative',
          'fixed left-0 top-0 md:static',
          !sidebarOpen && '-translate-x-full md:translate-x-0'
        )}
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E5E5E7]/50">
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-lg flex items-center justify-center">
                    <Store className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-900 truncate text-sm">
                      {restaurantName || 'Restaurant'}
                    </span>
                    <span className="text-xs text-slate-500">Client Portal</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              onClick={toggleSidebar}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                'hover:bg-slate-100 transition-colors',
                !sidebarOpen && 'mx-auto'
              )}
            >
              <motion.div
                animate={{ rotate: sidebarOpen ? 0 : 180 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </motion.div>
            </motion.button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = activeNavItem === item.key
                const Icon = item.icon

                return (
                  <Link key={item.key} href={item.href}>
                    <motion.div
                      onClick={() => setActiveNavItem(item.key)}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                        'hover:bg-slate-100/70 hover:backdrop-blur-sm',
                        isActive && [
                          'bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20',
                          'shadow-[0_2px_8px_rgba(0,122,255,0.08)]'
                        ],
                        !isActive && 'text-slate-700 hover:text-slate-900',
                        !sidebarOpen && 'justify-center px-2'
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-sm font-medium"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                )
              })}
            </div>

            {/* Restaurant Info Card */}
            <AnimatePresence>
              {sidebarOpen && restaurantName && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8 p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-[#E5E5E7]/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#34C759] to-[#30D158] rounded-lg flex items-center justify-center">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {restaurantName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Active Client
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* Analytics Preview */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-4 border-t border-[#E5E5E7]/50"
              >
                <div className="bg-gradient-to-r from-[#007AFF]/5 to-[#5856D6]/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-[#007AFF]" />
                    <span className="text-xs font-medium text-slate-900">Quick Stats</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-slate-500">This Month</div>
                      <div className="font-semibold text-slate-900">-</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Rating</div>
                      <div className="font-semibold text-slate-900">-</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}