import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Input validation schema
const bookingSchema = z.object({
  propertyType: z.string().min(1, 'Property type is required'),
  frequency: z.enum(['4weekly', '8weekly', '12weekly', 'onetime']),
  additionalServices: z.array(z.string()).optional().default([]),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address is required').max(500),
  city: z.string().min(2, 'City is required').max(100),
  postcode: z.string().regex(/^[A-Za-z]{1,2}[0-9]{1,2}[A-Za-z]?\s?[0-9][A-Za-z]{2}$/, 'Invalid UK postcode'),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number').min(10).max(20),
  contactMethod: z.enum(['email', 'phone', 'text']),
  preferredDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
  specialOffer: z.string().optional(),
});

// Rate limiting map (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + 15 * 60 * 1000 // 15 minutes
    });
    return true;
  }
  
  if (limit.count >= 5) {
    return false; // Rate limit exceeded
  }
  
  limit.count++;
  return true;
}

// Sanitize input to prevent XSS
function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
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
        'Retry-After': '900' // 15 minutes
      }
    });
  }

  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validatedData = bookingSchema.parse(body);
    
    // Sanitize text inputs
    const sanitizedData = {
      ...validatedData,
      fullName: sanitizeInput(validatedData.fullName),
      address: sanitizeInput(validatedData.address),
      city: sanitizeInput(validatedData.city),
      notes: validatedData.notes ? sanitizeInput(validatedData.notes) : undefined,
    };

    // Get Supabase credentials from environment
    const supabaseUrl = import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return new Response(JSON.stringify({ 
        error: 'Service temporarily unavailable. Please try again later.' 
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Calculate base price (simplified - should match frontend logic)
    const propertyPrices: Record<string, number> = {
      'detached-2': 25,
      'detached-3': 30,
      'detached-4': 35,
      'detached-5': 40,
      'semi-2': 20,
      'semi-3': 25,
      'semi-4': 28,
      'semi-5': 32,
      'terrace-2': 18,
      'terrace-3': 22,
      'terrace-4': 26,
      'terrace-5': 30,
      'flat-2': 15,
      'flat-3': 20,
      'flat-4': 25,
      'flat-5': 30,
    };

    const frequencyAdjustments: Record<string, number> = {
      '4weekly': 0,
      '8weekly': 3,
      '12weekly': 5,
      'onetime': 20
    };

    const basePrice = propertyPrices[sanitizedData.propertyType] || 0;
    const adjustment = frequencyAdjustments[sanitizedData.frequency] || 0;
    const estimatedPrice = basePrice + adjustment;

    // Prepare booking data
    const bookingData = {
      property_type: sanitizedData.propertyType,
      frequency: sanitizedData.frequency,
      additional_services: sanitizedData.additionalServices,
      full_name: sanitizedData.fullName,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      address: sanitizedData.address,
      city: sanitizedData.city,
      postcode: sanitizedData.postcode,
      contact_method: sanitizedData.contactMethod,
      preferred_date: sanitizedData.preferredDate,
      notes: sanitizedData.notes,
      special_offer: sanitizedData.specialOffer,
      estimated_price: estimatedPrice,
      status: 'pending',
      created_at: new Date().toISOString(),
      source: 'website',
    };

    // Insert booking into database (using the new simplified table)
    const { data, error } = await supabase
      .from('bookings_simple')
      .insert([bookingData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to create booking. Please try again later.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send confirmation email (would implement email service here)
    // For now, we'll skip this and rely on the database entry

    return new Response(JSON.stringify({ 
      success: true,
      bookingId: data.id,
      message: 'Your booking has been received! We\'ll contact you within 24 hours to confirm.',
      estimatedPrice: estimatedPrice > 0 ? `£${estimatedPrice}` : 'Quote required'
    }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': String(5 - (rateLimitMap.get(ip)?.count || 0)),
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        error: 'Invalid input data',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred. Please try again.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// OPTIONS handler for CORS preflight
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