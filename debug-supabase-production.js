import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Production Supabase credentials
const supabaseUrl = 'https://puqfbuqfxghffdbbqrvo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cWZidXFmeGdoZmZkYmJxcnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0OTc4NTIsImV4cCI6MjA3MjA3Mzg1Mn0.9TW3TAE9DkSvmos9wEjjpjZjHapaZHNnlwyQW-q3Vkc';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cWZidXFmeGdoZmZkYmJxcnZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ5Nzg1MiwiZXhwIjoyMDcyMDczODUyfQ.ZpuwzWdwVaJ-CGQIHuVpUF0lPgLp5zBud-gMyPf7cQE';

console.log('🔍 Debugging Supabase Production Setup\n');

// Test with both anon and service keys
async function testConnection(keyType, key) {
  console.log(`\n📋 Testing with ${keyType} key...`);
  const supabase = createClient(supabaseUrl, key);

  // 1. Test bookings_simple table
  console.log('\n1️⃣ Testing bookings_simple table:');
  try {
    const { data, error } = await supabase
      .from('bookings_simple')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      console.error(`   Details: ${error.details}`);
    } else {
      console.log(`✅ Table accessible! Found ${data?.length || 0} rows`);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }

  // 2. Test insert capability
  console.log('\n2️⃣ Testing insert into bookings_simple:');
  const testBooking = {
    property_type: 'semi-3',
    frequency: '4weekly',
    additional_services: [],
    full_name: 'Debug Test User',
    email: 'debug@test.com',
    phone: '07700000000',
    address: '123 Debug Street',
    city: 'Street',
    postcode: 'BA16 0HW',
    contact_method: 'email',
    estimated_price: 25.00,
    status: 'pending',
    source: 'debug-test',
    notes: 'Debug test booking'
  };

  try {
    const { data, error } = await supabase
      .from('bookings_simple')
      .insert([testBooking])
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Insert failed: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      console.error(`   Details: ${JSON.stringify(error.details)}`);
    } else {
      console.log(`✅ Insert successful! Booking ID: ${data.id}`);
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('bookings_simple')
        .delete()
        .eq('id', data.id);
      
      if (!deleteError) {
        console.log('🧹 Test data cleaned up');
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }

  // 3. Check table structure
  console.log('\n3️⃣ Checking table columns:');
  try {
    const { data, error } = await supabase
      .from('bookings_simple')
      .select('*')
      .limit(0);
    
    if (!error && data) {
      console.log('✅ Table structure query successful');
    } else if (error) {
      console.error('❌ Cannot query table structure:', error.message);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

// Test other tables
async function testOtherTables() {
  console.log('\n\n4️⃣ Testing other tables:');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const tables = ['customers', 'bookings', 'services', 'service_areas', 'customer_communications'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Accessible (${data?.length || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Unexpected error`);
    }
  }
}

// Run all tests
async function runTests() {
  await testConnection('Anon', supabaseAnonKey);
  await testConnection('Service', supabaseServiceKey);
  await testOtherTables();
  
  console.log('\n\n📝 Summary:');
  console.log('- If anon key fails but service key works: RLS policy issue');
  console.log('- If both fail: Table doesn\'t exist or connection issue');
  console.log('- If insert fails with "duplicate key": Unique constraint issue');
}

runTests().then(() => {
  console.log('\n✨ Debug complete!');
}).catch(err => {
  console.error('\n❌ Debug failed:', err);
});