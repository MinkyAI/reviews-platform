# Build Feature Command

Template for building a complete feature with multiple subagents working in parallel.

## Usage
Specify the feature name and this command orchestrates parallel development.

## Feature Development Pattern

### Phase 1: Analysis (Single Agent)
```
Analyze the feature requirements from context files.
Create a detailed implementation plan.
Identify dependencies and interfaces.
```

### Phase 2: Parallel Implementation (Multiple Agents)

#### Database Agent
```
1. Design database schema changes
2. Create/modify Prisma models
3. Generate migrations
4. Add seed data if needed
```

#### API Agent
```
1. Create API endpoints
2. Implement business logic
3. Add validation schemas
4. Set up error handling
```

#### Frontend Agent
```
1. Build UI components
2. Implement forms/interactions
3. Connect to API endpoints
4. Add loading/error states
```

#### Testing Agent
```
1. Write unit tests
2. Create integration tests
3. Add E2E test scenarios
4. Verify accessibility
```

### Phase 3: Integration (Single Agent)
```
1. Connect all components
2. Verify data flow
3. Fix integration issues
4. Run all tests
```

## Example Commands

### Build Reviews Landing Feature
```
Build the complete reviews landing feature using parallel agents:
- Database: Create review submission tables
- API: Implement submission endpoint
- Frontend: Build star rating and outcome pages
- Testing: Create submission flow tests
```

### Build Admin Dashboard Feature
```
Build the admin dashboard using parallel agents:
- Database: Create analytics aggregation views
- API: Implement metrics endpoints
- Frontend: Build KPI cards and charts
- Testing: Create dashboard interaction tests
```

### Build QR Generation Feature
```
Build QR code generation using parallel agents:
- Database: Create QR code tables
- API: Implement generation and download endpoints
- Frontend: Build generation UI and preview
- Testing: Create batch generation tests
```

## Coordination Rules

1. **Shared Interfaces**
   - Define TypeScript interfaces first
   - Share between agents via context
   - Maintain consistency

2. **API Contracts**
   - Define request/response schemas
   - Use Zod for validation
   - Document all endpoints

3. **Component Props**
   - Define prop interfaces
   - Share with API agent
   - Maintain type safety

4. **Database Models**
   - Define schema first
   - Generate types for other agents
   - Keep migrations sequential

## Quality Checks

Run after parallel execution:
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Tests
npm run test

# Build
npm run build
```

## Rollback Strategy

If issues occur:
1. Revert database migrations
2. Reset git to last known good state
3. Clear node_modules and reinstall
4. Rebuild from clean state

## Success Metrics

- [ ] Feature works end-to-end
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Performance targets met
- [ ] Accessibility compliant
- [ ] Mobile responsive