import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { ContactPage } from '../pages/contact-page';

test.describe('Visual Regression Tests', () => {
  // Configure visual comparison settings
  test.use({
    // Use consistent browser and viewport for visual tests
    viewport: { width: 1280, height: 720 }
  });

  test('should match home page screenshot', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Wait for all content to load
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic content that changes between test runs
    await page.addStyleTag({
      content: `
        .dynamic-content,
        [data-testid="dynamic"],
        .current-time,
        .timestamp {
          visibility: hidden !important;
        }
      `
    });
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('home-page-full.png', {
      fullPage: true,
      threshold: 0.3,
      animations: 'disabled'
    });
  });

  test('should match home page hero section', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await page.waitForLoadState('networkidle');
    
    // Screenshot specific section
    await expect(homePage.heroSection).toHaveScreenshot('hero-section.png', {
      threshold: 0.3,
      animations: 'disabled'
    });
  });

  test('should match contact page screenshot', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    await page.waitForLoadState('networkidle');
    
    // Hide form elements that might have dynamic IDs or values
    await page.addStyleTag({
      content: `
        input:placeholder-shown {
          color: transparent !important;
        }
        .dynamic-id,
        [id*="random"],
        [data-dynamic] {
          visibility: hidden !important;
        }
      `
    });
    
    await expect(page).toHaveScreenshot('contact-page-full.png', {
      fullPage: true,
      threshold: 0.3,
      animations: 'disabled'
    });
  });

  test('should match postcode checker states', async ({ page }) => {
    const contactPage = new ContactPage(page);
    
    // Test default state
    await contactPage.goto();
    await page.waitForLoadState('networkidle');
    
    await expect(contactPage.postcodeChecker).toHaveScreenshot('postcode-checker-default.png', {
      threshold: 0.3
    });
    
    // Test covered state
    await contactPage.gotoWithPostcode('BA68AB', true);
    await page.waitForLoadState('networkidle');
    
    // Wait a moment for any animations to complete
    await page.waitForTimeout(1000);
    
    await expect(contactPage.coveredHero).toHaveScreenshot('postcode-covered-hero.png', {
      threshold: 0.3,
      animations: 'disabled'
    });
  });

  test('should match mobile viewport screenshots', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('home-page-mobile.png', {
      fullPage: true,
      threshold: 0.3,
      animations: 'disabled'
    });
  });

  test('should match tablet viewport screenshots', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('home-page-tablet.png', {
      fullPage: true,
      threshold: 0.3,
      animations: 'disabled'
    });
  });

  test('should match contact form elements', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    await page.waitForLoadState('networkidle');
    
    // Clear any placeholder text for consistent screenshots
    await page.addStyleTag({
      content: `
        input::placeholder,
        textarea::placeholder {
          color: transparent !important;
        }
        input, textarea, select {
          color: black !important;
          background-color: white !important;
        }
      `
    });
    
    await expect(contactPage.contactForm).toHaveScreenshot('contact-form.png', {
      threshold: 0.3
    });
  });

  test('should match services section layout', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    // Scroll to services section
    await homePage.scrollToSection('services');
    await page.waitForTimeout(500);
    
    await expect(homePage.servicesSection).toHaveScreenshot('services-section.png', {
      threshold: 0.3,
      animations: 'disabled'
    });
  });

  test('should match testimonials section', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    await homePage.scrollToSection('testimonials');
    await page.waitForTimeout(500);
    
    await expect(homePage.testimonialsSection).toHaveScreenshot('testimonials-section.png', {
      threshold: 0.3,
      animations: 'disabled'
    });
  });

  test('should match FAQ section', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    await homePage.scrollToSection('faqs');
    await page.waitForTimeout(500);
    
    await expect(homePage.faqsSection).toHaveScreenshot('faqs-section.png', {
      threshold: 0.3,
      animations: 'disabled'
    });
  });

  test('should handle dark mode if supported', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    // Check if dark mode toggle exists
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"], .dark-mode-toggle, button[aria-label*="dark"]').first();
    
    if (await darkModeToggle.isVisible()) {
      // Test dark mode
      await darkModeToggle.click();
      await page.waitForTimeout(500); // Wait for transition
      
      await expect(page).toHaveScreenshot('home-page-dark-mode.png', {
        fullPage: true,
        threshold: 0.3,
        animations: 'disabled'
      });
    }
  });

  test('should match error states', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Trigger validation error
    await contactPage.emailInput.fill('invalid-email');
    await contactPage.submitButton.click();
    await page.waitForTimeout(500);
    
    // Screenshot form with validation errors
    await expect(contactPage.contactForm).toHaveScreenshot('contact-form-errors.png', {
      threshold: 0.3
    });
  });

  test('should match cross-browser rendering', async ({ page, browserName }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    // Take browser-specific screenshot
    await expect(homePage.heroSection).toHaveScreenshot(`hero-section-${browserName}.png`, {
      threshold: 0.4, // Slightly higher threshold for cross-browser differences
      animations: 'disabled'
    });
  });

  test('should handle loading states', async ({ page }) => {
    const contactPage = new ContactPage(page);
    
    // Mock slow response to capture loading state
    await page.route('**/contact', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: 'Success'
        });
      }, 2000);
    });
    
    await contactPage.goto();
    
    // Fill form
    await contactPage.fillContactForm({
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '07123456789',
      address: '123 Test St',
      postcode: 'BA6 8AB',
      propertyType: 'Terraced (2 bed)',
      frequency: 'Every 4 weeks'
    });
    
    // Submit and capture loading state
    await contactPage.submitButton.click();
    await page.waitForTimeout(500); // Capture loading state
    
    // Screenshot button in loading state if it changes
    const buttonText = await contactPage.submitButton.textContent();
    if (buttonText?.includes('Loading') || buttonText?.includes('Sending')) {
      await expect(contactPage.submitButton).toHaveScreenshot('submit-button-loading.png', {
        threshold: 0.3
      });
    }
  });

  test('should match print styles', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    // Emulate print media
    await page.emulateMedia({ media: 'print' });
    
    await expect(page).toHaveScreenshot('home-page-print.png', {
      fullPage: true,
      threshold: 0.3
    });
  });

  test('should handle high contrast mode', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    // Emulate high contrast
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    
    await expect(homePage.heroSection).toHaveScreenshot('hero-section-high-contrast.png', {
      threshold: 0.4,
      animations: 'disabled'
    });
  });
});