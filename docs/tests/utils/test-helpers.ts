import { Page, expect } from '@playwright/test';

export class TestHelpers {
  static async waitForPageLoad(page: Page, timeout = 10000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async checkNoConsoleErrors(page: Page) {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Allow some time for any console errors to appear
    await page.waitForTimeout(1000);
    
    // Filter out known acceptable errors/warnings
    const filteredErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('google-site-verification') &&
      !error.toLowerCase().includes('warning')
    );
    
    expect(filteredErrors).toHaveLength(0);
  }

  static async checkMetaTags(page: Page) {
    // Check essential meta tags
    await expect(page.locator('meta[charset]')).toBeAttached();
    await expect(page.locator('meta[name="viewport"]')).toBeAttached();
    await expect(page.locator('title')).toBeAttached();
    
    // Check title is not empty
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  }

  static async checkAccessibility(page: Page) {
    // Check for alt tags on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      
      // Images should have alt attributes (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
    
    // Check for proper heading hierarchy (at least one h1)
    await expect(page.locator('h1')).toHaveCount(1);
  }

  static async measurePageLoadTime(page: Page): Promise<number> {
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  static async checkResponsiveness(page: Page, viewport: { width: number; height: number }) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500); // Allow time for responsive changes
    
    // Check that content is visible and not overflowing
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    expect(bodyBox?.width).toBeLessThanOrEqual(viewport.width);
  }

  static async validateLinks(page: Page) {
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    const brokenLinks: string[] = [];
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      
      if (!href) continue;
      
      // Skip external links, mailto, tel, and anchor links for basic validation
      if (href.startsWith('http') && !href.includes('localhost:4321')) continue;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) continue;
      if (href.startsWith('#')) continue;
      
      try {
        // For internal links, check if they're valid routes
        if (href.startsWith('/')) {
          const response = await page.request.get(href);
          if (!response.ok()) {
            brokenLinks.push(`${href} (${response.status()})`);
          }
        }
      } catch (error) {
        brokenLinks.push(`${href} (Error: ${error})`);
      }
    }
    
    expect(brokenLinks).toHaveLength(0);
  }

  static async fillContactForm(page: Page, formData: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    postcode: string;
    propertyType: string;
    frequency: string;
    notes?: string;
  }) {
    await page.fill('input[name="fullName"]', formData.fullName);
    await page.fill('input[name="email"]', formData.email);
    await page.fill('input[name="phone"]', formData.phone);
    await page.fill('input[name="address"]', formData.address);
    await page.fill('input[name="postcode"]', formData.postcode);
    
    await page.selectOption('select[name="propertyType"]', formData.propertyType);
    await page.selectOption('select[name="frequency"]', formData.frequency);
    
    if (formData.notes) {
      await page.fill('textarea[name="message"]', formData.notes);
    }
  }

  static async testPostcodeChecker(page: Page, postcode: string, shouldBeCovered: boolean) {
    await page.fill('#postcodeInputC', postcode);
    await page.click('#postcodeBtnC');
    
    // Wait for the page to update
    await page.waitForTimeout(2000);
    
    if (shouldBeCovered) {
      await expect(page.locator('#hero-covered')).toBeVisible();
      await expect(page.locator('#covered-postcode')).toContainText(postcode.replace(/\s+/g, ''));
    } else {
      await expect(page.locator('#maybe-banner')).toBeVisible();
      await expect(page.locator('#maybe-postcode')).toContainText(postcode.replace(/\s+/g, ''));
    }
  }
}