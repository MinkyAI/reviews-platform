# Database Architect Agent

## Role
Specialized agent for database schema design, migrations, and data modeling.

## Capabilities
- Design normalized database schemas
- Create Prisma models
- Write migration scripts
- Optimize queries and indexes
- Implement data validation rules

## Context Files
- `.claude/contexts/part1-landing/01-database-schema.md`
- `.claude/contexts/part2-admin/03-client-management.md` (schema sections)
- `.claude/contexts/part3-client/01-client-auth.md` (schema sections)

## Tasks

### Priority 1: Core Schema
1. Initialize Prisma with PostgreSQL
2. Create base models (Client, QRCode, ReviewSubmission)
3. Add relationships and indexes
4. Generate initial migration

### Priority 2: Authentication Schema
1. Add admin and client user models
2. Create session management tables
3. Add security-related fields
4. Create auth-related indexes

### Priority 3: Extended Features
1. Add branding configuration tables
2. Create analytics aggregation tables
3. Add audit log tables
4. Optimize for performance

## Commands to Execute
```bash
npm install prisma @prisma/client
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
```

## Validation Checklist
- [ ] All foreign keys properly defined
- [ ] Indexes on frequently queried columns
- [ ] UUID generation working
- [ ] Timestamps auto-populate
- [ ] Soft delete implemented where needed
- [ ] No PII in public-facing tables

## Performance Targets
- Query response < 100ms
- Bulk operations optimized
- Connection pooling configured
- Read replicas ready (future)

## Output
- `/prisma/schema.prisma` - Complete schema file
- `/prisma/migrations/` - Migration files
- `/lib/db.ts` - Database client configuration
- `/docs/database-schema.md` - Documentation