# Reviews Platform - Master Orchestration Guide

## Overview
This document provides the complete orchestration strategy for building the Reviews Platform using Claude Opus 4.1 with parallel subagents and autonomous task execution.

## Architecture Summary

### Platform Components
1. **Reviews Landing** - QR-triggered mobile-first review collection
2. **Admin Dashboard** - Multi-client management and analytics
3. **Client Portal** - Restaurant-specific dashboard and settings

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Infrastructure**: Vercel hosting, Edge functions
- **Tools**: QR generation, Google Reviews integration

## Execution Strategy

### Phase 1: Project Initialization (5 minutes)
```bash
# Run initialization command
/init-project
```
This sets up the project structure, installs dependencies, and configures the development environment.

### Phase 2: Parallel Foundation Development (30 minutes)

Launch 4 parallel subagents:

```
Task Tool: Launch 4 parallel tasks to build foundation:

1. "Database Architect" - Read .claude/contexts/part1-landing/01-database-schema.md and create complete Prisma schema with all models for reviews, clients, QR codes, and authentication.

2. "UI Component Developer" - Read .claude/contexts/part1-landing/03-landing-page.md and build core UI components: StarRating, CommentBox, and base layouts.

3. "API Developer" - Read .claude/contexts/part1-landing/04-google-integration.md and implement core API structure with review submission and QR validation endpoints.

4. "QR System Developer" - Read .claude/contexts/part1-landing/02-qr-generation.md and implement QR generation service with batch support.
```

### Phase 3: Feature Development (45 minutes)

After foundation is complete, launch 3 parallel feature teams:

#### Team A: Reviews Landing (Part 1)
```
Subagents working on:
- Mobile landing page implementation
- Review submission flow
- Google Reviews integration
- Analytics tracking
```

#### Team B: Admin Dashboard (Part 2)
```
Subagents working on:
- Admin authentication
- Dashboard metrics and KPIs
- Client management CRUD
- QR batch generation UI
```

#### Team C: Client Portal (Part 3)
```
Subagents working on:
- Multi-tenant authentication
- Client-specific dashboards
- Review viewing interface
- Settings management
```

### Phase 4: Integration & Testing (15 minutes)

Single coordinator agent:
```
1. Connect all components
2. Verify data flow between systems
3. Run integration tests
4. Fix any connection issues
5. Validate multi-tenant isolation
```

### Phase 5: Optimization & Polish (10 minutes)

Parallel optimization agents:
```
1. "Performance Agent" - Optimize bundle size, lazy loading, caching
2. "Security Agent" - Verify authentication, rate limiting, input validation
3. "UX Agent" - Test responsive design, accessibility, loading states
```

## Key Context Files for Agents

### Essential Reading
- `CLAUDE.md` - Main strategy and rules
- `.claude/contexts/part1-landing/*` - Reviews landing specs
- `.claude/contexts/part2-admin/*` - Admin dashboard specs
- `.claude/contexts/part3-client/*` - Client portal specs
- `.claude/agents/*` - Agent-specific instructions

### Commands Available
- `/init-project` - Initialize project structure
- `/parallel-setup` - Launch parallel foundation setup
- `/build-feature` - Build specific features

## Success Metrics

### Technical Metrics
- [ ] Page load time < 2 seconds
- [ ] Lighthouse score > 90
- [ ] Test coverage > 80%
- [ ] Zero critical vulnerabilities
- [ ] TypeScript strict mode passing

### Functional Requirements
- [ ] QR scan → review flow working
- [ ] 5-star reviews redirect to Google
- [ ] 1-4 star reviews show contact
- [ ] Admin can manage multiple clients
- [ ] Clients see only their data
- [ ] Real-time metrics updating

## Parallel Execution Best Practices

### 1. Task Independence
Ensure tasks don't depend on each other's output during parallel execution.

### 2. Clear Interfaces
Define TypeScript interfaces upfront for components and API contracts.

### 3. Atomic Commits
Each agent should create focused, atomic changes.

### 4. Communication
Use shared context files for coordination between agents.

### 5. Conflict Resolution
Database schema changes should be done by single agent to avoid conflicts.

## Monitoring & Debugging

### Progress Tracking
```typescript
// Use TodoWrite tool
todos = [
  { content: "Initialize project", status: "completed" },
  { content: "Build database schema", status: "in_progress" },
  { content: "Create UI components", status: "in_progress" },
  { content: "Implement APIs", status: "pending" }
]
```

### Health Checks
```bash
# Verify setup
npm run typecheck  # No errors
npm run lint       # No warnings
npm run build      # Successful build
npm run test       # All tests pass
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Database connection failed | Check DATABASE_URL in .env |
| Type errors | Run `npx prisma generate` |
| Missing dependencies | Run `npm install` |
| Build failures | Clear .next folder |
| Test failures | Check mock data setup |

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Tests passing
- [ ] Security audit complete
- [ ] Performance benchmarks met

### Deployment
- [ ] Deploy to Vercel
- [ ] Configure custom domain
- [ ] Set up monitoring
- [ ] Enable error tracking
- [ ] Configure backups

### Post-deployment
- [ ] Smoke tests passing
- [ ] Monitoring active
- [ ] Documentation updated
- [ ] Team trained
- [ ] Support channels ready

## Advanced Orchestration

### Dynamic Agent Spawning
```javascript
// Based on workload
const agentCount = Math.min(10, tasks.length)
const agents = spawnAgents(agentCount)
const results = await Promise.all(
  agents.map(agent => agent.execute(task))
)
```

### Intelligent Task Distribution
```javascript
// Assign tasks based on agent expertise
const taskAssignments = {
  database: ['schema', 'migrations', 'indexes'],
  frontend: ['components', 'layouts', 'styles'],
  api: ['endpoints', 'validation', 'middleware'],
  testing: ['unit', 'integration', 'e2e']
}
```

### Feedback Loop
```javascript
// Agents report progress
agent.on('progress', (update) => {
  updateTodoList(update)
  notifyCoordinator(update)
  checkDependencies(update)
})
```

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Context Files
- Database schemas: `.claude/contexts/*/01-*.md`
- API specs: `.claude/contexts/*/04-*.md`
- UI requirements: `.claude/contexts/*/03-*.md`

### Agent Configs
- Database: `.claude/agents/database-architect.md`
- Frontend: `.claude/agents/frontend-developer.md`
- API: `.claude/agents/api-developer.md`

## Final Notes

This orchestration strategy leverages Claude Opus 4.1's ability to:
- Run up to 10 parallel subagents
- Maintain 1M token context windows
- Execute autonomous multi-step tasks
- Coordinate complex workflows

The key to success is proper task decomposition, clear interfaces between components, and effective use of context engineering to guide each agent's work.

Ready to execute: Use `/parallel-setup` to begin the automated build process.