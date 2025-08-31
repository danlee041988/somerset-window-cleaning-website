// Script to set up Row Level Security policies for Somerset Window Cleaning
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://puqfbuqfxghffdbbqrvo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cWZidXFmeGdoZmZkYmJxcnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0OTc4NTIsImV4cCI6MjA3MjA3Mzg1Mn0.9TW3TAE9DkSvmos9wEjjpjZjHapaZHNnlwyQW-q3Vkc'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTableStructure() {
  console.log('📊 Checking current table structure...\n')
  
  try {
    // Check bookings table columns
    console.log('🔍 Checking bookings table columns...')
    const { data: bookingsColumns, error: bookingsError } = await supabase
      .rpc('get_table_columns', { table_name: 'bookings' })
    
    if (bookingsError) {
      console.log('Using alternative method to check table structure...')
      // Try a different approach - select with limit 0 to get column info
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .limit(0)
      
      if (!error) {
        console.log('✅ Bookings table exists')
      } else {
        console.log('❌ Error checking bookings table:', error.message)
      }
    }
    
    // Check if the bookings table has the columns expected by the API
    const requiredColumns = [
      'property_type',
      'frequency', 
      'full_name',
      'email',
      'phone',
      'address',
      'city',
      'postcode',
      'contact_method',
      'preferred_date',
      'notes',
      'special_offer',
      'estimated_price',
      'status',
      'source',
      'additional_services'
    ]
    
    console.log('\n📋 Required columns for API compatibility:')
    requiredColumns.forEach(col => {
      console.log(`   - ${col}`)
    })
    
    console.log('\n💡 The API expects a flat bookings table structure, but the current schema')
    console.log('   uses a normalized structure with separate customers and bookings tables.')
    console.log('   We need to either:')
    console.log('   1. Create a new bookings table matching the API structure, OR')
    console.log('   2. Update the API to work with the normalized structure')
    
    return true
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error.message)
    return false
  }
}

async function setupRLSPolicies() {
  console.log('\n🔐 Setting up RLS policies...\n')
  
  console.log('ℹ️  RLS policies need to be set up via the Supabase Dashboard SQL Editor')
  console.log('   because we need service role permissions.\n')
  
  console.log('📋 Copy and run this SQL in your Supabase Dashboard:\n')
  
  const rlsSQL = `
-- Disable RLS temporarily to set up policies
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communications DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
DROP POLICY IF EXISTS "Enable insert for all users" ON customers;
DROP POLICY IF EXISTS "Enable update for all users" ON customers;
DROP POLICY IF EXISTS "Enable read access for all users" ON bookings;
DROP POLICY IF EXISTS "Enable insert for all users" ON bookings;
DROP POLICY IF EXISTS "Enable read access for all users" ON services;
DROP POLICY IF EXISTS "Enable read access for all users" ON service_areas;
DROP POLICY IF EXISTS "Enable insert for all users" ON customer_communications;

-- Re-enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;

-- Create public access policies for customers table
CREATE POLICY "Enable read access for all users" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON customers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON customers
    FOR UPDATE USING (true);

-- Create public access policies for bookings table
CREATE POLICY "Enable read access for all users" ON bookings
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON bookings
    FOR INSERT WITH CHECK (true);

-- Create public read access for services
CREATE POLICY "Enable read access for all users" ON services
    FOR SELECT USING (true);

-- Create public read access for service areas
CREATE POLICY "Enable read access for all users" ON service_areas
    FOR SELECT USING (true);

-- Create public insert access for customer communications
CREATE POLICY "Enable insert for all users" ON customer_communications
    FOR INSERT WITH CHECK (true);

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('customers', 'bookings', 'services', 'service_areas', 'customer_communications');
`

  console.log(rlsSQL)
  
  console.log('\n📌 Steps to apply:')
  console.log('   1. Go to https://puqfbuqfxghffdbbqrvo.supabase.co')
  console.log('   2. Navigate to SQL Editor')
  console.log('   3. Copy and paste the SQL above')
  console.log('   4. Click "Run" to execute')
  console.log('   5. Run node test-supabase-connection.js again to verify')
}

async function createSimplifiedBookingsTable() {
  console.log('\n🏗️  Creating simplified bookings table for API compatibility...\n')
  
  const createTableSQL = `
-- Create a simplified bookings table that matches the API expectations
CREATE TABLE IF NOT EXISTS bookings_simple (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Property and service details
    property_type VARCHAR(50) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    additional_services JSONB DEFAULT '[]',
    
    -- Customer information
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    
    -- Booking preferences
    contact_method VARCHAR(20) NOT NULL,
    preferred_date DATE,
    notes TEXT,
    special_offer VARCHAR(100),
    
    -- Pricing and status
    estimated_price DECIMAL(8,2),
    status VARCHAR(20) DEFAULT 'pending',
    source VARCHAR(50) DEFAULT 'website',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_simple_email ON bookings_simple(email);
CREATE INDEX IF NOT EXISTS idx_bookings_simple_status ON bookings_simple(status);
CREATE INDEX IF NOT EXISTS idx_bookings_simple_created_at ON bookings_simple(created_at);

-- Enable RLS
ALTER TABLE bookings_simple ENABLE ROW LEVEL SECURITY;

-- Create public access policies
CREATE POLICY "Enable read access for all users" ON bookings_simple
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON bookings_simple
    FOR INSERT WITH CHECK (true);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_bookings_simple_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_simple_updated_at
    BEFORE UPDATE ON bookings_simple
    FOR EACH ROW
    EXECUTE FUNCTION update_bookings_simple_updated_at();
`

  console.log('📋 SQL to create simplified bookings table:\n')
  console.log(createTableSQL)
  
  console.log('\n💡 Note: This creates a denormalized table that matches the API structure.')
  console.log('   For production, you might want to:')
  console.log('   - Keep the normalized structure and update the API')
  console.log('   - Create database triggers to sync data between tables')
  console.log('   - Use database views for different access patterns')
}

// Main execution
async function main() {
  console.log('🚀 Somerset Window Cleaning - Supabase Setup\n')
  
  // Check current structure
  await checkTableStructure()
  
  // Show RLS setup instructions
  await setupRLSPolicies()
  
  // Show simplified table creation option
  await createSimplifiedBookingsTable()
  
  console.log('\n✅ Setup instructions generated!')
  console.log('📝 Choose one of the following approaches:')
  console.log('   1. Run the RLS policies SQL to enable public access')
  console.log('   2. Create the simplified bookings table for API compatibility')
  console.log('   3. Update the API to work with the normalized database structure')
}

main().catch(console.error)