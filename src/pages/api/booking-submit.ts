import type { APIRoute } from 'astro';
import { sanitizeBookingForm } from '~/lib/sanitizer';
import { validateBookingForm, isFormValid } from '~/lib/validation';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Invalid content type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse request body
    const rawData = await request.json();
    
    // Check honeypot field
    if (rawData.website) {
      // Bot detected - return success to fool them
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Sanitize input data
    const sanitizedData = sanitizeBookingForm(rawData);
    
    // Validate sanitized data
    const validation = validateBookingForm(sanitizedData);
    if (!isFormValid(validation)) {
      return new Response(JSON.stringify({ 
        error: 'Validation failed',
        details: validation 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Here you would typically:
    // 1. Save to database (Supabase)
    // 2. Send email notifications
    // 3. Create a booking record
    
    // For now, just log and return success
    console.log('New booking request:', {
      ...sanitizedData,
      ip: clientAddress,
      timestamp: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Booking request received. We\'ll contact you within 1 hour.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Booking submission error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'An error occurred processing your request' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};