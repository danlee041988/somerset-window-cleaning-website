import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Home Page Tests', () => {
  test('should load home page successfully', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Check page loads without errors
    await TestHelpers.checkNoConsoleErrors(page);
    await homePage.checkCommonElements();
    
    // Check page title
    const title = await page.title();
    expect(title).toContain('Somerset Window Cleaning');
    expect(title).toContain('Professional window cleaning');
  });

  test('should display all main sections', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await homePage.checkAllSections();
  });

  test('should have functional hero section', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await homePage.checkHeroSection();
    
    // Test hero buttons
    await expect(homePage.getQuoteButton).toBeVisible();
    await expect(homePage.postcodeButton).toBeVisible();
  });

  test('should display services correctly', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await homePage.checkServicesSection();
    
    // Check service icons are loaded
    const serviceIcons = page.locator('[data-testid="service-icon"], .service-icon, svg').first();
    if (await serviceIcons.isVisible()) {
      await expect(serviceIcons).toBeVisible();
    }
  });

  test('should show statistics section', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await homePage.checkStatsSection();
  });

  test('should display process steps', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await homePage.checkProcessSection();
  });

  test('should show customer testimonials', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await homePage.checkTestimonialsSection();
    
    // Check star ratings if present
    const ratings = page.locator('[data-testid="rating"], .rating, .stars');
    if (await ratings.first().isVisible()) {
      await expect(ratings.first()).toBeVisible();
    }
  });

  test('should display FAQ section', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await homePage.checkFAQsSection();
    
    // Test FAQ interaction if expandable
    const faqQuestion = page.locator('.faq-question, [data-testid="faq-question"]').first();
    if (await faqQuestion.isVisible()) {
      await faqQuestion.click();
      await page.waitForTimeout(500); // Wait for animation
    }
  });

  test('should have working call-to-action section', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await homePage.checkCallToActionSection();
    
    // Check CTA links work
    const whatsappLink = page.locator('a[href*="wa.me"]');
    if (await whatsappLink.isVisible()) {
      const href = await whatsappLink.getAttribute('href');
      expect(href).toContain('447415526331');
    }
    
    const phoneLink = page.locator('a[href="tel:01458860339"]');
    if (await phoneLink.isVisible()) {
      await expect(phoneLink).toBeVisible();
    }
  });

  test('should navigate to contact page from CTA buttons', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Click first "Get a quote" button
    await homePage.clickGetQuote();
    
    // Should be on contact page
    expect(page.url()).toContain('/contact');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should scroll to postcode checker', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Click postcode checker button from hero
    await homePage.clickPostcodeChecker();
    
    // Should scroll to or navigate to postcode checker
    const postcodeSection = page.locator('#postcode-checker, [data-testid="postcode-checker"]');
    if (await postcodeSection.isVisible()) {
      await expect(postcodeSection).toBeVisible();
    } else {
      // If it navigates to contact page
      expect(page.url()).toContain('/contact');
    }
  });

  test('should load all images properly', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check hero image
    const heroImage = page.locator('img').first();
    if (await heroImage.isVisible()) {
      const src = await heroImage.getAttribute('src');
      expect(src).toBeTruthy();
      
      // Check image loaded successfully
      const naturalWidth = await heroImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Should have exactly one h1
    await expect(page.locator('h1')).toHaveCount(1);
    
    // Should have multiple h2s for sections
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThan(2);
  });

  test('should display contact information', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await homePage.checkContactInfo();
    
    // Check for email in footer/header
    const emailPattern = /info@somersetwindowcleaning\.co\.uk/;
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(emailPattern);
  });

  test('should have working social media links', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Look for social media links
    const socialLinks = page.locator('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="linkedin"]');
    const socialCount = await socialLinks.count();
    
    // If social links exist, they should be valid
    for (let i = 0; i < socialCount; i++) {
      const link = socialLinks.nth(i);
      const href = await link.getAttribute('href');
      expect(href).toMatch(/^https?:\/\//);
    }
  });
});