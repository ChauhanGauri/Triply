# Integration Tests

This directory contains browser-based integration tests using Playwright.

## Test Structure

- `auth.spec.js` - Authentication and login/logout tests
- `admin-dashboard.spec.js` - Admin dashboard navigation and display tests
- `admin-routes.spec.js` - Route management tests
- `admin-schedules.spec.js` - Schedule management tests
- `admin-bookings.spec.js` - Booking management tests

## Running Tests

### Run all integration tests
```bash
npm run test:integration
```

### Run tests in UI mode (interactive)
```bash
npm run test:integration:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:integration:headed
```

### Debug tests
```bash
npm run test:integration:debug
```

### View test report
```bash
npm run test:integration:report
```

## Prerequisites

1. MongoDB should be running
2. Redis should be running (optional, falls back to MongoDB sessions)
3. Admin user should be seeded (admin@transport.com / admin123)
4. Server will start automatically during tests

## Configuration

Test configuration is in `playwright.config.js` at the project root.

- Base URL: http://localhost:3000
- Browser: Chromium (can add Firefox, WebKit)
- Timeout: 30 seconds per test
- Screenshots: On failure
- Video: On failure
- Trace: On first retry

## Writing Tests

Example test structure:

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  });

  test('should do something', async ({ page }) => {
    await page.goto('/some-page');
    await expect(page.locator('h1')).toBeVisible();
  });

});
```

## Test Results

- HTML report: `playwright-report/index.html`
- Screenshots: `test-results/`
- Videos: `test-results/`
