# Premium UI Development Guide - Avoiding Generic LLM Patterns

## How to Prompt Claude Opus 4.1 for Premium, Non-Generic UI

### 🎯 Core Principles for Premium UI with Claude Code

#### 1. **Specificity Over Generality**
Instead of: "Create a dashboard"
Use: "Create a dashboard inspired by Linear's interface with subtle glass morphism, 8px border radius, #FAFAFA background, and Inter font at 14px/20px line height"

#### 2. **Reference Real Products**
Always provide specific references:
- "Like Stripe's dashboard navigation"
- "Similar to Vercel's deployment cards"
- "Inspired by Linear's issue tracker"
- "Following Arc browser's sidebar pattern"

#### 3. **Define Micro-Interactions**
Be explicit about animations:
```
- Buttons: scale(0.98) on click with 150ms ease-out
- Cards: 0 2px 8px rgba(0,0,0,0.04) hover to 0 8px 24px rgba(0,0,0,0.08)
- Transitions: all 200ms cubic-bezier(0.4, 0, 0.2, 1)
```

### 📝 Perfect Prompt Structure for Claude Opus 4.1

```markdown
Create a [COMPONENT_NAME] with these specific requirements:

VISUAL REFERENCE:
- Similar to [SPECIFIC_PRODUCT] but with [MODIFICATIONS]
- Screenshot/URL: [LINK]

DESIGN TOKENS:
- Colors: Primary #007AFF, Surface #FAFAFA, Border #E5E5E7
- Spacing: 4px grid system (4, 8, 12, 16, 24, 32, 48)
- Typography: Inter 14px/20px regular, 16px/24px medium headings
- Shadows: sm: 0 1px 2px rgba(0,0,0,0.05), md: 0 4px 6px rgba(0,0,0,0.07)

INTERACTIONS:
- Hover: opacity 0.8, transition 150ms
- Active: scale(0.98), background darken 5%
- Focus: 2px offset outline #007AFF with 0.2 opacity

SPECIFIC DETAILS:
- No generic "Click here" - use "Continue to dashboard →"
- No rounded-full - use rounded-lg (8px)
- No generic success messages - use "Review submitted successfully"
```

### 🚀 Premium NPM Packages Stack

```json
{
  "premium-ui": {
    "foundation": {
      "@radix-ui/react-*": "^1.1.0",
      "class-variance-authority": "^0.7.0",
      "tailwind-merge": "^2.7.0"
    },
    "animations": {
      "framer-motion": "^11.15.0",
      "auto-animate": "^0.0.19",
      "@formkit/auto-animate": "^0.8.2",
      "lottie-react": "^2.4.0"
    },
    "premium-components": {
      "sonner": "^1.7.0",
      "vaul": "^1.1.0",
      "emblor": "^1.4.0",
      "react-hot-toast": "^2.4.1"
    },
    "charts": {
      "recharts": "^2.15.0",
      "tremor": "^3.18.0"
    },
    "utilities": {
      "react-intersection-observer": "^9.14.0",
      "react-wrap-balancer": "^1.1.1",
      "next-themes": "^0.4.0"
    }
  }
}
```

### 💎 Specific UI Patterns to Request

#### 1. **Bento Grid Layouts**
```
"Create a bento grid dashboard like Raycast's, with:
- Asymmetric card sizes
- Subtle gradient borders on hover
- Content-aware spacing
- Glass morphism effect on dark mode"
```

#### 2. **Micro-Animations**
```
"Add these micro-interactions:
- Stagger children animations (50ms delay between items)
- Spring physics for modal appearance (stiffness: 260, damping: 20)
- Number count-up animations for metrics
- Skeleton pulse while loading (not generic gray boxes)"
```

#### 3. **Custom Success/Error States**
```
"For success state:
- Confetti animation from canvas-confetti
- Green gradient badge sliding in from top
- Check icon with draw-on animation

For error state:
- Subtle shake animation (x: [-10, 10, -10, 10, 0])
- Red glow effect behind form
- Specific error: 'Restaurant name already exists' not 'Error occurred'"
```

### 🎨 Design System Specifications

```typescript
// Always provide this to Claude
const designSystem = {
  colors: {
    // Apple-inspired palette
    primary: {
      50: '#EFF6FF',
      500: '#007AFF',
      600: '#0051D5',
    },
    success: {
      50: '#F0FDF4',
      500: '#34C759',
    },
    gray: {
      50: '#FAFAFA',
      100: '#F4F4F5',
      200: '#E5E5E7',
      300: '#D1D1D6',
      500: '#71717A',
      900: '#18181B',
    }
  },
  animation: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    curve: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  }
}
```

### 🔥 Prompting for Specific Components

#### Star Rating Component
```
"Create a star rating component:
- Inspired by Airbnb's review stars
- 48px stars on mobile, 32px on desktop  
- Fill animation from left to right on hover
- Yellow gradient: linear-gradient(135deg, #FFD700 0%, #FFA500 100%)
- Haptic feedback trigger on mobile (navigator.vibrate)
- ARIA labels: '4 out of 5 stars selected'"
```

#### Dashboard KPI Cards
```
"Create KPI cards like Stripe's dashboard:
- White background with 1px solid #E5E5E7 border
- Metric value in 32px Inter font-weight 600
- Percentage change with up/down arrow icon
- Subtle hover: translateY(-2px) and shadow increase
- Loading state: animated gradient placeholder, not spinner"
```

### 🚫 Anti-Patterns to Avoid

Tell Claude explicitly NOT to use:
- Generic "Lorem ipsum" text
- "Click here" or "Submit" buttons
- rounded-full on everything
- Generic shadow-lg classes
- Plain gray backgrounds (#gray-100)
- Default Tailwind colors without customization
- Generic loading spinners
- "Something went wrong" errors

### ✅ Quality Checklist Prompt Addition

Always end prompts with:
```
Ensure the component:
1. Has custom hover/active states (not just opacity changes)
2. Uses semantic HTML with proper ARIA labels
3. Includes loading and error states with specific messages
4. Has smooth enter/exit animations with Framer Motion
5. Works perfectly on iPhone 14 Pro (390px) to desktop (1920px)
6. Matches the Apple HIG or Material Design 3 guidelines
7. Uses the Inter or SF Pro font family
8. Has no generic placeholder text
```

### 📱 Mobile-First Specifics

```
"Mobile requirements (iPhone 14 Pro - 390px):
- Touch targets minimum 44x44px (Apple HIG)
- Bottom sheet pattern for modals (like iOS native)
- Swipe gestures for navigation
- Safe area padding for notch/home indicator
- Thumb-reachable CTAs in bottom 1/3 of screen
- Native-feeling scroll with -webkit-overflow-scrolling: touch"
```

### 🎭 Brand Personality Injection

```
"Component personality:
- Professional but approachable (like Notion)
- Subtle delighters (confetti on 5-star review)
- Warm error messages ('Oops, that email is already loved by another account')
- Celebratory success states (not just green checkmarks)
- Microinteractions that feel intentional, not decorative"
```

## Example: Complete Premium Component Request

```markdown
Create a review submission card using:

REFERENCE: Airbnb's review modal combined with Linear's form styling

STRUCTURE:
- Glass morphism card: backdrop-blur-xl bg-white/70
- 12px border radius with 1px rgba(255,255,255,0.18) border
- Max-width 420px, padding 24px

STAR RATING:
- 5 stars at 44px each (mobile) 
- Framer motion stagger animation on mount
- Fill from left on hover with #FFB800
- Haptic feedback on selection

COMMENT BOX:
- Auto-expanding textarea like Twitter
- Character counter appears at 100 chars (500 max)
- Placeholder: "Share what made your experience special..."
- Focus: 2px #007AFF border with 4px glow

SUBMIT BUTTON:
- Full width, height 48px
- Gradient: linear-gradient(135deg, #007AFF 0%, #0051D5 100%)
- Disabled until rating selected
- Loading: shifting gradient animation, not spinner
- Success: transforms to green with checkmark

ANIMATIONS:
- Entry: slideUp + fadeIn with spring physics
- Success: confetti burst + scale bounce
- Error: subtle horizontal shake

Use Radix UI primitives, Framer Motion, and these exact design tokens.
```

## Results You'll Get

Following these prompting strategies with Claude Opus 4.1 will produce:
- UI that looks like it came from a $50k design agency
- Components that feel native to premium products
- Interactions that surprise and delight users
- Code that follows industry best practices
- Designs that don't scream "AI-generated"

Remember: Claude Opus 4.1 excels at visual fidelity when given specific references and detailed requirements. The more specific your prompt, the less generic your output.