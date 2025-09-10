import { test, expect } from '@playwright/test';
import { ContactPage } from '../pages/contact-page';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Contact Form Tests', () => {
  test('should display contact form correctly', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    await contactPage.checkContactForm();
    await contactPage.checkContactMethods();
    await TestHelpers.checkNoConsoleErrors(page);
  });

  test('should have all required form fields', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Check all form inputs are present and have correct types
    await expect(contactPage.fullNameInput).toBeVisible();
    await expect(contactPage.fullNameInput).toHaveAttribute('type', 'text');
    
    await expect(contactPage.emailInput).toBeVisible();
    await expect(contactPage.emailInput).toHaveAttribute('type', 'email');
    
    await expect(contactPage.phoneInput).toBeVisible();
    await expect(contactPage.phoneInput).toHaveAttribute('type', 'tel');
    
    await expect(contactPage.addressInput).toBeVisible();
    await expect(contactPage.postcodeFormInput).toBeVisible();
    
    // Check select options
    await contactPage.checkPropertyTypeOptions();
    await contactPage.checkFrequencyOptions();
  });

  test('should validate required fields', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    await contactPage.checkFormValidation();
  });

  test('should fill and submit contact form', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    const testData = {
      fullName: 'John Smith',
      email: 'john.smith@example.com',
      phone: '07123456789',
      address: '123 Test Street, Test Town',
      postcode: 'BA6 8AB',
      propertyType: 'Semi-detached (3 bed)',
      frequency: 'Every 4 weeks',
      notes: 'Please include gutter cleaning'
    };
    
    await contactPage.fillContactForm(testData);
    
    // Verify form is filled correctly
    await expect(contactPage.fullNameInput).toHaveValue(testData.fullName);
    await expect(contactPage.emailInput).toHaveValue(testData.email);
    await expect(contactPage.phoneInput).toHaveValue(testData.phone);
    await expect(contactPage.addressInput).toHaveValue(testData.address);
    await expect(contactPage.postcodeFormInput).toHaveValue(testData.postcode);
    
    // Check selected options
    await expect(contactPage.propertyTypeSelect).toHaveValue(testData.propertyType);
    await expect(contactPage.frequencySelect).toHaveValue(testData.frequency);
    
    // Note: We don't actually submit in tests to avoid sending test data
    // await contactPage.submitForm();
  });

  test('should handle email validation', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Test invalid email
    await contactPage.emailInput.fill('invalid-email');
    await contactPage.submitButton.click();
    
    // Should show validation error
    const isInvalid = await contactPage.emailInput.evaluate(el => !el.checkValidity());
    expect(isInvalid).toBe(true);
    
    // Test valid email
    await contactPage.emailInput.fill('valid@example.com');
    const isValid = await contactPage.emailInput.evaluate(el => el.checkValidity());
    expect(isValid).toBe(true);
  });

  test('should check additional services', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    await contactPage.checkServiceCheckboxes();
    
    // Test selecting additional services
    const additionalServices = [
      'Gutter clearing',
      'Conservatory roof cleaning'
    ];
    
    await contactPage.selectAdditionalServices(additionalServices);
    
    // Verify checkboxes are checked
    for (const service of additionalServices) {
      const checkbox = page.locator(`input[type="checkbox"]:near(text="${service}")`);
      if (await checkbox.isVisible()) {
        await expect(checkbox).toBeChecked();
      }
    }
  });

  test('should display business information', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Check business hours are displayed
    await expect(contactPage.businessHours).toBeVisible();
    
    // Check contact methods are available
    await expect(page.locator('a[href="tel:01458860339"]')).toBeVisible();
    await expect(page.locator('a[href="mailto:info@somersetwindowcleaning.co.uk"]')).toBeVisible();
    
    // Check WhatsApp link
    const whatsappLink = page.locator('a[href*="wa.me"]');
    if (await whatsappLink.isVisible()) {
      const href = await whatsappLink.getAttribute('href');
      expect(href).toContain('447415526331');
    }
  });

  test('should handle file uploads', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Check if file input exists
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await expect(fileInput).toBeVisible();
      await expect(fileInput).toHaveAttribute('accept', 'image/*');
      await expect(fileInput).toHaveAttribute('multiple');
    }
  });

  test('should show coverage information', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Check coverage information is displayed
    await expect(page.locator('text=Somerset')).toBeVisible();
    
    // Look for postcode examples
    const postcodeText = await page.textContent('body');
    expect(postcodeText).toMatch(/BA|TA|BS|DT9/);
  });

  test('should have proper form accessibility', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Check form labels are associated with inputs
    const labels = page.locator('label');
    const labelCount = await labels.count();
    
    for (let i = 0; i < labelCount; i++) {
      const label = labels.nth(i);
      const forAttr = await label.getAttribute('for');
      const text = await label.textContent();
      
      if (forAttr) {
        // Should have corresponding input
        await expect(page.locator(`#${forAttr}`)).toBeAttached();
      } else if (text) {
        // Should contain an input or be near one
        const nearbyInput = page.locator(`input:near(label:has-text("${text}"))`);
        if (await nearbyInput.count() > 0) {
          await expect(nearbyInput.first()).toBeAttached();
        }
      }
    }
  });

  test('should handle form submission gracefully', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Fill form with minimal valid data
    await contactPage.fillContactForm({
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '07123456789',
      address: '123 Test St',
      postcode: 'BA6 8AB',
      propertyType: 'Terraced (2 bed)',
      frequency: 'Every 4 weeks'
    });
    
    // Mock form submission to prevent actual submission
    await page.route('**/contact', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>Thank you for your enquiry!</body></html>'
      });
    });
    
    // Now test submission
    await contactPage.submitForm();
    
    // Should handle submission without errors
    await page.waitForTimeout(2000);
    await TestHelpers.checkNoConsoleErrors(page);
  });
});