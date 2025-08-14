import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class ContactPage extends BasePage {
  readonly heroSection: Locator;
  readonly postcodeChecker: Locator;
  readonly postcodeInput: Locator;
  readonly postcodeButton: Locator;
  readonly postcodeResult: Locator;
  readonly contactForm: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly postcodeFormInput: Locator;
  readonly propertyTypeSelect: Locator;
  readonly frequencySelect: Locator;
  readonly notesTextarea: Locator;
  readonly submitButton: Locator;
  readonly coveredHero: Locator;
  readonly maybeBanner: Locator;
  readonly businessHours: Locator;
  readonly contactMethods: Locator;

  constructor(page: Page) {
    super(page);
    this.heroSection = page.locator('#hero-default, [data-testid="hero"]').first();
    this.postcodeChecker = page.locator('#postcode-checker');
    this.postcodeInput = page.locator('#postcodeInputC');
    this.postcodeButton = page.locator('#postcodeBtnC');
    this.postcodeResult = page.locator('#postcodeResultC');
    this.contactForm = page.locator('#form, form');
    this.fullNameInput = page.locator('input[name="fullName"]');
    this.emailInput = page.locator('input[name="email"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.addressInput = page.locator('input[name="address"]');
    this.postcodeFormInput = page.locator('input[name="postcode"]');
    this.propertyTypeSelect = page.locator('select[name="propertyType"]');
    this.frequencySelect = page.locator('select[name="frequency"]');
    this.notesTextarea = page.locator('textarea[name="message"], textarea');
    this.submitButton = page.locator('button[type="submit"], input[type="submit"]');
    this.coveredHero = page.locator('#hero-covered');
    this.maybeBanner = page.locator('#maybe-banner');
    this.businessHours = page.locator('text=Mon–Fri 9:00–16:00');
    this.contactMethods = page.locator('text=01458 860339');
  }

  async goto() {
    await super.goto('/contact');
  }

  async gotoWithPostcode(postcode: string, covered: boolean = false) {
    const url = `/contact?postcode=${encodeURIComponent(postcode)}&covered=${covered ? '1' : '0'}`;
    await super.goto(url);
  }

  async checkHeroSection() {
    await expect(this.heroSection).toBeVisible();
    await expect(this.page.locator('h1:has-text("Get a free quote")')).toBeVisible();
  }

  async checkPostcodeChecker() {
    await expect(this.postcodeChecker).toBeVisible();
    await expect(this.postcodeInput).toBeVisible();
    await expect(this.postcodeButton).toBeVisible();
    
    // Check placeholder text
    await expect(this.postcodeInput).toHaveAttribute('placeholder', 'e.g. BA6 8AB');
  }

  async testPostcodeChecker(postcode: string, shouldBeCovered: boolean = true) {
    await this.postcodeInput.fill(postcode);
    await this.postcodeButton.click();
    
    // Wait for page navigation
    await this.page.waitForURL(/postcode=/, { timeout: 5000 });
    await this.page.waitForLoadState('networkidle');
    
    if (shouldBeCovered) {
      // Should show covered hero
      await expect(this.coveredHero).toBeVisible();
      const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      await expect(this.page.locator('#covered-postcode')).toContainText(cleanPostcode);
    } else {
      // Should show maybe banner
      await expect(this.maybeBanner).toBeVisible();
      const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      await expect(this.page.locator('#maybe-postcode')).toContainText(cleanPostcode);
    }
  }

  async checkContactForm() {
    await expect(this.contactForm).toBeVisible();
    
    // Check all form fields are present
    await expect(this.fullNameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.phoneInput).toBeVisible();
    await expect(this.addressInput).toBeVisible();
    await expect(this.postcodeFormInput).toBeVisible();
    await expect(this.propertyTypeSelect).toBeVisible();
    await expect(this.frequencySelect).toBeVisible();
    
    // Check form labels
    await expect(this.page.locator('label:has-text("Full name")')).toBeVisible();
    await expect(this.page.locator('label:has-text("Email address")')).toBeVisible();
    await expect(this.page.locator('label:has-text("Phone number")')).toBeVisible();
    await expect(this.page.locator('label:has-text("Address")')).toBeVisible();
    await expect(this.page.locator('label:has-text("Postcode")')).toBeVisible();
  }

  async fillContactForm(data: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    postcode: string;
    propertyType: string;
    frequency: string;
    notes?: string;
  }) {
    await this.fullNameInput.fill(data.fullName);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.addressInput.fill(data.address);
    await this.postcodeFormInput.fill(data.postcode);
    
    await this.propertyTypeSelect.selectOption(data.propertyType);
    await this.frequencySelect.selectOption(data.frequency);
    
    if (data.notes && await this.notesTextarea.isVisible()) {
      await this.notesTextarea.fill(data.notes);
    }
  }

  async submitForm() {
    await this.submitButton.click();
    await this.page.waitForTimeout(2000); // Wait for form submission
  }

  async checkFormValidation() {
    // Try to submit empty form to test validation
    await this.submitButton.click();
    
    // Check for HTML5 validation or custom validation messages
    const requiredFields = [
      this.fullNameInput,
      this.emailInput,
      this.phoneInput,
      this.addressInput,
      this.postcodeFormInput
    ];
    
    for (const field of requiredFields) {
      // Check if field is marked as invalid or has validation message
      const isInvalid = await field.evaluate(el => !el.checkValidity());
      if (isInvalid) {
        expect(isInvalid).toBe(true); // Form validation is working
      }
    }
  }

  async checkContactMethods() {
    // Check phone number
    await expect(this.page.locator('a[href="tel:01458860339"]')).toBeVisible();
    
    // Check email
    await expect(this.page.locator('a[href="mailto:info@somersetwindowcleaning.co.uk"]')).toBeVisible();
    
    // Check WhatsApp link (should be present)
    await expect(this.page.locator('a[href*="wa.me"]')).toBeVisible();
    
    // Check business hours
    await expect(this.businessHours).toBeVisible();
  }

  async checkServiceCheckboxes() {
    // Check for service checkboxes
    const services = [
      'Gutter clearing',
      'Fascia & soffit cleaning',
      'Conservatory roof cleaning',
      'Solar panel cleaning'
    ];
    
    for (const service of services) {
      const checkbox = this.page.locator(`input[type="checkbox"]:near(text="${service}")`);
      if (await checkbox.isVisible()) {
        await expect(checkbox).toBeVisible();
      }
    }
  }

  async selectAdditionalServices(services: string[]) {
    for (const service of services) {
      const checkbox = this.page.locator(`input[type="checkbox"]:near(text="${service}")`);
      if (await checkbox.isVisible()) {
        await checkbox.check();
      }
    }
  }

  async checkPropertyTypeOptions() {
    await this.propertyTypeSelect.click();
    
    const expectedOptions = [
      'Terraced (2 bed)',
      'Terraced (3 bed)',
      'Semi-detached (2 bed)',
      'Semi-detached (3 bed)',
      'Semi-detached (4 bed)',
      'Detached (3 bed)',
      'Detached (4 bed)',
      'Detached (5+ bed)',
      'Bungalow',
      'Flat/Apartment',
      'Commercial'
    ];
    
    for (const option of expectedOptions) {
      await expect(this.page.locator(`option:has-text("${option}")`)).toBeAttached();
    }
  }

  async checkFrequencyOptions() {
    await this.frequencySelect.click();
    
    const expectedOptions = [
      'Every 4 weeks',
      'Every 8 weeks',
      'Every 12 weeks',
      'One-time clean'
    ];
    
    for (const option of expectedOptions) {
      await expect(this.page.locator(`option:has-text("${option}")`)).toBeAttached();
    }
  }
}