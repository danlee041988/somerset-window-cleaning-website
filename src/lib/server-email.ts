/**
 * Server-side email service
 * 
 * Secure email handling that keeps all credentials on the server
 * Never expose these credentials to the client
 */

interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  privateKey?: string;
}

interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  propertyType: string;
  frequency: string;
  additionalServices: string;
  estimatedPrice: string;
  preferredDate?: string;
  contactMethod: string;
  notes?: string;
  bookingReference: string;
  bookingDate: string;
}

// Get EmailJS config from environment variables (server-side only)
function getEmailConfig(): EmailConfig {
  const config: EmailConfig = {
    serviceId: process.env.EMAILJS_SERVICE_ID || '',
    templateId: process.env.EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || '',
    privateKey: process.env.EMAILJS_PRIVATE_KEY || ''
  };

  // Validate config
  if (!config.serviceId || !config.templateId || !config.publicKey) {
    throw new Error('EmailJS configuration missing. Please check environment variables.');
  }

  return config;
}

/**
 * Send booking confirmation email via EmailJS
 * This function should only be called from server-side code
 */
export async function sendBookingEmail(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getEmailConfig();

    // EmailJS API endpoint
    const url = 'https://api.emailjs.com/api/v1.0/email/send';

    // Prepare the request body
    const body = {
      service_id: config.serviceId,
      template_id: config.templateId,
      user_id: config.publicKey,
      template_params: {
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        customer_address: data.customerAddress,
        property_type: data.propertyType,
        frequency: data.frequency,
        additional_services: data.additionalServices,
        estimated_price: data.estimatedPrice,
        preferred_date: data.preferredDate || 'Not specified',
        contact_method: data.contactMethod,
        notes: data.notes || 'None',
        booking_reference: data.bookingReference,
        booking_date: data.bookingDate
      }
    };

    // If private key is available, use it for authentication
    if (config.privateKey) {
      body.accessToken = config.privateKey;
    }

    // Send the email
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('EmailJS API error:', errorText);
      return {
        success: false,
        error: `Email service error: ${response.status}`
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send booking email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Send contact form email
 */
export async function sendContactEmail(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getEmailConfig();

    const url = 'https://api.emailjs.com/api/v1.0/email/send';

    const body = {
      service_id: config.serviceId,
      template_id: process.env.EMAILJS_CONTACT_TEMPLATE_ID || config.templateId,
      user_id: config.publicKey,
      template_params: {
        from_name: data.name,
        from_email: data.email,
        from_phone: data.phone || 'Not provided',
        message: data.message,
        reply_to: data.email
      }
    };

    if (config.privateKey) {
      body.accessToken = config.privateKey;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('EmailJS API error:', errorText);
      return {
        success: false,
        error: `Email service error: ${response.status}`
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send contact email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generate booking reference
 */
export function generateBookingReference(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SWC${year}${month}${day}${random}`;
}

/**
 * Format property type for display
 */
export function formatPropertyType(propertyType: string): string {
  const propertyTypeMap: Record<string, string> = {
    'semi-2': 'Semi-detached House (2 bed)',
    'semi-3': 'Semi-detached House (3 bed)',
    'semi-4': 'Semi-detached House (4 bed)',
    'semi-5': 'Semi-detached House (5 bed)',
    'detached-2': 'Detached House (2 bed)',
    'detached-3': 'Detached House (3 bed)',
    'detached-4': 'Detached House (4 bed)',
    'detached-5': 'Detached House (5 bed)',
    'custom': 'Large Property (6+ bed)',
    'commercial': 'Commercial Property',
    'general': 'General Enquiry'
  };
  return propertyTypeMap[propertyType] || propertyType;
}

/**
 * Format frequency for display
 */
export function formatFrequency(frequency: string): string {
  const frequencyMap: Record<string, string> = {
    '4weekly': 'Every 4 Weeks',
    '8weekly': 'Every 8 Weeks',
    '12weekly': 'Every 12 Weeks',
    'onetime': 'One-time Clean'
  };
  return frequencyMap[frequency] || frequency;
}

/**
 * Format service for display
 */
export function formatService(service: string): string {
  const serviceMap: Record<string, string> = {
    'gutterInternal': 'Gutter Clearing (Internal)',
    'gutterExternal': 'Gutter, Fascia & Soffit Cleaning',
    'solar': 'Solar Panel Cleaning',
    'conservatory': 'Conservatory Roof Cleaning'
  };
  return serviceMap[service] || service;
}