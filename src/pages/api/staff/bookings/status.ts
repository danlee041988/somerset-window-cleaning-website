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
    const { bookingId, newStatus } = await request.json();
    
    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update booking status
    const { data, error } = await supabase
      .from('bookings')
      .update({
        booking_status: newStatus,
        status_updated_at: new Date().toISOString(),
        status_updated_by: 'Staff', // You could get this from session
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking status:', error);
      return new Response(JSON.stringify({ error: 'Failed to update status' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, booking: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Status update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};