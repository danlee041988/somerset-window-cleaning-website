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
    // Create test bookings data matching the actual schema
    const testBookings = [
      {
        full_name: 'John Smith',
        email: 'john@example.com',
        phone: '07700900001',
        postcode: 'BA16 0HW',
        property_type: 'Semi-Detached House',
        address: '10 Oak Street',
        city: 'Highbridge',
        status: 'new',
        estimated_price: 25,
        frequency: '4weekly',
        contact_method: 'phone',
        notes: 'New customer, needs quote',
        additional_services: [],
        source: 'staff_test',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        full_name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '07700900002',
        postcode: 'BA16 0HX',
        property_type: 'Terraced House',
        address: '25 Elm Avenue',
        city: 'Street',
        status: 'contacted',
        estimated_price: 20,
        frequency: '8weekly',
        contact_method: 'email',
        notes: 'Customer contacted, awaiting response',
        additional_services: [],
        source: 'staff_test',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        full_name: 'Mike Wilson',
        email: 'mike@example.com',
        phone: '07700900003',
        postcode: 'BA16 0HY',
        property_type: 'Detached House',
        address: '5 Pine Close',
        city: 'Burnham-on-Sea',
        status: 'quoted',
        estimated_price: 35,
        frequency: '4weekly',
        contact_method: 'phone',
        notes: 'Quote provided - £35 for 4-weekly service',
        additional_services: ['gutter'],
        source: 'staff_test',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      },
      {
        full_name: 'Emma Davis',
        email: 'emma@example.com',
        phone: '07700900004',
        postcode: 'BA16 0HZ',
        property_type: 'Semi-Detached House',
        address: '42 Maple Drive',
        city: 'Glastonbury',
        status: 'ready',
        estimated_price: 25,
        frequency: '4weekly',
        contact_method: 'email',
        notes: 'Quote accepted, ready to schedule first clean',
        additional_services: [],
        source: 'staff_test',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
      }
    ];

    // Insert test bookings
    const { data, error } = await supabase
      .from('bookings_simple')
      .insert(testBookings)
      .select();

    if (error) {
      console.error('Error creating test bookings:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Created ${data.length} test bookings`,
      bookings: data
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