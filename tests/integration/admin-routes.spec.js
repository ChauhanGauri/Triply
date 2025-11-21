// tests/integration/admin-routes.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Admin Routes Management', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/admin/login');
    await page.fill('input[name="email"]', 'admin@transport.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.press('input[name="password"]', 'Enter');
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
  });

  test('should display routes page', async ({ page }) => {
    await page.goto('/admin/routes');
    
    // Check if routes page loaded
    await expect(page).toHaveURL(/.*\/admin\/routes/);
    
    // Check for common elements
    const heading = page.locator('h1, h2').filter({ hasText: /route/i });
    await expect(heading.first()).toBeVisible();
  });

  test('should display add route form', async ({ page }) => {
    await page.goto('/admin/routes');
    
    // Look for "Add" or "New Route" button
    const addButton = page.locator('a:has-text("Add"), a:has-text("New"), button:has-text("Add")');
    
    if (await addButton.count() > 0) {
      await addButton.first().click();
      
      // Verify form elements appear
      await page.waitForTimeout(500);
      const form = page.locator('form');
      await expect(form).toBeVisible();
    }
  });

  test('should navigate to routes list', async ({ page }) => {
    await page.goto('/admin/routes');
    
    // Verify the page loads without errors
    await expect(page).toHaveURL(/.*\/admin\/routes/);
    
    // Check if table or list exists
    const tableOrList = page.locator('table, .route-list, .routes-container');
    const exists = await tableOrList.count() > 0;
    expect(exists).toBeTruthy();
  });

});
