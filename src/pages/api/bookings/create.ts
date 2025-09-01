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
  preferredDate: z.string().nullable().optional(),
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
  console.log('=== BOOKING API DEBUG START ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Client IP:', clientAddress);
  console.log('Request Method:', request.method);
  console.log('Request URL:', request.url);
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  
  // CORS headers for same-origin requests
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  // Validate environment variables first
  const supabaseUrl = import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Environment Check:');
  console.log('- Supabase URL exists:', !!supabaseUrl);
  console.log('- Supabase Key exists:', !!supabaseKey);
  console.log('- Supabase URL:', supabaseUrl?.substring(0, 30) + '...');
  console.log('- Key type:', supabaseKey?.startsWith('eyJ') ? 'JWT Token' : 'Unknown');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Missing Supabase credentials');
    return new Response(JSON.stringify({ 
      error: 'Service configuration error. Please contact support.',
      debug: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      }
    }), {
      status: 503,
      headers
    });
  }
  
  // Check rate limit
  const ip = clientAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    console.log('Rate limit exceeded for IP:', ip);
    return new Response(JSON.stringify({ 
      error: 'Too many requests. Please try again later.' 
    }), {
      status: 429,
      headers: {
        ...headers,
        'Retry-After': '900' // 15 minutes
      }
    });
  }

  try {
    // Parse request body
    console.log('Parsing request body...');
    let body;
    try {
      body = await request.json();
      console.log('Request body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid request format' 
      }), {
        status: 400,
        headers
      });
    }
    
    // Log data types for debugging
    console.log('Data type check:');
    console.log('- additionalServices type:', typeof body.additionalServices, Array.isArray(body.additionalServices));
    console.log('- additionalServices value:', body.additionalServices);
    console.log('- specialOffer type:', typeof body.specialOffer);
    console.log('- specialOffer value:', body.specialOffer);
    console.log('- propertyType:', body.propertyType);
    console.log('- bedrooms:', body.bedrooms);
    
    // Handle book-now page format where propertyType includes bedrooms (e.g., "detached-3")
    if (body.propertyType && body.propertyType.includes('-') && !body.bedrooms) {
      const parts = body.propertyType.split('-');
      const propertyStyle = parts[0]; // e.g., "detached", "semi", "terrace"
      const bedroomNumber = parts[1]; // e.g., "3"
      
      // Convert to the expected format
      body.propertyType = `${propertyStyle}-${bedroomNumber}`;
      console.log('Converted propertyType to:', body.propertyType);
    } else if (body.propertyType === 'detached' && body.bedrooms) {
      // Handle booking.astro format with separate fields
      body.propertyType = `detached-${body.bedrooms}`;
    } else if (body.propertyType === 'semi' && body.bedrooms) {
      body.propertyType = `semi-${body.bedrooms}`;
    } else if (body.propertyType === 'terrace' && body.bedrooms) {
      body.propertyType = `terrace-${body.bedrooms}`;
    }
    
    // Ensure additionalServices is an array
    if (body.additionalServices && !Array.isArray(body.additionalServices)) {
      console.log('Converting additionalServices to array');
      body.additionalServices = [];
    }
    
    // Ensure specialOffer is a string
    if (body.specialOffer === null || body.specialOffer === undefined) {
      console.log('Converting specialOffer to empty string');
      body.specialOffer = '';
    }
    
    // Validate input
    console.log('Validating input with Zod schema...');
    let validatedData;
    try {
      validatedData = bookingSchema.parse(body);
      console.log('Validation successful');
    } catch (validationError) {
      console.error('Validation failed:', validationError);
      throw validationError;
    }
    
    // Sanitize text inputs
    const sanitizedData = {
      ...validatedData,
      fullName: sanitizeInput(validatedData.fullName),
      address: sanitizeInput(validatedData.address),
      city: sanitizeInput(validatedData.city),
      notes: validatedData.notes ? sanitizeInput(validatedData.notes) : undefined,
    };

    // Create Supabase client
    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test Supabase connection
    console.log('Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('bookings_simple')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Supabase connection test failed:', {
        message: testError.message,
        code: testError.code,
        details: testError.details,
        hint: testError.hint
      });
      
      // Check if table exists
      if (testError.code === '42P01') {
        console.error('Table "bookings_simple" does not exist in Supabase');
        return new Response(JSON.stringify({ 
          error: 'Database table not configured. Please contact support.',
          debug: {
            code: 'TABLE_NOT_FOUND',
            table: 'bookings_simple'
          }
        }), {
          status: 503,
          headers
        });
      }
    } else {
      console.log('Supabase connection successful');
    }
    
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
      'terrace-2': 20,
      'terrace-3': 25,
      'terrace-4': 28,
      'terrace-5': 32,
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
      additional_services: sanitizedData.additionalServices || [],
      full_name: sanitizedData.fullName,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      address: sanitizedData.address,
      city: sanitizedData.city,
      postcode: sanitizedData.postcode,
      contact_method: sanitizedData.contactMethod,
      preferred_date: sanitizedData.preferredDate || null,
      notes: sanitizedData.notes || '',
      special_offer: sanitizedData.specialOffer || '',
      estimated_price: estimatedPrice,
      status: 'pending',
      created_at: new Date().toISOString(),
      source: 'website',
    };
    
    console.log('Booking data to insert:', JSON.stringify(bookingData, null, 2));

    // Insert booking into database (using the new simplified table)
    console.log('Inserting booking into database...');
    const { data, error } = await supabase
      .from('bookings_simple')
      .insert([bookingData])
      .select()
      .single();

    if (error) {
      console.error('Database insertion failed:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      console.log('=== BOOKING API DEBUG END (ERROR) ===');
      
      return new Response(JSON.stringify({ 
        error: 'Failed to create booking. Please try again later.',
        debug: {
          message: error.message,
          code: error.code,
          hint: error.hint || 'Check if the table exists and has correct permissions'
        }
      }), {
        status: 500,
        headers
      });
    }
    
    console.log('Booking created successfully:', data);
    console.log('=== BOOKING API DEBUG END (SUCCESS) ===');

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
        ...headers,
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
        headers
      });
    }
    
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred. Please try again.' 
    }), {
      status: 500,
      headers
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