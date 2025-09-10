import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { ContactPage } from '../pages/contact-page';
import { ServicesPage } from '../pages/services-page';
import { AboutPage } from '../pages/about-page';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Navigation Tests', () => {
  test('should navigate to all main pages successfully', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Start from home page
    await homePage.goto();
    await homePage.checkCommonElements();
    
    // Test navigation to main pages
    const pages = [
      { name: 'Contact', url: '/contact', pageClass: ContactPage },
      { name: 'Services', url: '/services', pageClass: ServicesPage },
      { name: 'About', url: '/about', pageClass: AboutPage }
    ];
    
    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await TestHelpers.waitForPageLoad(page);
      
      const pageInstance = new pageInfo.pageClass(page);
      await pageInstance.checkCommonElements();
      
      // Check page title is appropriate
      const title = await page.title();
      expect(title).toContain('Somerset Window Cleaning');
    }
  });

  test('should have working navigation menu', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Check navigation exists and is functional
    await homePage.checkNavigation();
    
    // Try clicking navigation links
    const navLinks = page.locator('nav a, header a').filter({ hasText: /^(Home|Services|About|Contact)$/i });
    const linkCount = await navLinks.count();
    
    if (linkCount > 0) {
      // Test first few navigation links
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');
        
        if (href && href.startsWith('/')) {
          await link.click();
          await TestHelpers.waitForPageLoad(page);
          
          // Check we navigated successfully
          expect(page.url()).toContain(href);
          
          // Go back to home for next test
          await homePage.goto();
        }
      }
    }
  });

  test('should have working logo link', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Find and click logo
    const logo = page.locator('[data-testid="logo"], .logo, img[alt*="logo"], a:has(img)').first();
    
    if (await logo.isVisible()) {
      await logo.click();
      await TestHelpers.waitForPageLoad(page);
      
      // Should be back on home page
      expect(page.url()).toBe('http://localhost:4321/');
    }
  });

  test('should show mobile menu on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await homePage.checkMobileMenu();
  });

  test('should handle 404 page gracefully', async ({ page }) => {
    // Go to non-existent page
    const response = await page.goto('/non-existent-page');
    
    // Should get 404 response
    expect(response?.status()).toBe(404);
    
    // Should still have proper page structure
    await expect(page.locator('body')).toBeVisible();
    
    // Check for 404 content or redirect to home
    const currentUrl = page.url();
    if (currentUrl.includes('404')) {
      await expect(page.locator('h1, .error-title')).toBeVisible();
    }
  });

  test('should have no console errors on main pages', async ({ page }) => {
    const pages = ['/', '/contact', '/services', '/about'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await TestHelpers.waitForPageLoad(page);
      await TestHelpers.checkNoConsoleErrors(page);
    }
  });

  test('should have proper meta tags on all pages', async ({ page }) => {
    const pages = ['/', '/contact', '/services', '/about'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await TestHelpers.waitForPageLoad(page);
      await TestHelpers.checkMetaTags(page);
    }
  });

  test('should have working back/forward navigation', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Navigate to contact page
    await page.goto('/contact');
    await TestHelpers.waitForPageLoad(page);
    
    // Go back
    await page.goBack();
    await TestHelpers.waitForPageLoad(page);
    expect(page.url()).toBe('http://localhost:4321/');
    
    // Go forward
    await page.goForward();
    await TestHelpers.waitForPageLoad(page);
    expect(page.url()).toContain('/contact');
  });
});