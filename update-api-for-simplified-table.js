// Script to update the API to use the simplified bookings table
import fs from 'fs'
import path from 'path'

function updateBookingAPI() {
  console.log('🔧 Updating booking API to use simplified table...\n')
  
  const apiPath = './src/pages/api/bookings/create.ts'
  
  if (!fs.existsSync(apiPath)) {
    console.log('❌ API file not found:', apiPath)
    return false
  }
  
  // Read current API content
  let content = fs.readFileSync(apiPath, 'utf8')
  
  // Show what needs to be changed
  console.log('📝 Required changes:')
  console.log('   1. Change table name from "bookings" to "bookings_simple"')
  console.log('   2. Remove complex customer upsert logic')
  console.log('   3. Simplify the data insertion')
  console.log()
  
  // Check if already updated
  if (content.includes('bookings_simple')) {
    console.log('✅ API already appears to use bookings_simple table')
    return true
  }
  
  console.log('🔍 Current API uses:', content.includes('.from(\'bookings\')') ? 'bookings table' : 'unknown table')
  console.log()
  
  console.log('💡 To update the API:')
  console.log('   1. First run the SQL setup: supabase-complete-setup.sql')
  console.log('   2. Then replace this line in the API:')
  console.log('      .from(\'bookings\')')
  console.log('   3. With:')
  console.log('      .from(\'bookings_simple\')')
  console.log()
  
  return false
}

updateBookingAPI()