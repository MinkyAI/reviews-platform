# Task: Google Reviews Integration

## Objective
Implement compliant Google Reviews integration that redirects satisfied customers to leave reviews while respecting Google's policies against review gating.

## Requirements

### Compliance Requirements
- NO prefilling of review text (against Google policies)
- NO filtering negative reviews from reaching Google
- Must offer Google review option to all users
- Clear disclosure about review process
- No incentivizing reviews

### Core Functionality

1. **Google Place ID Management**
   - Store Place ID per client
   - Validate Place ID format
   - Handle missing/invalid IDs gracefully

2. **Review URL Generation**
   ```typescript
   interface GoogleReviewUrl {
     placeId: string
     hl?: string // language code
   }
   ```
   - Format: `https://search.google.com/local/writereview?placeid=[PLACE_ID]`
   - Support multiple languages
   - Mobile-optimized URLs

3. **Copy to Clipboard**
   - Copy user's comment text
   - Visual feedback on copy
   - Fallback for unsupported browsers
   - Clear instructions for users

4. **Tracking & Analytics**
   - Track Google button clicks
   - Measure conversion rates
   - A/B testing capabilities
   - No personal data tracking

## Implementation Steps

### Step 1: Place ID Configuration
```typescript
// Database model
interface ClientGoogleConfig {
  clientId: string
  placeId: string
  verifiedAt?: Date
  lastChecked?: Date
  status: 'active' | 'invalid' | 'missing'
}
```

### Step 2: URL Builder Service
```typescript
class GoogleReviewService {
  generateReviewUrl(placeId: string, options?: UrlOptions): string
  validatePlaceId(placeId: string): Promise<boolean>
  getBusinessInfo(placeId: string): Promise<BusinessInfo>
}
```

### Step 3: Copy Mechanism
```typescript
interface CopyToClipboard {
  copy(text: string): Promise<boolean>
  isSupported(): boolean
  showFeedback(success: boolean): void
}
```

### Step 4: Review Flow Components

#### For 5-Star Reviews
```tsx
interface PositiveReviewFlow {
  comment: string
  googleUrl: string
  onCopyAndRedirect: () => void
  onSkip: () => void
}
```
- "Share your experience on Google"
- Copy button + redirect
- Skip option (small link)

#### For 1-4 Star Reviews
```tsx
interface CriticalReviewFlow {
  googleUrl: string
  onGoogleClick: () => void
  onContactClick: () => void
}
```
- Contact restaurant primary CTA
- "Leave Google review anyway" (secondary)
- No comment copy for negative reviews

## User Experience Flow

### 5-Star Review Path
1. User selects 5 stars
2. Writes positive comment
3. Submits review
4. Success screen appears
5. "Copy my comment & Post on Google" button
6. Click copies text and opens Google Reviews
7. User pastes comment on Google

### 1-4 Star Review Path
1. User selects 1-4 stars
2. Writes feedback (optional)
3. Submits review
4. Feedback screen appears
5. "Contact Restaurant" primary button
6. "Still leave a Google review" small link
7. Direct to contact or Google (no copy)

## Analytics Implementation

### Events to Track
```typescript
enum GoogleReviewEvents {
  GOOGLE_BUTTON_SHOWN = 'google_button_shown',
  COPY_COMMENT_CLICKED = 'copy_comment_clicked',
  COPY_SUCCESS = 'copy_success',
  COPY_FAILED = 'copy_failed',
  GOOGLE_REDIRECT = 'google_redirect',
  SKIP_GOOGLE = 'skip_google',
  CONTACT_INSTEAD = 'contact_instead'
}
```

### Metrics to Calculate
- Google CTR = (Google clicks / Total submissions)
- Positive redirect rate = (5-star Google clicks / 5-star reviews)
- Negative redirect rate = (1-4 star Google clicks / 1-4 star reviews)
- Copy success rate

## Technical Implementation

### Clipboard API Usage
```javascript
async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Clipboard API failed:', err);
    }
  }
  
  // Fallback for older browsers
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "absolute";
  textArea.style.left = "-999999px";
  document.body.appendChild(textArea);
  textArea.select();
  
  try {
    document.execCommand('copy');
    return true;
  } catch (err) {
    return false;
  } finally {
    document.body.removeChild(textArea);
  }
}
```

### Google URL Helper
```typescript
function buildGoogleReviewUrl(placeId: string, lang?: string): string {
  const baseUrl = 'https://search.google.com/local/writereview';
  const params = new URLSearchParams({ placeid: placeId });
  
  if (lang) {
    params.append('hl', lang);
  }
  
  return `${baseUrl}?${params.toString()}`;
}
```

## Acceptance Criteria

- [ ] Place ID validation works correctly
- [ ] URLs open Google Reviews on all devices
- [ ] Copy to clipboard works on 95%+ browsers
- [ ] Clear feedback when copy succeeds/fails
- [ ] Analytics tracking all key events
- [ ] Compliant with Google policies
- [ ] Graceful handling of missing Place IDs
- [ ] Multi-language support

## Testing Requirements

### Unit Tests
- URL generation with various inputs
- Clipboard functionality
- Analytics event firing
- Place ID validation

### Integration Tests
- Full review flow
- Copy and redirect sequence
- Error scenarios
- Different rating paths

### Manual Tests
- Test on real mobile devices
- Verify Google Reviews opens correctly
- Check copy/paste functionality
- Test with different languages

## Compliance Checklist

- [ ] No automatic review posting
- [ ] No review text prefilling
- [ ] All ratings can reach Google
- [ ] No payment for reviews
- [ ] Clear user consent
- [ ] Transparent process
- [ ] No manipulation of ratings

## Error Handling

- Invalid Place ID: Show admin notification
- Copy fails: Provide manual instructions
- Google site down: Fallback message
- Network issues: Retry mechanism

## Security Considerations

- Validate Place IDs server-side
- Sanitize copied text
- Rate limit API calls
- Log suspicious activity
- Prevent XSS in comment text

## Dependencies

- Clipboard API (native)
- Google Places API (for validation)
- Analytics service
- Toast notification library

## Future Enhancements

- Multiple review platform support
- Review response monitoring
- Sentiment analysis of comments
- Review velocity tracking
- Competitive benchmarking