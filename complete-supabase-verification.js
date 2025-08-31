// Complete Supabase verification and setup script
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://puqfbuqfxghffdbbqrvo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cWZidXFmeGdoZmZkYmJxcnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0OTc4NTIsImV4cCI6MjA3MjA3Mzg1Mn0.9TW3TAE9DkSvmos9wEjjpjZjHapaZHNnlwyQW-q3Vkc'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyCompleteSetup() {
  console.log('🔍 Somerset Window Cleaning - Complete Database Verification\n')
  
  let allTestsPassed = true
  
  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing Supabase connection...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('services')
      .select('count')
      .single()
    
    if (healthError) {
      console.log('❌ Connection failed:', healthError.message)
      allTestsPassed = false
    } else {
      console.log('✅ Connection successful!')
    }
    console.log()
    
    // Test 2: Check existing tables
    console.log('2️⃣ Verifying existing tables...')
    
    const tables = ['customers', 'bookings', 'services', 'service_areas', 'customer_communications']
    const tableResults = {}
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
          tableResults[table] = false
          allTestsPassed = false
        } else {
          console.log(`✅ ${table}: Accessible`)
          tableResults[table] = true
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
        tableResults[table] = false
        allTestsPassed = false
      }
    }
    console.log()
    
    // Test 3: Check for simplified bookings table
    console.log('3️⃣ Checking for bookings_simple table...')
    try {
      const { data, error } = await supabase
        .from('bookings_simple')
        .select('*')
        .limit(1)
      
      if (error) {
        console.log('❌ bookings_simple table not found or not accessible')
        console.log('💡 Need to create simplified table for API compatibility')
        allTestsPassed = false
      } else {
        console.log('✅ bookings_simple table exists and accessible')
      }
    } catch (err) {
      console.log('❌ bookings_simple table error:', err.message)
      allTestsPassed = false
    }
    console.log()
    
    // Test 4: Test customer insert (RLS check)
    console.log('4️⃣ Testing customer insert capability (RLS check)...')
    const testCustomer = {
      first_name: 'RLS',
      last_name: 'Test',
      email: `rlstest${Date.now()}@example.com`,
      phone: '01234567890',
      address: '123 Test Street',
      postcode: 'BA16 0HW',
      city: 'Street',
      property_type: 'semi-3'
    }
    
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert([testCustomer])
      .select()
      .single()
    
    if (customerError) {
      console.log('❌ Customer insert failed:', customerError.message)
      if (customerError.message.includes('row-level security')) {
        console.log('🔐 RLS policies need to be configured')
      }
      allTestsPassed = false
    } else {
      console.log('✅ Customer insert successful')
      // Clean up test customer
      await supabase.from('customers').delete().eq('id', customer.id)
    }
    console.log()
    
    // Test 5: API-style booking test
    console.log('5️⃣ Testing API-style booking submission...')
    
    const apiBookingData = {
      property_type: 'semi-3',
      frequency: '4weekly',
      additional_services: ['conservatory'],
      full_name: 'API Test Customer',
      email: `apitest${Date.now()}@example.com`,
      phone: '01234567890',
      address: '456 API Test Road',
      city: 'Street',
      postcode: 'BA16 0HW',
      contact_method: 'email',
      preferred_date: '2024-12-15',
      notes: 'API compatibility test',
      estimated_price: 28.00,
      status: 'pending',
      source: 'website'
    }
    
    // Try both table structures
    let apiTestPassed = false
    
    // Try simplified table first
    try {
      const { data: simpleBooking, error: simpleError } = await supabase
        .from('bookings_simple')
        .insert([apiBookingData])
        .select()
        .single()
      
      if (!simpleError) {
        console.log('✅ API booking test with bookings_simple: SUCCESS')
        apiTestPassed = true
        // Clean up
        await supabase.from('bookings_simple').delete().eq('id', simpleBooking.id)
      }
    } catch (err) {
      // Table might not exist yet
    }
    
    if (!apiTestPassed) {
      console.log('❌ API booking test failed')
      console.log('💡 Need to create bookings_simple table or fix RLS policies')
      allTestsPassed = false
    }
    console.log()
    
    // Summary
    console.log('📊 SETUP SUMMARY')
    console.log('================')
    console.log(`Overall Status: ${allTestsPassed ? '✅ READY' : '❌ NEEDS SETUP'}`)
    console.log()
    
    if (allTestsPassed) {
      console.log('🎉 Your Supabase database is fully configured!')
      console.log('🚀 Your booking API should work correctly now')
      console.log('📱 Test your booking form at: http://localhost:4321/book-now')
    } else {
      console.log('📋 NEXT STEPS:')
      console.log('1. Go to your Supabase Dashboard: https://puqfbuqfxghffdbbqrvo.supabase.co')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Copy and run the contents of: supabase-complete-setup.sql')
      console.log('4. Run this verification script again')
      console.log('5. Update your API if needed (see SUPABASE_DATABASE_SETUP_COMPLETE.md)')
    }
    
    return allTestsPassed
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    return false
  }
}

verifyCompleteSetup().catch(console.error)