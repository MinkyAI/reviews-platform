# Task: Client Portal Dashboard

## Objective
Create a read-only dashboard for restaurant clients to view their reviews, analytics, and manage limited settings with strict data isolation.

## Requirements

### Core Features
- View-only analytics and metrics
- Read reviews from customers
- Download QR codes (no generation)
- Limited branding customization
- Update contact information

### Data Isolation
- Only show data for logged-in client
- No cross-client visibility
- Scoped API responses
- Client-specific branding

## Layout Structure

```tsx
// /app/client/layout.tsx
interface ClientLayoutProps {
  children: React.ReactNode
  client: Client
  user: ClientUser
}

export default function ClientLayout({ children, client, user }: ClientLayoutProps) {
  return (
    <div className="flex h-screen">
      <ClientSidebar client={client} />
      <main className="flex-1 overflow-auto">
        <ClientTopBar client={client} user={user} />
        {children}
      </main>
    </div>
  )
}
```

## Dashboard Components

### 1. Overview Dashboard
```tsx
interface ClientDashboardProps {
  clientId: string
  dateRange: DateRange
}

interface ClientMetrics {
  totalScans: number
  totalSubmissions: number
  positiveReviews: { count: number; percentage: number }
  negativeReviews: { count: number; percentage: number }
  averageRating: number
  googleClicks: number
  contactClicks: number
  dailyTrend: TrendData[]
}
```

#### KPI Cards Layout
```
┌─────────────┬─────────────┬─────────────┐
│ Total Scans │ Submissions │ Avg Rating  │
│    1,234    │     567     │    4.5★     │
└─────────────┴─────────────┴─────────────┘
┌─────────────┬─────────────┬─────────────┐
│  Positive   │  Negative   │Google Clicks│
│  456 (80%)  │  111 (20%)  │     234     │
└─────────────┴─────────────┴─────────────┘
```

#### Metrics Service
```typescript
class ClientMetricsService {
  async getMetrics(clientId: string, dateRange: DateRange): Promise<ClientMetrics> {
    // All queries must include clientId filter
    const [scans, submissions, clicks] = await Promise.all([
      this.getScans(clientId, dateRange),
      this.getSubmissions(clientId, dateRange),
      this.getClicks(clientId, dateRange)
    ])
    
    return this.calculateMetrics(scans, submissions, clicks)
  }
  
  private validateClientAccess(clientId: string, userId: string): Promise<boolean> {
    // Verify user belongs to client
  }
}
```

### 2. Reviews Tab
```tsx
interface ReviewsTabProps {
  clientId: string
  filters: ReviewFilters
}

interface ReviewFilters {
  rating?: number[]
  dateRange?: DateRange
  searchTerm?: string
  qrCode?: string
  hasComment?: boolean
}

interface ReviewDisplay {
  id: string
  date: Date
  time: string
  rating: number
  comment: string
  qrLabel: string
  googleClicked: boolean
  contactClicked: boolean
}
```

#### Features
- Read-only table view
- Advanced filtering
- Search functionality
- Export to CSV
- Mobile responsive cards

#### Review Table Component
```tsx
const ReviewsTable = ({ reviews, onExport }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Date/Time</TableHead>
        <TableHead>Rating</TableHead>
        <TableHead>Comment</TableHead>
        <TableHead>Table/Location</TableHead>
        <TableHead>Actions Taken</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {reviews.map(review => (
        <ReviewRow key={review.id} review={review} />
      ))}
    </TableBody>
  </Table>
)
```

### 3. QR Codes Tab
```tsx
interface QRCodesTabProps {
  clientId: string
}

interface QRCodeDisplay {
  id: string
  label: string
  shortUrl: string
  createdAt: Date
  status: 'active' | 'archived'
  scanCount: number
}
```

#### Features
- View existing QR codes
- Download individual codes
- Copy short URLs
- View scan statistics
- "Request new codes" message

#### Download Options
```typescript
interface DownloadOptions {
  format: 'svg' | 'png' | 'pdf'
  size: 'small' | 'medium' | 'large'
  includeLabel: boolean
}

async function downloadQRCode(
  codeId: string, 
  options: DownloadOptions
): Promise<Blob> {
  const response = await fetch(`/api/client/qr/${codeId}/download`, {
    method: 'POST',
    body: JSON.stringify(options)
  })
  return response.blob()
}
```

### 4. Branding Tab
```tsx
interface BrandingTabProps {
  clientId: string
  currentBranding: ClientBranding
  onSave: (updates: Partial<ClientBranding>) => Promise<void>
}

interface EditableBranding {
  logoUrl: string
  primaryColor: string
  accentColor: string
  backgroundColor: string
  fontFamily: string
  buttonShape: 'rounded' | 'square'
}
```

#### Components
- Logo upload
- Color pickers
- Font selector
- Button style selector
- Live preview
- Save changes button

### 5. Settings Tab
```tsx
interface SettingsTabProps {
  client: Client
  onSave: (updates: ClientSettings) => Promise<void>
}

interface ClientSettings {
  contactEmail: string
  contactPhone?: string
  googlePlaceId?: string
  privacyText?: string
  notificationPreferences?: NotificationSettings
}
```

#### Editable Fields
- Contact email (required)
- Contact phone
- Google Place ID
- Privacy policy text

#### Read-only Fields
- Organization name
- Account status
- Subscription plan
- Account created date

## State Management

```typescript
interface ClientPortalStore {
  client: Client
  user: ClientUser
  metrics: ClientMetrics | null
  reviews: Review[]
  qrCodes: QRCode[]
  loading: boolean
  error: Error | null
  
  // Actions
  fetchMetrics: (dateRange: DateRange) => Promise<void>
  fetchReviews: (filters: ReviewFilters) => Promise<void>
  fetchQRCodes: () => Promise<void>
  updateBranding: (branding: Partial<ClientBranding>) => Promise<void>
  updateSettings: (settings: ClientSettings) => Promise<void>
  exportData: (type: 'reviews' | 'metrics') => Promise<Blob>
}
```

## API Endpoints (Client-scoped)

```typescript
// All endpoints automatically scoped to authenticated client
GET  /api/client/dashboard/metrics
GET  /api/client/dashboard/reviews
GET  /api/client/dashboard/qr-codes
PUT  /api/client/settings/branding
PUT  /api/client/settings/contact
GET  /api/client/export/reviews
GET  /api/client/qr/:id/download
```

## Data Scoping Middleware

```typescript
// Automatic client scoping for all queries
export function withClientScope(handler: ApiHandler) {
  return async (req: Request, res: Response) => {
    const clientId = req.headers['x-client-id']
    const userId = req.headers['x-user-id']
    
    if (!clientId || !userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    // Add to request context
    req.context = { clientId, userId }
    
    // Execute handler with scoped context
    return handler(req, res)
  }
}

// Usage in API routes
export const GET = withClientScope(async (req) => {
  const { clientId } = req.context
  
  // All queries automatically filtered by clientId
  const reviews = await prisma.reviewSubmission.findMany({
    where: { clientId }
  })
  
  return NextResponse.json(reviews)
})
```

## Mobile Responsiveness

### Mobile View Adaptations
- Stack KPI cards vertically
- Convert tables to cards
- Collapsible sidebar
- Touch-friendly controls
- Simplified charts

### Responsive Breakpoints
```scss
$mobile: 320px;
$tablet: 768px;
$desktop: 1024px;

@media (max-width: $tablet) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .review-table {
    display: none;
  }
  
  .review-cards {
    display: block;
  }
}
```

## Performance Optimization

- Lazy load tab content
- Virtual scrolling for long lists
- Image optimization
- Data caching (5 min TTL)
- Optimistic UI updates
- Debounced search

## Acceptance Criteria

- [ ] Dashboard shows only client's data
- [ ] All metrics calculate correctly
- [ ] Date range filtering works
- [ ] Reviews display with all details
- [ ] Export functionality works
- [ ] QR codes downloadable
- [ ] Branding updates apply immediately
- [ ] Settings save successfully
- [ ] Mobile responsive design

## Testing Requirements

### Unit Tests
- Metric calculations
- Data filtering
- Export formatting
- Date range logic

### Integration Tests
- API data fetching
- Client scoping verification
- Settings updates
- File downloads

### E2E Tests
- Complete dashboard flow
- Tab navigation
- Filter interactions
- Export functionality
- Cross-client isolation

## Security Considerations

- Verify client access on every request
- Sanitize export data
- Rate limit API calls
- Validate file uploads
- Audit log for changes
- Secure download links

## Error Handling

- API failures: User-friendly messages
- Empty states: Helpful instructions
- Loading states: Skeleton screens
- Network issues: Retry logic
- Invalid data: Fallback values

## Accessibility

- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management
- High contrast support
- Reduced motion options