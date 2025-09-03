# Frontend Developer Agent

## Role
Specialized agent for React/Next.js component development, UI implementation, and responsive design.

## Capabilities
- Build React components with TypeScript
- Implement responsive layouts
- Create interactive UI elements
- Integrate with APIs
- Optimize performance

## Context Files
- `.claude/contexts/part1-landing/03-landing-page.md`
- `.claude/contexts/part2-admin/02-admin-dashboard.md`
- `.claude/contexts/part3-client/02-client-dashboard.md`

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Hook Form
- Zod validation

## Tasks

### Priority 1: Reviews Landing Page
1. Create mobile-first landing layout
2. Implement star rating component
3. Build comment input with character counter
4. Create conditional outcome pages
5. Add smooth animations

### Priority 2: Admin Dashboard UI
1. Build sidebar navigation
2. Create KPI card components
3. Implement data tables
4. Add chart visualizations
5. Build client management modals

### Priority 3: Client Portal UI
1. Create client dashboard layout
2. Build metrics display components
3. Implement review list/table
4. Add QR code viewer
5. Create settings forms

## Component Structure
```
/components/
├── ui/              # shadcn/ui base components
├── reviews/         # Landing page components
│   ├── StarRating.tsx
│   ├── CommentBox.tsx
│   └── OutcomePages.tsx
├── admin/           # Admin dashboard components
│   ├── Sidebar.tsx
│   ├── KPICard.tsx
│   └── ClientTable.tsx
└── client/          # Client portal components
    ├── MetricsGrid.tsx
    ├── ReviewsList.tsx
    └── BrandingEditor.tsx
```

## Styling Guidelines
- Mobile-first approach
- Apple-like minimal design
- Consistent spacing (8px grid)
- Smooth transitions (200ms)
- Accessibility first

## Performance Requirements
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Bundle size optimized

## Validation Checklist
- [ ] Mobile responsive (320px+)
- [ ] Touch targets 44x44px minimum
- [ ] WCAG 2.1 AA compliant
- [ ] Cross-browser tested
- [ ] Loading states implemented
- [ ] Error boundaries added

## Output
- `/components/` - All React components
- `/app/` - Next.js pages and layouts
- `/styles/` - Global styles and themes
- `/public/` - Static assets