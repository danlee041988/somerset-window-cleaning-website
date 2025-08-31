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
    // Get the most recent bookings
    const { data, error } = await supabase
      .from('bookings_simple')
      .select('id, full_name, status, created_at, source')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching bookings:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Also get count by status
    const { data: statusCount, error: countError } = await supabase
      .from('bookings_simple')
      .select('status', { count: 'exact' });

    const statusSummary = {};
    if (!countError && statusCount) {
      statusCount.forEach(item => {
        const status = item.status || 'null';
        statusSummary[status] = (statusSummary[status] || 0) + 1;
      });
    }

    return new Response(JSON.stringify({
      success: true,
      recentBookings: data,
      totalCount: data?.length || 0,
      statusSummary: statusSummary,
      message: 'Debug information retrieved'
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