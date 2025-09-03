'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import {
  MoreHorizontal,
  Edit,
  Archive,
  Eye,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  QrCode,
  MapPin,
  Star,
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { format } from 'date-fns'

interface Client {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive' | 'pending'
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

interface ClientsTableProps {
  clients: Client[]
  isLoading: boolean
  pagination: PaginationData
  onPageChange: (page: number) => void
  selectedClients: string[]
  onSelectedClientsChange: (selected: string[]) => void
  onEditClient: (client: Client) => void
  onArchiveClient: (clientId: string) => void
}

const columnHelper = createColumnHelper<Client>()

export function ClientsTable({
  clients,
  isLoading,
  pagination,
  onPageChange,
  selectedClients,
  onSelectedClientsChange,
  onEditClient,
  onArchiveClient,
}: ClientsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        ),
        size: 50,
      }),
      columnHelper.accessor('name', {
        header: 'Client',
        cell: (info) => (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {info.getValue().charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-gray-900">{info.getValue()}</div>
              <div className="text-sm text-gray-500">{info.row.original.email}</div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue()
          const colors = {
            active: 'bg-green-100 text-green-800 border-green-200',
            inactive: 'bg-gray-100 text-gray-800 border-gray-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          }
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}>
              <div className={`w-2 h-2 rounded-full mr-1.5 ${
                status === 'active' ? 'bg-green-500' : 
                status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
              }`} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )
        },
      }),
      columnHelper.accessor('qrCodeCount', {
        header: 'QR Codes',
        cell: (info) => (
          <div className="flex items-center text-gray-900">
            <QrCode className="w-4 h-4 mr-1.5 text-gray-400" />
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('locationCount', {
        header: 'Locations',
        cell: (info) => (
          <div className="flex items-center text-gray-900">
            <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('reviewCount', {
        header: 'Reviews',
        cell: (info) => (
          <div className="flex items-center text-gray-900">
            <Star className="w-4 h-4 mr-1.5 text-gray-400" />
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: (info) => (
          <div className="text-sm text-gray-900">
            {format(new Date(info.getValue()), 'MMM d, yyyy')}
          </div>
        ),
      }),
      columnHelper.accessor('lastActivity', {
        header: 'Last Activity',
        cell: (info) => (
          <div className="text-sm text-gray-500">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </motion.button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[160px] z-50">
                <DropdownMenu.Item 
                  onClick={() => onEditClient(row.original)}
                  className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Client
                </DropdownMenu.Item>
                <DropdownMenu.Item 
                  onClick={() => window.open(`/admin/clients/${row.original.id}`, '_blank')}
                  className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                <DropdownMenu.Item 
                  onClick={() => onArchiveClient(row.original.id)}
                  className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ),
        size: 60,
      }),
    ],
    [onEditClient, onArchiveClient]
  )

  const table = useReactTable({
    data: clients,
    columns,
    state: {
      sorting,
      rowSelection: selectedClients.reduce((acc, id) => ({ ...acc, [id]: true }), {}),
    },
    onSortingChange: setSorting,
    onRowSelectionChange: (updaterOrValue) => {
      const newSelection = typeof updaterOrValue === 'function' 
        ? updaterOrValue(selectedClients.reduce((acc, id) => ({ ...acc, [id]: true }), {}))
        : updaterOrValue
      
      onSelectedClientsChange(Object.keys(newSelection).filter(key => newSelection[key]))
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="w-48 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: header.column.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="ml-2">
                            {header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <div className="w-4 h-4" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        <AnimatePresence>
          {clients.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="border-b border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(client.id)}
                    onChange={() => {
                      if (selectedClients.includes(client.id)) {
                        onSelectedClientsChange(selectedClients.filter(id => id !== client.id))
                      } else {
                        onSelectedClientsChange([...selectedClients, client.id])
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                    <p className="text-sm text-gray-500 truncate">{client.email}</p>
                    <div className="flex items-center mt-1 space-x-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        client.status === 'active' ? 'bg-green-100 text-green-800' :
                        client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {client.status}
                      </span>
                      <span className="text-xs text-gray-500">{client.qrCodeCount} QR codes</span>
                    </div>
                  </div>
                </div>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </motion.button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[160px] z-50">
                      <DropdownMenu.Item 
                        onClick={() => onEditClient(client)}
                        className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Client
                      </DropdownMenu.Item>
                      <DropdownMenu.Item 
                        onClick={() => window.open(`/admin/clients/${client.id}`, '_blank')}
                        className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                      <DropdownMenu.Item 
                        onClick={() => onArchiveClient(client.id)}
                        className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 flex items-center justify-between sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <motion.button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              whileHover={{ scale: pagination.page === 1 ? 1 : 1.02 }}
              whileTap={{ scale: pagination.page === 1 ? 1 : 0.98 }}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </motion.button>
            <motion.button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              whileHover={{ scale: pagination.page === pagination.pages ? 1 : 1.02 }}
              whileTap={{ scale: pagination.page === pagination.pages ? 1 : 0.98 }}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </motion.button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                whileHover={{ scale: pagination.page === 1 ? 1 : 1.05 }}
                whileTap={{ scale: pagination.page === 1 ? 1 : 0.95 }}
                className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <motion.button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                )
              })}
              
              <motion.button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                whileHover={{ scale: pagination.page === pagination.pages ? 1 : 1.05 }}
                whileTap={{ scale: pagination.page === pagination.pages ? 1 : 0.95 }}
                className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}