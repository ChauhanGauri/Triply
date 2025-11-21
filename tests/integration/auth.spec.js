// tests/integration/auth.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Authentication Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/auth/admin/login');
    
    // Check if login form exists
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/auth/admin/login');
    
    // Fill in invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for error message or redirect
    await page.waitForTimeout(1000);
    
    // Check if still on login page or error message shown
    const url = page.url();
    expect(url).toContain('/auth/admin/login');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/auth/admin/login');
    
    // Fill in admin credentials (default seeded admin)
    await page.fill('input[name="email"]', 'admin@transport.com');
    await page.fill('input[name="password"]', 'admin123');
    
    // Submit form by pressing Enter to avoid button manipulation
    await page.press('input[name="password"]', 'Enter');
    
    // Wait for dashboard to load
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    
    // Verify we're on the dashboard
    expect(page.url()).toContain('/admin/dashboard');
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route without login
    await page.goto('/admin/dashboard');
    
    // Should redirect to login page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/auth/admin/login');
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/auth/admin/login');
    await page.fill('input[name="email"]', 'admin@transport.com');
    await page.fill('input[name="password"]', 'admin123');
    
    // Submit form by pressing Enter
    await page.press('input[name="password"]', 'Enter');
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    
    // Find and click logout button/link
    const logoutButton = page.locator('a[href*="logout"], button:has-text("Logout"), a:has-text("Logout")');
    if (await logoutButton.count() > 0) {
      await logoutButton.first().click();
      await page.waitForTimeout(1000);
      
      // Should redirect to login or home
      const url = page.url();
      expect(url).toMatch(/\/(admin\/login|login|$)/);
    }
  });

});
