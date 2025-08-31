// Test script for the simplified bookings table
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://puqfbuqfxghffdbbqrvo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cWZidXFmeGdoZmZkYmJxcnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0OTc4NTIsImV4cCI6MjA3MjA3Mzg1Mn0.9TW3TAE9DkSvmos9wEjjpjZjHapaZHNnlwyQW-q3Vkc'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSimplifiedBookings() {
  console.log('🧪 Testing simplified bookings table...\n')
  
  try {
    // Test 1: Check if bookings_simple table exists
    console.log('1️⃣ Checking if bookings_simple table exists...')
    const { data, error } = await supabase
      .from('bookings_simple')
      .select('*')
      .limit(0)
    
    if (error) {
      console.log('❌ Table does not exist or has issues:', error.message)
      console.log('📝 You need to run the SQL script first!')
      console.log('   1. Go to https://puqfbuqfxghffdbbqrvo.supabase.co')
      console.log('   2. Navigate to SQL Editor')
      console.log('   3. Copy contents of supabase-complete-setup.sql and run it')
      return false
    }
    
    console.log('✅ bookings_simple table exists!\n')
    
    // Test 2: Test insert capability
    console.log('2️⃣ Testing insert capability...')
    const testBooking = {
      property_type: 'semi-3',
      frequency: '4weekly',
      additional_services: ['conservatory'],
      full_name: 'Test Customer',
      email: `test${Date.now()}@example.com`,
      phone: '01234567890',
      address: '123 Test Street',
      city: 'Street',
      postcode: 'BA16 0HW',
      contact_method: 'email',
      preferred_date: '2024-12-01',
      notes: 'Test booking via API',
      estimated_price: 25.00,
      status: 'pending',
      source: 'website'
    }
    
    const { data: insertedBooking, error: insertError } = await supabase
      .from('bookings_simple')
      .insert([testBooking])
      .select()
      .single()
    
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message)
      if (insertError.message.includes('row-level security')) {
        console.log('🔐 RLS policies need to be set up. Run the SQL script from supabase-complete-setup.sql')
      }
      return false
    }
    
    console.log('✅ Test booking created successfully!')
    console.log(`   ID: ${insertedBooking.id}`)
    console.log(`   Customer: ${insertedBooking.full_name}`)
    console.log(`   Email: ${insertedBooking.email}`)
    console.log(`   Price: £${insertedBooking.estimated_price}`)
    console.log()
    
    // Test 3: Test read capability
    console.log('3️⃣ Testing read capability...')
    const { data: allBookings, error: readError } = await supabase
      .from('bookings_simple')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (readError) {
      console.log('❌ Read failed:', readError.message)
      return false
    }
    
    console.log(`✅ Read successful! Found ${allBookings.length} bookings`)
    console.log()
    
    // Test 4: Clean up test data
    console.log('4️⃣ Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('bookings_simple')
      .delete()
      .eq('id', insertedBooking.id)
    
    if (deleteError) {
      console.log('⚠️  Cleanup failed (this is ok):', deleteError.message)
    } else {
      console.log('✅ Test data cleaned up')
    }
    console.log()
    
    console.log('🎉 ALL TESTS PASSED!')
    console.log('✅ Your API can now use the bookings_simple table')
    console.log('📱 Update your API endpoint to use "bookings_simple" instead of "bookings"')
    
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

testSimplifiedBookings().catch(console.error)