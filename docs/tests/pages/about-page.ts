import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class AboutPage extends BasePage {
  readonly heroSection: Locator;
  readonly content: Locator;

  constructor(page: Page) {
    super(page);
    this.heroSection = page.locator('h1').first();
    this.content = page.locator('main, article, .content').first();
  }

  async goto() {
    await super.goto('/about');
  }

  async checkAboutContent() {
    // Check that the page loads properly
    await expect(this.heroSection).toBeVisible();
    
    // Look for company information keywords
    const companyKeywords = [
      'somerset',
      'window cleaning',
      'established',
      'experience',
      'team',
      'professional',
      'insured'
    ];
    
    const pageContent = await this.page.textContent('body');
    const foundKeywords = companyKeywords.filter(keyword => 
      pageContent?.toLowerCase().includes(keyword.toLowerCase())
    );
    
    expect(foundKeywords.length).toBeGreaterThan(3); // Should have company info
  }
}