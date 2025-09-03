'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminRoot() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-600 font-medium">Loading dashboard...</span>
      </div>
    </div>
  )
}