# Task: Mobile-Responsive Reviews Landing Page

## Objective
Create a beautiful, mobile-first landing page that customers see after scanning a QR code, optimized for quick feedback collection with conditional outcomes based on rating.

## Requirements

### Design Specifications
- Apple-like minimal design
- White background, soft shadows
- Large, touch-friendly elements
- Mobile-first (320px minimum width)
- Smooth animations and transitions
- Accessibility compliant (WCAG 2.1 AA)

### Page Components

#### 1. Header Section
```typescript
interface HeaderProps {
  restaurantName: string
  logoUrl?: string
  brandColors?: BrandColors
}
```
- Restaurant logo (if available)
- Business name prominently displayed
- Clean, centered layout

#### 2. Rating Component
```typescript
interface StarRatingProps {
  value: number
  onChange: (rating: number) => void
  size: 'small' | 'medium' | 'large'
  animated: boolean
}
```
- 5 large, touchable stars
- Hover/tap effects
- Clear visual feedback
- Required field indicator

#### 3. Comment Section
```typescript
interface CommentBoxProps {
  value: string
  onChange: (text: string) => void
  placeholder: string
  maxLength: number
  optional: boolean
}
```
- Auto-expanding textarea
- Character counter
- "Optional" label
- Encouraging placeholder text

#### 4. Submit Button
```typescript
interface SubmitButtonProps {
  onClick: () => void
  disabled: boolean
  loading: boolean
  fullWidth: boolean
}
```
- Full-width on mobile
- Loading state
- Disabled until rating selected
- Smooth press animation

## Implementation Steps

### Step 1: Create Base Layout
```tsx
// /app/r/[code]/page.tsx
export default function ReviewLandingPage({ params }) {
  // Fetch restaurant data based on QR code
  // Initialize state for rating and comment
  // Handle form submission
}
```

### Step 2: Implement Star Rating
- SVG star icons
- Fill animation on selection
- Touch gesture support
- Accessibility with arrow keys

### Step 3: Create Comment Box
- Auto-resize based on content
- Mobile keyboard optimization
- Emoji support
- Text sanitization

### Step 4: Outcome Pages

#### Positive Outcome (5 stars)
```tsx
interface PositiveOutcomeProps {
  comment: string
  googleReviewUrl: string
  onCopyClick: () => void
}
```
- Success animation (confetti or checkmark)
- "We're glad you loved it!" message
- Big green success icon
- Copy comment button
- Google Review redirect

#### Negative Outcome (1-4 stars)
```tsx
interface NegativeOutcomeProps {
  rating: number
  contactEmail: string
  contactPhone?: string
}
```
- Empathetic message
- Contact options prominently displayed
- Optional Google review link (small)
- Warm, understanding tone

### Step 5: Analytics Integration
```typescript
interface AnalyticsEvent {
  event: 'page_view' | 'rating_selected' | 'review_submitted' | 'cta_clicked'
  properties: Record<string, any>
  timestamp: Date
}
```

## Mobile Optimizations

### Touch Interactions
- Minimum touch target: 44x44px
- Tap feedback: scale(0.95)
- Swipe gestures for star rating
- Prevent double-tap zoom

### Performance
- Lazy load images
- Inline critical CSS
- Preload fonts
- Service worker for offline support

### Viewport Settings
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
```

## Styling Requirements

### Design Tokens
```scss
:root {
  --primary: #007AFF;      // iOS blue
  --success: #34C759;      // Green
  --warning: #FF9500;      // Orange
  --danger: #FF3B30;       // Red
  --background: #FFFFFF;
  --surface: #F2F2F7;
  --text-primary: #000000;
  --text-secondary: #8E8E93;
  --border-radius: 12px;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.12);
}
```

### Responsive Breakpoints
```scss
$mobile: 320px;
$tablet: 768px;
$desktop: 1024px;
```

## Acceptance Criteria

- [ ] Loads in under 2 seconds on 3G
- [ ] Works on all modern mobile browsers
- [ ] Touch targets meet accessibility standards
- [ ] Form validation provides clear feedback
- [ ] Animations run at 60fps
- [ ] Supports RTL languages
- [ ] Works offline after first load
- [ ] Keyboard accessible
- [ ] Screen reader compatible

## Browser Support

- iOS Safari 14+
- Chrome 90+
- Firefox 88+
- Samsung Internet 14+
- Edge 90+

## Testing Requirements

### Unit Tests
- Star rating component
- Form validation logic
- Analytics tracking
- URL generation

### Integration Tests
- Full submission flow
- Error handling
- Offline functionality
- Deep linking

### E2E Tests
- Complete user journey
- Different rating scenarios
- CTA button interactions
- Cross-browser testing

### Performance Tests
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Cumulative Layout Shift < 0.1

## File Structure
```
/app/r/[code]/
  ├── page.tsx
  ├── layout.tsx
  └── loading.tsx
/components/reviews/
  ├── StarRating.tsx
  ├── CommentBox.tsx
  ├── SubmitButton.tsx
  ├── OutcomePositive.tsx
  └── OutcomeNegative.tsx
/styles/
  └── reviews.module.scss
```

## Accessibility Requirements

- ARIA labels for all interactive elements
- Focus management between views
- Keyboard navigation support
- High contrast mode support
- Reduced motion support
- Screen reader announcements

## Error Handling

- Network failure recovery
- Invalid QR code message
- Submission retry logic
- User-friendly error messages
- Fallback UI components

## Security Measures

- Input sanitization
- XSS prevention
- Rate limiting
- CSRF protection
- Content Security Policy

## Deployment Considerations

- CDN for static assets
- Image optimization
- Gzip compression
- HTTP/2 support
- SSL certificate