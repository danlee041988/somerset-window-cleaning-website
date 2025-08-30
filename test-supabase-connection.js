// Test script to verify Supabase connection and booking functionality
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://puqfbuqfxghffdbbqrvo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cWZidXFmeGdoZmZkYmJxcnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0OTc4NTIsImV4cCI6MjA3MjA3Mzg1Mn0.9TW3TAE9DkSvmos9wEjjpjZjHapaZHNnlwyQW-q3Vkc'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('🧪 Testing Supabase connection...\n')
    
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...')
    const { data, error } = await supabase.from('services').select('*').limit(1)
    if (error) {
      console.log('❌ Connection failed:', error.message)
      console.log('📝 You need to run the database migration first!')
      console.log('   Go to https://puqfbuqfxghffdbbqrvo.supabase.co')
      console.log('   Navigate to SQL Editor')
      console.log('   Copy contents of supabase_migration_fixed.sql and run it')
      return false
    }
    console.log('✅ Connection successful!\n')

    // Test 2: Check services table
    console.log('2️⃣ Checking services...')
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(3)
    
    if (servicesError) {
      console.log('❌ Services query failed:', servicesError.message)
      return false
    }
    
    console.log(`✅ Found ${services.length} services:`)
    services.forEach(service => {
      console.log(`   - ${service.name}: £${service.base_price}`)
    })
    console.log()

    // Test 3: Check service areas
    console.log('3️⃣ Checking service areas...')
    const { data: areas, error: areasError } = await supabase
      .from('service_areas')
      .select('*')
      .limit(3)
    
    if (areasError) {
      console.log('❌ Service areas query failed:', areasError.message)
      return false
    }
    
    console.log(`✅ Found ${areas.length} service areas:`)
    areas.forEach(area => {
      console.log(`   - ${area.area_name} (${area.postcode_prefix})`)
    })
    console.log()

    // Test 4: Test customer insert capability
    console.log('4️⃣ Testing customer creation...')
    const testCustomer = {
      first_name: 'Test',
      last_name: 'Customer',
      email: `test${Date.now()}@example.com`,
      phone: '01234567890',
      address: '123 Test Street',
      postcode: 'BA16 0HW',
      city: 'Street',
      property_type: 'semi-3'
    }

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert(testCustomer)
      .select()
      .single()

    if (customerError) {
      console.log('❌ Customer creation failed:', customerError.message)
      return false
    }
    
    console.log('✅ Test customer created:', customer.first_name, customer.last_name)
    console.log()

    // Test 5: Test booking creation
    console.log('5️⃣ Testing booking creation...')
    const windowService = services.find(s => s.slug === 'window-cleaning')
    
    if (!windowService) {
      console.log('❌ Window cleaning service not found')
      return false
    }

    const testBooking = {
      customer_id: customer.id,
      service_id: windowService.id,
      booking_date: new Date().toISOString().split('T')[0],
      time_slot: 'morning',
      status: 'pending',
      base_price: windowService.base_price,
      total_price: windowService.base_price,
      payment_status: 'pending',
      internal_notes: JSON.stringify({
        booking_reference: 'TEST-' + Date.now(),
        test_booking: true
      })
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(testBooking)
      .select()
      .single()

    if (bookingError) {
      console.log('❌ Booking creation failed:', bookingError.message)
      return false
    }

    const reference = JSON.parse(booking.internal_notes).booking_reference
    console.log('✅ Test booking created:', reference)
    console.log()

    // Cleanup test data
    console.log('6️⃣ Cleaning up test data...')
    await supabase.from('bookings').delete().eq('id', booking.id)
    await supabase.from('customers').delete().eq('id', customer.id)
    console.log('✅ Test data cleaned up\n')

    console.log('🎉 ALL TESTS PASSED!')
    console.log('🚀 Your booking form integration is ready to use!')
    console.log('📱 Test it at: http://localhost:4322/book-now')

    return true

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

testConnection()