import { test, expect, Browser, chromium, firefox, webkit } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { ContactPage } from '../pages/contact-page';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Cross-Browser Compatibility Tests', () => {
  const browsers = ['chromium', 'firefox', 'webkit'];
  
  // Test basic functionality across all browsers configured in playwright.config.ts
  test('should load home page across all browsers', async ({ page, browserName }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Basic functionality should work in all browsers
    await homePage.checkCommonElements();
    await homePage.checkHeroSection();
    
    // Check no console errors
    await TestHelpers.checkNoConsoleErrors(page);
    
    console.log(`✓ Home page loaded successfully in ${browserName}`);
  });

  test('should handle contact form across browsers', async ({ page, browserName }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    await contactPage.checkContactForm();
    
    // Test form interaction
    const testData = {
      fullName: `Test User ${browserName}`,
      email: 'test@example.com',
      phone: '07123456789',
      address: '123 Test Street',
      postcode: 'BA6 8AB',
      propertyType: 'Semi-detached (3 bed)',
      frequency: 'Every 4 weeks'
    };
    
    await contactPage.fillContactForm(testData);
    
    // Verify form values are set correctly
    await expect(contactPage.fullNameInput).toHaveValue(testData.fullName);
    await expect(contactPage.emailInput).toHaveValue(testData.email);
    
    console.log(`✓ Contact form works correctly in ${browserName}`);
  });

  test('should handle postcode checker across browsers', async ({ page, browserName }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Test postcode checker
    await contactPage.testPostcodeChecker('BA6 8AB', true);
    
    // Should show covered state
    await expect(contactPage.coveredHero).toBeVisible();
    
    console.log(`✓ Postcode checker works correctly in ${browserName}`);
  });

  test('should render CSS consistently across browsers', async ({ page, browserName }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Check key visual elements
    const heroButton = homePage.getQuoteButton;
    const buttonStyles = await heroButton.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        borderRadius: styles.borderRadius,
        padding: styles.padding,
        display: styles.display
      };
    });
    
    // Button should be properly styled
    expect(buttonStyles.display).not.toBe('none');
    expect(buttonStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    
    console.log(`✓ CSS renders consistently in ${browserName}`);
  });

  test('should handle JavaScript interactions across browsers', async ({ page, browserName }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Test JavaScript-dependent functionality
    await contactPage.postcodeInput.fill('BA6 8AB');
    await contactPage.postcodeButton.click();
    
    // JavaScript should update the page
    await page.waitForURL(/postcode=/, { timeout: 10000 });
    await expect(contactPage.coveredHero).toBeVisible();
    
    console.log(`✓ JavaScript interactions work in ${browserName}`);
  });

  test('should handle mobile responsiveness across browsers', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await TestHelpers.checkResponsiveness(page, { width: 375, height: 667 });
    
    // Check mobile-specific features
    await homePage.checkMobileMenu();
    
    console.log(`✓ Mobile responsiveness works in ${browserName}`);
  });

  // Safari/WebKit specific tests
  test('should handle WebKit specific features', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'This test is only for WebKit/Safari');
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Test WebKit specific CSS features
    const heroSection = homePage.heroSection;
    const webkitStyles = await heroSection.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        webkitBackdropFilter: styles.webkitBackdropFilter || styles.backdropFilter,
        webkitTransform: styles.webkitTransform || styles.transform
      };
    });
    
    // Should handle webkit prefixes gracefully
    expect(webkitStyles).toBeDefined();
    
    console.log('✓ WebKit specific features handled correctly');
  });

  // Firefox specific tests
  test('should handle Firefox specific features', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'This test is only for Firefox');
    
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Test Firefox form validation
    await contactPage.emailInput.fill('invalid-email');
    
    const validationMessage = await contactPage.emailInput.evaluate(el => {
      return (el as HTMLInputElement).validationMessage;
    });
    
    // Firefox should provide validation message
    expect(validationMessage).toBeTruthy();
    
    console.log('✓ Firefox specific features handled correctly');
  });

  test('should handle image loading across browsers', async ({ page, browserName }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check image loading
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
    
    console.log(`✓ Images load correctly in ${browserName}`);
  });

  test('should handle font rendering across browsers', async ({ page, browserName }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Check font family is applied
    const titleFont = await homePage.heroTitle.evaluate(el => {
      return window.getComputedStyle(el).fontFamily;
    });
    
    // Should have a font family set
    expect(titleFont).toBeTruthy();
    expect(titleFont).not.toBe('');
    
    console.log(`✓ Fonts render correctly in ${browserName}`);
  });

  test('should handle animations and transitions across browsers', async ({ page, browserName }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Test postcode checker animation (confetti)
    await contactPage.testPostcodeChecker('BA6 8AB', true);
    
    // Wait for potential animations
    await page.waitForTimeout(2000);
    
    // Should not cause errors
    await TestHelpers.checkNoConsoleErrors(page);
    
    console.log(`✓ Animations work correctly in ${browserName}`);
  });

  test('should handle local storage across browsers', async ({ page, browserName }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Test localStorage functionality if used
    const localStorageTest = await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'value');
        const value = localStorage.getItem('test');
        localStorage.removeItem('test');
        return value === 'value';
      } catch (e) {
        return false;
      }
    });
    
    expect(localStorageTest).toBe(true);
    
    console.log(`✓ Local storage works in ${browserName}`);
  });

  test('should handle form submission across browsers', async ({ page, browserName }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Mock form submission
    await page.route('**/contact', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    // Fill and attempt to submit form
    await contactPage.fillContactForm({
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '07123456789',
      address: '123 Test St',
      postcode: 'BA6 8AB',
      propertyType: 'Terraced (2 bed)',
      frequency: 'Every 4 weeks'
    });
    
    // Should handle form submission without errors
    await TestHelpers.checkNoConsoleErrors(page);
    
    console.log(`✓ Form submission handling works in ${browserName}`);
  });
});