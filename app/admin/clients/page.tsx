'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Download, Users, Archive } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ClientModal } from '@/components/admin/modals/ClientModal'
import { ClientsTable } from '@/components/admin/ClientsTable'

type ClientStatus = 'all' | 'active' | 'inactive' | 'pending'
type ActualClientStatus = 'active' | 'inactive' | 'pending'

interface Client {
  id: string
  name: string
  email: string
  status: ActualClientStatus
  qrCodeCount: number
  locationCount: number
  reviewCount: number
  lastActivity: string
  createdAt: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClientStatus>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [selectedClients, setSelectedClients] = useState<string[]>([])

  const fetchClients = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      })

      const response = await fetch(`/api/admin/clients?${params}`)
      if (!response.ok) throw new Error('Failed to fetch clients')

      const data = await response.json()
      setClients(data.clients)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, searchQuery, statusFilter])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleStatusFilter = (status: ClientStatus) => {
    setStatusFilter(status)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleClientCreated = (newClient: Client) => {
    setClients(prev => [newClient, ...prev])
    setPagination(prev => ({ ...prev, total: prev.total + 1 }))
  }

  const handleClientUpdated = (updatedClient: Client) => {
    setClients(prev => prev.map(client => 
      client.id === updatedClient.id ? { ...client, ...updatedClient } : client
    ))
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  const handleArchiveClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to archive this client?')) return

    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to archive client')

      setClients(prev => prev.filter(client => client.id !== clientId))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    } catch (error) {
      console.error('Failed to archive client:', error)
      alert('Failed to archive client. Please try again.')
    }
  }

  const handleBulkArchive = async () => {
    if (selectedClients.length === 0) return
    if (!confirm(`Archive ${selectedClients.length} selected clients?`)) return

    try {
      await Promise.all(
        selectedClients.map(id =>
          fetch(`/api/admin/clients/${id}`, { method: 'DELETE' })
        )
      )

      setClients(prev => prev.filter(client => !selectedClients.includes(client.id)))
      setSelectedClients([])
      fetchClients()
    } catch (error) {
      console.error('Failed to archive clients:', error)
      alert('Some clients could not be archived. Please try again.')
    }
  }

  const handleExportCSV = () => {
    const csvHeaders = ['Name', 'Email', 'Status', 'QR Codes', 'Locations', 'Reviews', 'Created', 'Last Activity']
    const csvRows = clients.map(client => [
      client.name,
      client.email,
      client.status,
      client.qrCodeCount.toString(),
      client.locationCount.toString(),
      client.reviewCount.toString(),
      new Date(client.createdAt).toLocaleDateString(),
      client.lastActivity,
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `clients-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const activeCount = clients.filter(c => c.status === 'active').length
  const inactiveCount = clients.filter(c => c.status === 'inactive').length
  const pendingCount = clients.filter(c => c.status === 'pending').length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600 mt-1">Manage your restaurant clients and their QR code campaigns</p>
          </div>

          <motion.button
            onClick={() => {
              setEditingClient(null)
              setIsModalOpen(true)
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div 
            className="bg-white rounded-lg border border-gray-200 p-4"
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg border border-gray-200 p-4"
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg border border-gray-200 p-4"
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg border border-gray-200 p-4"
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{inactiveCount}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full sm:w-64"
              />
            </div>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </motion.button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[150px] z-50">
                  <DropdownMenu.Item 
                    onClick={() => handleStatusFilter('all')}
                    className="px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                  >
                    All Clients
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    onClick={() => handleStatusFilter('active')}
                    className="px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                  >
                    Active
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    onClick={() => handleStatusFilter('pending')}
                    className="px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                  >
                    Pending
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    onClick={() => handleStatusFilter('inactive')}
                    className="px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                  >
                    Inactive
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          <div className="flex items-center gap-3">
            {selectedClients.length > 0 && (
              <motion.button
                onClick={handleBulkArchive}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive ({selectedClients.length})
              </motion.button>
            )}

            <motion.button
              onClick={handleExportCSV}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </motion.button>
          </div>
        </div>
      </div>

      <ClientsTable 
        clients={clients}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        selectedClients={selectedClients}
        onSelectedClientsChange={setSelectedClients}
        onEditClient={handleEditClient}
        onArchiveClient={handleArchiveClient}
      />

      <ClientModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        client={editingClient}
        onSuccess={editingClient ? handleClientUpdated : handleClientCreated}
      />
    </div>
  )
}