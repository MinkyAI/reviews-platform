# Reviews Platform - Context Engineering Strategy

## Project Overview
Building a 3-part Reviews Management Platform using Claude Opus 4.1 with autonomous task execution and parallel processing capabilities.

### Platform Components
1. **Reviews Landing** - End-user QR code flow (mobile-first, conditional outcomes)
2. **Admin Dashboard** - Owner control panel (multi-client management, analytics)
3. **Client Portal** - Restaurant dashboard (read-only analytics, limited settings)

## Context Engineering Approach

### 1. Multi-Agent Architecture
- **Coordinator Agent**: Main orchestrator that analyzes tasks and spawns specialized subagents
- **Specialized Subagents**: Independent agents with focused contexts for specific domains
- **Parallel Execution**: Up to 10 concurrent agents working on non-overlapping tasks
- **Isolated Context**: Each agent maintains separate context window (1M tokens with Claude Sonnet 4)

### 2. Task Management Strategy

#### Automatic Task Detection
When given a development request, automatically:
1. Analyze scope and identify if multi-step (3+ distinct actions)
2. Create specialized subagents for parallel work
3. Use TodoWrite tool for progress tracking
4. Generate markdown documentation for each subtask

#### Parallelization Patterns
- **Sectioning**: Break complex tasks into independent subtasks
- **Specialization**: Assign domain experts (DB architect, UI developer, API designer)
- **Validation**: Run separate agents for testing and code review
- **Documentation**: Parallel documentation generation during development

### 3. Development Workflow

#### Phase 1: Planning & Architecture
```
Coordinator → [Architecture Agent, Database Agent, UI/UX Agent]
```
- Architecture Agent: System design, API structure, component hierarchy
- Database Agent: Schema design, relationships, indexes
- UI/UX Agent: Component structure, design system, responsive layouts

#### Phase 2: Implementation
```
Coordinator → [Frontend Agent, Backend Agent, Integration Agent, Testing Agent]
```
- Frontend Agent: React/Next.js components, state management
- Backend Agent: API endpoints, business logic, data validation
- Integration Agent: Third-party services (Google Places, QR generation)
- Testing Agent: Unit tests, integration tests, E2E scenarios

#### Phase 3: Optimization & Deployment
```
Coordinator → [Performance Agent, Security Agent, DevOps Agent]
```
- Performance Agent: Bundle optimization, lazy loading, caching
- Security Agent: Authentication, authorization, data protection
- DevOps Agent: CI/CD, deployment scripts, monitoring

## Automated Context Files

### Directory Structure
```
.claude/
├── commands/           # Custom slash commands
├── contexts/          # Task-specific context files
│   ├── part1-landing/ # Reviews Landing contexts
│   ├── part2-admin/   # Admin Dashboard contexts
│   └── part3-client/  # Client Portal contexts
└── agents/            # Subagent configurations
```

### Context File Format
Each task gets a markdown file with:
- **Objective**: Clear goal definition
- **Requirements**: Functional and technical specifications
- **Dependencies**: Required libraries, APIs, services
- **Acceptance Criteria**: Definition of done
- **Testing Strategy**: Unit, integration, E2E tests
- **Related Files**: Codebase references

## Execution Rules

### Priority Order
1. Database schema and models
2. Core business logic and API
3. Frontend components and UI
4. Integration and external services
5. Testing and validation
6. Documentation and deployment

### Parallel Execution Groups
Group A (Can run simultaneously):
- Database schema design
- UI component library setup
- Authentication system
- QR code generation system

Group B (After Group A):
- API endpoints implementation
- Frontend page development
- Analytics implementation
- Review submission flow

Group C (After Group B):
- Integration testing
- Performance optimization
- Deployment configuration
- Documentation generation

### Quality Gates
Each task must pass before marking complete:
- Code compiles without errors
- Tests pass (if applicable)
- Linting passes
- Type checking passes
- Follows project conventions

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.2 (App Router with Turbopack)
- **React**: 19.1.0
- **Styling**: Tailwind CSS v4 with PostCSS
- **Components**: Radix UI primitives
- **State**: Zustand v5
- **Forms**: React Hook Form v7 + Zod v3

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma v6.2.0
- **Authentication**: NextAuth.js v5.1.0
- **File Storage**: Sharp for image processing
- **QR Generation**: qrcode library

### Infrastructure
- **Hosting**: Vercel
- **Database**: Vercel Postgres or Supabase
- **Analytics**: Vercel Analytics
- **Monitoring**: Sentry

## Coding Standards

### General Rules
- NO comments unless specifically requested
- Follow existing patterns in codebase
- Use TypeScript for type safety
- Implement proper error handling
- Write tests for critical paths
- Mobile-first responsive design

## Premium UI Development Standards

### CRITICAL: Avoiding Generic LLM-Generated UI

#### Design References to Follow
- **Reviews Landing**: Similar to Airbnb review modals with Apple's SF design language
- **Admin Dashboard**: Inspired by Linear's interface with Stripe's KPI cards
- **Client Portal**: Following Vercel's dashboard patterns with Notion's approachability

#### Specific Design Tokens
```typescript
const design = {
  colors: {
    primary: '#007AFF',     // iOS blue
    success: '#34C759',     // Apple green
    surface: '#FAFAFA',     // Off-white
    border: '#E5E5E7',      // Subtle border
  },
  spacing: '4px grid',      // 4, 8, 12, 16, 24, 32, 48
  borderRadius: '8px',      // Consistent rounding
  font: 'Inter',            // Modern, clean
  animations: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
}
```

#### Micro-interactions (REQUIRED)
- Buttons: `scale(0.98)` on click with 150ms
- Cards: Hover shadow from `0 2px 8px rgba(0,0,0,0.04)` to `0 8px 24px rgba(0,0,0,0.08)`
- Transitions: All with spring physics from Framer Motion
- Success states: Confetti animation using canvas-confetti
- Loading: Gradient animations, NOT generic spinners

#### Anti-Patterns to AVOID
- ❌ Generic "Submit" or "Click here" buttons
- ❌ Default Tailwind colors without customization
- ❌ rounded-full on everything
- ❌ Generic shadow-lg classes
- ❌ "Lorem ipsum" placeholder text
- ❌ Basic opacity-only hover states
- ❌ Generic error: "Something went wrong"

#### Required Patterns
- ✅ Specific CTAs: "Continue to dashboard →"
- ✅ Custom shadows with blur values
- ✅ Thoughtful border radius (8px standard)
- ✅ Real placeholder text: "Share what made your experience special..."
- ✅ Multi-property hover states
- ✅ Specific errors: "This email is already loved by another account"

### File Organization
- Components: `/components/[domain]/[ComponentName].tsx`
- API Routes: `/app/api/[resource]/route.ts`
- Database: `/prisma/schema.prisma`
- Types: `/types/[domain].ts`
- Utils: `/lib/[category]/[utility].ts`

## Automated Commands

### Development Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle with Turbopack
- `npm run test` - Run test suite
- `npm run lint` - Run ESLint v9
- `npm run typecheck` - Run TypeScript compiler

### Database Commands
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:push` - Push schema changes (development)
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio GUI

## Progress Tracking

Use TodoWrite tool for:
- Tasks with 3+ steps
- Complex features requiring planning
- Multi-file operations
- Integration work
- Testing and deployment

Track these metrics:
- Tasks completed vs total
- Test coverage percentage
- Performance benchmarks
- Accessibility score
- Security vulnerabilities

## Error Handling Strategy

### Development Errors
- Capture with try-catch blocks
- Log to console in development
- Display user-friendly messages

### Production Errors
- Send to error tracking service
- Fallback UI components
- Graceful degradation

## Security Considerations

- Environment variables for secrets
- Input validation on all endpoints
- SQL injection prevention (Prisma)
- XSS protection (React default)
- CSRF tokens for mutations
- Rate limiting on public endpoints
- No PII storage for end-users

## Documentation Requirements

Each component needs:
- Purpose description
- Props interface
- Usage example
- Test coverage

Each API endpoint needs:
- Request/response schema
- Authentication requirements
- Rate limits
- Error responses

## Deployment Strategy

1. Local development
2. Preview deployments (PRs)
3. Staging environment
4. Production deployment
5. Monitoring and alerts

## Success Metrics

- Page load time < 2s
- Lighthouse score > 90
- Test coverage > 80%
- Zero critical vulnerabilities
- 99.9% uptime target

---

## Quick Start for Agents

When starting a new task:
1. Read this CLAUDE.md file
2. Check relevant context file in `.claude/contexts/`
3. Use TodoWrite to plan if 3+ steps
4. Execute with appropriate subagents
5. Test and validate
6. Update progress tracking

Remember: Parallel execution when possible, isolated contexts for clarity, and always validate before marking complete.
- Summary of Progress

  I've successfully:

  ✅ Created 4 new API endpoints:
  1. /api/admin/activity - Fetches recent platform activity (scans, reviews, new clients)
  2. /api/admin/top-clients - Returns top performing clients with metrics and trends
  3. /api/admin/settings - Platform settings and usage statistics
  4. /api/client/activity - Client-specific activity feed

  ✅ Updated Admin Dashboard:
  - Removed all mock data (mockRecentActivity and mockTopClients)
  - Added real-time data fetching from new API endpoints
  - Implemented loading states and error handling
  - Added 30-second auto-refresh for activity feed
  - Enhanced TopClient interface with trend and positive percentage

  The admin dashboard now shows:
  - Real recent activity from database (QR scans, reviews, new clients)
  - Actual top clients calculated from review data with trends
  - Loading spinners while fetching data
  - Empty state messages when no data available

  Remaining Tasks:

  - Update admin analytics page to use real data
  - Update admin settings to show real usage statistics
  - Update client dashboard to use real activity data
  - Implement email service for password resets

  All mock data has been successfully replaced with real database queries in the admin dashboard, providing
  actual insights into platform activity and client performance!