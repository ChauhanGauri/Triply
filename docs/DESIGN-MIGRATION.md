# Design Migration Guide

## Overview
This guide provides step-by-step instructions for migrating remaining pages to the new modern design system.

## Completed Pages ✅

1. **Authentication**
   - ✅ `/auth/user/login` - User login page
   - ✅ `/auth/admin/login` - Admin login page

2. **Landing**
   - ✅ `/` - Home page with modern hero section

3. **Dashboards**
   - ✅ `/user/dashboard` - User dashboard
   - ✅ `/admin/dashboard` - Admin dashboard

## Pending Pages 🔄

### High Priority

#### 1. Booking Pages
- [ ] `/user/browse-routes` - Route browsing
- [ ] `/user/booking-form` - Booking creation
- [ ] `/user/booking-details` - Booking details view
- [ ] `/user/bookings` - User bookings list

#### 2. Admin Management Pages
- [ ] `/admin/routes` - Route management
- [ ] `/admin/schedules` - Schedule management
- [ ] `/admin/bookings` - Booking management
- [ ] `/admin/users` - User management

#### 3. Forms
- [ ] `/admin/route-form` - Route creation/edit
- [ ] `/admin/schedule-form` - Schedule creation/edit
- [ ] `/admin/user-form` - User creation/edit

### Medium Priority

#### 4. User Profile & Settings
- [ ] `/user/profile` - Profile page
- [ ] `/user/edit-profile` - Profile editing

#### 5. Admin Manifest Pages
- [ ] `/admin/manifests` - Passenger manifests list
- [ ] `/admin/passenger-manifest` - Manifest details

#### 6. Payment & Success Pages
- [ ] `/user/payment` - Payment page
- [ ] `/user/booking-success` - Success confirmation

### Low Priority

#### 7. Error Pages
- [ ] `error.ejs` - Error page template

## Migration Steps for Each Page

### Step 1: Add Theme Stylesheet
Add after existing Bootstrap CSS:
```html
<link rel="stylesheet" href="/css/modern-theme.css">
```

### Step 2: Update Body Background
Replace:
```css
body {
  background: #1E293B; /* or any solid color */
}
```

With:
```css
body {
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  min-height: 100vh;
}
```

### Step 3: Update Main Container
For dashboard-style pages:
```css
.dashboard-container {
  background: rgba(255, 255, 255, 0.95);
  min-height: 100vh;
  border-radius: 20px 0 0 20px;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
}
```

### Step 4: Update Headers
Replace existing headers with:
```html
<div class="user-header"> <!-- or dashboard-header for admin -->
  <div class="container">
    <h1 class="user-title">Page Title</h1>
    <p class="text-light">Description</p>
  </div>
</div>
```

Add CSS:
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

For admin pages, use amber accent:
```css
background: radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%);
```

### Step 5: Update Buttons

#### Replace User Buttons
Old:
```html
<button class="btn btn-primary">Action</button>
```

New:
```html
<button class="btn-modern-primary">
  <i class="bi bi-icon-name"></i>
  Action
</button>
```

#### Replace Admin Buttons
```html
<button class="btn-modern-amber">
  <i class="bi bi-icon-name"></i>
  Action
</button>
```

### Step 6: Update Cards
Replace:
```html
<div class="card">
  <div class="card-body">
    Content
  </div>
</div>
```

With:
```html
<div class="modern-card">
  Content
</div>
```

### Step 7: Update Stat Cards
Replace stat displays with:
```html
<div class="stat-card-modern purple"> <!-- or amber for admin -->
  <div class="stat-icon-modern purple">
    <i class="bi bi-icon-name"></i>
  </div>
  <div class="stat-value">123</div>
  <div class="stat-label">Label</div>
</div>
```

### Step 8: Update Forms

#### Replace Form Inputs (Light Background)
```html
<input type="text" class="form-control-modern" placeholder="Enter text">
```

#### Dark Background Forms
```html
<input type="text" class="form-control-dark" placeholder="Enter text">
```

### Step 9: Update Tables
Add gradient to table headers:
```css
.table thead th {
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  border-bottom: 2px solid #E2E8F0;
  color: #1E293B;
  font-weight: 600;
  padding: 1rem;
}
```

Update hover effect:
```css
.table-hover tbody tr:hover {
  background-color: rgba(102, 126, 234, 0.05); /* purple for user */
  /* OR */
  background-color: rgba(245, 158, 11, 0.05); /* amber for admin */
}
```

### Step 10: Add Animations
Add entrance animation to main content:
```css
.dashboard-container {
  animation: slideIn 0.8s ease-out;
}

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

## Page-Specific Migration Details

### Booking Form (`booking-form.ejs`)

1. **Update Route Cards**
   ```html
   <div class="modern-card">
     <div class="d-flex justify-content-between align-items-center">
       <div>
         <h5>Route Name</h5>
         <p class="text-muted">Details</p>
       </div>
       <button class="btn-modern-primary">Select</button>
     </div>
   </div>
   ```

2. **Update Seat Selection**
   - Use modern-card for seat grid container
   - Apply purple gradient for selected seats
   - Add smooth hover transitions

3. **Update Form Controls**
   - Use `form-control-modern` for all inputs
   - Add validation styling with purple accents

### Route Management (`admin/routes.ejs`)

1. **Update Action Buttons**
   ```html
   <a href="/admin/routes/new" class="btn-modern-amber">
     <i class="bi bi-plus-circle"></i>
     Add Route
   </a>
   ```

2. **Update Route Cards**
   - Use stat-card-modern with amber accent
   - Display route statistics
   - Add hover animations

3. **Update Table**
   - Add amber gradient to headers
   - Amber hover effect on rows

### Schedule Management (`admin/schedules.ejs`)

1. **Calendar View**
   - Dark background for calendar
   - Amber highlights for selected dates
   - Modern card for schedule details

2. **Time Slots**
   - Grid layout with modern-card
   - Amber gradient for active slots
   - Disabled state styling

### User Profile (`user/profile.ejs`)

1. **Profile Header**
   - Purple gradient background
   - User avatar with border
   - Stats in modern-card layout

2. **Information Sections**
   - Use section-card for grouping
   - Purple accent borders
   - Edit buttons with purple theme

## Color Guidelines by Page Type

### User Pages
- **Primary Gradient:** `#667eea → #764ba2` (Purple)
- **Accent Color:** `#667eea`
- **Hover Glow:** `rgba(102, 126, 234, 0.4)`

### Admin Pages
- **Primary Gradient:** `#F59E0B → #D97706` (Amber)
- **Accent Color:** `#F59E0B`
- **Hover Glow:** `rgba(245, 158, 11, 0.4)`

### Neutral Elements
- **Background:** `#1a202c → #2d3748` gradient
- **Cards:** White with subtle shadow
- **Text:** `#1E293B` on light, `#FFFFFF` on dark

## Testing Checklist

After migrating each page:

- [ ] **Visual Consistency**
  - Colors match design system
  - Spacing is consistent
  - Typography matches standards

- [ ] **Responsiveness**
  - Test on mobile (< 480px)
  - Test on tablet (480-768px)
  - Test on desktop (> 768px)

- [ ] **Interactions**
  - Buttons have hover states
  - Cards have hover animations
  - Forms have focus states

- [ ] **Accessibility**
  - Sufficient color contrast
  - Keyboard navigation works
  - Screen reader compatible

- [ ] **Performance**
  - No animation jank
  - Fast load times
  - Smooth scrolling

## Common Patterns

### Pattern 1: List View with Cards
```html
<div class="container py-4">
  <div class="row g-3">
    <div class="col-md-6 col-lg-4">
      <div class="modern-card">
        <h5>Item Title</h5>
        <p class="text-muted">Description</p>
        <button class="btn-modern-primary">Action</button>
      </div>
    </div>
    <!-- Repeat -->
  </div>
</div>
```

### Pattern 2: Detail View
```html
<div class="container py-4">
  <div class="section-card">
    <h3 class="section-title">
      <i class="bi bi-icon"></i>
      Section Name
    </h3>
    <div class="row">
      <div class="col-md-6">
        <p><strong>Label:</strong> Value</p>
      </div>
      <!-- More fields -->
    </div>
  </div>
</div>
```

### Pattern 3: Form Layout
```html
<div class="container py-4">
  <div class="section-card">
    <h3 class="section-title">Form Title</h3>
    <form>
      <div class="mb-3">
        <label class="form-label">Field Label</label>
        <input type="text" class="form-control-modern">
      </div>
      <div class="d-flex gap-2">
        <button type="submit" class="btn-modern-primary">Submit</button>
        <button type="button" class="btn-outline-custom">Cancel</button>
      </div>
    </form>
  </div>
</div>
```

### Pattern 4: Stats Dashboard
```html
<div class="row g-3 mb-4">
  <div class="col-md-6 col-lg-3">
    <div class="stat-card-modern purple">
      <div class="stat-icon-modern purple">
        <i class="bi bi-graph-up"></i>
      </div>
      <div class="stat-value">1,234</div>
      <div class="stat-label">Total Count</div>
    </div>
  </div>
  <!-- Repeat for other stats -->
</div>
```

## Quick Reference

### CSS Classes to Replace

| Old Class | New Class | Usage |
|-----------|-----------|-------|
| `btn-primary` | `btn-modern-primary` | User actions |
| `btn-warning` | `btn-modern-amber` | Admin actions |
| `card` | `modern-card` | Content containers |
| `form-control` | `form-control-modern` | Light backgrounds |
| N/A | `form-control-dark` | Dark backgrounds |
| Custom stat divs | `stat-card-modern` | Statistics display |
| `badge-primary` | Custom with gradient | Status badges |

### Icon Usage
Always include Bootstrap Icons:
```html
<i class="bi bi-[icon-name]"></i>
```

Common icons:
- `bi-house` - Home
- `bi-person` - User
- `bi-shield-check` - Admin
- `bi-ticket-perforated` - Booking
- `bi-calendar` - Schedule
- `bi-geo-alt` - Route
- `bi-plus-circle` - Add
- `bi-pencil` - Edit
- `bi-trash` - Delete
- `bi-eye` - View
- `bi-search` - Search

## Troubleshooting

### Issue: Colors Don't Match
**Solution:** Ensure `/css/modern-theme.css` is loaded and check CSS variable usage

### Issue: Animations Too Fast/Slow
**Solution:** Adjust transition duration in component CSS:
```css
transition: all 0.3s ease; /* Adjust 0.3s as needed */
```

### Issue: Responsive Issues
**Solution:** Check breakpoints and use Bootstrap grid classes properly

### Issue: Hover States Not Working
**Solution:** Ensure proper CSS selector specificity and check for conflicting styles

## Progress Tracking

Use this checklist to track migration progress:

### User Pages
- [x] Home page
- [x] User login
- [x] User dashboard
- [ ] Browse routes
- [ ] Booking form
- [ ] Booking details
- [ ] My bookings
- [ ] Profile
- [ ] Edit profile
- [ ] Payment
- [ ] Booking success

### Admin Pages
- [x] Admin login
- [x] Admin dashboard
- [ ] Routes management
- [ ] Schedule management
- [ ] Booking management
- [ ] User management
- [ ] Passenger manifests
- [ ] Route form
- [ ] Schedule form
- [ ] User form

### Shared Pages
- [ ] Error page
- [ ] 404 page
- [ ] Maintenance page

## Next Steps

1. **Phase 1** (Priority): Migrate booking flow pages
   - Browse routes → Booking form → Payment → Success
   
2. **Phase 2**: Migrate admin management pages
   - Routes → Schedules → Bookings → Users
   
3. **Phase 3**: Migrate remaining pages
   - Profile pages → Forms → Error pages

4. **Phase 4**: Polish and optimize
   - Performance testing
   - Cross-browser testing
   - Accessibility audit
   - User feedback

## Resources

- [Design System Documentation](./DESIGN-SYSTEM.md)
- [Frontend Improvements Guide](./FRONTEND-IMPROVEMENTS.md)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)

---

**Note:** This is a living document. Update as you complete migrations and discover new patterns or solutions.
