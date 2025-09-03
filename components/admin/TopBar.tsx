'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  ChevronDown,
  Menu,
  Command
} from 'lucide-react'
import { useDashboardStore } from '@/lib/stores/dashboard'
import { cn } from '@/lib/utils'

interface User {
  id: string
  email: string
  created_at: string
}

interface TopBarProps {
  user?: User | null
  onLogout?: () => void
}

export default function TopBar({ user, onLogout }: TopBarProps) {
  const { 
    searchQuery, 
    setSearchQuery, 
    // sidebarOpen, 
    toggleSidebar, 
    isMobile, 
    setIsMobile,
    activeNavItem 
  } = useDashboardStore()

  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768)
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [setIsMobile])

  // Generate breadcrumb from active nav item
  const getBreadcrumb = () => {
    const breadcrumbMap: Record<string, string> = {
      dashboard: 'Dashboard',
      clients: 'Clients',
      'qr-codes': 'QR Codes',
      analytics: 'Analytics',
      settings: 'Settings'
    }
    return breadcrumbMap[activeNavItem] || 'Dashboard'
  }

  return (
    <motion.header 
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#E5E5E7]"
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          {isMobile && (
            <motion.button
              onClick={toggleSidebar}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-4 h-4 text-slate-600" />
            </motion.button>
          )}

          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Reviews Platform</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-900">
              {getBreadcrumb()}
            </span>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-md mx-8 hidden sm:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients, analytics..."
              className={cn(
                'w-full pl-10 pr-16 py-2 text-sm',
                'bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white',
                'border border-transparent hover:border-slate-200 focus:border-[#007AFF]',
                'rounded-lg transition-all duration-200',
                'placeholder-slate-400 text-slate-900',
                'focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20'
              )}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                {isMac ? <Command className="w-3 h-3" /> : 'Ctrl'}
                <span>K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Button */}
          <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors sm:hidden">
            <Search className="w-4 h-4 text-slate-600" />
          </button>

          {/* Notifications */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors relative"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {/* Notification dot */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF3B30] rounded-full" />
          </motion.button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <motion.button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg transition-all duration-200',
                'hover:bg-slate-100/70 hover:backdrop-blur-sm',
                showProfileDropdown && 'bg-slate-100'
              )}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-900">
                  {user?.email?.split('@')[0] || 'Admin'}
                </p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <ChevronDown className={cn(
                'w-4 h-4 text-slate-400 transition-transform hidden md:block',
                showProfileDropdown && 'rotate-180'
              )} />
            </motion.button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileDropdown && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowProfileDropdown(false)}
                    className="fixed inset-0 z-10"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{
                      type: 'spring',
                      damping: 20,
                      stiffness: 300,
                    }}
                    className={cn(
                      'absolute right-0 mt-2 w-64 z-20',
                      'bg-white/95 backdrop-blur-xl rounded-xl',
                      'border border-[#E5E5E7] shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
                      'overflow-hidden'
                    )}
                    style={{
                      backdropFilter: 'blur(20px) saturate(180%)',
                    }}
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-[#E5E5E7]/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {user?.email || 'admin@example.com'}
                          </p>
                          <p className="text-xs text-slate-500">Administrator</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <Settings className="w-4 h-4" />
                        <span>Account Settings</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-[#E5E5E7]/50 py-2">
                      <motion.button
                        onClick={() => {
                          setShowProfileDropdown(false)
                          onLogout?.()
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#FF3B30] hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </motion.button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  )
}