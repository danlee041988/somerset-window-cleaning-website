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
    const { id, completed, completion_date } = await request.json();

    if (!id || completed === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Prepare update data
    const updateData = {
      first_clean_completed: Boolean(completed),
      updated_at: new Date().toISOString()
    };

    // Set completion date if marking as completed
    if (completed) {
      updateData.first_clean_date = completion_date 
        ? new Date(completion_date).toISOString()
        : new Date().toISOString();
    } else {
      updateData.first_clean_date = null;
    }

    // Update booking completion status
    const { data, error } = await supabase
      .from('bookings_simple')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating completion status:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      booking: data,
      message: completed ? 'First clean marked as completed' : 'First clean status updated'
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