import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface ClientPortalStore {
  sidebarOpen: boolean
  activeNavItem: string
  searchQuery: string
  isMobile: boolean
  restaurantName: string
  
  // Actions
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setActiveNavItem: (item: string) => void
  setSearchQuery: (query: string) => void
  setIsMobile: (mobile: boolean) => void
  setRestaurantName: (name: string) => void
}

export const useClientPortalStore = create<ClientPortalStore>()(
  devtools(
    (set) => ({
      sidebarOpen: true,
      activeNavItem: 'dashboard',
      searchQuery: '',
      isMobile: false,
      restaurantName: '',

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setActiveNavItem: (item) => set({ activeNavItem: item }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setIsMobile: (mobile) => set({ isMobile: mobile }),

      setRestaurantName: (name) => set({ restaurantName: name })
    }),
    {
      name: 'client-portal-store'
    }
  )
)