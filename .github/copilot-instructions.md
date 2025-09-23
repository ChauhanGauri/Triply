# Public Transport Management Backend - AI Coding Instructions

## Architecture Overview

This is a **dual-purpose Node.js/Express application** serving both REST APIs and server-rendered web interfaces using EJS. The system manages public transport routes, schedules, users, and bookings with role-based access (admin/user).

### Key Architectural Patterns

**Hybrid Response Pattern**: Controllers detect request type via `Accept` headers and respond accordingly:
```javascript
// API request: returns JSON
if (req.headers.accept && req.headers.accept.includes('application/json')) {
    res.status(201).json({ message: "Route created successfully", data: newRoute });
} else {
    // Web request: redirects to dashboard
    res.redirect('/admin/routes');
}
```

**Session-Based Authentication**: Uses `express-session` with MongoDB storage (not JWT):
- Sessions stored in `req.session.user` with `{id, role, name, email}`
- Role-based routing: admins → `/admin/*`, users → `/user/:id/*`
- Authentication middleware redirects based on path prefix

## Data Models & Relationships

**Core Entities** (src/models/):
- `User`: Has role enum `['user', 'admin']`, bcrypt password hashing, excludes password from JSON
- `Route`: Contains `routeNumber` (unique), origin/destination, fare, embedded `schedule` object
- `Schedule`: References Route, has `departureTime`/`arrivalTime` as strings, not dates
- `Booking`: References User and Schedule, tracks seat count and status

**Important**: Schedule times are stored as strings, not Date objects. Routes have embedded schedule objects AND separate Schedule documents.

## Development Conventions

### Controller Patterns
- **Class-based controllers** with descriptive method names
- **Dual response handling** for API/web requests in same methods
- **Comprehensive logging** with console.log for debugging auth flows
- **Error handling** returns appropriate status codes and redirects with query params

### Route Structure
```
/auth/*          - Authentication (login/logout/register)
/api/*           - REST API endpoints  
/admin/*         - Admin dashboard (protected)
/user/:id/*      - User dashboard (protected)
```

### Authentication Flow
1. Login forms POST to `/auth/admin/login` or `/auth/user/login`
2. Successful auth stores user in session and redirects to role-specific dashboard
3. `isAuthenticated`, `isAdmin`, `isUser` middleware protects routes
4. Default admin creation available at `/auth/create-admin` (development)

## Critical Developer Workflows

### Development Setup
```bash
npm install
# Create .env with MONGO_URI and SESSION_SECRET
npm run dev  # Uses nodemon for auto-reload
```

### Database Operations
- **No migrations**: Mongoose schemas with timestamps automatically
- **Password hashing**: Automatic via User model pre-save hook (bcrypt, salt rounds: 12)
- **Validation**: Basic validators in middleware/validation.js, not express-validator integration

### View System
- **EJS templates** in `src/views/` with nested folder structure
- **Bootstrap 5** + Bootstrap Icons for styling
- **Partials**: header.ejs for common elements
- **Error handling**: Custom error.ejs template with development/production modes

## Project-Specific Gotchas

1. **Mixed API/Web Architecture**: Same endpoints serve both JSON APIs and web redirects - always check Accept headers
2. **String-based Time Handling**: Schedule times are strings, not Date objects - no timezone handling
3. **Session-based Auth**: No JWT tokens - all auth state in server sessions with MongoDB storage
4. **Route vs Schedule Confusion**: Routes have embedded schedule objects AND separate Schedule collection - understand the difference
5. **User Access Control**: Users can only access their own data (enforced by middleware checking req.params.userId)

## Integration Points

### External Dependencies
- **MongoDB**: Primary database with Mongoose ODM
- **bcryptjs**: Password hashing (12 salt rounds)
- **express-session + connect-mongo**: Session management
- **method-override**: Enables PUT/DELETE from HTML forms

### Security Considerations
- Sessions stored in MongoDB (not memory)
- Password fields excluded from JSON responses
- CSRF protection not implemented
- HTTPS not enforced (set cookie.secure in production)

## Common Patterns

### Error Responses
```javascript
// API responses use utils/apiResponses.js helpers
exports.successResponse(res, data, message);
exports.errorResponse(res, error, message);
exports.notFoundResponse(res, message);
```

### Model Extensions
```javascript
// All models use timestamps: true
// User model has password comparison and JSON transformation methods
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
```

### View Data Passing
```javascript
// Common pattern for rendering with error handling
res.render('template-name', { 
    title: 'Page Title',
    user: req.session.user,
    error: req.query.error || null
});
```

When working with this codebase, prioritize understanding the dual API/web nature and session-based authentication over modern patterns like JWT or SPA architectures.