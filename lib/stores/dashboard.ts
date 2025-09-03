import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Client {
  id: string
  name: string
  status: 'active' | 'inactive' | 'pending'
  reviewCount: number
  lastActivity?: string
}

interface DashboardStore {
  sidebarOpen: boolean
  selectedClient: Client | null
  activeNavItem: string
  searchQuery: string
  clients: Client[]
  isMobile: boolean
  
  // Actions
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSelectedClient: (client: Client | null) => void
  setActiveNavItem: (item: string) => void
  setSearchQuery: (query: string) => void
  setClients: (clients: Client[]) => void
  setIsMobile: (mobile: boolean) => void
  addClient: (client: Client) => void
  updateClient: (id: string, updates: Partial<Client>) => void
  removeClient: (id: string) => void
}

export const useDashboardStore = create<DashboardStore>()(
  devtools(
    (set, get) => ({
      sidebarOpen: true,
      selectedClient: null,
      activeNavItem: 'dashboard',
      searchQuery: '',
      clients: [
        {
          id: '1',
          name: 'Bella Vista Restaurant',
          status: 'active',
          reviewCount: 127,
          lastActivity: '2 hours ago'
        },
        {
          id: '2',
          name: 'The Garden Cafe',
          status: 'active',
          reviewCount: 89,
          lastActivity: '5 hours ago'
        },
        {
          id: '3',
          name: 'Sunset Bistro',
          status: 'pending',
          reviewCount: 23,
          lastActivity: '1 day ago'
        }
      ],
      isMobile: false,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSelectedClient: (client) => set({ selectedClient: client }),
      
      setActiveNavItem: (item) => set({ activeNavItem: item }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setClients: (clients) => set({ clients }),
      
      setIsMobile: (mobile) => set({ isMobile: mobile }),
      
      addClient: (client) => set((state) => ({
        clients: [...state.clients, client]
      })),
      
      updateClient: (id, updates) => set((state) => ({
        clients: state.clients.map(client => 
          client.id === id ? { ...client, ...updates } : client
        )
      })),
      
      removeClient: (id) => set((state) => ({
        clients: state.clients.filter(client => client.id !== id),
        selectedClient: state.selectedClient?.id === id ? null : state.selectedClient
      }))
    }),
    {
      name: 'dashboard-store'
    }
  )
)

export type { Client }