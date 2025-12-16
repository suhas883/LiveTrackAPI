# Design Guidelines for LiveTrackings.com

## Design Approach: Design System-Based (Utility-First)

**Selected System**: Material Design (modified for utility)
**Rationale**: Package tracking is utility-focused, information-dense, requiring clear visual feedback and efficiency. Material Design excels at data presentation and progressive disclosure.

**Reference Inspiration**: Ship24, AfterShip, 17Track - clean, scan-focused interfaces with prominent search and clear status displays

## Core Design Elements

### Typography
- **Primary Font**: Inter (via Google Fonts CDN)
- **Headings**: 
  - H1: text-4xl font-bold (landing hero)
  - H2: text-2xl font-semibold (section headers)
  - H3: text-xl font-medium (card titles, status headers)
- **Body**: text-base font-normal (tracking details, descriptions)
- **Monospace**: font-mono text-sm (tracking numbers display)

### Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8 (p-4, m-6, space-y-8, etc.)
- Consistent card padding: p-6
- Section spacing: py-12 to py-16
- Component gaps: gap-4 for grids, space-y-6 for stacks

### Component Library

**A. Search/Input Section (Hero)**
- Large, prominent tracking number input field (center-aligned)
- Multi-tracking support (textarea or tag-based input)
- Courier auto-detect indicator below input
- Primary CTA button: "Track Package" (large, full-width on mobile)
- Recently tracked section below (horizontal scrolling cards on mobile)

**B. Results Display**
- Timeline/stepper component for package journey stages
- Status badge system (In Transit, Delivered, Exception, Pending)
- Expandable details cards with tracking events
- Estimated delivery date prominently displayed
- Courier logo/name identification

**C. Navigation**
- Clean header with logo, "Track", "API", "History" links
- Sticky navigation on scroll
- Mobile: hamburger menu

**D. Data Cards**
- Bordered cards with subtle shadow (shadow-sm)
- Rounded corners: rounded-lg
- Hover state: subtle scale or border highlight
- Icon + text combination for key information

**E. Status Indicators**
- Badge components with status-based styling
- Progress bars for delivery estimation
- Icon system for delivery stages (Heroicons via CDN)

### Layout Structure

**Landing Page**:
1. **Hero Section** (h-auto, py-16): 
   - Centered heading "Track Any Package, Anywhere"
   - Subheading explaining AI-powered multi-courier tracking
   - Large tracking input with instant search
   - Trust indicators below (e.g., "Supporting 500+ couriers worldwide")

2. **Features Grid** (2-column on md+, single on mobile):
   - AI Courier Detection
   - Multi-package Tracking
   - Real-time Updates
   - Tracking History

3. **How It Works** (3-step process, horizontal on desktop):
   - Enter tracking number
   - AI detects courier
   - Get real-time updates

4. **Footer**: Links, API documentation, contact

**Tracking Results Page**:
- Sticky tracking input at top
- Primary package status card (large, prominent)
- Timeline/events section (vertical stepper)
- Tracking details grid (2-column: package info + carrier info)

### Icons
**Library**: Heroicons (via CDN)
- Search, Package, Truck, Clock, Check, Alert icons
- Consistent 24px size for main actions, 20px for inline

### Images
**Hero Section**: Full-width background image of packages/logistics (subtle overlay for text readability)
- Suggested image: Abstract delivery trucks, packages on conveyor, or global shipping network visualization
- Overlay: Dark gradient (bottom to top) for input visibility
- Buttons on hero: backdrop-blur-sm with semi-transparent backgrounds

**Feature Cards**: Icon-based (no images needed - focus on clarity)

### Accessibility
- High contrast for status badges
- Clear focus states on all interactive elements
- ARIA labels for timeline/stepper components
- Keyboard navigation for tracking history

### Animations
**Minimal use**:
- Fade-in on search results appear
- Smooth transitions on status updates (when backend pushes new events)
- Subtle hover states on cards
- No scroll animations

**Critical**: This is a utility tool - speed and clarity over visual flair. Users need to quickly input tracking numbers and see results without distraction.