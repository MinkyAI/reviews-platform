# Task: Client Management System

## Objective
Implement comprehensive client management functionality including CRUD operations, detailed client workspaces with tabs for overview, reviews, QR codes, branding, and settings.

## Requirements

### Database Schema
```prisma
model Client {
  id             String   @id @default(uuid())
  name           String
  slug           String   @unique
  monthlyPrice   Float
  status         ClientStatus @default(DRAFT)
  googlePlaceId  String?
  contactEmail   String
  contactPhone   String?
  privacyText    String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  deletedAt      DateTime?
  
  branding       ClientBranding?
  locations      Location[]
  qrCodes        QRCode[]
  reviews        ReviewSubmission[]
}

enum ClientStatus {
  DRAFT
  LIVE
  SUSPENDED
  DELETED
}

model ClientBranding {
  id              String   @id @default(uuid())
  clientId        String   @unique
  logoUrl         String?
  primaryColor    String   @default("#007AFF")
  accentColor     String   @default("#34C759")
  backgroundColor String   @default("#FFFFFF")
  fontFamily      String   @default("system")
  buttonStyle     String   @default("rounded")
  customCss       String?
  
  client          Client   @relation(fields: [clientId], references: [id])
}

model Location {
  id        String   @id @default(uuid())
  clientId  String
  name      String   @default("Main Location")
  address   String?
  isDefault Boolean  @default(true)
  
  client    Client   @relation(fields: [clientId], references: [id])
  qrCodes   QRCode[]
}
```

## Implementation Components

### 1. Add/Edit Client Modal
```tsx
interface ClientFormData {
  name: string
  monthlyPrice: number
  googlePlaceId?: string
  contactEmail: string
  contactPhone?: string
  qrCodesToGenerate: number
  qrLabelingScheme: 'auto' | 'custom'
  customLabels?: string[]
}

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ClientFormData) => Promise<void>
  client?: Client // For edit mode
}
```

Features:
- Form validation with Zod
- Google Place ID lookup/validation
- QR batch generation on save
- Loading states
- Error handling

### 2. Client Detail Workspace

#### Navigation Tabs
```tsx
interface ClientTab {
  id: string
  label: string
  icon: IconType
  component: React.ComponentType
  badge?: number
}

const tabs: ClientTab[] = [
  { id: 'overview', label: 'Overview', icon: BarChart, component: OverviewTab },
  { id: 'reviews', label: 'Reviews', icon: Star, component: ReviewsTab },
  { id: 'qr-codes', label: 'QR Codes', icon: QrCode, component: QRCodesTab },
  { id: 'branding', label: 'Branding', icon: Palette, component: BrandingTab },
  { id: 'settings', label: 'Settings', icon: Settings, component: SettingsTab }
]
```

### 3. Overview Tab
```tsx
interface OverviewTabProps {
  clientId: string
  dateRange: DateRange
}

interface OverviewMetrics {
  totalSubmissions: number
  positiveCount: number
  negativeCount: number
  averageRating: number
  googleCTR: number
  contactClicks: number
  trendData: TrendPoint[]
  recentReviews: Review[]
}
```

Components:
- KPI cards with trends
- Submissions chart (positive vs negative)
- Recent reviews list
- Quick actions menu

### 4. Reviews Tab
```tsx
interface ReviewsTabProps {
  clientId: string
}

interface ReviewFilters {
  rating?: number[]
  dateRange?: DateRange
  googleClicked?: boolean
  contactClicked?: boolean
  searchTerm?: string
  qrCode?: string
}

interface ReviewTableRow {
  id: string
  dateTime: Date
  rating: number
  comment: string
  qrLabel: string
  googleClicked: boolean
  contactClicked: boolean
}
```

Features:
- Filterable table
- Export to CSV
- Sentiment indicators
- Reply functionality (future)
- Bulk actions

### 5. QR Codes Tab
```tsx
interface QRCodesTabProps {
  clientId: string
}

interface QRCodeActions {
  generateBatch: (params: BatchGenerateParams) => Promise<void>
  downloadCode: (codeId: string, format: 'svg' | 'png' | 'pdf') => void
  archiveCode: (codeId: string) => Promise<void>
  editLabel: (codeId: string, newLabel: string) => Promise<void>
}

interface QRCodeTableRow {
  id: string
  label: string
  shortUrl: string
  createdAt: Date
  batchId: string
  location: string
  status: 'active' | 'archived'
  scanCount: number
}
```

Features:
- Generate new batches
- Download individual/batch
- Label management
- Usage statistics
- Archive/reactivate

### 6. Branding Tab
```tsx
interface BrandingTabProps {
  clientId: string
  branding: ClientBranding
  onSave: (branding: Partial<ClientBranding>) => Promise<void>
}

interface BrandingEditor {
  logoUpload: FileUpload
  colorPickers: ColorPicker[]
  fontSelector: FontSelector
  buttonStyleSelector: StyleSelector
  preview: PreviewPane
}
```

Components:
- Logo upload with preview
- Color scheme editor
- Typography settings
- Button style selector
- Live preview (mobile & desktop)
- Reset to defaults

### 7. Settings Tab
```tsx
interface SettingsTabProps {
  client: Client
  onSave: (updates: Partial<Client>) => Promise<void>
  onDelete: () => Promise<void>
}

interface SettingsForm {
  clientName: string
  monthlyPrice: number
  googlePlaceId: string
  contactEmail: string
  contactPhone?: string
  privacyText?: string
  status: ClientStatus
}
```

Features:
- Edit client details
- Status management (Draft/Live)
- Google Place ID validation
- Contact info update
- Privacy policy editor
- Soft delete with confirmation

## API Endpoints

```typescript
// Client CRUD
GET    /api/clients              - List all clients
POST   /api/clients              - Create client
GET    /api/clients/:id          - Get client details
PUT    /api/clients/:id          - Update client
DELETE /api/clients/:id          - Soft delete client

// Client-specific data
GET    /api/clients/:id/metrics  - Get client metrics
GET    /api/clients/:id/reviews  - Get client reviews
GET    /api/clients/:id/qr-codes - Get QR codes
PUT    /api/clients/:id/branding - Update branding
POST   /api/clients/:id/qr-batch - Generate QR batch
```

## State Management

### Client Store
```typescript
interface ClientStore {
  clients: Client[]
  selectedClient: Client | null
  loading: boolean
  error: Error | null
  
  fetchClients: () => Promise<void>
  selectClient: (id: string) => Promise<void>
  createClient: (data: ClientFormData) => Promise<Client>
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  
  // Tab-specific data
  metrics: OverviewMetrics | null
  reviews: Review[]
  qrCodes: QRCode[]
  
  fetchTabData: (tab: string) => Promise<void>
}
```

## File Upload

### Logo Upload Handler
```typescript
interface FileUploadService {
  uploadLogo: (file: File, clientId: string) => Promise<string>
  deleteFile: (url: string) => Promise<void>
  validateImage: (file: File) => ValidationResult
}

const uploadConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/svg+xml'],
  dimensions: { maxWidth: 500, maxHeight: 500 }
}
```

## Validation Rules

### Client Creation
- Name: Required, 2-50 characters
- Monthly Price: Required, >= 0
- Email: Valid email format
- Phone: Optional, valid format
- Google Place ID: Optional, valid format

### QR Generation
- Batch size: 1-100
- Label length: 1-30 characters
- Unique labels within client

## Acceptance Criteria

- [ ] CRUD operations work correctly
- [ ] All tabs load appropriate data
- [ ] Branding changes reflect immediately
- [ ] QR code generation works
- [ ] Export functions properly
- [ ] Status changes affect public landing
- [ ] Soft delete preserves data
- [ ] Validation prevents invalid data
- [ ] Mobile responsive design

## Performance Optimization

- Lazy load tab content
- Virtualized tables for large datasets
- Image optimization for logos
- Debounced search/filter
- Cached client data
- Optimistic UI updates

## Testing Requirements

### Unit Tests
- Form validation
- Data transformations
- Utility functions
- State management

### Integration Tests
- Client creation flow
- Tab navigation
- Data fetching
- File uploads

### E2E Tests
- Complete client lifecycle
- QR code generation
- Branding preview
- Settings updates

## Error Handling

- API failures: Toast notifications
- Validation errors: Inline messages
- Upload failures: Retry option
- Network issues: Offline indicator
- Concurrent edits: Conflict resolution

## Security Considerations

- Validate ownership before operations
- Sanitize file uploads
- Rate limit API endpoints
- Audit log for changes
- Secure file storage