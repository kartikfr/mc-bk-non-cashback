# MoneyControl Cards - Responsive Testing Checklist

## Overview
This document provides a comprehensive testing checklist for responsive design across all pages of the MoneyControl Cards platform.

## Testing Breakpoints
Test all flows at these key widths:
- **Mobile Small**: 320px (iPhone SE)
- **Mobile**: 375px (iPhone 12/13)
- **Mobile Large**: 414px (iPhone Plus)
- **Tablet**: 768px (iPad Portrait)
- **Laptop**: 992px (Small Desktop)
- **Desktop**: 1200px+ (Full Desktop)

## Chrome DevTools Device Presets
- iPhone SE (320×568)
- iPhone 12 Pro (390×844)
- iPad (768×1024)
- iPad Pro (1024×1366)
- Custom: 992px width

## Global Shell Tests

### Navigation
- [ ] Logo scales appropriately (h-12 mobile → h-16 tablet → h-20 desktop)
- [ ] Hamburger menu appears ≤991px and opens slide-in drawer
- [ ] Desktop links visible ≥992px
- [ ] Tools dropdown works on all widths
- [ ] Sticky header doesn't block content
- [ ] Safe area padding on notched devices
- [ ] All touch targets ≥44×44px

### Footer
- [ ] Columns stack vertically on mobile (≤768px)
- [ ] Links remain clickable with adequate spacing
- [ ] Social icons centered on mobile
- [ ] Copyright text centered and readable

---

## Page-by-Page Tests

### 1. Home Page (Index)

#### Hero Section
- [ ] Text/image stack vertically on mobile
- [ ] Headline clamps from 7xl → 5xl → 3xl → 2xl
- [ ] Subheading text scales appropriately
- [ ] CTA buttons stack vertically (sm:flex-row)
- [ ] CTA buttons full-width on mobile
- [ ] Floating background elements don't cause overflow
- [ ] GSAP animations respect `prefers-reduced-motion`

#### Four Key USPs
- [ ] Grid: 1 col mobile → 2 tablet → 4 desktop
- [ ] Icons scale: w-8 mobile → w-12 desktop
- [ ] Card min-height prevents layout shift
- [ ] Touch targets adequate for mobile taps
- [ ] Stagger animations work on scroll

#### Bank Carousel
- [ ] Logos scale appropriately
- [ ] Horizontal scroll works with touch/swipe
- [ ] No horizontal overflow
- [ ] Lazy loading implemented

#### Popular Credit Cards
- [ ] Tabs scroll horizontally on mobile
- [ ] Card grid: 1 col mobile → 2 tablet → 3 desktop
- [ ] Card images maintain aspect ratio
- [ ] Fee grid stacks on very small widths
- [ ] CTA buttons full-width and stacked
- [ ] "View All Cards" button centers properly

#### Testimonials
- [ ] Carousel scrolls smoothly
- [ ] Touch/swipe gestures work on mobile
- [ ] Stats band: 1 col mobile → 3 tablet
- [ ] No text overflow in testimonial cards

#### Blog Section
- [ ] Grid: 1 col mobile → 2 tablet → 3 desktop
- [ ] Image aspect ratio maintained
- [ ] Tags wrap properly
- [ ] "Read More" CTAs accessible

---

### 2. Cards Listing (Discover)

#### Hero/Search
- [ ] Headline scales: text-3xl → 4xl
- [ ] Search bar full-width on mobile
- [ ] Search button adequate size (touch-target)

#### Filters
- [ ] Sidebar hidden ≤991px, accessible via drawer
- [ ] Filter drawer opens from left with slide animation
- [ ] Sticky Apply/Clear buttons at bottom of drawer
- [ ] Close button visible and functional
- [ ] All filter sections (accordions) work
- [ ] Drawer closes on apply/clear

#### Eligibility Bar
- [ ] Inputs stack vertically on mobile (grid-cols-1)
- [ ] Labels above inputs (not inline)
- [ ] Button full-width on mobile
- [ ] Adequate spacing between fields

#### Card Grid
- [ ] Grid: 1 col mobile (≤640) → 2 tablet (≥768) → 3 desktop (≥1024)
- [ ] Card images scale appropriately
- [ ] Savings/eligibility/LTF badges don't overlap
- [ ] Compare toggle icon positioned correctly
- [ ] Fee chips readable
- [ ] Details/Apply buttons full-width on mobile
- [ ] Card hover effects work (not just desktop)

#### Active Filters Pills
- [ ] Pills wrap to multiple lines
- [ ] X buttons are touch-friendly
- [ ] Readable on all widths

#### Compare Pill (Floating)
- [ ] Positioned bottom-4 right-4 with safe margins
- [ ] Pill shrinks appropriately on mobile
- [ ] Thumbnails scale: w-12 → w-16
- [ ] Text truncates gracefully ("Compare" vs "Compare Cards")
- [ ] Clear button is touch-friendly

#### Load More
- [ ] Button full-width on mobile
- [ ] Count label wraps properly

---

### 3. Card Details Page

#### Hero
- [ ] Image/stats stack vertically ≤768px
- [ ] Image shrinks proportionally
- [ ] Headline clamps: text-3xl → 4xl
- [ ] CTA buttons wrap (flex-wrap) and remain accessible
- [ ] Compare button not cut off

#### Sticky CTA Bar
- [ ] Appears after scrolling past hero
- [ ] Full-width on mobile
- [ ] Apply button takes majority width
- [ ] Compare button shrinks to icon on mobile
- [ ] Safe area padding at bottom

#### Quick Navigation
- [ ] Sticky nav appears at correct scroll position
- [ ] Buttons scroll horizontally on mobile (scrollbar-hide)
- [ ] Active section highlighted
- [ ] Touch targets adequate

#### Fees/Eligibility
- [ ] Summary cards stack (grid-cols-1 mobile → 2 tablet)
- [ ] Icons and text aligned
- [ ] Adequate padding and spacing

#### Benefits/Tabs
- [ ] Tabs scroll horizontally on mobile
- [ ] Accordion items expand/collapse smoothly
- [ ] Long text truncated with "Show More"
- [ ] Images/icons scale appropriately

#### Fee Structure & T&Cs
- [ ] Tables convert to stacked cards on mobile
- [ ] Accordions work for each section
- [ ] HTML content renders without overflow

#### How to Apply Section
- [ ] Steps stack vertically on mobile
- [ ] Icons centered
- [ ] CTA button full-width and prominent

---

### 4. Card Genius

#### Question Flow
- [ ] Welcome dialog centers and scales appropriately
- [ ] Progress bar sticky at top
- [ ] Headline clamps: text-2xl → 4xl
- [ ] Question card full-width with adequate padding
- [ ] Sliders thumb size adequate for touch
- [ ] Input fields full-width on mobile
- [ ] Nav buttons stack vertically (sm:flex-row)
- [ ] Skip button hidden on mobile (shows on tablet+)
- [ ] Previous/Next buttons full-width mobile

#### Results Table
- [ ] Table scrolls horizontally on mobile
- [ ] Sticky "Credit Cards" column works
- [ ] Scroll indicators (arrows) visible and functional
- [ ] Tabs (Quick/Detailed) accessible
- [ ] Eligibility popover opens correctly
- [ ] All savings values readable

#### Card Detail View (from results)
- [ ] Image scales appropriately
- [ ] Savings summary card stacks
- [ ] Category pills scroll horizontally
- [ ] Breakdown view switches (yearly/monthly)
- [ ] Back button visible and functional
- [ ] Escape hint shown on desktop, hidden mobile

---

### 5. Category Card Genius

#### Category Tiles
- [ ] Grid: 2 cols mobile → 3 tablet → 7 desktop
- [ ] Icons scale: w-8 → w-12
- [ ] Touch targets adequate
- [ ] Selected state (ring) visible

#### Question Flow
- [ ] Progress bar scales
- [ ] Question text wraps properly
- [ ] SpendingInput component responsive
- [ ] Lounge questions show "visits" suffix without ₹
- [ ] Validation toasts appear centered

#### Results
- [ ] Card grid: 1 col mobile → 3 desktop
- [ ] Savings breakdown accordion works
- [ ] Lounge breakdown cards stack
- [ ] "Best Match" badge positioned correctly
- [ ] Apply/View Details buttons full-width mobile

---

### 6. Beat My Card

#### Search/Selection
- [ ] Search input full-width
- [ ] Dropdown results don't overflow
- [ ] Trust badges wrap on mobile

#### Comparison Result
- [ ] Winner/current cards stack vertically on mobile
- [ ] Comparison bar adapts to vertical layout
- [ ] Category savings accordion works
- [ ] "Try Another Card" button full-width
- [ ] Apply buttons touch-friendly

---

### 7. Comparison Panel (Dialog/Drawer)

#### Mobile
- [ ] Dialog takes 98vw width
- [ ] Card slots stack (grid-cols-1)
- [ ] Search inputs full-width
- [ ] Remove buttons touch-friendly
- [ ] Comparison sections work as accordions
- [ ] Apply buttons full-width

#### Tablet/Desktop
- [ ] 2-3 column grid for card slots
- [ ] Table scrolls horizontally if needed
- [ ] Detail drawer opens correctly

---

### 8. Redirect Interstitial

- [ ] Countdown timer centered
- [ ] Bank logo scales
- [ ] Card name doesn't overflow
- [ ] CTA button prominent and centered

---

### 9. Blog Posts

- [ ] Article typography scales
- [ ] Images responsive with srcset
- [ ] Code blocks don't overflow
- [ ] Share buttons accessible
- [ ] Back button visible

---

## Accessibility Tests

### Keyboard Navigation
- [ ] All interactive elements focusable with Tab
- [ ] Focus indicators visible (2px outline)
- [ ] Escape closes dialogs/drawers
- [ ] Arrow keys navigate where appropriate

### Screen Reader
- [ ] All images have alt text
- [ ] ARIA labels on icon-only buttons
- [ ] Headings in semantic order (h1 → h2 → h3)
- [ ] Form inputs have associated labels
- [ ] Drawer/dialog roles announced correctly

### Color Contrast
- [ ] All text meets WCAG AA (4.5:1)
- [ ] Focus states visible against backgrounds
- [ ] Disabled states distinguishable

### Touch Targets
- [ ] All interactive elements ≥44×44px
- [ ] Adequate spacing between tappable items
- [ ] No overlapping interactive zones

---

## Performance Tests

### Lighthouse Scores (Mobile)
Run on each major page:
- [ ] Home: Performance ≥90, Accessibility 100
- [ ] Cards Listing: Performance ≥85, Accessibility 100
- [ ] Card Details: Performance ≥85, Accessibility 100
- [ ] Card Genius: Performance ≥85, Accessibility 100
- [ ] Category Genius: Performance ≥85, Accessibility 100
- [ ] Beat My Card: Performance ≥85, Accessibility 100

### Image Optimization
- [ ] All images have `loading="lazy"` below fold
- [ ] Hero images use `srcset` for responsive sizes
- [ ] WebP format where supported
- [ ] Image dimensions specified to prevent CLS

### Animation Performance
- [ ] GSAP animations use `force3D: true`
- [ ] CSS transforms (not left/top for movement)
- [ ] Reduced motion respected
- [ ] No janky scroll interactions

---

## Cross-Browser Tests

### Browsers to Test
- [ ] Chrome (Desktop + Mobile)
- [ ] Safari (Desktop + iOS)
- [ ] Firefox (Desktop + Mobile)
- [ ] Edge (Desktop)

### Common Issues to Check
- [ ] Flexbox/Grid support
- [ ] CSS clamp() support
- [ ] Touch events work correctly
- [ ] Backdrop-filter polyfills
- [ ] Sticky positioning edge cases

---

## PR Verification Checklist

Before submitting PR, attach:
- [ ] Screenshots at 320px, 768px, 1200px for Home, Cards, Card Details
- [ ] GIF/video of hamburger menu interaction
- [ ] GIF of filter drawer on mobile
- [ ] GIF of comparison pill → panel flow
- [ ] Lighthouse reports for key pages
- [ ] axe DevTools scan results (0 violations)

---

## Notes
- Test with real content (long card names, many tags, edge cases)
- Verify touch gestures on actual mobile device (not just devtools)
- Check landscape orientation on tablets
- Test with slow network (throttle to 3G) for loading states




