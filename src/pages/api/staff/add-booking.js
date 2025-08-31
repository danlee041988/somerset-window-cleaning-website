import { supabase } from '~/lib/supabase.js';

export async function POST({ request }) {
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const bookingData = await request.json();

    // Validate required fields
    if (!bookingData.full_name || !bookingData.address || !bookingData.city || 
        !bookingData.postcode || !bookingData.property_type || !bookingData.contact_method) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Validate at least one contact method
    if (!bookingData.email && !bookingData.phone) {
      return new Response(JSON.stringify({ error: 'At least one contact method (email or phone) is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Prepare booking data for database insertion
    const dbBookingData = {
      full_name: bookingData.full_name,
      email: bookingData.email || null,
      phone: bookingData.phone || null,
      address: bookingData.address,
      city: bookingData.city,
      postcode: bookingData.postcode.toUpperCase(),
      property_type: bookingData.property_type,
      contact_method: bookingData.contact_method,
      frequency: bookingData.frequency || '4weekly',
      estimated_price: bookingData.estimated_price || null,
      notes: bookingData.notes || null,
      additional_services: bookingData.additional_services || [],
      source: bookingData.source || 'staff_portal',
      status: bookingData.status || 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Store additional booking details in notes if needed
    const extendedNotes = {
      original_notes: bookingData.notes,
      window_cleaning: bookingData.window_cleaning,
      service_frequencies: bookingData.service_frequencies || {},
      service_prices: bookingData.service_prices || {}
    };
    
    dbBookingData.notes = JSON.stringify(extendedNotes);

    // Insert booking into database
    const { data, error } = await supabase
      .from('bookings_simple')
      .insert(dbBookingData)
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: 'Customer booking created successfully',
      booking: {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        postcode: data.postcode,
        property_type: data.property_type,
        status: data.status,
        estimated_price: data.estimated_price,
        created_at: data.created_at
      }
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}