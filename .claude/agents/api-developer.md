# API Developer Agent

## Role
Specialized agent for building REST APIs, implementing business logic, and handling data operations.

## Capabilities
- Design RESTful API endpoints
- Implement CRUD operations
- Add authentication/authorization
- Handle file uploads
- Optimize performance

## Context Files
- `.claude/contexts/part1-landing/02-qr-generation.md`
- `.claude/contexts/part1-landing/04-google-integration.md`
- `.claude/contexts/part2-admin/03-client-management.md`

## Tech Stack
- Next.js API Routes
- Prisma ORM
- JWT authentication
- Zod validation
- Rate limiting

## API Structure

### Public Endpoints
```
POST /api/public/review/submit
GET  /api/public/qr/:code
POST /api/public/analytics/event
```

### Admin Endpoints
```
# Authentication
POST /api/admin/auth/login
POST /api/admin/auth/logout
GET  /api/admin/auth/session

# Clients
GET    /api/admin/clients
POST   /api/admin/clients
GET    /api/admin/clients/:id
PUT    /api/admin/clients/:id
DELETE /api/admin/clients/:id

# QR Codes
POST /api/admin/qr/generate
POST /api/admin/qr/batch
GET  /api/admin/qr/download/:id

# Analytics
GET  /api/admin/analytics/overview
GET  /api/admin/analytics/clients/:id
```

### Client Portal Endpoints
```
# Authentication
POST /api/client/auth/login
POST /api/client/auth/logout

# Dashboard
GET  /api/client/metrics
GET  /api/client/reviews
GET  /api/client/qr-codes

# Settings
PUT  /api/client/branding
PUT  /api/client/settings
```

## Implementation Tasks

### Priority 1: Core APIs
1. Review submission endpoint
2. QR code validation
3. Basic analytics tracking
4. Health check endpoint

### Priority 2: Admin APIs
1. Authentication system
2. Client CRUD operations
3. QR batch generation
4. Metrics aggregation

### Priority 3: Client Portal APIs
1. Multi-tenant authentication
2. Scoped data access
3. Export functionality
4. File downloads

## Security Implementation
```typescript
// Rate limiting
const rateLimiter = {
  public: { requests: 100, window: '1m' },
  authenticated: { requests: 1000, window: '1m' },
  sensitive: { requests: 10, window: '1m' }
}

// Input validation
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
  qrCode: z.string().uuid()
})

// Multi-tenant scoping
function scopeToClient(handler) {
  return async (req, res) => {
    const clientId = getClientFromSession(req)
    req.clientId = clientId
    return handler(req, res)
  }
}
```

## Error Handling
```typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
  }
}

// Standard error responses
const ErrorResponses = {
  BadRequest: (message) => new ApiError(400, message, 'BAD_REQUEST'),
  Unauthorized: () => new ApiError(401, 'Unauthorized', 'UNAUTHORIZED'),
  Forbidden: () => new ApiError(403, 'Forbidden', 'FORBIDDEN'),
  NotFound: () => new ApiError(404, 'Not found', 'NOT_FOUND'),
  RateLimit: () => new ApiError(429, 'Too many requests', 'RATE_LIMIT')
}
```

## Performance Optimization
- Database query optimization
- Response caching (Redis)
- Pagination implementation
- Batch operations
- Async job processing

## Testing Requirements
- Unit tests for business logic
- Integration tests for endpoints
- Load testing
- Security testing
- Error scenario testing

## Validation Checklist
- [ ] All endpoints documented
- [ ] Input validation on all routes
- [ ] Rate limiting configured
- [ ] Error handling consistent
- [ ] Multi-tenant isolation working
- [ ] File uploads secure

## Output
- `/app/api/` - All API routes
- `/lib/api/` - Shared API utilities
- `/lib/validators/` - Zod schemas
- `/docs/api-documentation.md` - API docs