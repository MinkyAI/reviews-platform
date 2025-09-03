# Task: Admin Dashboard Overview

## Objective
Create a comprehensive admin dashboard that displays global KPIs, client overview, and quick access to all management functions.

## Requirements

### Layout Structure
```
┌─────────────────────────────────────────┐
│  Sidebar  │       Main Content          │
│           │                             │
│ • Add New │  KPI Cards                  │
│ • Clients │  ┌────┐ ┌────┐ ┌────┐      │
│   - Name1 │  │    │ │    │ │    │      │
│   - Name2 │  └────┘ └────┘ └────┘      │
│ • Home    │                             │
│           │  Clients Table              │
│           │  ┌─────────────────────┐    │
│           │  │                     │    │
│           │  └─────────────────────┘    │
└─────────────────────────────────────────┘
```

## Component Implementation

### Step 1: Dashboard Layout
```tsx
// /app/admin/layout.tsx
interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <TopBar />
        {children}
      </main>
    </div>
  )
}
```

### Step 2: Sidebar Component
```tsx
interface SidebarProps {
  clients: Client[]
  activeClient?: string
}

interface SidebarItem {
  id: string
  label: string
  href: string
  icon: IconType
  status?: 'draft' | 'live'
  badge?: number
}
```

Features:
- Collapsible on mobile
- Client status indicators (Draft/Live)
- Quick client search
- Active state highlighting
- Smooth transitions

### Step 3: KPI Cards
```tsx
interface KPICard {
  title: string
  value: number | string
  change?: number
  changeType?: 'increase' | 'decrease'
  icon?: IconType
  format?: 'number' | 'currency' | 'percentage'
  dateRange?: DateRange
}
```

KPIs to Display:
1. **Total Scans** - Last 30 days across all clients
2. **Total Submissions** - Reviews submitted
3. **Google Clicks** - Total redirects to Google
4. **Total MRR** - Sum of client monthly prices
5. **Average Rating** - Across all submissions
6. **Active Clients** - Count of live clients

### Step 4: Clients Table
```tsx
interface ClientsTableColumns {
  name: string
  monthlyPrice: number
  status: 'draft' | 'live'
  submissions30d: number
  googleCTR: number
  lastActive: Date
  actions: ActionButtons
}
```

Features:
- Sortable columns
- Search/filter functionality
- Pagination
- Bulk actions
- Export to CSV
- Responsive mobile view

### Step 5: Data Aggregation Service
```typescript
interface DashboardMetrics {
  totalScans: number
  totalSubmissions: number
  googleClicks: number
  totalMRR: number
  averageRating: number
  activeClients: number
  chartData: TimeSeriesData[]
  recentActivity: ActivityItem[]
}

class DashboardService {
  async getMetrics(dateRange: DateRange): Promise<DashboardMetrics>
  async getClientMetrics(clientId: string, dateRange: DateRange): Promise<ClientMetrics>
  async getRecentActivity(limit: number): Promise<ActivityItem[]>
}
```

## Data Queries

### Optimized Aggregation Queries
```sql
-- Total scans (last 30 days)
SELECT COUNT(*) as total_scans
FROM qr_scans
WHERE created_at >= NOW() - INTERVAL '30 days';

-- MRR calculation
SELECT SUM(monthly_price) as total_mrr
FROM clients
WHERE status = 'live';

-- Google CTR by client
SELECT 
  client_id,
  COUNT(CASE WHEN google_clicked THEN 1 END)::float / 
  COUNT(*)::float * 100 as google_ctr
FROM review_submissions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY client_id;
```

## UI Components

### Date Range Picker
```tsx
interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  presets: DatePreset[]
}

const presets = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Custom', value: 'custom' }
]
```

### Charts & Visualizations
```tsx
interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area'
  data: ChartData[]
  options: ChartOptions
  responsive: boolean
}
```

Using Recharts or Chart.js:
- Submissions over time (line chart)
- Rating distribution (bar chart)
- Client comparison (bar chart)
- Trend indicators (sparklines)

### Activity Feed
```tsx
interface ActivityItem {
  id: string
  type: 'review' | 'client_added' | 'qr_generated' | 'settings_changed'
  description: string
  timestamp: Date
  clientName?: string
  metadata?: Record<string, any>
}
```

## State Management

### Dashboard Store (Zustand)
```typescript
interface DashboardStore {
  metrics: DashboardMetrics | null
  loading: boolean
  error: Error | null
  dateRange: DateRange
  selectedClient: string | null
  
  fetchMetrics: () => Promise<void>
  setDateRange: (range: DateRange) => void
  selectClient: (clientId: string | null) => void
  refreshData: () => Promise<void>
}
```

## Real-time Updates

### WebSocket Integration
```typescript
interface RealtimeUpdate {
  type: 'new_review' | 'client_update' | 'metric_change'
  payload: any
  timestamp: Date
}

// Pusher or Socket.io for real-time
const subscribe = (channel: string, callback: (data: RealtimeUpdate) => void) => {
  // Real-time subscription logic
}
```

## Responsive Design

### Mobile Layout
- Stack KPI cards vertically
- Collapsible sidebar (hamburger menu)
- Horizontal scrollable table
- Touch-friendly controls
- Simplified charts

### Tablet Layout
- 2-column KPI grid
- Persistent sidebar
- Responsive table
- Full chart features

### Desktop Layout
- 3-4 column KPI grid
- Fixed sidebar
- Full table view
- Advanced filters
- Multiple charts

## Acceptance Criteria

- [ ] KPIs update in real-time
- [ ] Date range filtering works
- [ ] Client table sortable and searchable
- [ ] Export functionality works
- [ ] Mobile responsive design
- [ ] Loading states implemented
- [ ] Error handling for failed queries
- [ ] Charts render correctly
- [ ] Activity feed updates

## Performance Requirements

- Dashboard load time < 2 seconds
- KPI queries < 500ms
- Chart rendering < 1 second
- Smooth scrolling (60fps)
- Efficient pagination

## Testing Requirements

### Unit Tests
- Metric calculations
- Date range logic
- Formatting functions
- Sort/filter algorithms

### Integration Tests
- Data fetching
- Real-time updates
- Export functionality
- Navigation flow

### E2E Tests
- Complete dashboard load
- Client selection
- Date range changes
- Table interactions

## Dependencies

- recharts or chart.js
- tanstack/react-table
- date-fns
- react-hot-toast
- lucide-react (icons)
- clsx (styling)

## Error Handling

- Failed API calls: Show toast notification
- Empty states: Helpful messages
- Loading states: Skeleton screens
- Network issues: Retry logic
- Invalid data: Fallback values

## Accessibility

- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management
- High contrast mode
- Reduced motion support