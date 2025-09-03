'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  QrCode, 
  Settings, 
  Users, 
  LayoutDashboard, 
  Plus,
  ChevronLeft,
  Circle,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { useDashboardStore, type Client } from '@/lib/stores/dashboard'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    key: 'dashboard'
  },
  {
    name: 'Clients',
    href: '/admin/clients',
    icon: Users,
    key: 'clients'
  },
  {
    name: 'QR Codes',
    href: '/admin/qr-codes',
    icon: QrCode,
    key: 'qr-codes'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    key: 'analytics'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    key: 'settings'
  }
]

const ClientStatusIndicator = ({ status }: { status: Client['status'] }) => {
  const colors = {
    active: 'text-emerald-500',
    inactive: 'text-slate-400',
    pending: 'text-amber-500'
  }

  return (
    <Circle 
      className={cn('w-2 h-2 fill-current', colors[status])}
    />
  )
}

const ClientItem = ({ client, isActive }: { client: Client; isActive: boolean }) => {
  const setSelectedClient = useDashboardStore(state => state.setSelectedClient)
  const sidebarOpen = useDashboardStore(state => state.sidebarOpen)

  return (
    <motion.button
      onClick={() => setSelectedClient(isActive ? null : client)}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200',
        'hover:bg-white/60 hover:backdrop-blur-sm',
        isActive && 'bg-[#007AFF]/10 border border-[#007AFF]/20',
        !sidebarOpen && 'justify-center px-2'
      )}
    >
      <ClientStatusIndicator status={client.status} />
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex-1 min-w-0"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900 truncate">
                {client.name}
              </p>
              {isActive && (
                <Activity className="w-3 h-3 text-[#007AFF] flex-shrink-0 ml-2" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{client.reviewCount} reviews</span>
              {client.lastActivity && (
                <>
                  <Circle className="w-1 h-1 fill-current" />
                  <span>{client.lastActivity}</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default function Sidebar() {
  const { 
    sidebarOpen, 
    toggleSidebar, 
    activeNavItem, 
    setActiveNavItem,
    selectedClient,
    clients,
    setClients 
  } = useDashboardStore()

  // Fetch real clients from database
  React.useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/admin/clients/list')
        const data = await response.json()
        if (data.clients) {
          setClients(data.clients)
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error)
      }
    }
    fetchClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
                    <LayoutDashboard className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-slate-900">Reviews</span>
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

          {/* Add New Client Button */}
          <div className="p-4">
            <motion.button
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full bg-[#007AFF] hover:bg-[#007AFF]/90 text-white rounded-lg',
                'transition-all duration-200',
                'shadow-[0_2px_8px_rgba(0,122,255,0.25)]',
                'hover:shadow-[0_4px_16px_rgba(0,122,255,0.35)]',
                sidebarOpen ? 'h-10 px-4' : 'h-10 px-0'
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      Add New Client
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = activeNavItem === item.key
                const Icon = item.icon

                return (
                  <Link key={item.key} href={item.href}>
                    <motion.div
                      onClick={() => setActiveNavItem(item.key)}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                        'hover:bg-slate-100/70 hover:backdrop-blur-sm',
                        isActive && [
                          'bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20',
                          'shadow-[0_2px_8px_rgba(0,122,255,0.08)]'
                        ],
                        !isActive && 'text-slate-700 hover:text-slate-900',
                        !sidebarOpen && 'justify-center px-2'
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
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

            {/* Clients Section */}
            <AnimatePresence>
              {sidebarOpen && clients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8"
                >
                  <div className="px-3 mb-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Active Clients
                    </h3>
                  </div>
                  <div className="space-y-1 max-h-80 overflow-y-auto scrollbar-thin">
                    {clients.map((client) => (
                      <ClientItem
                        key={client.id}
                        client={client}
                        isActive={selectedClient?.id === client.id}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </div>
      </motion.div>
    </>
  )
}