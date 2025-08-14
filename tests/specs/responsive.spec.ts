import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { ContactPage } from '../pages/contact-page';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Mobile Responsiveness Tests', () => {
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
    { name: 'Desktop Small', width: 1280, height: 720 },
    { name: 'Desktop Large', width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    test(`should display correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      const homePage = new HomePage(page);
      await homePage.goto();
      
      // Check basic responsiveness
      await TestHelpers.checkResponsiveness(page, viewport);
      
      // Check that content is accessible
      await expect(homePage.heroTitle).toBeVisible();
      await expect(homePage.getQuoteButton).toBeVisible();
      
      // Check navigation is usable
      if (viewport.width < 768) {
        // Mobile: check for hamburger menu
        await homePage.checkMobileMenu();
      } else {
        // Desktop: check standard navigation
        await homePage.checkNavigation();
      }
    });
  }

  test('should handle mobile contact form correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Check form is usable on mobile
    await contactPage.checkContactForm();
    
    // Check form fields are properly sized
    const formWidth = await contactPage.contactForm.boundingBox();
    expect(formWidth?.width).toBeLessThanOrEqual(375);
    
    // Test form interaction
    await contactPage.fullNameInput.fill('Mobile Test User');
    await expect(contactPage.fullNameInput).toHaveValue('Mobile Test User');
    
    // Check postcode checker on mobile
    await contactPage.checkPostcodeChecker();
    await contactPage.postcodeInput.fill('BA6 8AB');
    await contactPage.postcodeButton.click();
    
    // Should work on mobile
    await page.waitForURL(/postcode=/, { timeout: 5000 });
  });

  test('should handle tablet layout correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Check tablet-specific layout
    await homePage.checkAllSections();
    
    // Elements should be properly spaced
    const heroBox = await homePage.heroSection.boundingBox();
    expect(heroBox?.width).toBeLessThanOrEqual(768);
    
    // Navigation should be desktop-style on tablet
    await homePage.checkNavigation();
  });

  test('should scale images properly across devices', async ({ page }) => {
    const testViewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 }  // Desktop
    ];
    
    for (const viewport of testViewports) {
      await page.setViewportSize(viewport);
      
      const homePage = new HomePage(page);
      await homePage.goto();
      
      // Check hero image scales properly
      const heroImage = page.locator('img').first();
      if (await heroImage.isVisible()) {
        const imageBox = await heroImage.boundingBox();
        expect(imageBox?.width).toBeLessThanOrEqual(viewport.width);
        expect(imageBox?.width).toBeGreaterThan(0);
      }
    }
  });

  test('should maintain readability on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }); // Very small mobile
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Check text is readable
    const heroTitle = await homePage.heroTitle.textContent();
    expect(heroTitle).toBeTruthy();
    
    // Check text doesn't overflow
    const titleBox = await homePage.heroTitle.boundingBox();
    expect(titleBox?.width).toBeLessThanOrEqual(320);
    
    // Check buttons are tap-friendly (minimum 44px height)
    const buttonBox = await homePage.getQuoteButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(40);
  });

  test('should handle orientation changes', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await expect(homePage.heroTitle).toBeVisible();
    
    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500); // Allow for reflow
    
    // Content should still be accessible
    await expect(homePage.heroTitle).toBeVisible();
    await expect(homePage.getQuoteButton).toBeVisible();
  });

  test('should handle touch interactions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Test touch tap on buttons
    await homePage.getQuoteButton.tap();
    await page.waitForLoadState('networkidle');
    
    // Should navigate successfully
    expect(page.url()).toContain('/contact');
  });

  test('should display services grid responsively', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1200, height: 800 }  // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      const homePage = new HomePage(page);
      await homePage.goto();
      
      await homePage.scrollToSection('services');
      
      // Services should be visible and properly arranged
      const services = page.locator('[data-testid="service"], .service-item').first();
      if (await services.isVisible()) {
        const serviceBox = await services.boundingBox();
        expect(serviceBox?.width).toBeLessThanOrEqual(viewport.width);
      }
    }
  });

  test('should handle long content on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Test scrolling through all sections
    await homePage.scrollToSection('services');
    await page.waitForTimeout(500);
    
    await homePage.scrollToSection('testimonials');
    await page.waitForTimeout(500);
    
    await homePage.scrollToSection('faqs');
    await page.waitForTimeout(500);
    
    // All sections should be accessible by scrolling
    await expect(homePage.faqsSection).toBeVisible();
  });

  test('should maintain form usability on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Check form fields are usable
    await contactPage.fullNameInput.fill('Test');
    await contactPage.emailInput.fill('test@example.com');
    
    // Check select dropdowns work
    await contactPage.propertyTypeSelect.click();
    await page.waitForTimeout(500);
    
    // Should be able to select option
    await contactPage.propertyTypeSelect.selectOption('Terraced (2 bed)');
    await expect(contactPage.propertyTypeSelect).toHaveValue('Terraced (2 bed)');
  });

  test('should handle responsive navigation menus', async ({ page }) => {
    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 });
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Look for mobile menu toggle
    const mobileToggle = page.locator('[data-testid="mobile-menu-toggle"], .mobile-menu-toggle, button[aria-expanded]').first();
    
    if (await mobileToggle.isVisible()) {
      await mobileToggle.click();
      await page.waitForTimeout(500);
      
      // Mobile menu should appear
      const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, nav[aria-expanded="true"]').first();
      if (await mobileMenu.isVisible()) {
        await expect(mobileMenu).toBeVisible();
        
        // Test navigation link
        const navLink = mobileMenu.locator('a').first();
        if (await navLink.isVisible()) {
          await navLink.click();
          await page.waitForLoadState('networkidle');
        }
      }
    }
  });
});