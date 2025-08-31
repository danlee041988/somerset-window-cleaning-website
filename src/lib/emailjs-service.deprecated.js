// EmailJS integration for Somerset Window Cleaning
// DEPRECATED: This file exposes sensitive credentials in client code
// Use /src/lib/secure-booking-service.js instead for secure server-side handling

// EmailJS configuration - will be loaded from environment variables
// WARNING: These credentials should NOT be exposed in client-side code
const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.PUBLIC_EMAILJS_SERVICE_ID || 'service_9lcbgop',
  TEMPLATE_ID: import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID || 'template_booking',
  PUBLIC_KEY: import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY || '__gzsbn4ENCZhFT0z8zV9'
};

// Load EmailJS SDK
let emailjsLoaded = false;

export async function loadEmailJS() {
  if (emailjsLoaded) return true;
  
  try {
    // Check if EmailJS is already loaded
    if (window.emailjs) {
      emailjsLoaded = true;
      return true;
    }
    
    // Load EmailJS SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.async = true;
    
    return new Promise((resolve, reject) => {
      script.onload = () => {
        if (window.emailjs) {
          window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
          emailjsLoaded = true;
          console.log('EmailJS initialized successfully');
          resolve(true);
        } else {
          reject(new Error('EmailJS failed to load'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load EmailJS script'));
      };
      
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('Error loading EmailJS:', error);
    return false;
  }
}

export async function sendBookingEmail(formData) {
  try {
    // Ensure EmailJS is loaded
    await loadEmailJS();
    
    // Prepare template parameters
    const templateParams = {
      // Customer Information
      customer_name: formData.fullName,
      customer_email: formData.email,
      customer_phone: formData.phone,
      customer_address: `${formData.address}, ${formData.city}, ${formData.postcode}`,
      
      // Service Details
      property_type: getPropertyTypeText(formData.propertyType),
      frequency: getFrequencyText(formData.frequency),
      additional_services: formData.additionalServices.map(s => getServiceText(s)).join(', ') || 'None',
      
      // Pricing
      estimated_price: formData.estimatedPrice ? `£${formData.estimatedPrice}` : 'Quote Required',
      
      // Other Details
      preferred_date: formData.preferredDate || 'Not specified',
      contact_method: formData.contactMethod,
      notes: formData.notes || 'None',
      
      // Booking Reference
      booking_reference: generateBookingReference(),
      booking_date: new Date().toLocaleString('en-GB')
    };
    
    // Send email via EmailJS
    const response = await window.emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );
    
    console.log('Email sent successfully:', response);
    return {
      success: true,
      reference: templateParams.booking_reference,
      messageId: response.text
    };
    
  } catch (error) {
    console.error('Failed to send booking email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
}

// Helper function to generate booking reference
function generateBookingReference() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SWC${year}${month}${day}${random}`;
}

// Helper functions for formatting
function getPropertyTypeText(propertyType) {
  const propertyTypeMap = {
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

function getFrequencyText(frequency) {
  const frequencyMap = {
    '4weekly': 'Every 4 Weeks',
    '8weekly': 'Every 8 Weeks',
    '12weekly': 'Every 12 Weeks',
    'onetime': 'One-time Clean'
  };
  return frequencyMap[frequency] || frequency;
}

function getServiceText(service) {
  const serviceMap = {
    'gutterInternal': 'Gutter Clearing (Internal)',
    'gutterExternal': 'Gutter, Fascia & Soffit Cleaning',
    'solar': 'Solar Panel Cleaning',
    'conservatory': 'Conservatory Roof Cleaning'
  };
  return serviceMap[service] || service;
}

export default { loadEmailJS, sendBookingEmail };