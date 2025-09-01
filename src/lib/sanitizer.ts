/**
 * Input Sanitization Library
 * 
 * Provides comprehensive sanitization functions for user inputs
 * to prevent XSS, SQL injection, and other security vulnerabilities
 */

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Remove all HTML tags from a string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize general text input
 * - Removes HTML tags
 * - Trims whitespace
 * - Limits length
 */
export function sanitizeText(input: string, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  
  return stripHtml(input)
    .trim()
    .substring(0, maxLength);
}

/**
 * Sanitize email addresses
 * - Validates format
 * - Converts to lowercase
 * - Removes dangerous characters
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  // Basic email regex - not perfect but good enough for sanitization
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  const cleaned = email
    .toLowerCase()
    .trim()
    .replace(/[<>]/g, ''); // Remove angle brackets
  
  return emailRegex.test(cleaned) ? cleaned : '';
}

/**
 * Sanitize phone numbers
 * - Removes all non-numeric characters except + and spaces
 * - Validates length
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';
  
  // Keep only numbers, +, and spaces
  const cleaned = phone.replace(/[^\d+\s]/g, '').trim();
  
  // Check if it's a reasonable phone number length (7-15 digits)
  const digitCount = cleaned.replace(/\D/g, '').length;
  if (digitCount < 7 || digitCount > 15) {
    return '';
  }
  
  return cleaned;
}

/**
 * Sanitize URLs
 * - Validates protocol
 * - Prevents javascript: and data: URLs
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';
  
  const trimmed = url.trim();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = trimmed.toLowerCase();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '';
    }
  }
  
  // Ensure URL starts with http:// or https:// if no protocol
  if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('/')) {
    return 'https://' + trimmed;
  }
  
  return trimmed;
}

/**
 * Sanitize postcode (UK format)
 */
export function sanitizePostcode(postcode: string): string {
  if (typeof postcode !== 'string') return '';
  
  // Remove all non-alphanumeric characters and convert to uppercase
  const cleaned = postcode
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .substring(0, 8); // UK postcodes are max 7 chars without spaces
  
  // Normalize to standard UK postcode format (e.g., "SW1A 1AA")
  if (cleaned.length >= 5) {
    return cleaned.slice(0, -3) + ' ' + cleaned.slice(-3);
  }
  
  return cleaned;
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number): number {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  return isNaN(num) ? 0 : num;
}

/**
 * Sanitize form data object
 * Applies appropriate sanitization to each field
 */
export interface SanitizeOptions {
  stripHtml?: boolean;
  maxLength?: number;
  allowedFields?: string[];
}

export function sanitizeFormData<T extends Record<string, any>>(
  data: T,
  options: SanitizeOptions = {}
): Partial<T> {
  const {
    stripHtml: shouldStripHtml = true,
    maxLength = 500,
    allowedFields = []
  } = options;
  
  const sanitized: Partial<T> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Skip fields not in allowedFields if specified
    if (allowedFields.length > 0 && !allowedFields.includes(key)) {
      continue;
    }
    
    // Skip honeypot fields
    if (key === 'website' || key === 'url' || key.includes('honeypot')) {
      continue;
    }
    
    // Apply field-specific sanitization
    switch (key) {
      case 'email':
        sanitized[key as keyof T] = sanitizeEmail(value) as T[keyof T];
        break;
        
      case 'phone':
      case 'tel':
      case 'mobile':
        sanitized[key as keyof T] = sanitizePhone(value) as T[keyof T];
        break;
        
      case 'postcode':
      case 'zip':
        sanitized[key as keyof T] = sanitizePostcode(value) as T[keyof T];
        break;
        
      case 'website':
      case 'url':
        sanitized[key as keyof T] = sanitizeUrl(value) as T[keyof T];
        break;
        
      default:
        if (typeof value === 'string') {
          sanitized[key as keyof T] = (shouldStripHtml 
            ? sanitizeText(value, maxLength) 
            : escapeHtml(value)) as T[keyof T];
        } else if (typeof value === 'number') {
          sanitized[key as keyof T] = sanitizeNumber(value) as T[keyof T];
        } else if (Array.isArray(value)) {
          // Sanitize array elements
          sanitized[key as keyof T] = value.map(item => 
            typeof item === 'string' ? sanitizeText(item, maxLength) : item
          ) as T[keyof T];
        } else {
          // For other types, pass through
          sanitized[key as keyof T] = value;
        }
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize booking form data specifically
 */
export interface BookingFormData {
  propertyType?: string;
  bedrooms?: string;
  frequency?: string;
  services?: string[];
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  postcode?: string;
  message?: string;
}

export function sanitizeBookingForm(data: BookingFormData): BookingFormData {
  return {
    propertyType: sanitizeText(data.propertyType || '', 50),
    bedrooms: sanitizeText(data.bedrooms || '', 20),
    frequency: sanitizeText(data.frequency || '', 50),
    services: data.services?.map(s => sanitizeText(s, 50)) || [],
    firstName: sanitizeText(data.firstName || '', 100),
    lastName: sanitizeText(data.lastName || '', 100),
    email: sanitizeEmail(data.email || ''),
    phone: sanitizePhone(data.phone || ''),
    postcode: sanitizePostcode(data.postcode || ''),
    message: sanitizeText(data.message || '', 1000)
  };
}