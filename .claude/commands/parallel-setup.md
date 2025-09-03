# Parallel Setup Command

Use this command to launch multiple subagents in parallel to set up different parts of the Reviews Platform simultaneously.

## Execution Strategy

Launch 4 parallel subagents to work on non-overlapping tasks:

### Agent 1: Database & Backend Setup
```
Read CLAUDE.md and database context files.
Then:
1. Set up Prisma schema with all models
2. Create database migrations
3. Implement basic API structure
4. Set up authentication middleware
```

### Agent 2: Frontend Components
```
Read CLAUDE.md and frontend context files.
Then:
1. Create base layout components
2. Build star rating component
3. Implement responsive navigation
4. Set up Tailwind configuration
```

### Agent 3: QR Code System
```
Read CLAUDE.md and QR generation context files.
Then:
1. Implement QR code generation service
2. Create batch generation logic
3. Build PDF export functionality
4. Set up download endpoints
```

### Agent 4: Admin Dashboard Structure
```
Read CLAUDE.md and admin dashboard context files.
Then:
1. Create admin layout and routing
2. Build KPI card components
3. Set up data tables
4. Implement client management UI
```

## Parallel Execution Command

```
Please use 4 parallel tasks to set up the Reviews Platform:

Task 1: "Database Architect" - Read .claude/contexts/part1-landing/01-database-schema.md and .claude/agents/database-architect.md, then create the complete Prisma schema and generate migrations.

Task 2: "Frontend Developer" - Read .claude/contexts/part1-landing/03-landing-page.md and .claude/agents/frontend-developer.md, then create the mobile-responsive landing page components.

Task 3: "QR System Developer" - Read .claude/contexts/part1-landing/02-qr-generation.md, then implement the complete QR code generation system with batch support.

Task 4: "Admin UI Developer" - Read .claude/contexts/part2-admin/02-admin-dashboard.md and create the admin dashboard layout with sidebar and KPI components.
```

## Synchronization Points

After parallel tasks complete, run these sequential tasks:

1. **Integration Phase**
   - Connect frontend to API endpoints
   - Link database to services
   - Wire up authentication

2. **Testing Phase**
   - Run unit tests
   - Test API endpoints
   - Verify UI responsiveness

3. **Optimization Phase**
   - Bundle optimization
   - Database indexing
   - Performance testing

## Monitoring Progress

Track progress using:
- TodoWrite tool for task management
- Console logs for agent status
- File creation confirmations
- Build/test results

## Success Criteria

- [ ] All 4 agents complete successfully
- [ ] No merge conflicts
- [ ] Build passes without errors
- [ ] Database migrations run
- [ ] UI components render
- [ ] API endpoints respond