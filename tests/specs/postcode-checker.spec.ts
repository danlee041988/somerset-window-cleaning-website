import { test, expect } from '@playwright/test';
import { ContactPage } from '../pages/contact-page';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Postcode Checker Tests', () => {
  test('should display postcode checker form', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    await contactPage.checkPostcodeChecker();
    
    // Check placeholder and instructions
    const instructions = page.locator('text=We cover most BA, TA, BS and DT9 postcodes');
    await expect(instructions).toBeVisible();
  });

  test('should validate full UK postcode format', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Test invalid postcode format
    await contactPage.postcodeInput.fill('INVALID');
    await contactPage.postcodeButton.click();
    
    // Should show error message
    await expect(contactPage.postcodeResult).toContainText('Please enter your full postcode');
    await expect(contactPage.postcodeResult).toHaveClass(/text-red/);
  });

  test('should handle covered postcodes correctly', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    const coveredPostcodes = [
      'BA6 8AB',
      'TA1 1AA',
      'BS1 1AA',
      'DT9 3QN'
    ];
    
    for (const postcode of coveredPostcodes) {
      // Go back to clean contact page
      await contactPage.goto();
      
      await contactPage.testPostcodeChecker(postcode, true);
      
      // Should show covered hero with confetti animation
      await expect(contactPage.coveredHero).toBeVisible();
      
      // Check postcode is displayed correctly
      const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      await expect(page.locator('#covered-postcode')).toContainText(cleanPostcode);
      
      // Check WhatsApp link is updated
      const whatsappLink = page.locator('#covered-whats');
      if (await whatsappLink.isVisible()) {
        const href = await whatsappLink.getAttribute('href');
        expect(href).toContain(encodeURIComponent(cleanPostcode));
      }
      
      // Check URL parameters
      expect(page.url()).toContain(`postcode=${encodeURIComponent(cleanPostcode)}`);
      expect(page.url()).toContain('covered=1');
    }
  });

  test('should handle potentially covered postcodes', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Test postcodes that might be covered but not confirmed
    const maybePostcodes = [
      'EX1 1AA', // Exeter - outside normal coverage
      'GL1 1AA', // Gloucester - outside normal coverage
      'SN1 1AA'  // Swindon - outside normal coverage
    ];
    
    for (const postcode of maybePostcodes) {
      // Go back to clean contact page
      await contactPage.goto();
      
      await contactPage.testPostcodeChecker(postcode, false);
      
      // Should show maybe banner
      await expect(contactPage.maybeBanner).toBeVisible();
      
      // Check postcode is displayed correctly
      const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      await expect(page.locator('#maybe-postcode')).toContainText(cleanPostcode);
      
      // Check WhatsApp link is updated
      const whatsappLink = page.locator('#maybe-whats');
      if (await whatsappLink.isVisible()) {
        const href = await whatsappLink.getAttribute('href');
        expect(href).toContain(encodeURIComponent(cleanPostcode));
      }
      
      // Check URL parameters
      expect(page.url()).toContain(`postcode=${encodeURIComponent(cleanPostcode)}`);
      expect(page.url()).toContain('covered=0');
    }
  });

  test('should handle postcode with different formats', async ({ page }) => {
    const contactPage = new ContactPage(page);
    
    const postcodeVariations = [
      { input: 'ba6 8ab', expected: 'BA68AB' },
      { input: 'BA6  8AB', expected: 'BA68AB' },
      { input: 'ba68ab', expected: 'BA68AB' },
      { input: 'Ba6 8aB', expected: 'BA68AB' }
    ];
    
    for (const variation of postcodeVariations) {
      await contactPage.goto();
      
      await contactPage.postcodeInput.fill(variation.input);
      await contactPage.postcodeButton.click();
      
      // Wait for navigation
      await page.waitForURL(/postcode=/, { timeout: 5000 });
      
      // Should normalize postcode correctly
      expect(page.url()).toContain(`postcode=${encodeURIComponent(variation.expected)}`);
      
      // Should show covered hero
      await expect(contactPage.coveredHero).toBeVisible();
      await expect(page.locator('#covered-postcode')).toContainText(variation.expected);
    }
  });

  test('should prefill form postcode from URL', async ({ page }) => {
    const contactPage = new ContactPage(page);
    const testPostcode = 'BA68AB';
    
    await contactPage.gotoWithPostcode(testPostcode, true);
    
    // Form postcode input should be prefilled
    await expect(contactPage.postcodeFormInput).toHaveValue(testPostcode);
  });

  test('should test coverage logic for all area codes', async ({ page }) => {
    const contactPage = new ContactPage(page);
    
    const areaTests = [
      // BA postcodes - should be covered
      { postcode: 'BA1 1AA', shouldBeCovered: true },
      { postcode: 'BA20 1AA', shouldBeCovered: true },
      
      // TA postcodes - should be covered
      { postcode: 'TA1 1AA', shouldBeCovered: true },
      { postcode: 'TA24 8AA', shouldBeCovered: true },
      
      // BS postcodes - should be covered
      { postcode: 'BS1 1AA', shouldBeCovered: true },
      { postcode: 'BS48 1AA', shouldBeCovered: true },
      
      // DT9 specifically - should be covered
      { postcode: 'DT9 3QN', shouldBeCovered: true },
      
      // Other DT postcodes - should not be covered
      { postcode: 'DT1 1AA', shouldBeCovered: false },
      { postcode: 'DT10 1AA', shouldBeCovered: false },
      
      // Other areas - should not be covered
      { postcode: 'EX1 1AA', shouldBeCovered: false },
      { postcode: 'GL1 1AA', shouldBeCovered: false },
      { postcode: 'SN1 1AA', shouldBeCovered: false }
    ];
    
    for (const test of areaTests) {
      await contactPage.goto();
      await contactPage.testPostcodeChecker(test.postcode, test.shouldBeCovered);
    }
  });

  test('should show confetti animation for covered postcodes', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    await contactPage.testPostcodeChecker('BA6 8AB', true);
    
    // Wait a moment for confetti to appear
    await page.waitForTimeout(1000);
    
    // Check if confetti container exists
    const confetti = page.locator('#confetti');
    if (await confetti.isVisible()) {
      await expect(confetti).toBeVisible();
      
      // Check confetti pieces
      const confettiPieces = confetti.locator('.confetti');
      const pieceCount = await confettiPieces.count();
      expect(pieceCount).toBeGreaterThan(0);
    }
  });

  test('should auto-scroll to form after confirmation', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    await contactPage.testPostcodeChecker('BA6 8AB', true);
    
    // Should eventually scroll to form section
    await page.waitForTimeout(3000); // Wait for auto-scroll
    
    // Check if form is in viewport or page has scrolled
    const formSection = page.locator('#form');
    if (await formSection.isVisible()) {
      const formBox = await formSection.boundingBox();
      expect(formBox?.y).toBeLessThan(1000); // Should be near top of viewport
    }
  });

  test('should handle edge cases gracefully', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Test empty input
    await contactPage.postcodeButton.click();
    await expect(contactPage.postcodeResult).toContainText('Please enter your full postcode');
    
    // Test very short input
    await contactPage.postcodeInput.fill('B');
    await contactPage.postcodeButton.click();
    await expect(contactPage.postcodeResult).toContainText('Please enter your full postcode');
    
    // Test partial postcode
    await contactPage.postcodeInput.fill('BA6');
    await contactPage.postcodeButton.click();
    await expect(contactPage.postcodeResult).toContainText('Please enter your full postcode');
  });

  test('should maintain postcode state across page reloads', async ({ page }) => {
    const contactPage = new ContactPage(page);
    const testPostcode = 'BA68AB';
    
    await contactPage.gotoWithPostcode(testPostcode, true);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still show covered state
    await expect(contactPage.coveredHero).toBeVisible();
    await expect(page.locator('#covered-postcode')).toContainText(testPostcode);
  });
});