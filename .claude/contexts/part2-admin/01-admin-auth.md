# Task: Admin Authentication System

## Objective
Implement a secure single-owner authentication system for the admin dashboard with proper session management and security measures.

## Requirements

### Authentication Methods
1. **Email/Password Login**
   - Secure password hashing (bcrypt)
   - Rate limiting
   - Session management
   
2. **Magic Link (Optional)**
   - Email-based authentication
   - Time-limited tokens
   - One-time use

3. **Session Management**
   - JWT or session cookies
   - Refresh token mechanism
   - Secure storage

## Implementation Steps

### Step 1: Database Schema
```prisma
model AdminUser {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastLoginAt   DateTime?
  
  sessions      Session[]
  loginAttempts LoginAttempt[]
}

model Session {
  id           String   @id @default(uuid())
  userId       String
  token        String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  
  user         AdminUser @relation(fields: [userId], references: [id])
}

model LoginAttempt {
  id           String   @id @default(uuid())
  email        String
  success      Boolean
  ipAddress    String
  userAgent    String?
  createdAt    DateTime @default(now())
  
  user         AdminUser? @relation(fields: [email], references: [email])
}
```

### Step 2: Authentication Service
```typescript
interface AuthService {
  login(email: string, password: string): Promise<AuthResult>
  logout(sessionToken: string): Promise<void>
  validateSession(token: string): Promise<User | null>
  refreshSession(refreshToken: string): Promise<AuthResult>
  sendMagicLink(email: string): Promise<void>
  verifyMagicLink(token: string): Promise<AuthResult>
}

interface AuthResult {
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}
```

### Step 3: NextAuth.js Configuration
```typescript
// /lib/auth.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Implement login logic
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  }
}
```

### Step 4: Middleware Protection
```typescript
// /middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/admin/login',
  }
})

export const config = {
  matcher: ['/admin/:path*']
}
```

### Step 5: Login Page Component
```tsx
// /app/admin/login/page.tsx
interface LoginPageProps {
  searchParams: { error?: string }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  // Email/password form
  // Error handling
  // Loading states
  // Remember me option
}
```

## Security Measures

### Password Requirements
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Password strength indicator
- Breach detection (HaveIBeenPwned API)

### Rate Limiting
```typescript
interface RateLimitConfig {
  maxAttempts: 5
  windowMs: 15 * 60 * 1000 // 15 minutes
  blockDurationMs: 60 * 60 * 1000 // 1 hour
}
```

### Session Security
- HTTPOnly cookies
- Secure flag (HTTPS only)
- SameSite strict
- CSRF protection
- Regular token rotation

### Account Security
- Two-factor authentication (future)
- Login notifications
- Activity log
- IP allowlisting (optional)

## Environment Variables
```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generated-secret>
DATABASE_URL=<postgres-connection>
SMTP_HOST=<email-provider>
SMTP_PORT=587
SMTP_USER=<email-user>
SMTP_PASS=<email-password>
```

## API Endpoints

```typescript
POST   /api/auth/login      - Login with credentials
POST   /api/auth/logout     - Logout current session
GET    /api/auth/session    - Get current session
POST   /api/auth/refresh    - Refresh access token
POST   /api/auth/magic-link - Request magic link
GET    /api/auth/verify     - Verify magic link token
```

## Acceptance Criteria

- [ ] Secure password hashing implemented
- [ ] Session management working
- [ ] Rate limiting prevents brute force
- [ ] Login attempts logged
- [ ] Session expiry handled gracefully
- [ ] Refresh tokens working
- [ ] Protected routes redirect to login
- [ ] Remember me functionality
- [ ] Logout clears all sessions

## Testing Requirements

### Unit Tests
- Password hashing and verification
- Token generation and validation
- Rate limiting logic
- Session management

### Integration Tests
- Complete login flow
- Session persistence
- Protected route access
- Logout functionality
- Token refresh flow

### Security Tests
- SQL injection attempts
- XSS prevention
- CSRF protection
- Rate limiting effectiveness
- Session fixation prevention

## Error Handling

- Invalid credentials: Generic error message
- Too many attempts: Clear lockout message
- Session expired: Automatic refresh attempt
- Network errors: Retry with exponential backoff
- Database errors: Graceful degradation

## Monitoring

- Track login success/failure rates
- Monitor suspicious patterns
- Alert on multiple failed attempts
- Log all authentication events
- Session duration analytics

## UI/UX Requirements

### Login Form
- Clean, centered design
- Clear error messages
- Loading states
- Password visibility toggle
- Forgot password link

### Session Management
- Auto-logout warning
- Session extension option
- Remember device option
- Activity timeout (30 min)

## Dependencies

- next-auth
- bcryptjs
- jsonwebtoken
- @auth/prisma-adapter
- nodemailer (for magic links)
- zod (validation)

## Future Enhancements

- SSO integration (Google, GitHub)
- Biometric authentication
- Hardware key support
- Passwordless by default
- Admin user management