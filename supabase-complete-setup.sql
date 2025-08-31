-- Somerset Window Cleaning - Complete Supabase Setup
-- This script resolves RLS issues and creates the table structure needed by the API

-- =============================================================================
-- STEP 1: Fix RLS Policies for Existing Tables
-- =============================================================================

-- Disable RLS temporarily to set up policies
ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS services DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS service_areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_communications DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
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

-- Re-enable RLS
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_communications ENABLE ROW LEVEL SECURITY;

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

-- =============================================================================
-- STEP 2: Create Simplified Bookings Table for API Compatibility
-- =============================================================================

-- Create a simplified bookings table that matches the current API structure
CREATE TABLE IF NOT EXISTS bookings_simple (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_simple_email ON bookings_simple(email);
CREATE INDEX IF NOT EXISTS idx_bookings_simple_status ON bookings_simple(status);
CREATE INDEX IF NOT EXISTS idx_bookings_simple_created_at ON bookings_simple(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_simple_postcode ON bookings_simple(postcode);

-- Enable RLS for the simplified table
ALTER TABLE bookings_simple ENABLE ROW LEVEL SECURITY;

-- Create public access policies for the simplified table
CREATE POLICY "Enable read access for all users" ON bookings_simple
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON bookings_simple
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON bookings_simple
    FOR UPDATE USING (true);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_bookings_simple_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bookings_simple_updated_at ON bookings_simple;
CREATE TRIGGER update_bookings_simple_updated_at
    BEFORE UPDATE ON bookings_simple
    FOR EACH ROW
    EXECUTE FUNCTION update_bookings_simple_updated_at();

-- =============================================================================
-- STEP 3: Create a Sync Function (Optional - for keeping both structures)
-- =============================================================================

-- Function to sync bookings_simple data to the normalized structure
CREATE OR REPLACE FUNCTION sync_simple_to_normalized()
RETURNS TRIGGER AS $$
DECLARE
    customer_uuid UUID;
    service_uuid UUID;
BEGIN
    -- Create or get customer
    INSERT INTO customers (
        first_name, 
        last_name, 
        email, 
        phone, 
        address, 
        postcode, 
        city, 
        property_type
    ) VALUES (
        split_part(NEW.full_name, ' ', 1),
        COALESCE(substring(NEW.full_name from position(' ' in NEW.full_name) + 1), ''),
        NEW.email,
        NEW.phone,
        NEW.address,
        NEW.postcode,
        NEW.city,
        NEW.property_type
    )
    ON CONFLICT (email) DO UPDATE SET
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        postcode = EXCLUDED.postcode,
        city = EXCLUDED.city,
        property_type = EXCLUDED.property_type,
        updated_at = NOW()
    RETURNING id INTO customer_uuid;

    -- Get window cleaning service ID
    SELECT id INTO service_uuid 
    FROM services 
    WHERE slug = 'window-cleaning' 
    LIMIT 1;

    -- Insert into normalized bookings table
    IF service_uuid IS NOT NULL THEN
        INSERT INTO bookings (
            customer_id,
            service_id,
            booking_date,
            time_slot,
            status,
            base_price,
            total_price,
            payment_status,
            internal_notes
        ) VALUES (
            customer_uuid,
            service_uuid,
            COALESCE(NEW.preferred_date, CURRENT_DATE + INTERVAL '7 days'),
            'morning',
            NEW.status,
            COALESCE(NEW.estimated_price, 25.00),
            COALESCE(NEW.estimated_price, 25.00),
            'pending',
            jsonb_build_object(
                'property_type', NEW.property_type,
                'frequency', NEW.frequency,
                'additional_services', NEW.additional_services,
                'contact_method', NEW.contact_method,
                'notes', NEW.notes,
                'special_offer', NEW.special_offer,
                'source', NEW.source,
                'simple_booking_id', NEW.id
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync data (optional - enable only if you want both structures)
-- DROP TRIGGER IF EXISTS sync_bookings_trigger ON bookings_simple;
-- CREATE TRIGGER sync_bookings_trigger
--     AFTER INSERT ON bookings_simple
--     FOR EACH ROW
--     EXECUTE FUNCTION sync_simple_to_normalized();

-- =============================================================================
-- STEP 4: Insert Sample Services if Not Exists
-- =============================================================================

-- Ensure window cleaning service exists
INSERT INTO services (name, slug, description, base_price, price_unit, estimated_duration_minutes, active)
SELECT 'Standard Window Cleaning', 'window-cleaning', 'External window cleaning with frames and sills included', 25.00, 'per_job', 45, true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'window-cleaning');

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check that RLS is properly configured
SELECT 
    tablename, 
    rowsecurity,
    (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename IN ('customers', 'bookings', 'bookings_simple', 'services', 'service_areas', 'customer_communications')
ORDER BY tablename;

-- Show available services
SELECT name, slug, base_price, active FROM services ORDER BY name;

-- Show service areas
SELECT area_name, postcode_prefix, active FROM service_areas ORDER BY area_name;