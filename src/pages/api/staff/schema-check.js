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

  try {
    // Try to get a single row to understand the schema
    const { data, error } = await supabase
      .from('bookings_simple')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error checking schema:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // If we have data, show the structure
    if (data && data.length > 0) {
      return new Response(JSON.stringify({
        success: true,
        columns: Object.keys(data[0]),
        sample_data: data[0]
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // If no data, we can't infer the schema directly
    // But we can try inserting a minimal record to see what's required
    return new Response(JSON.stringify({
      success: true,
      message: 'No data available to infer schema',
      columns: []
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