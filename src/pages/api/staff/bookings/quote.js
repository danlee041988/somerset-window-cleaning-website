import { supabase } from '~/lib/supabase.js';

export async function PATCH({ request }) {
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const { id, quote_amount, quote_status } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing booking ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Validate quote status if provided
    if (quote_status) {
      const validStatuses = ['pending', 'accepted', 'rejected', 'negotiating'];
      if (!validStatuses.includes(quote_status)) {
        return new Response(JSON.stringify({ error: 'Invalid quote status' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }

    // Prepare update data
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (quote_amount !== undefined) {
      updateData.quote_amount = parseFloat(quote_amount);
    }

    if (quote_status !== undefined) {
      updateData.quote_status = quote_status;
    }

    // Update booking quote information
    const { data, error } = await supabase
      .from('bookings_simple')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking quote:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      booking: data
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