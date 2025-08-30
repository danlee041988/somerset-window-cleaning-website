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
    const { bookingId, notes } = await request.json();
    
    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update internal notes
    const { data, error } = await supabase
      .from('bookings')
      .update({
        internal_notes: notes,
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating notes:', error);
      return new Response(JSON.stringify({ error: 'Failed to update notes' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, booking: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Notes update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};