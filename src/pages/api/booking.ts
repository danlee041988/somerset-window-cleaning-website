import type { APIRoute } from 'astro';
import { BookingService } from '../../lib/supabase';
import crypto from 'crypto';

// CSRF token validation
function validateCSRFToken(token: string, sessionId: string): boolean {
  const secret = import.meta.env.CSRF_SECRET || 'fallback-secret';
  const expectedToken = crypto
    .createHmac('sha256', secret)
    .update(sessionId)
    .digest('hex');
  return token === expectedToken;
}

// Server-side EmailJS implementation
async function sendEmailNotification(formData: any) {
  const serviceId = import.meta.env.EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.EMAILJS_TEMPLATE_ID;
  const privateKey = import.meta.env.EMAILJS_PRIVATE_KEY || import.meta.env.EMAILJS_PUBLIC_KEY; // Support both for migration

  if (!serviceId || !templateId || !privateKey) {
    console.error('EmailJS credentials not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: privateKey,
        template_params: {
          customer_name: formData.fullName,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_address: `${formData.address}, ${formData.city}, ${formData.postcode}`,
          property_type: formData.propertyType,
          frequency: formData.frequency,
          additional_services: formData.additionalServices?.join(', ') || 'None',
          estimated_price: formData.estimatedPrice ? `£${formData.estimatedPrice}` : 'Quote Required',
          preferred_date: formData.preferredDate || 'Not specified',
          contact_method: formData.contactMethod,
          notes: formData.notes || 'None',
          booking_reference: formData.bookingReference,
          booking_date: new Date().toLocaleString('en-GB'),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`EmailJS API error: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('EmailJS error:', error);
    return { success: false, error: error.message };
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Invalid content type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const formData = await request.json();

    // Validate CSRF token
    const csrfToken = formData.csrfToken;
    const sessionId = cookies.get('session-id')?.value || '';
    
    if (!csrfToken || !validateCSRFToken(csrfToken, sessionId)) {
      return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate required fields
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'postcode'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Phone validation (UK format)
    const phoneRegex = /^(?:(?:\+44\s?|0)(?:7\d{3}|\d{4})\s?\d{3}\s?\d{3,4})$/;
    const cleanPhone = formData.phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return new Response(JSON.stringify({ error: 'Invalid UK phone number' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate booking reference
    const bookingReference = `SWC-${Date.now().toString().slice(-6)}`;
    formData.bookingReference = bookingReference;

    // Submit to Supabase
    const bookingResult = await BookingService.submitBooking(formData);
    
    if (!bookingResult.success) {
      console.error('Booking submission failed:', bookingResult.error);
      return new Response(JSON.stringify({ error: 'Failed to submit booking' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send email notification (server-side)
    const emailResult = await sendEmailNotification(formData);
    
    if (!emailResult.success) {
      console.warn('Email notification failed:', emailResult.error);
      // Don't fail the booking if email fails
    }

    return new Response(JSON.stringify({
      success: true,
      bookingReference: bookingReference,
      message: 'Booking submitted successfully',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Booking API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Generate CSRF token endpoint
export const GET: APIRoute = async ({ cookies }) => {
  const sessionId = cookies.get('session-id')?.value || crypto.randomBytes(16).toString('hex');
  
  // Set session cookie if not exists
  if (!cookies.get('session-id')) {
    cookies.set('session-id', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  const secret = import.meta.env.CSRF_SECRET || 'fallback-secret';
  const csrfToken = crypto
    .createHmac('sha256', secret)
    .update(sessionId)
    .digest('hex');

  return new Response(JSON.stringify({ csrfToken }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};