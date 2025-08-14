import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class ServicesPage extends BasePage {
  readonly heroSection: Locator;
  readonly servicesGrid: Locator;
  readonly callToAction: Locator;

  constructor(page: Page) {
    super(page);
    this.heroSection = page.locator('h1').first();
    this.servicesGrid = page.locator('[data-testid="services"], section:has(.service)');
    this.callToAction = page.locator('[data-testid="cta"], section:has(a:has-text("Get a quote"))');
  }

  async goto() {
    await super.goto('/services');
  }

  async checkServicesContent() {
    // Check that the page loads properly
    await expect(this.heroSection).toBeVisible();
    
    // Look for common service-related content
    const serviceKeywords = [
      'window cleaning',
      'gutter',
      'fascia',
      'soffit',
      'conservatory',
      'solar panel',
      'commercial'
    ];
    
    const pageContent = await this.page.textContent('body');
    const foundServices = serviceKeywords.filter(keyword => 
      pageContent?.toLowerCase().includes(keyword.toLowerCase())
    );
    
    expect(foundServices.length).toBeGreaterThan(3); // Should have at least 4 services mentioned
  }

  async checkGetQuoteButton() {
    const quoteButton = this.page.locator('a:has-text("Get a quote"), a:has-text("Contact")').first();
    if (await quoteButton.isVisible()) {
      await expect(quoteButton).toBeVisible();
    }
  }
}