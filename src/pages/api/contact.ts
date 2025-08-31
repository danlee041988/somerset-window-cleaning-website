import type { APIRoute } from 'astro';
import { sanitizeText, sanitizeEmail, sanitizePhone } from '~/lib/sanitizer';
import { validateEmail, validatePhone } from '~/lib/validation';
import { sendContactEmail } from '~/lib/server-email';

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
    if (rawData.website || rawData.url || rawData.company) {
      // Bot detected - return success to fool them
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Sanitize input data
    const sanitizedData = {
      name: sanitizeText(rawData.name || '', 100),
      email: sanitizeEmail(rawData.email || ''),
      phone: sanitizePhone(rawData.phone || ''),
      message: sanitizeText(rawData.message || '', 1000)
    };
    
    // Validate required fields
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.message) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        details: {
          name: !sanitizedData.name ? 'Name is required' : null,
          email: !sanitizedData.email ? 'Email is required' : null,
          message: !sanitizedData.message ? 'Message is required' : null
        }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate email
    if (!validateEmail(sanitizedData.email)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid email address'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate phone if provided
    if (sanitizedData.phone && !validatePhone(sanitizedData.phone)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid phone number'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Send email notification
    const emailResult = await sendContactEmail(sanitizedData);
    
    if (!emailResult.success) {
      console.error('Failed to send contact email:', emailResult.error);
      return new Response(JSON.stringify({ 
        error: 'Failed to send message. Please try again or call us directly.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Log contact request
    console.log('New contact form submission:', {
      from: sanitizedData.email,
      ip: clientAddress,
      timestamp: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Thank you for your message. We\'ll get back to you within 24 hours.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'An error occurred processing your request' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};