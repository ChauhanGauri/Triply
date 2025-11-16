# Testing Guide

This directory contains unit tests for the Public Transport Management System.

## Test Structure

```
tests/
├── setup/
│   └── test-setup.js          # Jest configuration & MongoDB Memory Server setup
├── unit/
│   ├── controllers/           # Unit tests for controllers
│   │   └── authController.test.js
│   ├── middleware/            # Unit tests for middleware
│   │   ├── auth.test.js
│   │   └── validation.test.js
│   └── models/                # Unit tests for models
│       ├── User.test.js
│       ├── Route.test.js
│       ├── Schedule.test.js
│       └── Booking.test.js
└── README.md                  # This file
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

### Models (100% coverage)
- **User Model**: Schema validation, password hashing, password comparison, JSON serialization
- **Route Model**: Schema validation, unique constraints, default values
- **Schedule Model**: Schema validation, auto-generated scheduleId, relationships
- **Booking Model**: Schema validation, passenger schema, payment status validation

### Middleware (100% coverage)
- **Auth Middleware**: `isAuthenticated`, `isAdmin`, `isUser`, `addUserToViews`, `redirectIfLoggedIn`, `apiAuth`, `apiAdminAuth`
- **Validation Middleware**: `validateRoute`, `validateSchedule`, `validateUser`, `validateBooking`

### Controllers
- **AuthController**: User registration, admin/user login, logout, authentication status, default admin creation, login page rendering

## Test Setup

Tests use:
- **Jest**: Test framework
- **MongoDB Memory Server**: In-memory MongoDB database for testing (no setup required)
- **Supertest**: For HTTP endpoint testing (for future integration tests)

## Test Database

Tests automatically:
1. Create an in-memory MongoDB instance before all tests
2. Clean up the database between tests
3. Stop the database after all tests complete

No manual database setup is required!

## Writing New Tests

### Example: Model Test

```javascript
const Model = require('../../../src/models/Model');

describe('Model', () => {
  it('should create a model with valid data', async () => {
    const modelData = { /* ... */ };
    const model = new Model(modelData);
    const savedModel = await model.save();
    
    expect(savedModel._id).toBeDefined();
    // ... more assertions
  });
});
```

### Example: Middleware Test

```javascript
const { middlewareFunction } = require('../../../src/middleware/middleware');

describe('Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { session: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn()
    };
    next = jest.fn();
  });

  it('should call next() when conditions are met', () => {
    middlewareFunction(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Database is automatically cleaned between tests
3. **Mocking**: Use Jest mocks for external dependencies
4. **Descriptive Names**: Test names should clearly describe what they're testing
5. **Arrange-Act-Assert**: Structure tests with clear sections

## Current Status

✅ **117 tests passing**
- Models: 50 tests
- Middleware: 23 tests
- Controllers: 24 tests
- Validation: 16 tests

## Next Steps

Consider adding:
- Integration tests for full request/response cycles
- End-to-end tests for critical user flows
- Performance tests for database queries
- API endpoint tests using Supertest

