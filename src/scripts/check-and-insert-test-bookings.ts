import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'https://puqfbuqfxghffdbbqrvo.supabase.co';
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cWZidXFmeGdoZmZkYmJxcnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0OTc4NTIsImV4cCI6MjA3MjA3Mzg1Mn0.9TW3TAE9DkSvmos9wEjjpjZjHapaZHNnlwyQW-q3Vkc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndInsertTestData() {
  // First, let's check if we can read existing bookings
  console.log('Checking existing bookings...');
  const { data: existingBookings, error: readError } = await supabase
    .from('bookings')
    .select('*')
    .limit(5);

  if (readError) {
    console.error('Error reading bookings:', readError);
  } else {
    console.log(`Found ${existingBookings?.length || 0} existing bookings`);
  }

  // Check if we can read customers
  const { data: existingCustomers, error: customerReadError } = await supabase
    .from('customers')
    .select('*')
    .limit(5);

  if (customerReadError) {
    console.error('Error reading customers:', customerReadError);
  } else {
    console.log(`Found ${existingCustomers?.length || 0} existing customers`);
  }

  // Let's try to read the active_bookings view which should combine the data
  console.log('\nChecking active_bookings view...');
  const { data: activeBookings, error: viewError } = await supabase
    .from('active_bookings')
    .select('*')
    .limit(10);

  if (viewError) {
    console.error('Error reading active_bookings view:', viewError);
  } else {
    console.log(`Found ${activeBookings?.length || 0} active bookings in view`);
    if (activeBookings && activeBookings.length > 0) {
      console.log('\nSample booking:', JSON.stringify(activeBookings[0], null, 2));
    }
  }

  console.log('\n---\nNote: Due to Row Level Security policies, we cannot insert test data directly.');
  console.log('To add test bookings, use the public booking form at: http://localhost:4321/booking-2step');
  console.log('\nOr you can insert test data directly in the Supabase dashboard:');
  console.log('1. Go to https://supabase.com/dashboard/project/puqfbuqfxghffdbbqrvo');
  console.log('2. Navigate to Table Editor');
  console.log('3. Insert test records manually');
  console.log('\nThe staff portal is at: http://localhost:4321/staff/login');
}

// Run the script
checkAndInsertTestData().catch(console.error);