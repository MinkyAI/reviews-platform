# Claude Project State - Reviews Platform

## 🎯 Quick Resume Instructions

When returning to this project, tell Claude:
```
Read CLAUDE_PROJECT_STATE.md to understand what's been built. The Reviews Landing (Part 1) is complete with premium UI. Continue from where we left off.
```

## 📊 Current Implementation Status

### ✅ Part 1: Reviews Landing - COMPLETE
- Database schema with 6 tables (Client, Location, QrCode, QrScan, ReviewSubmission, CTAClick)
- Seed data with 4 test QR codes (TEST123, TABLE02, BAR001, PATIO01)
- Review submission API at `/api/reviews`
- CTA tracking API at `/api/cta`
- Premium landing page at `/app/r/[code]`
- All micro-interactions and animations working

### ⏳ Part 2: Admin Dashboard - NOT STARTED
- Authentication system needs implementation
- Dashboard layout needs creation
- Client management CRUD operations pending
- Analytics aggregation not built

### ⏳ Part 3: Client Portal - NOT STARTED
- Multi-tenant authentication not implemented
- Client-specific dashboards not created
- Read-only interfaces pending

## 🏗️ Project Structure

```
reviews-platform/
├── CLAUDE.md                 # Main context (auto-loads)
├── PREMIUM_UI_GUIDE.md       # UI standards to prevent generic design
├── MASTER_ORCHESTRATION.md   # Complete build strategy
├── .claude/                  # All context files for each part
│   ├── contexts/            
│   │   ├── part1-landing/   # ✅ IMPLEMENTED
│   │   ├── part2-admin/     # ⏳ TODO
│   │   └── part3-client/    # ⏳ TODO
│   └── commands/            # Custom commands
├── app/
│   ├── r/[code]/            # ✅ Review landing pages
│   ├── api/
│   │   ├── reviews/         # ✅ Review submission
│   │   └── cta/            # ✅ CTA tracking
│   ├── admin/              # ⏳ TODO: Admin dashboard
│   └── client/             # ⏳ TODO: Client portal
├── components/
│   └── reviews/            # ✅ All review components built
├── prisma/
│   ├── schema.prisma       # ✅ Complete schema
│   └── seed.ts            # ✅ Test data
└── lib/                   # ✅ Utilities and DB client
```

## 🎨 Design Implementation

### Current Design System
```typescript
// These are actively used throughout the app
const design = {
  colors: {
    primary: '#007AFF',     // iOS blue
    success: '#34C759',     // Apple green  
    surface: '#FAFAFA',     // Off-white
    border: '#E5E5E7',      // Subtle border
  },
  animations: {
    button: 'scale(0.98) on click',
    card: 'hover shadow 0 2px 8px → 0 8px 24px',
    success: 'confetti burst',
    transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)'
  },
  borderRadius: '8px',     // NOT rounded-full
  font: 'Inter'
}
```

### UI References Used
- **Reviews Landing**: Airbnb review modal + Apple design language ✅
- **Admin Dashboard**: Linear interface + Stripe KPI cards (TODO)
- **Client Portal**: Vercel dashboard + Notion approachability (TODO)

## 🔧 Quick Modifications Guide

### To Change Star Rating Style
```typescript
// File: components/reviews/StarRating.tsx
// Current: Golden gradient fill
// Change the fill colors in the gradient definition
```

### To Modify Success/Error Messages
```typescript
// File: components/reviews/OutcomePositive.tsx
// Current: "We're glad you loved it!"
// File: components/reviews/OutcomeNegative.tsx  
// Current: "We're sorry to hear that"
```

### To Update Database Schema
```bash
# Edit: prisma/schema.prisma
# Then run:
npm run db:push  # For development
npm run db:migrate  # For production
```

### To Change Animations
```typescript
// All animations use Framer Motion
// Files: components/reviews/*.tsx
// Look for: motion.div, animate props
```

### To Modify Colors/Theme
```css
/* File: app/globals.css */
/* Update CSS variables in :root */
```

## 🚀 Quick Commands

### Start Development
```bash
npm run dev
# Visit: http://localhost:3000/r/TEST123
```

### Database Management
```bash
npm run db:studio    # Visual database browser
npm run db:push      # Push schema changes
npm run db:seed      # Reset with test data
```

### View Test QR Codes
- `/r/TEST123` - Table 1 (has sample reviews)
- `/r/TABLE02` - Table 2
- `/r/BAR001` - Bar Area  
- `/r/PATIO01` - Outdoor Patio

## 📝 Common Tasks

### Add New QR Code
```sql
-- In Prisma Studio or database:
INSERT INTO "QrCode" (id, clientId, label, shortCode, status)
VALUES ('uuid', 'client-uuid', 'Table 5', 'TABLE05', 'ACTIVE');
```

### Test Review Submission
1. Visit `/r/TEST123`
2. Select star rating
3. Add comment (optional)
4. Submit
5. Check database with `npm run db:studio`

### Implement Admin Dashboard (Part 2)
```
Tell Claude: "Implement Part 2 Admin Dashboard following .claude/contexts/part2-admin/ with the same premium UI patterns used in Part 1"
```

### Implement Client Portal (Part 3)
```
Tell Claude: "Implement Part 3 Client Portal following .claude/contexts/part3-client/ maintaining the premium UI consistency"
```

## 🐛 Known Issues & Fixes

### If Database Connection Fails
```bash
# Check .env has correct DATABASE_URL
# Restart dev server
npm run dev
```

### If Styles Look Generic
- Ensure following PREMIUM_UI_GUIDE.md
- Check Framer Motion animations are working
- Verify custom design tokens are applied

### If Build Fails
```bash
npm run typecheck  # Check for TS errors
npm run lint       # Check for linting issues
```

## 💡 Important Context for Claude

When continuing work, remind Claude:
1. **NO GENERIC UI** - Follow PREMIUM_UI_GUIDE.md strictly
2. **Use established patterns** - Reference existing components
3. **Maintain consistency** - Same colors, animations, spacing
4. **Test data exists** - Use TEST123 for testing
5. **Premium packages installed** - Framer Motion, canvas-confetti, etc.

## 🎯 Next Priority Tasks

1. **Admin Authentication** (NextAuth setup)
2. **Admin Dashboard Layout** (Sidebar + main content)
3. **Client Management CRUD** (Add/edit/delete clients)
4. **Analytics Aggregation** (KPI calculations)
5. **Client Portal Auth** (Multi-tenant)

## 📦 Key Dependencies Installed

```json
{
  "critical": {
    "next": "15.5.2",
    "react": "19.1.0",
    "prisma": "^6.2.0",
    "framer-motion": "^12.23.0",
    "tailwindcss": "^4"
  },
  "ui-premium": {
    "canvas-confetti": "^1.9.3",
    "sonner": "^1.7.0",
    "vaul": "^1.1.2",
    "class-variance-authority": "^0.7.0"
  }
}
```

## 🔄 To Continue Development

Just tell Claude:
```
Continue building the Reviews Platform. Part 1 is complete. Start Part 2 (Admin Dashboard) following the established premium UI patterns and using the context in .claude/contexts/part2-admin/.
```

---
**Last Updated**: Project has Reviews Landing fully functional with premium UI
**Ready for**: Admin Dashboard implementation
**Database**: Connected and seeded with test data
**UI Quality**: Premium (Airbnb/Apple inspired)