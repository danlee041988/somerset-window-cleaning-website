import { test, expect } from '@playwright/test';
import { LinkCrawler, CrawlResult } from '../utils/link-crawler';
import { HomePage } from '../pages/home-page';
import { ContactPage } from '../pages/contact-page';
import fs from 'fs';
import path from 'path';

test.describe('Link Validation Tests', () => {
  let crawler: LinkCrawler;

  test.beforeAll(async () => {
    crawler = new LinkCrawler('http://localhost:4321');
    await crawler.init();
  });

  test.afterAll(async () => {
    await crawler.close();
  });

  test('should validate all internal links site-wide', async () => {
    const result: CrawlResult = await crawler.crawlSite();
    
    // Generate detailed report
    const report = crawler.generateReport(result);
    
    // Save report to file
    const reportsDir = path.join(process.cwd(), 'test-results', 'link-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, `link-validation-${Date.now()}.md`);
    fs.writeFileSync(reportPath, report);
    
    console.log(`Link validation report saved to: ${reportPath}`);
    console.log(`Total links: ${result.totalLinks}, Broken: ${result.brokenLinks.length}`);
    
    // Test should fail if there are broken internal links
    const brokenInternalLinks = result.brokenLinks.filter(link => 
      !link.url.startsWith('http') || link.url.startsWith('http://localhost:4321')
    );
    
    if (brokenInternalLinks.length > 0) {
      console.error('Broken internal links found:');
      brokenInternalLinks.forEach(link => {
        console.error(`  - ${link.url}: ${link.status} ${link.statusText}`);
        if (link.error) console.error(`    Error: ${link.error}`);
      });
    }
    
    expect(brokenInternalLinks).toHaveLength(0);
  });

  test('should validate home page links', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    const results = await crawler.validatePageLinks(page, '/');
    const brokenLinks = results.filter(result => !result.isValid);
    
    // Log any broken links for debugging
    if (brokenLinks.length > 0) {
      console.error('Broken links found on home page:');
      brokenLinks.forEach(link => {
        console.error(`  - ${link.url}: ${link.status} ${link.statusText}`);
      });
    }
    
    // Allow external links to fail (they might be down temporarily)
    const brokenInternalLinks = brokenLinks.filter(link => 
      !link.url.startsWith('http') || link.url.startsWith('http://localhost:4321')
    );
    
    expect(brokenInternalLinks).toHaveLength(0);
  });

  test('should validate contact page links', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    const results = await crawler.validatePageLinks(page, '/contact');
    const brokenInternalLinks = results
      .filter(result => !result.isValid)
      .filter(link => !link.url.startsWith('http') || link.url.startsWith('http://localhost:4321'));
    
    expect(brokenInternalLinks).toHaveLength(0);
  });

  test('should validate navigation links', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Get all navigation links
    const navLinks = page.locator('nav a[href], header a[href]');
    const linkCount = await navLinks.count();
    
    const linkResults = [];
    
    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      
      if (href && href.startsWith('/')) {
        // Test internal navigation link
        const response = await page.request.get(`http://localhost:4321${href}`);
        linkResults.push({
          url: href,
          status: response.status(),
          isValid: response.ok()
        });
      }
    }
    
    const brokenNavLinks = linkResults.filter(result => !result.isValid);
    
    if (brokenNavLinks.length > 0) {
      console.error('Broken navigation links:');
      brokenNavLinks.forEach(link => {
        console.error(`  - ${link.url}: ${link.status}`);
      });
    }
    
    expect(brokenNavLinks).toHaveLength(0);
  });

  test('should validate footer links', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Get all footer links
    const footerLinks = page.locator('footer a[href]');
    const linkCount = await footerLinks.count();
    
    const linkResults = [];
    
    for (let i = 0; i < linkCount; i++) {
      const link = footerLinks.nth(i);
      const href = await link.getAttribute('href');
      
      if (href && href.startsWith('/')) {
        // Test internal footer link
        const response = await page.request.get(`http://localhost:4321${href}`);
        linkResults.push({
          url: href,
          status: response.status(),
          isValid: response.ok()
        });
      }
    }
    
    const brokenFooterLinks = linkResults.filter(result => !result.isValid);
    expect(brokenFooterLinks).toHaveLength(0);
  });

  test('should validate CTA button links', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Test main CTA buttons
    const ctaButtons = page.locator('a:has-text("Get a quote"), a:has-text("Contact")');
    const buttonCount = await ctaButtons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    
    for (let i = 0; i < buttonCount; i++) {
      const button = ctaButtons.nth(i);
      const href = await button.getAttribute('href');
      
      if (href && href.startsWith('/')) {
        const response = await page.request.get(`http://localhost:4321${href}`);
        expect(response.ok()).toBe(true);
      }
    }
  });

  test('should validate phone and email links', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Check phone links
    const phoneLinks = page.locator('a[href^="tel:"]');
    const phoneCount = await phoneLinks.count();
    
    for (let i = 0; i < phoneCount; i++) {
      const link = phoneLinks.nth(i);
      const href = await link.getAttribute('href');
      
      // Should be valid tel: format
      expect(href).toMatch(/^tel:\+?[\d\s-()]+$/);
    }
    
    // Check email links
    const emailLinks = page.locator('a[href^="mailto:"]');
    const emailCount = await emailLinks.count();
    
    for (let i = 0; i < emailCount; i++) {
      const link = emailLinks.nth(i);
      const href = await link.getAttribute('href');
      
      // Should be valid mailto: format
      expect(href).toMatch(/^mailto:[^@]+@[^@]+\.[^@]+/);
    }
  });

  test('should validate WhatsApp links', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Check WhatsApp links
    const whatsappLinks = page.locator('a[href*="wa.me"], a[href*="whatsapp"]');
    const whatsappCount = await whatsappLinks.count();
    
    for (let i = 0; i < whatsappCount; i++) {
      const link = whatsappLinks.nth(i);
      const href = await link.getAttribute('href');
      
      if (href) {
        // Should contain valid WhatsApp format
        expect(href).toMatch(/wa\.me\/\d+/);
        
        // Should contain Somerset Window Cleaning phone number
        expect(href).toContain('447415526331');
      }
    }
  });

  test('should check for broken assets (images, CSS, JS)', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Track failed resource loads
    const failedResources: string[] = [];
    
    page.on('response', response => {
      if (!response.ok() && response.url().includes('localhost:4321')) {
        failedResources.push(`${response.url()} (${response.status()})`);
      }
    });
    
    // Wait for all resources to load
    await page.waitForLoadState('networkidle');
    
    // Check images are loaded
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      
      if (src && !src.startsWith('data:')) {
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        if (naturalWidth === 0) {
          failedResources.push(`Image failed to load: ${src}`);
        }
      }
    }
    
    if (failedResources.length > 0) {
      console.error('Failed to load resources:');
      failedResources.forEach(resource => console.error(`  - ${resource}`));
    }
    
    expect(failedResources).toHaveLength(0);
  });

  test('should validate social media links', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Check social media links
    const socialLinks = page.locator('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="linkedin"], a[href*="youtube"]');
    const socialCount = await socialLinks.count();
    
    for (let i = 0; i < socialCount; i++) {
      const link = socialLinks.nth(i);
      const href = await link.getAttribute('href');
      
      if (href) {
        // Should be valid HTTPS URL
        expect(href).toMatch(/^https:\/\//);
        
        // Should not be placeholder links
        expect(href).not.toContain('example.com');
        expect(href).not.toContain('placeholder');
      }
    }
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Test non-existent pages
    const testPaths = [
      '/non-existent-page',
      '/invalid/path',
      '/test-404'
    ];
    
    for (const path of testPaths) {
      const response = await page.request.get(`http://localhost:4321${path}`);
      
      // Should return 404
      expect(response.status()).toBe(404);
      
      // Try to navigate to 404 page and check it's handled properly
      await page.goto(`http://localhost:4321${path}`, { waitUntil: 'networkidle' });
      
      // Should still have basic page structure
      await expect(page.locator('body')).toBeVisible();
    }
  });
});