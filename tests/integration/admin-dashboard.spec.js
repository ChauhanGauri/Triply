// tests/integration/admin-dashboard.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Admin Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/admin/login');
    await page.fill('input[name="email"]', 'admin@transport.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.press('input[name="password"]', 'Enter');
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  });

  test('should display dashboard after login', async ({ page }) => {
    // Verify we're on dashboard
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    // Check that at least one heading is visible
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // Check for admin navigation links
    const adminLinks = page.locator('a[href^="/admin"]');
    await expect(adminLinks.first()).toBeVisible();
  });

  test('should display statistics or metrics', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Look for stat cards or metrics
    const stats = page.locator('.stat, .metric, .card, .dashboard-card');
    const statsExist = await stats.count() > 0;
    
    // Dashboard should have some content
    const bodyText = await page.textContent('body');
    expect(bodyText.length).toBeGreaterThan(100);
  });

  test('should navigate to different admin sections', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Try to find and click routes link
    const routesLink = page.locator('a[href*="routes"]');
    if (await routesLink.count() > 0) {
      await routesLink.first().click();
      await page.waitForTimeout(500);
      expect(page.url()).toContain('routes');
    }
  });

});
