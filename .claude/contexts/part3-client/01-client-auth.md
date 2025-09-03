# Task: Client Portal Authentication

## Objective
Implement secure multi-tenant authentication system for restaurant clients with isolated access to their own data only.

## Requirements

### Authentication Methods
1. **Email/Password**
   - Client-specific login
   - Secure password management
   - Password reset flow

2. **Magic Link**
   - Email-based authentication
   - One-time use tokens
   - Expiry handling

3. **Multi-tenancy**
   - Strict data isolation
   - Organization-scoped sessions
   - No cross-client access

## Database Schema

```prisma
model ClientUser {
  id             String   @id @default(uuid())
  clientId       String
  email          String   
  passwordHash   String?
  role           UserRole @default(VIEWER)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  lastLoginAt    DateTime?
  
  client         Client   @relation(fields: [clientId], references: [id])
  sessions       ClientSession[]
  
  @@unique([clientId, email])
  @@index([email])
}

enum UserRole {
  OWNER
  MANAGER
  VIEWER
}

model ClientSession {
  id           String   @id @default(uuid())
  userId       String
  clientId     String
  token        String   @unique
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime @default(now())
  
  user         ClientUser @relation(fields: [userId], references: [id])
}

model PasswordReset {
  id           String   @id @default(uuid())
  userId       String
  token        String   @unique
  expiresAt    DateTime
  usedAt       DateTime?
  createdAt    DateTime @default(now())
}
```

## Implementation

### Step 1: Authentication Service
```typescript
interface ClientAuthService {
  // Authentication
  login(email: string, password: string, clientSlug: string): Promise<AuthResult>
  logout(sessionToken: string): Promise<void>
  validateSession(token: string): Promise<ClientSession | null>
  
  // Magic Link
  sendMagicLink(email: string, clientSlug: string): Promise<void>
  verifyMagicLink(token: string): Promise<AuthResult>
  
  // Password Management
  requestPasswordReset(email: string, clientSlug: string): Promise<void>
  resetPassword(token: string, newPassword: string): Promise<void>
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>
}

interface AuthResult {
  user: ClientUser
  client: Client
  accessToken: string
  refreshToken: string
  expiresIn: number
}
```

### Step 2: Multi-tenant Middleware
```typescript
// /middleware.ts
export async function middleware(req: NextRequest) {
  const token = req.cookies.get('client-session')
  
  if (!token) {
    return NextResponse.redirect('/client/login')
  }
  
  const session = await validateClientSession(token.value)
  
  if (!session) {
    return NextResponse.redirect('/client/login')
  }
  
  // Add client context to request
  req.headers.set('X-Client-Id', session.clientId)
  req.headers.set('X-User-Id', session.userId)
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/client/:path*']
}
```

### Step 3: Login Page
```tsx
// /app/client/login/page.tsx
interface ClientLoginPageProps {
  searchParams: { 
    error?: string
    redirect?: string
    client?: string
  }
}

export default function ClientLoginPage({ searchParams }: ClientLoginPageProps) {
  // Client identification (subdomain or slug)
  // Email/password form
  // Magic link option
  // Forgot password link
  // Error handling
}
```

### Step 4: Client Identification
```typescript
interface ClientIdentification {
  // Option 1: Subdomain-based
  // restaurant.reviews.com → restaurant client
  
  // Option 2: Path-based
  // reviews.com/client/restaurant → restaurant client
  
  // Option 3: Email domain-based
  // user@restaurant.com → restaurant client
  
  identifyClient(request: Request): Promise<Client | null>
}

// Subdomain extraction
function getClientFromSubdomain(host: string): string | null {
  const parts = host.split('.')
  if (parts.length >= 3) {
    return parts[0] // First part is subdomain
  }
  return null
}
```

### Step 5: Session Management
```typescript
interface SessionManager {
  createSession(user: ClientUser, client: Client): Promise<ClientSession>
  refreshSession(refreshToken: string): Promise<ClientSession>
  invalidateSession(sessionId: string): Promise<void>
  invalidateAllSessions(userId: string): Promise<void>
  
  // Session validation with client scope
  validateAccess(sessionId: string, clientId: string): Promise<boolean>
}
```

## Security Measures

### Password Requirements
- Minimum 8 characters
- At least one uppercase, lowercase, number
- Password strength indicator
- Common password checking

### Rate Limiting
```typescript
interface RateLimits {
  login: {
    attempts: 5,
    window: '15m',
    blockDuration: '1h'
  },
  passwordReset: {
    attempts: 3,
    window: '1h',
    blockDuration: '24h'
  },
  magicLink: {
    attempts: 5,
    window: '1h',
    blockDuration: '24h'
  }
}
```

### Session Security
- JWT with client scope claim
- HTTPOnly, Secure, SameSite cookies
- Short access token (15 min)
- Long refresh token (7 days)
- Device fingerprinting

### Multi-tenant Security
```typescript
// Every database query must include client scope
async function getClientReviews(clientId: string, userId: string) {
  // Verify user belongs to client
  const user = await prisma.clientUser.findFirst({
    where: { id: userId, clientId: clientId }
  })
  
  if (!user) throw new UnauthorizedError()
  
  // Fetch only this client's data
  return prisma.reviewSubmission.findMany({
    where: { clientId: clientId }
  })
}
```

## API Endpoints

```typescript
// Public endpoints
POST /api/client/auth/login
POST /api/client/auth/magic-link
POST /api/client/auth/verify-magic-link
POST /api/client/auth/forgot-password
POST /api/client/auth/reset-password

// Protected endpoints
POST /api/client/auth/logout
GET  /api/client/auth/session
POST /api/client/auth/refresh
POST /api/client/auth/change-password
```

## Email Templates

### Magic Link Email
```html
Subject: Sign in to [Restaurant Name] Dashboard

Click the link below to sign in:
[Magic Link URL]

This link expires in 15 minutes.
```

### Password Reset Email
```html
Subject: Reset your password

Click the link below to reset your password:
[Reset Link URL]

This link expires in 1 hour.
```

## Environment Variables
```env
# Client auth specific
CLIENT_JWT_SECRET=<generated-secret>
CLIENT_SESSION_DURATION=900 # 15 minutes
CLIENT_REFRESH_DURATION=604800 # 7 days
MAGIC_LINK_DURATION=900 # 15 minutes
PASSWORD_RESET_DURATION=3600 # 1 hour

# Email configuration
SMTP_FROM_EMAIL=noreply@reviews.com
SMTP_FROM_NAME=Reviews Platform
```

## Acceptance Criteria

- [ ] Client users can only access their data
- [ ] Password requirements enforced
- [ ] Magic link flow works
- [ ] Password reset works
- [ ] Rate limiting prevents abuse
- [ ] Session refresh works
- [ ] Multi-tenant isolation verified
- [ ] Logout clears session
- [ ] Email templates sent correctly

## Testing Requirements

### Unit Tests
- Password hashing/verification
- Token generation/validation
- Client identification logic
- Session management

### Integration Tests
- Complete login flow
- Magic link flow
- Password reset flow
- Session refresh
- Multi-tenant access control

### Security Tests
- SQL injection prevention
- XSS protection
- CSRF protection
- Session fixation prevention
- Tenant isolation verification

## Error Handling

- Invalid credentials: Generic message
- Account locked: Clear message with duration
- Session expired: Auto-redirect to login
- Invalid tenant: "Organization not found"
- Network errors: Retry with backoff

## Monitoring

- Track login success/failure by client
- Monitor suspicious patterns
- Alert on multiple failed attempts
- Session duration metrics
- Password reset requests

## UI/UX Considerations

### Login Form
- Client branding (logo, colors)
- Remember me option
- Loading states
- Clear error messages
- Mobile responsive

### Session Management
- Idle timeout warning
- Keep-alive option
- Multiple device support
- Session list in settings

## Future Enhancements

- SSO integration
- 2FA support
- Biometric login
- Team member invitations
- Role-based permissions