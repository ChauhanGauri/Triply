# Triply Modern Design System

## Overview
This document outlines the modern design system applied across the Triply Transport Management System. The design features a dark aesthetic with gradient accents, modern cards, and smooth animations.

## Design Philosophy
- **Modern & Professional**: Clean, contemporary look suitable for enterprise applications
- **Dark Theme**: Reduces eye strain and provides a premium feel
- **Color-Coded Roles**: Purple gradients for users, amber gradients for admins
- **Accessibility**: High contrast, keyboard navigation, screen reader support
- **Responsive**: Mobile-first approach with fluid layouts

## Color Palette

### Primary Colors

#### User Theme (Purple)
```css
--primary-purple: #667eea;
--primary-purple-dark: #5a67d8;
--gradient-purple: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

#### Admin Theme (Amber)
```css
--primary-amber: #F59E0B;
--primary-amber-dark: #D97706;
--gradient-amber: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
```

### Dark Theme Colors
```css
--bg-dark: #1a202c;
--bg-darker: #2d3748;
--bg-darkest: #1E293B;
```

### Text Colors
```css
--text-light: #ffffff;
--text-muted: #a0aec0;
--text-dark: #1E293B;
```

### Border Colors
```css
--border-light: #4a5568;
--border-lighter: #e2e8f0;
```

## Typography

### Font Family
- Primary: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`

### Font Sizes
- Hero Title: 4rem (desktop), 2rem (mobile)
- Page Title: 2.5rem (desktop), 1.5rem (mobile)
- Section Title: 1.25rem
- Body: 1rem
- Small: 0.9rem

### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extrabold: 800

## Components

### Modern Cards
```css
.modern-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid #e2e8f0;
}

.modern-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}
```

**Usage:**
- Stat displays
- Content containers
- Information panels
- Feature highlights

### Buttons

#### Primary Button (Purple)
```css
.btn-modern-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  color: white;
}

.btn-modern-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
```

#### Admin Button (Amber)
```css
.btn-modern-amber {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  /* Same properties as primary */
}
```

#### Gradient Button
```css
.btn-modern-gradient {
  background: linear-gradient(135deg, #EC4899 0%, #F59E0B 100%);
}
```

### Stat Cards
```css
.stat-card-modern {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
}

.stat-card-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--gradient-purple); /* or --gradient-amber */
}

.stat-card-modern:hover::before {
  width: 6px;
}
```

**Features:**
- Colored left border accent
- Icon with gradient background
- Large stat number
- Descriptive label
- Hover animation

### Form Controls

#### Light Form Control (for white backgrounds)
```css
.form-control-modern {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 12px 16px;
  background: white;
}

.form-control-modern:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
```

#### Dark Form Control (for dark backgrounds)
```css
.form-control-dark {
  border-radius: 8px;
  border: 1px solid #4a5568;
  padding: 12px 16px;
  background: #1a202c;
  color: white;
}

.form-control-dark:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
```

### Headers

#### Dark Header with Gradient Overlay
```html
<div class="user-header">
  <div class="container">
    <h1 class="user-title">Dashboard Title</h1>
    <p class="text-light">Welcome message</p>
  </div>
</div>
```

**CSS:**
```css
.user-header {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  color: white;
  padding: 2rem 0;
  border-radius: 20px 0 0 0;
  position: relative;
  overflow: hidden;
}

.user-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
  animation: float 20s ease-in-out infinite;
}

.user-title {
  background: linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  position: relative;
  z-index: 1;
}
```

## Animations

### Fade In Up
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Usage:** Page load animations, modal appearances

### Slide In
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

**Usage:** Sidebar animations, list item appearances

### Float
```css
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}
```

**Usage:** Hero icons, decorative elements

### Gradient Shift
```css
@keyframes gradientShift {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
```

**Usage:** Background animations, subtle movement

## Page Layouts

### Home Page
- Full-screen hero section with gradient background
- Centered content card with glassmorphism effect
- Split login cards (admin/user)
- Features section at bottom

### Dashboard Layout
- Dark header with gradient title
- White/light content container
- Grid of stat cards
- Table sections with modern styling

### Login Pages
- Split-screen layout
- Left panel: Gradient background with imagery
- Right panel: Dark form container (#2d3748)
- Modern form controls with validation

## Implementation Guidelines

### Including the Theme
Add to all pages:
```html
<link rel="stylesheet" href="/css/modern-theme.css">
```

### Using Gradients

#### Purple (User)
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

#### Amber (Admin)
```css
background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
```

#### Pink (Accent)
```css
background: linear-gradient(135deg, #EC4899 0%, #F59E0B 100%);
```

### Text Gradients
```css
.text-gradient-purple {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Shadow Levels
```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
--shadow-md: 0 4px 15px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.15);
```

### Border Radius Standards
- Small elements (buttons, inputs): 8px
- Cards: 16px
- Large containers: 20px
- Extra large (hero sections): 24px-32px

## Responsive Breakpoints

### Mobile (< 480px)
- Reduce font sizes by 25-30%
- Stack horizontal layouts vertically
- Reduce padding/margins
- Full-width cards

### Tablet (480px - 768px)
- Reduce font sizes by 15-20%
- Two-column layouts where appropriate
- Moderate padding adjustments

### Desktop (> 768px)
- Full design system
- Multi-column layouts
- Maximum visual effects

## Accessibility

### Keyboard Navigation
- All interactive elements focusable
- Visible focus indicators
- Tab order follows visual flow

### Color Contrast
- Text on dark backgrounds: #FFFFFF or #E2E8F0
- Text on light backgrounds: #1E293B or #475569
- Minimum contrast ratio: 4.5:1

### Screen Readers
- Proper ARIA labels
- Semantic HTML structure
- Descriptive alt text

## Future Enhancements

1. **Dark Mode Toggle**: User preference for light/dark themes
2. **Custom Themes**: Allow customization of primary colors
3. **Motion Reduction**: Respect `prefers-reduced-motion`
4. **High Contrast Mode**: Enhanced accessibility option
5. **Print Styles**: Optimized printing layouts

## File Structure

```
public/css/
├── modern-theme.css       # Main theme file
├── dashboard.css          # Dashboard-specific styles
└── [other page-specific CSS files]
```

## Maintenance

### Adding New Components
1. Follow existing naming conventions
2. Use CSS variables for colors
3. Include hover states
4. Add responsive breakpoints
5. Test accessibility

### Modifying Colors
1. Update CSS variables in `:root`
2. Test all components
3. Verify contrast ratios
4. Update documentation

## Examples

### Creating a New Stat Card
```html
<div class="stat-card-modern purple">
  <div class="stat-icon-modern purple">
    <i class="bi bi-ticket-perforated"></i>
  </div>
  <div class="stat-value">125</div>
  <div class="stat-label">Total Bookings</div>
</div>
```

### Creating a Modern Button
```html
<a href="/bookings" class="btn-modern-primary">
  <i class="bi bi-plus-circle"></i>
  New Booking
</a>
```

### Creating a Section Card
```html
<div class="section-card">
  <h3 class="section-title">
    <i class="bi bi-clock-history"></i>
    Recent Activity
  </h3>
  <!-- Content here -->
</div>
```

## Support

For questions or issues with the design system:
1. Check this documentation
2. Review `/public/css/modern-theme.css`
3. Examine existing implementations in views
4. Contact the development team

---

**Last Updated:** 2024
**Version:** 1.0.0
**Maintainer:** Development Team
