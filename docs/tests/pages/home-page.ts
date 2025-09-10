import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class HomePage extends BasePage {
  readonly heroSection: Locator;
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly getQuoteButton: Locator;
  readonly postcodeButton: Locator;
  readonly servicesSection: Locator;
  readonly testimonialsSection: Locator;
  readonly faqsSection: Locator;
  readonly callToActionSection: Locator;
  readonly statsSection: Locator;
  readonly processSection: Locator;

  constructor(page: Page) {
    super(page);
    this.heroSection = page.locator('[data-testid="hero"], section').first();
    this.heroTitle = page.locator('h1').first();
    this.heroSubtitle = page.locator('h1 + p, .hero-subtitle, [data-testid="hero-subtitle"]').first();
    this.getQuoteButton = page.locator('a:has-text("Get a quote")').first();
    this.postcodeButton = page.locator('a:has-text("Check your postcode")').first();
    this.servicesSection = page.locator('#features, [data-testid="services"]');
    this.testimonialsSection = page.locator('[data-testid="testimonials"], section:has(.testimonial)');
    this.faqsSection = page.locator('[data-testid="faqs"], section:has-text("Frequently Asked Questions")');
    this.callToActionSection = page.locator('[data-testid="cta"], section:has(a:has-text("Get a quote"))').last();
    this.statsSection = page.locator('[data-testid="stats"], section:has-text("Regular Customers")');
    this.processSection = page.locator('#process, [data-testid="process"]');
  }

  async goto() {
    await super.goto('/');
  }

  async checkHeroSection() {
    await expect(this.heroSection).toBeVisible();
    await expect(this.heroTitle).toBeVisible();
    await expect(this.heroTitle).toContainText('Crystal‑clear windows');
    
    await expect(this.heroSubtitle).toBeVisible();
    await expect(this.heroSubtitle).toContainText('Professional exterior cleaning');
    
    await expect(this.getQuoteButton).toBeVisible();
    await expect(this.postcodeButton).toBeVisible();
  }

  async checkServicesSection() {
    await expect(this.servicesSection).toBeVisible();
    
    // Check for key services
    const services = [
      'Window cleaning',
      'Gutter clearing',
      'Fascia & soffit',
      'Conservatory roof cleaning',
      'Solar panels',
      'Commercial'
    ];
    
    for (const service of services) {
      await expect(this.page.locator(`text=${service}`)).toBeVisible();
    }
  }

  async checkStatsSection() {
    await expect(this.statsSection).toBeVisible();
    
    // Check for key statistics
    await expect(this.page.locator('text=4,000+')).toBeVisible(); // Regular Customers
    await expect(this.page.locator('text=4.9★')).toBeVisible(); // Google Rating
    await expect(this.page.locator('text=2019')).toBeVisible(); // Established
  }

  async checkProcessSection() {
    await expect(this.processSection).toBeVisible();
    
    // Check process steps
    const steps = [
      'Get a fast quote',
      'Reminder',
      'We carry out your exterior clean',
      'Invoice & payment'
    ];
    
    for (const step of steps) {
      await expect(this.page.locator(`text=${step}`)).toBeVisible();
    }
  }

  async checkTestimonialsSection() {
    await expect(this.testimonialsSection).toBeVisible();
    
    // Check for testimonial content
    await expect(this.page.locator('text=What our customers say')).toBeVisible();
    
    // Check for at least one testimonial
    const testimonials = this.page.locator('.testimonial, [data-testid="testimonial"]');
    await expect(testimonials.first()).toBeVisible();
  }

  async checkFAQsSection() {
    await expect(this.faqsSection).toBeVisible();
    
    // Check FAQ title
    await expect(this.page.locator('text=Frequently Asked Questions')).toBeVisible();
    
    // Check for key FAQ questions
    await expect(this.page.locator('text=How much does window cleaning cost?')).toBeVisible();
    await expect(this.page.locator('text=Do I need to be home during cleaning?')).toBeVisible();
    await expect(this.page.locator('text=Are you insured?')).toBeVisible();
  }

  async checkCallToActionSection() {
    await expect(this.callToActionSection).toBeVisible();
    
    // Check CTA buttons
    await expect(this.page.locator('a:has-text("Get a quote")').last()).toBeVisible();
    await expect(this.page.locator('a:has-text("WhatsApp")')).toBeVisible();
    await expect(this.page.locator('a:has-text("Call 01458 860339")')).toBeVisible();
  }

  async clickGetQuote() {
    await this.getQuoteButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickPostcodeChecker() {
    await this.postcodeButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async scrollToSection(sectionName: string) {
    const sectionMap = {
      'services': this.servicesSection,
      'testimonials': this.testimonialsSection,
      'faqs': this.faqsSection,
      'process': this.processSection,
      'stats': this.statsSection
    };
    
    const section = sectionMap[sectionName as keyof typeof sectionMap];
    if (section) {
      await section.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
    }
  }

  async checkAllSections() {
    await this.checkHeroSection();
    await this.checkServicesSection();
    await this.checkStatsSection();
    await this.checkProcessSection();
    await this.checkTestimonialsSection();
    await this.checkFAQsSection();
    await this.checkCallToActionSection();
  }
}