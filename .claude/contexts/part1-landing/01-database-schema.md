# Task: Database Schema for Reviews Landing

## Objective
Design and implement the database schema for the reviews landing system that captures QR scans, reviews, and user interactions.

## Requirements

### Tables to Create

1. **qr_codes**
   - id (UUID, primary key)
   - client_id (UUID, foreign key)
   - location_id (UUID, foreign key, nullable)
   - label (string, e.g., "Table 1")
   - short_code (string, unique, for URL)
   - batch_id (UUID, for grouping)
   - status (enum: active, archived)
   - created_at (timestamp)
   - updated_at (timestamp)

2. **qr_scans**
   - id (UUID, primary key)
   - qr_id (UUID, foreign key to qr_codes)
   - client_id (UUID, foreign key)
   - session_id (string, for tracking)
   - scan_timestamp (timestamp)
   - user_agent (string, optional)
   - ip_hash (string, anonymized)
   - created_at (timestamp)

3. **review_submissions**
   - id (UUID, primary key)
   - qr_id (UUID, foreign key to qr_codes)
   - client_id (UUID, foreign key)
   - scan_id (UUID, foreign key to qr_scans)
   - rating (integer, 1-5)
   - comment (text, nullable)
   - google_clicked (boolean, default false)
   - contact_clicked (boolean, default false)
   - clicked_cta (enum: google_copy, google_direct, contact, none)
   - created_at (timestamp)

4. **cta_clicks**
   - id (UUID, primary key)
   - submission_id (UUID, foreign key)
   - cta_type (enum: google_copy, google_direct, contact_email, contact_phone)
   - clicked_at (timestamp)

## Implementation Steps

1. Create Prisma schema file
2. Define all models with proper relationships
3. Add indexes for performance:
   - qr_codes: index on (client_id, status)
   - qr_scans: index on (qr_id, created_at)
   - review_submissions: index on (client_id, created_at, rating)
4. Create migration
5. Generate Prisma client

## Acceptance Criteria

- [ ] All tables created with correct data types
- [ ] Foreign key relationships established
- [ ] Indexes added for query performance
- [ ] UUID generation works
- [ ] Timestamps auto-populate
- [ ] Enums properly defined
- [ ] Migration runs without errors
- [ ] No PII stored (only anonymized data)

## Dependencies

- Prisma ORM
- PostgreSQL database
- UUID generation library

## Testing Requirements

- Test CRUD operations for each model
- Verify foreign key constraints
- Test cascade deletes where appropriate
- Validate enum constraints
- Performance test with 10k+ records

## Related Files

- `/prisma/schema.prisma`
- `/prisma/migrations/`
- `/lib/db.ts`

## Security Considerations

- No storing of personal information
- IP addresses must be hashed
- Session IDs should expire
- Use parameterized queries (Prisma handles this)

## Performance Targets

- Query response time < 100ms
- Bulk insert capability for QR generation
- Efficient pagination for large datasets

## Notes

- Consider partitioning review_submissions by date if volume is high
- Add database backup strategy
- Plan for data retention policy (GDPR compliance)