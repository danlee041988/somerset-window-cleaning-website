import { supabase } from '~/lib/supabase.js';

export async function GET({ request }) {
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing booking ID' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    // Get booking details with full information
    const { data: booking, error } = await supabase
      .from('bookings_simple')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Return formatted booking data
    return new Response(JSON.stringify({
      success: true,
      booking: {
        id: booking.id,
        full_name: booking.full_name,
        email: booking.email,
        phone: booking.phone,
        postcode: booking.postcode,
        property_type: booking.property_type,
        bedrooms: booking.bedrooms,
        status: booking.status,
        created_at: booking.created_at,
        estimated_price: booking.estimated_price,
        
        // Enhanced quote management fields
        quote_amount: booking.quote_amount,
        quote_status: booking.quote_status || 'pending',
        quote_date: booking.quote_date,
        quote_history: booking.quote_history || [],
        
        // Follow-up and completion tracking
        follow_up_date: booking.follow_up_date,
        first_clean_completed: booking.first_clean_completed || false,
        first_clean_date: booking.first_clean_date,
        
        // Additional fields
        priority: booking.priority || 'normal',
        service_frequency: booking.service_frequency,
        next_service_date: booking.next_service_date,
        customer_satisfaction_score: booking.customer_satisfaction_score,
        customer_feedback: booking.customer_feedback,
        staff_notes: booking.staff_notes,
        revenue_potential: booking.revenue_potential
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}