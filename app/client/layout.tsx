'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Sidebar from '@/components/client/Sidebar'
import TopBar from '@/components/client/TopBar'
import { useClientPortalStore } from '@/lib/stores/client-portal'

interface ClientUser {
  id: string
  name: string
  email: string
  restaurant_name: string
  created_at: string
}

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: ClientLayoutProps) {
  const [user, setUser] = useState<ClientUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { setRestaurantName } = useClientPortalStore()

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/client/auth/session')
        const data = await response.json()

        if (data.authenticated && data.user) {
          setUser(data.user)
          setRestaurantName(data.user.restaurant_name || data.user.name)
        } else {
          router.push('/client/login')
        }
      } catch (error) {
        console.error('Failed to fetch session:', error)
        router.push('/client/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [router, setRestaurantName])

  const handleLogout = async () => {
    try {
      await fetch('/api/client/auth/logout', { method: 'POST' })
      router.push('/client/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-6 h-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600 font-medium">Loading your dashboard...</span>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <TopBar user={user} onLogout={handleLogout} />

        {/* Page Content */}
        <motion.main
          layout
          transition={{
            type: 'spring',
            damping: 30,
            stiffness: 300,
          }}
          className="flex-1 overflow-auto"
        >
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
                delay: 0.1,
              }}
              className="max-w-full"
            >
              {children}
            </motion.div>
          </div>
        </motion.main>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: rgba(148, 163, 184, 0.5);
        }

        /* Hide scrollbar for elements that don't need it visible */
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Custom focus styles to match Linear's design */
        *:focus-visible {
          outline: 2px solid #007AFF;
          outline-offset: 2px;
          border-radius: 6px;
        }

        /* Smooth animations for layout changes */
        * {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  )
}