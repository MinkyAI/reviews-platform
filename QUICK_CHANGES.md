# Quick Changes Guide - Reviews Platform

## 🎨 UI/UX Quick Changes

### Change Success Message (5 Stars)
```typescript
// File: components/reviews/OutcomePositive.tsx
// Line ~47
<h2 className="text-2xl font-semibold text-gray-900 mb-2">
  We're glad you loved it! // ← Change this text
</h2>
```

### Change Error Message (1-4 Stars)
```typescript
// File: components/reviews/OutcomeNegative.tsx  
// Line ~36
<h2 className="text-2xl font-semibold text-gray-900 mb-2">
  We're sorry to hear that // ← Change this text
</h2>
```

### Modify Star Colors
```typescript
// File: components/reviews/StarRating.tsx
// Line ~32-33
fill={filled ? "url(#starGradient)" : "none"}  // Change gradient
// Line ~51-52 - Modify gradient colors:
<stop offset="0%" stopColor="#FFD700" />    // ← Gold start
<stop offset="100%" stopColor="#FFA500" />  // ← Orange end
```

### Change Card Background
```typescript
// File: app/r/[code]/page.tsx
// Line ~240 - Main card styling
className="bg-white/70 backdrop-blur-xl" // ← Change opacity/blur
```

### Modify Button Animations
```typescript
// File: app/r/[code]/page.tsx
// Line ~333 - Submit button
whileTap={{ scale: 0.98 }} // ← Change scale value
transition={{ duration: 0.15 }} // ← Change animation speed
```

## 📝 Content Changes

### Restaurant Name Display
```typescript
// File: app/r/[code]/page.tsx
// Line ~249
<h1 className="text-3xl font-bold text-gray-900 mb-2">
  {qrData.client.name} // This pulls from database
</h1>
```

### Main Question Text
```typescript
// File: app/r/[code]/page.tsx
// Line ~254
<p className="text-lg text-gray-600 mb-8">
  How was your experience? // ← Change this
</p>
```

### Placeholder Text
```typescript
// File: components/reviews/CommentBox.tsx
// Line ~23
placeholder="Share what made your experience special..." // ← Change this
```

### Button Text
```typescript
// File: app/r/[code]/page.tsx
// Line ~339
{isSubmitting ? 'Submitting...' : 'Submit Review'} // ← Change these
```

## 🔗 Redirect URLs

### Google Review URL
```typescript
// File: components/reviews/OutcomePositive.tsx
// Line ~66 - Google Review URL construction
const googleUrl = qrData?.client?.googlePlaceId 
  ? `https://search.google.com/local/writereview?placeid=${qrData.client.googlePlaceId}`
  : '#'; // ← Modify URL structure if needed
```

### Contact Methods
```typescript
// File: components/reviews/OutcomeNegative.tsx
// Line ~58 & ~73
href={`mailto:${qrData?.client?.contactEmail}`} // Email link
href={`tel:${qrData?.client?.contactPhone}`}    // Phone link
```

## 🎭 Animation Changes

### Disable Confetti
```typescript
// File: components/reviews/OutcomePositive.tsx
// Line ~28-34
// Comment out this useEffect to disable confetti:
useEffect(() => {
  // triggerConfetti(); // ← Comment this line
}, []);
```

### Change Animation Timing
```typescript
// File: components/reviews/StarRating.tsx
// Line ~42
transition={{ duration: 0.2 }} // ← Adjust duration
```

### Modify Hover Effects
```css
/* File: app/globals.css */
/* Add or modify: */
.custom-hover {
  transition: all 200ms ease; /* ← Change timing */
}
.custom-hover:hover {
  transform: translateY(-2px); /* ← Change effect */
  box-shadow: 0 8px 24px rgba(0,0,0,0.08); /* ← Change shadow */
}
```

## 🗄️ Database Quick Changes

### Add Test QR Code
```bash
# Run Prisma Studio
npm run db:studio

# Or add via seed file:
# Edit: prisma/seed.ts
# Then run:
npm run db:seed
```

### Change Restaurant Info
```sql
-- In Prisma Studio, update Client table:
UPDATE "Client" 
SET name = 'New Restaurant Name',
    "contactEmail" = 'new@email.com'
WHERE id = 'cm5isx8je0000qdres6c5fnqt';
```

## 🎨 Color Scheme Changes

### Update All Primary Colors
```css
/* File: app/globals.css */
:root {
  --primary: #007AFF;    /* ← Change primary (iOS blue) */
  --success: #34C759;    /* ← Change success (green) */
  --warning: #FF9500;    /* ← Change warning (orange) */
  --danger: #FF3B30;     /* ← Change danger (red) */
}
```

### Change Background Colors
```css
/* File: app/globals.css */
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* ↑ Change gradient colors */
}
```

## 🚀 Quick Test Commands

### Test with Different QR Codes
```bash
# Start dev server
npm run dev

# Visit these URLs:
http://localhost:3000/r/TEST123  # Table 1 (has reviews)
http://localhost:3000/r/TABLE02   # Table 2
http://localhost:3000/r/BAR001    # Bar Area
http://localhost:3000/r/PATIO01  # Outdoor Patio
```

### Reset Database
```bash
# Clear all data and reseed
npm run db:push --force-reset
npm run db:seed
```

### Check Submissions
```bash
# Open database browser
npm run db:studio
# Navigate to ReviewSubmission table
```

## 📱 Mobile Adjustments

### Change Mobile Star Size
```typescript
// File: components/reviews/StarRating.tsx
// Line ~20
const isMobile = window.innerWidth < 768;
const starSize = isMobile ? 48 : 40; // ← Adjust sizes
```

### Adjust Mobile Padding
```typescript
// File: app/r/[code]/page.tsx
// Line ~237
<div className="min-h-screen p-4 md:p-8"> // ← Change padding
```

## ⚡ Performance Tweaks

### Disable Animations (for slow devices)
```typescript
// Add to any component:
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Then conditionally apply animations:
animate={prefersReducedMotion ? {} : { scale: 1.1 }}
```

### Reduce Blur Effects
```css
/* Change backdrop-blur-xl to backdrop-blur-sm or remove */
.glass-card {
  backdrop-filter: blur(5px); /* Reduce from 20px */
}
```

## 🔍 Debug Mode

### Enable Console Logging
```typescript
// File: app/api/reviews/route.ts
// Uncomment console.log statements for debugging
console.log('Review submission:', { rating, comment }); // ← Uncomment
```

### Check API Responses
```bash
# In browser console:
fetch('/api/reviews?code=TEST123')
  .then(r => r.json())
  .then(console.log)
```

---

**Pro Tip**: After making changes, always run `npm run dev` to see them live. Most changes hot-reload instantly!