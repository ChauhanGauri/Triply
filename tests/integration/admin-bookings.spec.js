// tests/integration/admin-bookings.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Admin Bookings Management', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/admin/login');
    await page.fill('input[name="email"]', 'admin@transport.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.press('input[name="password"]', 'Enter');
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
  });

  test('should display bookings page', async ({ page }) => {
    await page.goto('/admin/bookings');
    
    // Check if bookings page loaded
    await expect(page).toHaveURL(/.*\/admin\/bookings/);
    
    // Check for heading
    const heading = page.locator('h1, h2').filter({ hasText: /booking/i });
    await expect(heading.first()).toBeVisible();
  });

  test('should display bookings list', async ({ page }) => {
    await page.goto('/admin/bookings');
    
    // Check if table or list exists
    const tableOrList = page.locator('table, .booking-list, .bookings-container');
    const exists = await tableOrList.count() > 0;
    expect(exists).toBeTruthy();
  });

});
