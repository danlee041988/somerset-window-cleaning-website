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
    // Comprehensive demo customers with all possible fields filled
    const demoCustomers = [
      {
        full_name: 'James Thompson',
        email: 'james.thompson@gmail.com',
        phone: '07892 456123',
        address: '15 Victoria Gardens',
        city: 'Highbridge',
        postcode: 'TA9 3LN',
        property_type: 'Detached House',
        contact_method: 'phone',
        frequency: '4weekly',
        estimated_price: 32.00,
        preferred_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
        notes: 'Customer called about regular window cleaning. Has conservatory and front/back windows. Prefers morning appointments. Garden gate access.',
        additional_services: ['conservatory', 'gutter'],
        source: 'staff_portal',
        status: 'new',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
      },
      {
        full_name: 'Sarah Mitchell',
        email: 'sarah.mitchell@outlook.com',
        phone: '07765 321987',
        address: '42 Church Street',
        city: 'Street',
        postcode: 'BA16 0AB',
        property_type: 'Terraced House',
        contact_method: 'email',
        frequency: '8weekly',
        estimated_price: 22.50,
        preferred_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
        notes: 'New customer referral from neighbor. 2-bed terraced house with small front and large rear windows. Prefers email communication. Has a dog - needs gate to be securely closed.',
        additional_services: ['pressure_wash'],
        source: 'staff_portal',
        status: 'contacted',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        full_name: 'Robert and Helen Davis',
        email: 'rob.davis@btinternet.com',
        phone: '01458 847392',
        address: '8 Orchard Lane',
        city: 'Glastonbury',
        postcode: 'BA6 8QR',
        property_type: 'Semi-Detached House',
        contact_method: 'phone',
        frequency: '4weekly',
        estimated_price: 28.00,
        preferred_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
        notes: 'Elderly couple, very particular about quality. Previous cleaner moved away. House has leaded windows that need careful handling. Always pay on completion. Robert usually home during day.',
        additional_services: ['fascia'],
        source: 'staff_portal',
        status: 'quoted',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        full_name: 'Marcus Webb',
        email: 'marcus.webb@company.co.uk',
        phone: '07123 987456',
        address: '67 Manor Drive',
        city: 'Burnham-on-Sea',
        postcode: 'TA8 2HY',
        property_type: 'Detached House',
        contact_method: 'email',
        frequency: '4weekly',
        estimated_price: 38.50,
        preferred_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
        notes: 'Business owner, travels frequently. Large detached house with multiple windows including bay windows. Has ring doorbell. Payment by bank transfer preferred. Emergency contact: wife Linda 07987 654321.',
        additional_services: ['conservatory', 'pressure_wash'],
        source: 'staff_portal',
        status: 'ready',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      },
      {
        full_name: 'Anna Richardson',
        email: 'anna.r@yahoo.co.uk',
        phone: '07445 678234',
        address: '23 Meadow View',
        city: 'Cheddar',
        postcode: 'BS27 3RW',
        property_type: 'Bungalow',
        contact_method: 'sms',
        frequency: '12weekly',
        estimated_price: 18.00,
        preferred_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 weeks from now
        notes: 'Single lady, works from home. Small bungalow with easy access windows. Prefers quarterly cleaning. Very concerned about pricing - budget conscious. Has two cats that may be curious.',
        additional_services: [],
        source: 'staff_portal',
        status: 'new',
        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45 minutes ago
      },
      {
        full_name: 'Commercial - The Coffee House',
        email: 'manager@coffeehouse-street.com',
        phone: '01458 832456',
        address: '12-14 High Street',
        city: 'Street',
        postcode: 'BA16 0EQ',
        property_type: 'Commercial',
        contact_method: 'email',
        frequency: '4weekly',
        estimated_price: 85.00,
        preferred_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days from now
        notes: 'Commercial client - coffee shop with large street-facing windows. Requires early morning cleaning (before 8am opening). Monthly invoicing required. Contact: Sarah (Manager). Critical to maintain clean appearance for customers.',
        additional_services: ['pressure_wash'],
        source: 'staff_portal',
        status: 'contacted',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      }
    ];

    // Insert all demo customers
    const results = [];
    for (const customer of demoCustomers) {
      try {
        const { data, error } = await supabase
          .from('bookings_simple')
          .insert({
            ...customer,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error(`Error creating customer ${customer.full_name}:`, error);
          results.push({ 
            name: customer.full_name, 
            success: false, 
            error: error.message 
          });
        } else {
          results.push({ 
            name: customer.full_name, 
            success: true, 
            id: data.id 
          });
        }
      } catch (err) {
        console.error(`Exception creating customer ${customer.full_name}:`, err);
        results.push({ 
          name: customer.full_name, 
          success: false, 
          error: err.message 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return new Response(JSON.stringify({
      success: true,
      message: `Demo customers created: ${successCount} successful, ${failureCount} failed`,
      results: results,
      summary: {
        total: demoCustomers.length,
        successful: successCount,
        failed: failureCount
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