import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTables() {
  console.log('🔍 Checking Supabase tables...\n')

  // Check bookings table
  console.log('📋 Checking bookings table...')
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .limit(1)
  
  if (bookingsError) {
    console.error('❌ Error with bookings table:', bookingsError.message)
  } else {
    console.log('✅ Bookings table exists')
    if (bookings.length > 0) {
      console.log('   Sample columns:', Object.keys(bookings[0]).join(', '))
    }
  }

  // Check customer_communications table (instead of contact_submissions)
  console.log('\n📋 Checking customer_communications table...')
  const { data: comms, error: commsError } = await supabase
    .from('customer_communications')
    .select('*')
    .limit(1)
  
  if (commsError) {
    console.error('❌ Error with customer_communications table:', commsError.message)
  } else {
    console.log('✅ Customer communications table exists')
    if (comms.length > 0) {
      console.log('   Sample columns:', Object.keys(comms[0]).join(', '))
    }
  }

  // Check service_areas table
  console.log('\n📋 Checking service_areas table...')
  const { data: areas, error: areasError } = await supabase
    .from('service_areas')
    .select('*')
    .limit(5)
  
  if (areasError) {
    console.error('❌ Error with service_areas table:', areasError.message)
  } else {
    console.log('✅ Service areas table exists')
    console.log(`   Found ${areas.length} service areas`)
    areas.forEach(area => console.log(`   - ${area.name || 'Unnamed area'}`))
  }

  // Check services table
  console.log('\n📋 Checking services table...')
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .limit(5)
  
  if (servicesError) {
    console.error('❌ Error with services table:', servicesError.message)
  } else {
    console.log('✅ Services table exists')
    console.log(`   Found ${services.length} services`)
    services.forEach(service => console.log(`   - ${service.name || 'Unnamed service'}`))
  }
}

checkTables()
  .then(() => console.log('\n✨ Database check complete!'))
  .catch(err => console.error('\n❌ Error:', err))