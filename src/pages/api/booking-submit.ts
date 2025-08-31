import type { APIRoute } from 'astro';
import { sanitizeBookingForm } from '~/lib/sanitizer';
import { validateBookingForm, isFormValid } from '~/lib/validation';
import { 
  sendBookingEmail, 
  generateBookingReference, 
  formatPropertyType, 
  formatFrequency, 
  formatService 
} from '~/lib/server-email';

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
    
    // Generate booking reference
    const bookingReference = generateBookingReference();
    const bookingDate = new Date().toLocaleString('en-GB');
    
    // Prepare email data
    const emailData = {
      customerName: sanitizedData.fullName || sanitizedData.name || '',
      customerEmail: sanitizedData.email || '',
      customerPhone: sanitizedData.phone || '',
      customerAddress: `${sanitizedData.address || ''}, ${sanitizedData.city || ''}, ${sanitizedData.postcode || ''}`.trim(),
      propertyType: formatPropertyType(sanitizedData.propertyType || ''),
      frequency: formatFrequency(sanitizedData.frequency || ''),
      additionalServices: (sanitizedData.additionalServices || [])
        .map((s: string) => formatService(s))
        .join(', ') || 'None',
      estimatedPrice: sanitizedData.estimatedPrice ? `£${sanitizedData.estimatedPrice}` : 'Quote Required',
      preferredDate: sanitizedData.preferredDate || undefined,
      contactMethod: sanitizedData.contactMethod || 'email',
      notes: sanitizedData.notes,
      bookingReference,
      bookingDate
    };
    
    // Send email notification
    const emailResult = await sendBookingEmail(emailData);
    
    if (!emailResult.success) {
      console.error('Failed to send booking email:', emailResult.error);
      // Still save the booking even if email fails
    }
    
    // Log booking request
    console.log('New booking request:', {
      reference: bookingReference,
      customer: sanitizedData.email,
      ip: clientAddress,
      timestamp: new Date().toISOString(),
      emailSent: emailResult.success
    });
    
    // TODO: Save to Supabase database here
    
    return new Response(JSON.stringify({ 
      success: true,
      reference: bookingReference,
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