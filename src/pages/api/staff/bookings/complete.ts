import type { APIRoute } from 'astro';
import { supabase } from '~/lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  // Check authentication
  const authCookie = cookies.get('staff-auth')?.value;
  if (!authCookie || authCookie !== 'authenticated') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { bookingId } = await request.json();
    
    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mark booking as processed to Squeegee and update status
    const { data, error } = await supabase
      .from('bookings')
      .update({
        processed_to_squeegee: true,
        booking_status: 'completed',
        status_updated_at: new Date().toISOString(),
        status_updated_by: 'Staff',
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Error completing booking:', error);
      return new Response(JSON.stringify({ error: 'Failed to complete booking' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, booking: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};