import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'https://puqfbuqfxghffdbbqrvo.supabase.co';
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cWZidXFmeGdoZmZkYmJxcnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0OTc4NTIsImV4cCI6MjA3MjA3Mzg1Mn0.9TW3TAE9DkSvmos9wEjjpjZjHapaZHNnlwyQW-q3Vkc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestData() {
  console.log('Inserting test customers...');
  
  // Insert test customers
  const testCustomers = [
    { first_name: 'John', last_name: 'Smith', email: 'john.smith@example.com', phone: '07700900001', address: '23 High Street', postcode: 'BA16 0HW', city: 'Burnham-on-Sea', property_type: 'semi-detached' },
    { first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.j@example.com', phone: '07700900002', address: '45 Queens Road', postcode: 'TA8 1BQ', city: 'Burnham-on-Sea', property_type: 'detached' },
    { first_name: 'Michael', last_name: 'Brown', email: 'mike.brown@example.com', phone: '07700900003', address: '12 Victoria Avenue', postcode: 'BA16 0LD', city: 'Highbridge', property_type: 'terraced' },
    { first_name: 'Emma', last_name: 'Wilson', email: 'emma.wilson@example.com', phone: '07700900004', address: '78 Park Lane', postcode: 'TA9 3HP', city: 'Bridgwater', property_type: 'detached' },
    { first_name: 'David', last_name: 'Taylor', email: 'david.t@example.com', phone: '07700900005', address: '34 Church Street', postcode: 'BA6 8QB', city: 'Glastonbury', property_type: 'semi-detached' },
    { first_name: 'Lucy', last_name: 'Davis', email: 'lucy.davis@example.com', phone: '07700900006', address: '56 Station Road', postcode: 'BS25 1HD', city: 'Weston-super-Mare', property_type: 'flat' },
    { first_name: 'James', last_name: 'Miller', email: 'james.m@example.com', phone: '07700900007', address: '90 Somerset Way', postcode: 'BA5 1PX', city: 'Wells', property_type: 'bungalow' },
    { first_name: 'Sophie', last_name: 'Anderson', email: 'sophie.a@example.com', phone: '07700900008', address: '15 Market Street', postcode: 'BA11 1BB', city: 'Frome', property_type: 'terraced' }
  ];

  const { data: customers, error: customerError } = await supabase
    .from('customers')
    .insert(testCustomers)
    .select();

  if (customerError) {
    console.error('Error inserting customers:', customerError);
    return;
  }

  console.log(`Inserted ${customers.length} test customers`);

  // Get the first service ID (assuming window cleaning service exists)
  const { data: services } = await supabase
    .from('services')
    .select('id')
    .limit(1);

  const serviceId = services?.[0]?.id || 1;

  // Insert test bookings
  const now = new Date();
  const testBookings = [
    // New bookings
    {
      customer_id: customers.find(c => c.email === 'john.smith@example.com')?.id,
      service_id: serviceId,
      total_price: 25.00,
      status: 'pending',
      booking_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      booking_status: 'new',
      processed_to_squeegee: false
    },
    {
      customer_id: customers.find(c => c.email === 'sarah.j@example.com')?.id,
      service_id: serviceId,
      total_price: 35.00,
      status: 'pending',
      booking_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      booking_status: 'new',
      processed_to_squeegee: false
    },
    // Contacted bookings
    {
      customer_id: customers.find(c => c.email === 'mike.brown@example.com')?.id,
      service_id: serviceId,
      total_price: 20.00,
      status: 'pending',
      booking_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      booking_status: 'contacted',
      internal_notes: 'Spoke to customer, wants service every 4 weeks. Prefers Thursdays.',
      processed_to_squeegee: false,
      status_updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      customer_id: customers.find(c => c.email === 'emma.wilson@example.com')?.id,
      service_id: serviceId,
      total_price: 40.00,
      status: 'pending',
      booking_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      booking_status: 'contacted',
      internal_notes: 'Large property with conservatory. Quoted £40 including conservatory roof.',
      processed_to_squeegee: false,
      status_updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    // Quoted bookings
    {
      customer_id: customers.find(c => c.email === 'david.t@example.com')?.id,
      service_id: serviceId,
      total_price: 28.00,
      status: 'pending',
      booking_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      booking_status: 'quoted',
      internal_notes: 'Customer accepted quote. Wants to start next month. Has 2 dogs - gate code 1234.',
      processed_to_squeegee: false,
      status_updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      customer_id: customers.find(c => c.email === 'lucy.davis@example.com')?.id,
      service_id: serviceId,
      total_price: 18.00,
      status: 'pending',
      booking_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      booking_status: 'quoted',
      internal_notes: '2nd floor flat, needs ladder access from rear. Monthly service.',
      processed_to_squeegee: false,
      status_updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    // Ready for Squeegee
    {
      customer_id: customers.find(c => c.email === 'james.m@example.com')?.id,
      service_id: serviceId,
      total_price: 30.00,
      status: 'confirmed',
      booking_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      booking_status: 'ready',
      internal_notes: 'Bungalow with easy access. Customer usually home. Includes garage windows.',
      processed_to_squeegee: false,
      status_updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      customer_id: customers.find(c => c.email === 'sophie.a@example.com')?.id,
      service_id: serviceId,
      total_price: 22.00,
      status: 'confirmed',
      booking_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      booking_status: 'ready',
      internal_notes: 'Small terraced house. Park on Market Street. 6-weekly service requested.',
      processed_to_squeegee: false,
      status_updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const { data: bookings, error: bookingError } = await supabase
    .from('bookings')
    .insert(testBookings);

  if (bookingError) {
    console.error('Error inserting bookings:', bookingError);
    return;
  }

  console.log(`Inserted ${testBookings.length} test bookings`);
  console.log('\nTest data inserted successfully!');
  console.log('\nYou can now log into the staff portal at http://localhost:4321/staff/login');
  console.log('and see the test bookings in different stages of the pipeline.');
}

// Run the script
insertTestData().catch(console.error);