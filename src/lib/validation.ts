/**
 * Input Validation Library
 * 
 * Provides validation functions to ensure data integrity
 * Works alongside sanitizer.ts for comprehensive input handling
 */

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
}

/**
 * UK phone number validation
 */
export function validatePhone(phone: string): ValidationResult {
  // Remove spaces and dashes for validation
  const cleaned = phone.replace(/[\s-]/g, '');
  
  if (!cleaned) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // UK phone number patterns
  const ukPhoneRegex = /^(\+44|0)[1-9]\d{9,10}$/;
  
  if (!ukPhoneRegex.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid UK phone number' };
  }
  
  return { isValid: true };
}

/**
 * Normalize UK postcode to standard format
 */
export function normalizePostcode(postcode: string): string {
  if (!postcode) return '';
  
  // Remove all spaces and convert to uppercase
  const cleaned = postcode.replace(/\s/g, '').toUpperCase();
  
  // Insert space before the last 3 characters (standard UK postcode format)
  if (cleaned.length >= 5) {
    return cleaned.slice(0, -3) + ' ' + cleaned.slice(-3);
  }
  
  return cleaned;
}

/**
 * UK postcode validation
 */
export function validatePostcode(postcode: string): ValidationResult {
  if (!postcode) {
    return { isValid: false, error: 'Postcode is required' };
  }
  
  // UK postcode regex (comprehensive)
  const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
  
  if (!postcodeRegex.test(postcode.trim())) {
    return { isValid: false, error: 'Please enter a valid UK postcode' };
  }
  
  return { isValid: true };
}

/**
 * Name validation (first/last name)
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: `${fieldName} must be less than 50 characters` };
  }
  
  // Check for invalid characters (numbers, special chars except apostrophe and hyphen)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }
  
  return { isValid: true };
}

/**
 * Message/text area validation
 */
export function validateMessage(message: string, minLength: number = 10, maxLength: number = 1000): ValidationResult {
  if (!message || message.trim().length === 0) {
    return { isValid: false, error: 'Message is required' };
  }
  
  if (message.trim().length < minLength) {
    return { isValid: false, error: `Message must be at least ${minLength} characters` };
  }
  
  if (message.trim().length > maxLength) {
    return { isValid: false, error: `Message must be less than ${maxLength} characters` };
  }
  
  return { isValid: true };
}

/**
 * Service selection validation
 */
export function validateServices(services: string[]): ValidationResult {
  if (!services || services.length === 0) {
    return { isValid: false, error: 'Please select at least one service' };
  }
  
  return { isValid: true };
}

/**
 * Property type validation
 */
export function validatePropertyType(propertyType: string): ValidationResult {
  const validTypes = ['house', 'flat', 'bungalow', 'commercial'];
  
  if (!propertyType) {
    return { isValid: false, error: 'Please select a property type' };
  }
  
  if (!validTypes.includes(propertyType)) {
    return { isValid: false, error: 'Please select a valid property type' };
  }
  
  return { isValid: true };
}

/**
 * Booking form validation
 */
export interface BookingFormValidation {
  propertyType: ValidationResult;
  bedrooms: ValidationResult;
  frequency: ValidationResult;
  services: ValidationResult;
  firstName: ValidationResult;
  lastName: ValidationResult;
  email: ValidationResult;
  phone: ValidationResult;
  postcode: ValidationResult;
  message?: ValidationResult;
}

export function validateBookingForm(data: Record<string, any>): BookingFormValidation {
  return {
    propertyType: validatePropertyType(data.propertyType),
    bedrooms: data.bedrooms ? { isValid: true } : { isValid: false, error: 'Please select number of bedrooms' },
    frequency: data.frequency ? { isValid: true } : { isValid: false, error: 'Please select cleaning frequency' },
    services: validateServices(data.services || []),
    firstName: validateName(data.firstName, 'First name'),
    lastName: validateName(data.lastName, 'Last name'),
    email: validateEmail(data.email),
    phone: validatePhone(data.phone),
    postcode: validatePostcode(data.postcode),
    message: data.message ? validateMessage(data.message, 0, 1000) : { isValid: true }
  };
}

/**
 * Check if all validations passed
 */
export function isFormValid(validation: Record<string, ValidationResult>): boolean {
  return Object.values(validation).every(result => result.isValid);
}

/**
 * Get all error messages from validation
 */
export function getValidationErrors(validation: Record<string, ValidationResult>): string[] {
  return Object.values(validation)
    .filter(result => !result.isValid && result.error)
    .map(result => result.error!);
}

/**
 * Custom validation rules for specific Somerset Window Cleaning postcodes
 */
export function validateServiceArea(postcode: string): ValidationResult {
  const supportedPostcodes = [
    'BS21', 'BS23', 'BS24', 'BS25', 'BS26', 'BS27', 'BS28', 'BS29', 'BS39', 'BS40', 'BS49',
    'BA3', 'BA4', 'BA5', 'BA6', 'BA7', 'BA8', 'BA9', 'BA10', 'BA11', 'BA16', 'BA20', 'BA21', 'BA22',
    'TA2', 'TA6', 'TA7', 'TA8', 'TA9', 'TA10', 'TA11', 'TA12', 'TA13', 'TA14', 'TA18', 'TA19', 'TA20',
    'DT9'
  ];
  
  const postcodeValidation = validatePostcode(postcode);
  if (!postcodeValidation.isValid) {
    return postcodeValidation;
  }
  
  // Extract postcode prefix
  const prefix = postcode.toUpperCase().replace(/\s/g, '').match(/^[A-Z]{1,2}\d{1,2}/)?.[0];
  
  if (!prefix || !supportedPostcodes.includes(prefix)) {
    return { 
      isValid: false, 
      error: 'Sorry, we don\'t currently service this postcode area' 
    };
  }
  
  return { isValid: true };
}