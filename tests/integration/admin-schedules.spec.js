// tests/integration/admin-schedules.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Admin Schedules Management', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/admin/login');
    await page.fill('input[name="email"]', 'admin@transport.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.press('input[name="password"]', 'Enter');
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test('should display schedules page', async ({ page }) => {
    await page.goto('/admin/schedules');
    
    // Check if schedules page loaded
    await expect(page).toHaveURL(/.*\/admin\/schedules/);
    
    // Check for heading
    const heading = page.locator('h1, h2').filter({ hasText: /schedule/i });
    await expect(heading.first()).toBeVisible();
  });

  test('should display schedules list or table', async ({ page }) => {
    await page.goto('/admin/schedules');
    
    // Check if table or list exists
    const tableOrList = page.locator('table, .schedule-list, .schedules-container');
    const exists = await tableOrList.count() > 0;
    expect(exists).toBeTruthy();
  });

  test('should navigate to add schedule page', async ({ page }) => {
    await page.goto('/admin/schedules');
    
    // Look for "Add" or "New Schedule" button
    const addButton = page.locator('a:has-text("Add"), a:has-text("New"), button:has-text("Add")');
    
    if (await addButton.count() > 0) {
      await addButton.first().click();
      await page.waitForTimeout(500);
      
      // Verify form appears
      const form = page.locator('form');
      await expect(form).toBeVisible();
    }
  });

});
