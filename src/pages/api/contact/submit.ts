import type { APIRoute } from 'astro';
import { z } from 'zod';
import nodemailer from 'nodemailer';

// Input validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + 15 * 60 * 1000 // 15 minutes
    });
    return true;
  }
  
  if (limit.count >= 3) { // Lower limit for contact form
    return false;
  }
  
  limit.count++;
  return true;
}

// Sanitize input
function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Create email transporter
function createTransporter() {
  // Check if we have email configuration
  const emailConfig = {
    host: import.meta.env.SMTP_HOST,
    port: parseInt(import.meta.env.SMTP_PORT || '587'),
    secure: import.meta.env.SMTP_PORT === '465',
    auth: {
      user: import.meta.env.SMTP_USER,
      pass: import.meta.env.SMTP_PASS,
    }
  };

  // If SMTP not configured, use EmailJS fallback (for development)
  if (!emailConfig.host || !emailConfig.auth.user) {
    return null;
  }

  return nodemailer.createTransporter(emailConfig);
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Check rate limit
  const ip = clientAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ 
      error: 'Too many requests. Please try again later.' 
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '900'
      }
    });
  }

  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validatedData = contactSchema.parse(body);
    
    // Sanitize text inputs
    const sanitizedData = {
      name: sanitizeInput(validatedData.name),
      email: validatedData.email, // Email already validated
      phone: validatedData.phone ? sanitizeInput(validatedData.phone) : undefined,
      message: sanitizeInput(validatedData.message),
    };

    // Store in database if Supabase is configured
    const supabaseUrl = import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY || import.meta.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          name: sanitizedData.name,
          email: sanitizedData.email,
          phone: sanitizedData.phone,
          message: sanitizedData.message,
          created_at: new Date().toISOString(),
          status: 'unread',
          source: 'website'
        }]);

      if (error) {
        console.error('Database error:', error);
        // Continue even if database fails
      }
    }

    // Send email
    const transporter = createTransporter();
    
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Somerset Window Cleaning Website" <${import.meta.env.SMTP_USER}>`,
          to: import.meta.env.CONTACT_EMAIL || 'info@somersetwindowcleaning.co.uk',
          replyTo: sanitizedData.email,
          subject: `New Contact Form Submission from ${sanitizedData.name}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #555; }
                .value { margin-top: 5px; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>New Contact Form Submission</h2>
                </div>
                <div class="content">
                  <div class="field">
                    <div class="label">Name:</div>
                    <div class="value">${sanitizedData.name}</div>
                  </div>
                  <div class="field">
                    <div class="label">Email:</div>
                    <div class="value"><a href="mailto:${sanitizedData.email}">${sanitizedData.email}</a></div>
                  </div>
                  ${sanitizedData.phone ? `
                    <div class="field">
                      <div class="label">Phone:</div>
                      <div class="value"><a href="tel:${sanitizedData.phone}">${sanitizedData.phone}</a></div>
                    </div>
                  ` : ''}
                  <div class="field">
                    <div class="label">Message:</div>
                    <div class="value">${sanitizedData.message.replace(/\n/g, '<br>')}</div>
                  </div>
                </div>
                <div class="footer">
                  <p>This email was sent from the Somerset Window Cleaning website contact form.</p>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `
New Contact Form Submission

Name: ${sanitizedData.name}
Email: ${sanitizedData.email}
${sanitizedData.phone ? `Phone: ${sanitizedData.phone}` : ''}
Message:
${sanitizedData.message}

---
This email was sent from the Somerset Window Cleaning website contact form.
          `
        });

        // Send auto-reply to customer
        await transporter.sendMail({
          from: `"Somerset Window Cleaning" <${import.meta.env.SMTP_USER}>`,
          to: sanitizedData.email,
          subject: 'Thank you for contacting Somerset Window Cleaning',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Thank You for Contacting Us</h2>
                </div>
                <div class="content">
                  <p>Dear ${sanitizedData.name},</p>
                  <p>Thank you for contacting Somerset Window Cleaning. We've received your message and will get back to you within 24 hours.</p>
                  <p>If your enquiry is urgent, please feel free to call us on <strong>01458 860339</strong>.</p>
                  <p>Best regards,<br>The Somerset Window Cleaning Team</p>
                </div>
                <div class="footer">
                  <p>Somerset Window Cleaning<br>
                  13 Rockhaven Business Centre, Gravenchon Way, Street, Somerset BA16 0HW<br>
                  Tel: 01458 860339</p>
                </div>
              </div>
            </body>
            </html>
          `
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Still return success to user
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Thank you for your message. We\'ll be in touch within 24 hours!'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '3',
        'X-RateLimit-Remaining': String(3 - (rateLimitMap.get(ip)?.count || 0)),
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        error: 'Please check your input',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send message. Please try again or call us directly.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// OPTIONS handler for CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }
  });
};