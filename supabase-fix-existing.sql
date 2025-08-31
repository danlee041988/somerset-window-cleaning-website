-- Somerset Window Cleaning - Fix Existing Supabase Setup
-- This script works with your existing tables and only adds what's needed

-- =============================================================================
-- STEP 1: Fix RLS Policies for Existing Tables Only
-- =============================================================================

-- Drop existing policies if any (won't error if they don't exist)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON bookings;
DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
DROP POLICY IF EXISTS "Enable insert for all users" ON customers;
DROP POLICY IF EXISTS "Enable update for all users" ON customers;
DROP POLICY IF EXISTS "Enable read access for all users" ON bookings;
DROP POLICY IF EXISTS "Enable insert for all users" ON bookings;
DROP POLICY IF EXISTS "Enable read access for all users" ON services;
DROP POLICY IF EXISTS "Enable read access for all users" ON service_areas;
DROP POLICY IF EXISTS "Enable insert for all users" ON customer_communications;

-- Create public access policies for existing customers table
CREATE POLICY "Enable read access for all users" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON customers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON customers
    FOR UPDATE USING (true);

-- Create public access policies for existing bookings table
CREATE POLICY "Enable read access for all users" ON bookings
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON bookings
    FOR INSERT WITH CHECK (true);

-- Create public read access for services
CREATE POLICY "Enable read access for all users" ON services
    FOR SELECT USING (true);

-- Create public read access for service_areas
CREATE POLICY "Enable read access for all users" ON service_areas
    FOR SELECT USING (true);

-- Create public insert access for customer_communications
CREATE POLICY "Enable insert for all users" ON customer_communications
    FOR INSERT WITH CHECK (true);

-- =============================================================================
-- STEP 2: Create NEW Simplified Bookings Table (Only if it doesn't exist)
-- =============================================================================

-- Create the simplified bookings table for API compatibility
CREATE TABLE IF NOT EXISTS bookings_simple (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Property and service details
    property_type VARCHAR(50) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    additional_services JSONB DEFAULT '[]',
    
    -- Customer information (denormalized for API compatibility)
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

-- Create indexes for performance (only if table was just created)
CREATE INDEX IF NOT EXISTS idx_bookings_simple_email ON bookings_simple(email);
CREATE INDEX IF NOT EXISTS idx_bookings_simple_status ON bookings_simple(status);
CREATE INDEX IF NOT EXISTS idx_bookings_simple_created_at ON bookings_simple(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_simple_postcode ON bookings_simple(postcode);

-- Enable RLS for the simplified table
ALTER TABLE bookings_simple ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for bookings_simple (in case they exist)
DROP POLICY IF EXISTS "Enable read access for all users" ON bookings_simple;
DROP POLICY IF EXISTS "Enable insert for all users" ON bookings_simple;
DROP POLICY IF EXISTS "Enable update for all users" ON bookings_simple;

-- Create public access policies for the simplified table
CREATE POLICY "Enable read access for all users" ON bookings_simple
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON bookings_simple
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON bookings_simple
    FOR UPDATE USING (true);

-- Create update trigger for updated_at (replace if exists)
CREATE OR REPLACE FUNCTION update_bookings_simple_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create it
DROP TRIGGER IF EXISTS update_bookings_simple_updated_at ON bookings_simple;
CREATE TRIGGER update_bookings_simple_updated_at
    BEFORE UPDATE ON bookings_simple
    FOR EACH ROW
    EXECUTE FUNCTION update_bookings_simple_updated_at();

-- =============================================================================
-- STEP 3: Insert test data to verify it works
-- =============================================================================

-- Insert a test booking to verify the setup works
INSERT INTO bookings_simple (
    property_type,
    frequency,
    full_name,
    email,
    phone,
    address,
    city,
    postcode,
    contact_method,
    estimated_price,
    notes
) VALUES (
    'Semi-Detached House',
    '4weekly',
    'Test Customer',
    'test@example.com',
    '01234567890',
    '123 Test Street',
    'Street',
    'BA16 0HW',
    'email',
    25.00,
    'Test booking created during setup'
) ON CONFLICT DO NOTHING;

-- =============================================================================
-- VERIFICATION - Show what was created
-- =============================================================================

-- Show table info
SELECT 
    'bookings_simple' as table_name,
    COUNT(*) as row_count
FROM bookings_simple
UNION ALL
SELECT 
    'customers' as table_name,
    COUNT(*) as row_count
FROM customers
UNION ALL
SELECT 
    'services' as table_name,
    COUNT(*) as row_count
FROM services;

-- Show RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE schemaname = t.schemaname AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename IN ('customers', 'bookings', 'bookings_simple', 'services', 'service_areas', 'customer_communications')
ORDER BY tablename;