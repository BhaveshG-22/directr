# Virtual Photoshoot Generator - UI Kit Documentation

**Version:** 1.0  
**Last Updated:** January 2026  
**Purpose:** Complete design system reference for AI assistants, developers, and designers

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Interaction Patterns](#interaction-patterns)
7. [Accessibility Guidelines](#accessibility-guidelines)
8. [Voice & Tone](#voice--tone)
9. [Implementation Guidelines](#implementation-guidelines)

---

## Brand Identity

### Overview
Virtual Photoshoot Generator is a sophisticated, professional platform that democratizes high-quality photography. The design should evoke:
- **Premium quality** without being pretentious
- **Professional excellence** while remaining approachable
- **Creative freedom** balanced with technical precision
- **Luxury accessibility** - high-end results at accessible prices

### Design Principles
1. **Photography-First:** Let user-generated images be the hero
2. **Clean & Minimal:** Avoid visual clutter that distracts from content
3. **Consistent Quality:** Every element should feel intentional and polished
4. **Accessible Premium:** Luxury aesthetics without exclusivity

---

## Color System

### Primary Palette

#### Deep Charcoal
- **Hex:** `#1A1A1D`
- **RGB:** `26, 26, 29`
- **Usage:** Primary backgrounds, main navigation, headers, hero sections
- **Psychology:** Professional, sophisticated, authoritative
- **Accessibility:** Use with light text (AAA contrast with white)

#### Soft Cream
- **Hex:** `#F5F3EF`
- **RGB:** `245, 243, 239`
- **Usage:** Light backgrounds, cards, secondary surfaces, image borders
- **Psychology:** Clean, elegant, gallery-like
- **Accessibility:** Use with dark text for readability

#### Accent Gold
- **Hex:** `#D4AF37`
- **RGB:** `212, 175, 55`
- **Usage:** Premium badges, "Try Free" CTAs, highlights, hover states
- **Psychology:** Premium, exclusive, valuable
- **Accessibility:** Ensure 4.5:1 contrast ratio with text

#### Pure White
- **Hex:** `#FFFFFF`
- **RGB:** `255, 255, 255`
- **Usage:** Text on dark backgrounds, borders, clean spaces, card backgrounds
- **Psychology:** Pure, clean, professional

### Secondary Palette

#### Cinematic Blue
- **Hex:** `#4A90E2`
- **RGB:** `74, 144, 226`
- **Usage:** Interactive elements, links, secondary CTAs, info states
- **Psychology:** Trustworthy, modern, technological
- **Use Cases:** "View Gallery", "Learn More", navigation links

#### Warm Coral
- **Hex:** `#FF6B6B`
- **RGB:** `255, 107, 107`
- **Usage:** Purchase buttons, special offers, urgent actions
- **Psychology:** Energetic, inviting, action-oriented
- **Use Cases:** "Buy Now", "Purchase Photoshoot", promotional banners

#### Sage Green
- **Hex:** `#8B9D83`
- **RGB:** `139, 157, 131`
- **Usage:** Success states, confirmation messages, completed actions
- **Psychology:** Calm, successful, natural
- **Use Cases:** "Payment Successful", "Download Complete", checkmarks

### Neutral Palette

#### Dark Grey
- **Hex:** `#2D2D30`
- **RGB:** `45, 45, 48`
- **Usage:** Secondary backgrounds, card shadows, subtle dividers

#### Medium Grey
- **Hex:** `#6B6B6B`
- **RGB:** `107, 107, 107`
- **Usage:** Disabled states, secondary text, placeholder text, captions

#### Light Grey
- **Hex:** `#E8E8E8`
- **RGB:** `232, 232, 232`
- **Usage:** Borders, dividers, subtle backgrounds, input borders

### Color Combinations

#### Dark Mode (Preferred for Hero Sections)
- Background: `#1A1A1D`
- Primary Text: `#F5F3EF`
- Secondary Text: `#F5F3EF` at 70% opacity
- Accent: `#D4AF37`
- Links: `#4A90E2`

#### Light Mode (Preferred for Content Areas)
- Background: `#F5F3EF` or `#FFFFFF`
- Primary Text: `#1A1A1D`
- Secondary Text: `#6B6B6B`
- Borders: `#E8E8E8`
- Accent: `#D4AF37`

### Color Usage Rules

**DO:**
- Use Deep Charcoal for important, premium sections
- Reserve Gold for premium features and primary CTAs
- Use Coral sparingly for high-priority purchase actions
- Maintain high contrast ratios (minimum 4.5:1 for text)

**DON'T:**
- Use multiple accent colors in the same section
- Place Coral and Gold CTAs next to each other
- Use Light Grey text on Soft Cream backgrounds (poor contrast)
- Overuse Gold - it should feel special

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
```

### Type Scale

#### Display (Hero Headlines)
- **Size:** 60px (3.75rem)
- **Weight:** 700 (Bold)
- **Line Height:** 1.1
- **Letter Spacing:** -0.02em
- **Usage:** Landing page heroes, major section headers
- **Example:** "Create Stunning Professional Photos"

#### Heading 1
- **Size:** 48px (3rem)
- **Weight:** 700 (Bold)
- **Line Height:** 1.2
- **Letter Spacing:** -0.01em
- **Usage:** Page titles, major section headers
- **Example:** "Your Photoshoot Collection"

#### Heading 2
- **Size:** 36px (2.25rem)
- **Weight:** 600 (Semibold)
- **Line Height:** 1.3
- **Letter Spacing:** -0.01em
- **Usage:** Subsection headers, card titles
- **Example:** "Professional Quality Results"

#### Heading 3
- **Size:** 24px (1.5rem)
- **Weight:** 600 (Semibold)
- **Line Height:** 1.4
- **Usage:** Component headers, card titles
- **Example:** "Urban Lifestyle Photoshoot"

#### Body Large
- **Size:** 18px (1.125rem)
- **Weight:** 400 (Regular)
- **Line Height:** 1.6
- **Usage:** Lead paragraphs, important descriptions
- **Max Width:** 65 characters for readability

#### Body Regular
- **Size:** 16px (1rem)
- **Weight:** 400 (Regular)
- **Line Height:** 1.6
- **Usage:** Primary body text, descriptions, form labels
- **Max Width:** 75 characters for readability

#### Body Small
- **Size:** 14px (0.875rem)
- **Weight:** 400 (Regular)
- **Line Height:** 1.5
- **Usage:** Captions, metadata, secondary information
- **Color:** Usually Medium Grey (#6B6B6B)

#### Caption/Label
- **Size:** 12px (0.75rem)
- **Weight:** 600 (Semibold)
- **Line Height:** 1.4
- **Letter Spacing:** 0.05em
- **Text Transform:** UPPERCASE
- **Usage:** Labels, tags, category names
- **Example:** "PREMIUM" badges, "5 IMAGES" indicators

### Typography Rules

**DO:**
- Use a clear hierarchy with size, weight, and color
- Maintain consistent line heights within sections
- Limit line length to 75 characters for body text
- Use semibold (600) for emphasis, not just bold
- Add breathing room above headers (margin-top)

**DON'T:**
- Use more than 3 font weights on a single page
- Set body text larger than 18px or smaller than 14px
- Use all caps for body text or long phrases
- Place large blocks of centered text (hard to read)

---

## Spacing & Layout

### Spacing Scale (8px Base Unit)

```
4px   (0.25rem)  - xs  - Minimal gaps, icon padding
8px   (0.5rem)   - sm  - Tight spacing, badges
12px  (0.75rem)  - md  - Small component padding
16px  (1rem)     - lg  - Standard spacing unit
24px  (1.5rem)   - xl  - Component gaps, margins
32px  (2rem)     - 2xl - Section padding
48px  (3rem)     - 3xl - Section margins
64px  (4rem)     - 4xl - Major section gaps
96px  (6rem)     - 5xl - Hero padding
128px (8rem)     - 6xl - Large vertical spacing
```

### Grid System

#### Desktop (1200px+ container)
- **Columns:** 12
- **Gutter:** 24px
- **Max Width:** 1400px
- **Padding:** 48px sides

#### Tablet (768px-1199px)
- **Columns:** 8
- **Gutter:** 16px
- **Padding:** 32px sides

#### Mobile (320px-767px)
- **Columns:** 4
- **Gutter:** 16px
- **Padding:** 16px sides

### Layout Patterns

#### Content Containers
```css
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 48px;
}

.narrow-container {
  max-width: 800px;
  margin: 0 auto;
}

.text-container {
  max-width: 65ch; /* Optimal reading width */
}
```

#### Card Layouts
- **Minimum Card Width:** 280px
- **Card Padding:** 24px
- **Card Gap:** 24px (desktop), 16px (mobile)
- **Border Radius:** 8px-12px
- **Shadow:** 0 2px 8px rgba(0,0,0,0.08)

---

## Components

### Buttons

#### Primary Button (Gold)
```css
Background: #D4AF37
Text: #1A1A1D
Font: 16px, Semibold (600)
Padding: 12px 24px
Border Radius: 8px
Hover: opacity 0.9
```
**Usage:** Main CTAs, "Try Free Photoshoot"

#### Secondary Button (Coral)
```css
Background: #FF6B6B
Text: #FFFFFF
Font: 16px, Semibold (600)
Padding: 12px 24px
Border Radius: 8px
Hover: opacity 0.9
```
**Usage:** Purchase actions, "Buy Photoshoot"

#### Tertiary Button (Blue)
```css
Background: #4A90E2
Text: #FFFFFF
Font: 16px, Semibold (600)
Padding: 12px 24px
Border Radius: 8px
Hover: opacity 0.9
```
**Usage:** Secondary actions, "View Gallery", "Learn More"

#### Outline Button
```css
Background: transparent
Border: 2px solid #1A1A1D
Text: #1A1A1D
Font: 16px, Semibold (600)
Padding: 10px 22px (adjusted for border)
Border Radius: 8px
Hover: opacity 0.7
```
**Usage:** Secondary actions, "Cancel", "Back"

#### Button with Icon
```css
Same as above with:
Gap: 8px between icon and text
Icon Size: 20px
Icon Position: Left of text (usually)
```

#### Button States
- **Normal:** Full opacity, defined colors
- **Hover:** 90% opacity or subtle scale (1.02)
- **Active/Pressed:** 95% opacity, slight scale down (0.98)
- **Disabled:** Background #6B6B6B, Text #E8E8E8, cursor not-allowed
- **Loading:** Show spinner, disable pointer events

### Cards

#### Basic Card
```css
Background: #FFFFFF
Border Radius: 12px
Padding: 24px
Shadow: 0 2px 8px rgba(0,0,0,0.08)
Hover Shadow: 0 4px 16px rgba(0,0,0,0.12)
Transition: all 0.3s ease
```

#### Photoshoot Selection Card
- **Image Section:** 200px height, Soft Cream background
- **Content Section:** 24px padding
- **Badge:** Top-right corner, Gold background for premium
- **Price:** Bold, 20px, bottom-left
- **CTA Button:** Bottom-right, full-width on mobile

#### Feature Card
- **Icon Circle:** 48px diameter, Soft Cream background
- **Icon Size:** 24px, Gold or Charcoal color
- **Title:** Heading 3 size
- **Description:** Body Small, Medium Grey

#### Image Gallery Card
- **Grid:** 5 images in a row (or responsive)
- **Aspect Ratio:** 1:1 (square)
- **Gap:** 0 (touching edges for cohesion)
- **Download Button:** Full-width at bottom

### Form Elements

#### Text Input
```css
Background: #FFFFFF
Border: 2px solid #E8E8E8
Border Radius: 8px
Padding: 12px 16px
Font: 16px, Regular
Placeholder: #6B6B6B
Focus Border: #4A90E2
```

#### Select Dropdown
```css
Same as text input with:
Chevron icon on right
Padding-right: 40px (for icon space)
```

#### Textarea
```css
Same as text input with:
Min Height: 120px
Resize: vertical
```

#### Checkbox/Radio
```css
Size: 20px
Accent Color: #D4AF37
Border Radius: 4px (checkbox), 50% (radio)
```

#### Search Input
```css
Same as text input with:
Search icon or chevron on right
Padding-right: 48px
Clear button on focus (if has value)
```

### Navigation

#### Top Navigation Bar
```css
Background: #1A1A1D
Height: 72px
Padding: 0 48px
Logo: Left-aligned
Nav Links: Right-aligned, #F5F3EF, 16px
CTA Button: Gold, rightmost
```

#### Navigation Links
```css
Color: #F5F3EF
Hover: #D4AF37
Active: #D4AF37, underline
Font: 16px, Medium (500)
Spacing: 32px apart
```

### Badges & Tags

#### Premium Badge
```css
Background: #D4AF37
Text: #1A1A1D
Padding: 4px 12px
Border Radius: 20px (pill)
Font: 12px, Semibold, UPPERCASE
```

#### Status Badge
```css
Success: #8B9D83 background
Warning: #FF6B6B background
Info: #4A90E2 background
Text: #FFFFFF
Padding: 4px 12px
Border Radius: 20px
Font: 12px, Semibold
```

### Icons

#### Standard Sizes
- **Small:** 16px (inline with text)
- **Medium:** 24px (buttons, cards)
- **Large:** 32px (feature highlights)
- **XL:** 48px+ (empty states, placeholders)

#### Colors
- **Default:** #1A1A1D (on light) or #F5F3EF (on dark)
- **Accent:** #D4AF37 (premium features)
- **Interactive:** #4A90E2 (clickable icons)
- **Muted:** #6B6B6B (decorative, non-interactive)

### Loading States

#### Spinner
```css
Size: 24px (inline), 48px (full-page)
Color: #D4AF37 or #4A90E2
Border Width: 3px
Animation: Spin 1s linear infinite
```

#### Skeleton Screens
```css
Background: Linear gradient shimmer
Base Color: #E8E8E8
Highlight: #F5F3EF
Animation: Shimmer 1.5s infinite
```

### Notifications/Toasts

#### Success Toast
```css
Background: #8B9D83
Text: #FFFFFF
Icon: Check, #FFFFFF
Duration: 4 seconds
Position: Top-right
```

#### Error Toast
```css
Background: #FF6B6B
Text: #FFFFFF
Icon: X, #FFFFFF
Duration: 6 seconds
Position: Top-right
```

#### Info Toast
```css
Background: #4A90E2
Text: #FFFFFF
Icon: Info, #FFFFFF
Duration: 5 seconds
Position: Top-right
```

---

## Interaction Patterns

### Hover Effects

#### Buttons
- Opacity: 0.9
- Transition: 0.2s ease
- Optional: slight scale (1.02)

#### Cards
- Shadow increase: from 8px to 16px blur
- Slight lift: translateY(-2px)
- Transition: 0.3s ease

#### Links
- Color change: from #F5F3EF to #D4AF37
- Optional: underline on hover
- Transition: 0.2s ease

### Focus States

#### Interactive Elements
```css
Outline: 2px solid #4A90E2
Outline Offset: 2px
Border Radius: Inherit from element
```

### Click/Active States

#### Buttons
- Scale: 0.98
- Opacity: 0.95
- Duration: 0.1s

### Transitions

#### Standard
```css
transition: all 0.3s ease;
```

#### Fast
```css
transition: all 0.15s ease;
```

#### Slow
```css
transition: all 0.5s ease;
```

### Animations

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
animation: fadeIn 0.5s ease;
```

#### Slide Up
```css
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
animation: slideUp 0.5s ease;
```

---

## Accessibility Guidelines

### Color Contrast

#### Minimum Requirements (WCAG AA)
- Normal text: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

#### Compliant Combinations
✅ Deep Charcoal (#1A1A1D) + Soft Cream (#F5F3EF)
✅ Deep Charcoal (#1A1A1D) + White (#FFFFFF)
✅ Accent Gold (#D4AF37) + Deep Charcoal (#1A1A1D)
✅ Cinematic Blue (#4A90E2) + White (#FFFFFF)
✅ Warm Coral (#FF6B6B) + White (#FFFFFF)

❌ Medium Grey (#6B6B6B) + Soft Cream (#F5F3EF) - Use for decorative only
❌ Accent Gold (#D4AF37) + Soft Cream (#F5F3EF) - Poor contrast

### Focus Indicators

**All interactive elements must have visible focus states:**
- Keyboard navigation must be fully supported
- Focus ring should be 2px, high contrast color (#4A90E2)
- Focus should never be removed with outline: none without replacement

### Screen Reader Support

#### Image Alt Text
```html
<!-- For photoshoot results -->
<img alt="Professional urban lifestyle photoshoot, subject in casual outfit on city rooftop at sunset" />

<!-- For UI icons -->
<button aria-label="Download all images">
  <DownloadIcon aria-hidden="true" />
</button>
```

#### ARIA Labels
- Use `aria-label` for icon-only buttons
- Use `aria-describedby` for additional context
- Use `role="status"` for loading states
- Use `role="alert"` for error messages

### Keyboard Navigation

**Tab Order Priority:**
1. Primary navigation
2. Main CTAs
3. Secondary actions
4. Form fields
5. Footer links

**Keyboard Shortcuts:**
- Enter/Space: Activate buttons and links
- Escape: Close modals and dropdowns
- Arrow keys: Navigate within dropdowns and galleries
- Tab: Move forward through interactive elements
- Shift+Tab: Move backward through interactive elements

---

## Voice & Tone

### Brand Voice Characteristics

#### Professional but Approachable
- Confident without being arrogant
- Expert without being condescending
- Clear without being robotic

#### Empowering & Positive
- Focus on what users CAN do
- Celebrate their creativity
- Encourage exploration

#### Clear & Concise
- Short sentences, active voice
- Avoid jargon and buzzwords
- Get to the point quickly

### Microcopy Examples

#### CTAs
✅ "Try Free Photoshoot"
✅ "Create Your First Shoot"
✅ "Get Started"
❌ "Click Here to Begin Your Journey"
❌ "Submit"

#### Error Messages
✅ "Oops! We couldn't process that. Please try again."
✅ "Image upload failed. Try a smaller file size."
❌ "Error 500: Internal Server Error"
❌ "Invalid input detected in form field."

#### Success Messages
✅ "Your photoshoot is ready! Check your gallery."
✅ "Payment successful. Enjoy your new images!"
❌ "Transaction completed successfully."
❌ "Operation finished."

#### Empty States
✅ "No photoshoots yet. Create your first one!"
✅ "Your gallery is empty. Let's fill it with stunning photos."
❌ "No data to display."
❌ "0 results found."

### Button Labels

**DO:**
- Use action verbs: "Create", "Download", "Purchase"
- Be specific: "Download All 5 Images" not just "Download"
- Keep it short: 1-3 words ideally

**DON'T:**
- Use generic labels: "Click Here", "Submit", "OK"
- Be vague: "Continue" without context
- Use technical terms: "Execute", "Initialize"

---

## Implementation Guidelines

### CSS Architecture

#### Recommended Structure
```
styles/
├── base/
│   ├── reset.css
│   ├── typography.css
│   └── colors.css
├── components/
│   ├── buttons.css
│   ├── cards.css
│   ├── forms.css
│   └── navigation.css
├── layouts/
│   ├── grid.css
│   └── containers.css
└── utilities/
    ├── spacing.css
    └── helpers.css
```

#### Naming Convention (BEM)
```css
/* Block */
.card { }

/* Element */
.card__title { }
.card__image { }
.card__cta { }

/* Modifier */
.card--premium { }
.card--featured { }
.button--primary { }
.button--outline { }
```

### Responsive Breakpoints

```css
/* Mobile First Approach */

/* Small devices (phones) */
@media (min-width: 640px) { }

/* Medium devices (tablets) */
@media (min-width: 768px) { }

/* Large devices (laptops) */
@media (min-width: 1024px) { }

/* Extra large devices (desktops) */
@media (min-width: 1280px) { }

/* XXL devices (large desktops) */
@media (min-width: 1536px) { }
```

### Component Implementation Order

1. **Start with mobile layout** (mobile-first)
2. **Add desktop enhancements** progressively
3. **Test keyboard navigation** at each step
4. **Verify color contrast** for all states
5. **Add animations last** (progressive enhancement)

### Performance Considerations

#### Image Optimization
- Use WebP format with JPEG fallback
- Implement lazy loading for gallery images
- Provide multiple sizes for responsive images
- Compress images to < 200KB when possible

#### CSS Optimization
- Minimize custom CSS by using utility classes
- Remove unused styles in production
- Use CSS containment for independent components
- Defer non-critical CSS

#### Font Loading
```css
/* Preload critical fonts */
<link rel="preload" href="fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>

/* Use font-display for better performance */
@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url('fonts/inter-var.woff2') format('woff2');
}
```

---

## Quick Reference for AI Assistants

### When Building Interfaces

**Color Decisions:**
- Dark hero sections → Deep Charcoal background (#1A1A1D)
- Light content areas → Soft Cream background (#F5F3EF)
- Primary CTA → Gold button (#D4AF37)
- Purchase CTA → Coral button (#FF6B6B)
- Secondary actions → Blue button (#4A90E2)

**Spacing:**
- Use 8px base unit (multiples of 8)
- Component padding: 24px
- Section gaps: 48px-64px
- Card gaps: 24px

**Typography:**
- Headlines: 48px-60px, Bold
- Subheadings: 24px-36px, Semibold
- Body: 16px, Regular
- Labels: 12px, Semibold, UPPERCASE

**Components:**
- Buttons: 12px padding top/bottom, 24px left/right
- Border radius: 8px-12px for most elements
- Cards: 12px border radius, subtle shadow
- Forms: 2px borders, 8px border radius

**Always Include:**
- Hover states for interactive elements
- Focus indicators for keyboard navigation
- Alt text for images
- Loading states for async actions
- Error handling with clear messages

### Common Patterns

**Hero Section:**
```
Background: #1A1A1D
Headline: 60px, Bold, #F5F3EF
Subheadline: 18px, Regular, #F5F3EF at 70% opacity
CTA: Gold button (#D4AF37)
Padding: 96px vertical
```

**Card Grid:**
```
Container: Max-width 1400px
Grid: 3 columns desktop, 1 column mobile
Gap: 24px
Cards: White background, 12px radius, subtle shadow
```

**Form:**
```
Max-width: 600px
Labels: 14px, Semibold, #1A1A1D
Inputs: 16px text, 2px #E8E8E8 border
Focus: #4A90E2 border
Submit: Gold button, full-width on mobile
```

---

## Version History

**v1.0** - January 2026
- Initial UI kit release
- Complete color system
- Typography scale
- Component library
- Accessibility guidelines

---

## Support & Questions

For questions about implementation or clarification on design decisions:
- Reference this documentation first
- Check the interactive UI kit component
- Consult the press kit for brand messaging
- Contact design team for edge cases

**Remember:** When in doubt, prioritize accessibility and user experience over aesthetics.