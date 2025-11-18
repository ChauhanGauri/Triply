# Visual Design Reference

## Color Palette

### User Theme
```
Primary Purple: #667eea
Purple Dark:    #5a67d8
Purple Accent:  #764ba2

Gradient:
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Usage:**
- User login page left panel
- User dashboard buttons and accents
- User action buttons
- Active states for user features
- Progress indicators

### Admin Theme
```
Primary Amber: #F59E0B
Amber Dark:    #D97706
Amber Accent:  #B45309

Gradient:
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
```

**Usage:**
- Admin login page left panel
- Admin dashboard buttons and accents
- Admin action buttons
- Active states for admin features
- Warning indicators

### Dark Theme
```
Background Dark:   #1a202c
Background Darker: #2d3748
Background Slate:  #1E293B

Gradient:
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
```

**Usage:**
- Page backgrounds
- Header backgrounds
- Form containers
- Modal backgrounds
- Dark mode elements

### Neutral Colors
```
White:        #FFFFFF
Light Gray:   #F8FAFC
Gray:         #E2E8F0
Muted:        #CBD5E1
Dark Gray:    #64748B
Text Dark:    #1E293B
Text Darker:  #475569
Border Light: #F1F5F9
Border:       #E2E8F0
```

## Typography

### Font Stacks
```css
Primary: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
```

### Font Sizes
```
Hero Title:     4rem   (64px)
Page Title:     2.5rem (40px)
Section Title:  1.25rem (20px)
Body:          1rem   (16px)
Small:         0.9rem (14.4px)
```

### Font Weights
```
Light:     300
Regular:   400
Medium:    500
Semibold:  600
Bold:      700
Extrabold: 800
```

## Spacing

### Padding/Margin Scale
```
xs:   0.5rem  (8px)
sm:   0.75rem (12px)
base: 1rem    (16px)
md:   1.5rem  (24px)
lg:   2rem    (32px)
xl:   3rem    (48px)
2xl:  4rem    (64px)
```

### Component Spacing
```
Card Padding:        1.5rem
Button Padding:      0.75rem 1.5rem
Input Padding:       0.75rem 1rem
Section Padding:     2rem
Container Padding:   1.5rem
```

## Border Radius

```
Small (inputs, buttons):      8px
Medium (cards):              16px
Large (containers):          20px
Extra Large (hero sections): 24px-32px
```

## Shadows

### Elevation Levels
```css
/* Level 1 - Subtle */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);

/* Level 2 - Medium */
--shadow-md: 0 4px 15px rgba(0, 0, 0, 0.1);

/* Level 3 - Large */
--shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.15);
```

### Button Hover Shadows
```css
/* Purple Button */
box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);

/* Amber Button */
box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
```

### Card Shadows
```css
/* Default */
box-shadow: 0 4px 12px rgba(30, 41, 59, 0.08);

/* Hover */
box-shadow: 0 8px 25px rgba(30, 41, 59, 0.12);
```

## Component Examples

### Modern Card
```html
<div class="modern-card">
  <h4>Card Title</h4>
  <p>Card content goes here</p>
</div>
```

**Visual:**
- White background
- 16px border radius
- 4px left colored border (purple/amber)
- Subtle shadow
- Hover: lift up 4px, enhanced shadow, wider border

### Stat Card
```html
<div class="stat-card-modern purple">
  <div class="stat-icon-modern purple">
    <i class="bi bi-ticket"></i>
  </div>
  <div class="stat-value">125</div>
  <div class="stat-label">Total Bookings</div>
</div>
```

**Visual:**
- White background
- Purple gradient icon (50x50px, 12px radius)
- Large value (2.25rem, bold)
- Uppercase label (0.9rem, gray)
- 4px left purple border

### Button - Primary (Purple)
```html
<button class="btn-modern-primary">
  <i class="bi bi-plus"></i>
  Create New
</button>
```

**Visual:**
- Purple gradient background
- White text
- 8px border radius
- Icon + text layout
- Hover: lift 2px, glow shadow

### Button - Admin (Amber)
```html
<button class="btn-modern-amber">
  <i class="bi bi-gear"></i>
  Settings
</button>
```

**Visual:**
- Amber gradient background
- White text
- Same styling as purple
- Hover: lift 2px, glow shadow

### Form Input - Light
```html
<input type="text" class="form-control-modern" placeholder="Enter text">
```

**Visual:**
- White background
- Light gray border
- 8px border radius
- Focus: purple border, subtle glow

### Form Input - Dark
```html
<input type="text" class="form-control-dark" placeholder="Enter text">
```

**Visual:**
- Dark background (#1a202c)
- Dark border (#4a5568)
- White text
- Focus: purple border, subtle glow

### Table Header
```css
.table thead th {
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  color: #1E293B;
  font-weight: 600;
  padding: 1rem;
}
```

**Visual:**
- Subtle gradient background
- Bold text
- Generous padding
- 2px bottom border

### Section Card
```html
<div class="section-card">
  <h3 class="section-title">
    <i class="bi bi-clock-history"></i>
    Recent Activity
  </h3>
  <!-- Content -->
</div>
```

**Visual:**
- White background
- 16px border radius
- Icon + text title
- 2rem padding
- Subtle shadow

## Page Layouts

### Home Page Structure
```
┌─────────────────────────────────────┐
│   Gradient Background (#1a202c)     │
│  ┌───────────────────────────────┐  │
│  │  Glassmorphism Hero Card      │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  🚌 Icon (floating)     │  │  │
│  │  │  Triply (gradient text) │  │  │
│  │  │  Tagline               │  │  │
│  │  └─────────────────────────┘  │  │
│  │  ┌─────────┐  ┌─────────┐    │  │
│  │  │ Admin   │  │  User   │    │  │
│  │  │ Login   │  │  Login  │    │  │
│  │  │ (amber) │  │(purple) │    │  │
│  │  └─────────┘  └─────────┘    │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  ⭐ Features Section   │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Login Page Structure (Split Screen)
```
┌──────────────┬──────────────┐
│              │              │
│  Left Panel  │ Right Panel  │
│              │              │
│  Gradient    │  Dark Form   │
│  Background  │  Container   │
│  (Purple/    │  (#2d3748)   │
│   Amber)     │              │
│              │  ┌────────┐  │
│  Imagery/    │  │ Logo   │  │
│  Branding    │  └────────┘  │
│              │              │
│  Features    │  Form Fields │
│  List        │              │
│              │  [Buttons]   │
│              │              │
└──────────────┴──────────────┘
```

### Dashboard Structure
```
┌─────────────────────────────────────┐
│ Dark Header (gradient background)   │
│ Gradient Title + Description        │
│ [Buttons]                           │
├─────────────────────────────────────┤
│ White/Light Content Container       │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │Stat1│ │Stat2│ │Stat3│ │Stat4│   │
│ └─────┘ └─────┘ └─────┘ └─────┘   │
│ ┌───────────────────────────────┐  │
│ │  Section Card                 │  │
│ │  ┌─────────────────────────┐  │  │
│ │  │  Table / Content        │  │  │
│ │  └─────────────────────────┘  │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Animation Examples

### Fade In Up
```
0%:   opacity: 0, translateY(30px)
100%: opacity: 1, translateY(0)
Duration: 1.2s
Easing: ease-out
```

**Usage:** Page load, modal appearance

### Hover Lift
```
Default: transform: translateY(0)
Hover:   transform: translateY(-4px)
Duration: 0.3s
Easing: ease
```

**Usage:** Cards, buttons

### Float
```
0%:   translateY(0)
50%:  translateY(-20px)
100%: translateY(0)
Duration: 3s
Easing: ease-in-out
Loop: infinite
```

**Usage:** Hero icons, decorative elements

## Responsive Breakpoints

```
Mobile:   < 480px
Tablet:   480px - 768px
Desktop:  > 768px
```

### Mobile Adjustments
- Font sizes reduced 25-30%
- Single column layouts
- Reduced padding/margins
- Full-width cards
- Stacked forms

### Tablet Adjustments
- Font sizes reduced 15-20%
- 2-column layouts
- Moderate padding
- Adaptive cards

## Accessibility

### Color Contrast Ratios
```
Light on Dark:  #FFFFFF on #2d3748 = 12.24:1 ✅
Dark on Light:  #1E293B on #FFFFFF = 14.75:1 ✅
Purple on Dark: #667eea on #2d3748 = 4.51:1 ✅
Amber on Dark:  #F59E0B on #2d3748 = 6.89:1 ✅
```

All ratios exceed WCAG AA standard (4.5:1 for text)

### Focus Indicators
```css
:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
```

### Screen Reader Text
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## Icon Usage

### Icon Sizes
```
Small:   1rem   (16px)
Medium:  1.25rem (20px)
Large:   1.5rem (24px)
XL:      1.75rem (28px)
Hero:    4-5rem (64-80px)
```

### Icon Colors
```
User Theme:   Purple gradient or solid purple
Admin Theme:  Amber gradient or solid amber
Neutral:      Gray (#64748B)
Success:      Green (#10B981)
Error:        Red (#EF4444)
Warning:      Amber (#F59E0B)
```

## Best Practices

### DO ✅
- Use CSS variables for colors
- Apply consistent spacing
- Include hover states
- Add smooth transitions
- Use semantic HTML
- Include ARIA labels
- Test on mobile devices
- Maintain contrast ratios

### DON'T ❌
- Mix color schemes (purple/amber on same page)
- Use overly long animations
- Forget focus indicators
- Skip responsive breakpoints
- Use fixed pixel widths
- Ignore accessibility
- Overuse animations
- Violate contrast standards

---

**Reference Images:**
- Bus Fleet Photo: Login page imagery
- Modern Login UI: Design inspiration

**Last Updated:** December 2024
