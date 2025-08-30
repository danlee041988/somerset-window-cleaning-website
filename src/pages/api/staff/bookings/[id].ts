import type { APIRoute } from 'astro';
import { supabase } from '~/lib/supabase';

export const GET: APIRoute = async ({ params, cookies }) => {
  // Check authentication
  const authCookie = cookies.get('staff-auth')?.value;
  if (!authCookie || authCookie !== 'authenticated') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const bookingId = params.id;
    
    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch booking details with customer info
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customers (
          first_name,
          last_name,
          email,
          phone,
          address,
          postcode,
          city,
          property_type
        ),
        services (
          name,
          description
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Flatten the response
    const booking = {
      ...data,
      first_name: data.customers?.first_name,
      last_name: data.customers?.last_name,
      email: data.customers?.email,
      phone: data.customers?.phone,
      address: data.customers?.address,
      postcode: data.customers?.postcode,
      city: data.customers?.city,
      property_type: data.customers?.property_type,
      service_name: data.services?.name,
      service_description: data.services?.description,
    };

    // Parse internal notes if it's JSON
    try {
      if (data.internal_notes && data.internal_notes.startsWith('{')) {
        const notes = JSON.parse(data.internal_notes);
        booking.frequency = notes.frequency;
        booking.additional_services = notes.additional_services;
      }
    } catch (e) {
      // Keep internal_notes as is if not JSON
    }

    return new Response(JSON.stringify(booking), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Booking fetch error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};