import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly header: Locator;
  readonly footer: Locator;
  readonly logo: Locator;
  readonly navigation: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header');
    this.footer = page.locator('footer');
    this.logo = page.locator('[data-testid="logo"], .logo, img[alt*="logo"]').first();
    this.navigation = page.locator('nav, [role="navigation"]').first();
  }

  async goto(url: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async checkCommonElements() {
    // Check that common page elements are present
    await expect(this.header).toBeVisible();
    await expect(this.footer).toBeVisible();
    
    // Check page title exists and is not empty
    const title = await this.page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  }

  async checkNavigation() {
    // Check main navigation links
    const navLinks = this.navigation.locator('a');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);
    
    // Verify navigation links are clickable
    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      await expect(navLinks.nth(i)).toBeVisible();
    }
  }

  async clickNavigationLink(linkText: string) {
    await this.navigation.locator(`a:has-text("${linkText}")`).click();
    await this.page.waitForLoadState('networkidle');
  }

  async checkPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.locator('body')).toBeVisible();
  }

  async checkMobileMenu() {
    // Check if mobile menu toggle exists and works
    const mobileToggle = this.page.locator('[data-testid="mobile-menu-toggle"], .mobile-menu-toggle, button[aria-label*="menu"]').first();
    
    if (await mobileToggle.isVisible()) {
      await mobileToggle.click();
      await this.page.waitForTimeout(500); // Wait for animation
      
      // Check if mobile menu appears
      const mobileMenu = this.page.locator('[data-testid="mobile-menu"], .mobile-menu').first();
      if (await mobileMenu.isVisible()) {
        await expect(mobileMenu).toBeVisible();
        
        // Close mobile menu
        await mobileToggle.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  async checkContactInfo() {
    // Look for contact information in header/footer
    const phonePattern = /01458\s*860339/;
    const emailPattern = /info@somersetwindowcleaning\.co\.uk/;
    
    const pageContent = await this.page.textContent('body');
    expect(pageContent).toMatch(phonePattern);
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true
    });
  }
}