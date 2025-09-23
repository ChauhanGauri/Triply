# Contributing to Public Transport Management Backend

Thank you for your interest in contributing to this project! This guide will help you get started with development and contribution workflows.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone your-fork-url
   cd public-transport-management-backend
   ```

2. **Environment Setup**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your local MongoDB URI and session secret
   ```

3. **Database Setup**
   - Ensure MongoDB is running locally or use MongoDB Atlas
   - The application will create collections automatically
   - Use `node scripts/utilities/create-test-user.js` to create test data

## Code Style & Standards

### File Organization
- Controllers: Business logic in `src/controllers/`
- Models: Mongoose schemas in `src/models/`
- Routes: Express routes in `src/routes/`
- Views: EJS templates in `src/views/`
- Scripts: Utility scripts in `scripts/` (organized by category)

### Coding Conventions
- Use **camelCase** for variables and functions
- Use **PascalCase** for model names and classes
- Use **kebab-case** for file names and URLs
- Include comprehensive error handling
- Add console.log statements for debugging (with emoji prefixes like 🔐, 📊, etc.)

### Template Patterns
- **Dual Response Pattern**: Controllers should handle both API (JSON) and web (redirect) responses
- **Session-based Auth**: Always check `req.session.user` for authentication
- **Bootstrap Classes**: Use Bootstrap 5 classes for consistent styling
- **Error Handling**: Include proper error messages and status codes

## Testing Your Changes

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Key Workflows**
   - Admin login at `/auth/admin/login`
   - User registration and login
   - Booking creation workflow
   - Route and schedule management

3. **Check Console Logs**
   - Watch for authentication flows
   - Verify data population logs
   - Check for any error messages

## Database Scripts

When working with database changes:
- Debug scripts: `scripts/debug/`
- Migration scripts: `scripts/migration/`
- Utility scripts: `scripts/utilities/`

Always test scripts on development data before production use.

## Submitting Changes

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow existing code patterns
   - Add appropriate logging
   - Test thoroughly

3. **Commit with Clear Messages**
   ```bash
   git commit -m "feat: add user booking history filter"
   git commit -m "fix: resolve undefined route data issue"
   git commit -m "docs: update API documentation"
   ```

4. **Submit Pull Request**
   - Describe what the change does
   - Include any testing steps
   - Mention any breaking changes

## Common Issues & Solutions

### Port Already in Use
```bash
taskkill /f /im node.exe  # Windows
pkill -f node            # Linux/Mac
```

### Database Connection Issues
- Check MongoDB is running
- Verify MONGO_URI in .env
- Check network connectivity

### Session Issues
- Clear browser cookies
- Check SESSION_SECRET in .env
- Restart the application

### Route Data Undefined
- Check database relationships
- Run `node scripts/debug/diagnose-bookings.js`
- Verify population queries

## Architecture Notes

This is a **hybrid application** that serves both REST APIs and web pages:
- Same endpoints handle both JSON API requests and web form submissions
- Authentication is session-based (not JWT)
- Templates use EJS with Bootstrap 5
- Database uses MongoDB with Mongoose ODM

Understanding this dual nature is crucial for effective development.

## Questions?

If you have questions or need help:
1. Check existing issues and documentation
2. Look at similar implementations in the codebase
3. Run diagnostic scripts to understand data structure
4. Create an issue with your question

Thank you for contributing! 🚀