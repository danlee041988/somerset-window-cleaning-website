-- Somerset Window Cleaning - Supabase Migration Schema (Fixed Version)
-- This version fixes common SQL issues and ensures proper table creation

-- Enable necessary extensions first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types first (before tables that use them)
DO $$ BEGIN
    CREATE TYPE customer_type_enum AS ENUM ('residential', 'commercial', 'industrial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_access');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'processing', 'paid', 'failed', 'refunded', 'overdue');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'bank_transfer', 'direct_debit', 'paypal', 'stripe');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE priority_enum AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE price_unit_enum AS ENUM ('per_job', 'per_window', 'per_hour', 'per_sqm');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- CORE BUSINESS TABLES
-- =============================================================================

-- Customer profiles
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    city VARCHAR(100) DEFAULT 'Somerset',
    customer_type customer_type_enum DEFAULT 'residential',
    source VARCHAR(50), -- Marketing source tracking
    communication_preferences JSONB DEFAULT '{"email": true, "sms": false, "phone": true}',
    special_instructions TEXT,
    property_type VARCHAR(50), -- terraced, detached, apartment, etc.
    access_instructions TEXT, -- Gate codes, dogs, parking, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    long_description TEXT,
    base_price DECIMAL(8,2) NOT NULL,
    price_unit price_unit_enum DEFAULT 'per_job',
    estimated_duration_minutes INTEGER,
    equipment_needed JSONB,
    seasonal_multipliers JSONB,
    frequency_discounts JSONB,
    min_charge DECIMAL(8,2),
    max_charge DECIMAL(8,2),
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service areas
CREATE TABLE IF NOT EXISTS service_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    postcode_prefix VARCHAR(10) NOT NULL UNIQUE,
    area_name VARCHAR(100) NOT NULL,
    travel_time_minutes INTEGER,
    service_charge_multiplier DECIMAL(3,2) DEFAULT 1.0,
    fuel_cost_factor DECIMAL(3,2) DEFAULT 1.0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    booking_date DATE,
    time_slot VARCHAR(50), -- 'morning', 'afternoon', 'specific_time'
    specific_time TIME,
    status booking_status_enum DEFAULT 'pending',
    priority priority_enum DEFAULT 'normal',
    
    -- Pricing breakdown
    base_price DECIMAL(8,2) NOT NULL,
    area_multiplier DECIMAL(3,2) DEFAULT 1.0,
    seasonal_multiplier DECIMAL(3,2) DEFAULT 1.0,
    frequency_discount DECIMAL(3,2) DEFAULT 1.0,
    total_price DECIMAL(8,2) NOT NULL,
    
    -- Payment tracking
    payment_status payment_status_enum DEFAULT 'pending',
    payment_method payment_method_enum,
    payment_reference VARCHAR(100),
    payment_date TIMESTAMPTZ,
    
    -- Service delivery
    assigned_technician VARCHAR(100),
    estimated_arrival TIME,
    actual_arrival TIMESTAMPTZ,
    completion_time TIMESTAMPTZ,
    
    -- Quality and feedback
    quality_rating INTEGER CHECK(quality_rating >= 1 AND quality_rating <= 5),
    customer_feedback TEXT,
    internal_notes TEXT,
    
    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer communications
CREATE TABLE IF NOT EXISTS customer_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    
    communication_type VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL, -- email, sms, phone, whatsapp
    
    subject VARCHAR(255),
    message TEXT NOT NULL,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    
    -- Response tracking
    customer_response TEXT,
    response_sentiment VARCHAR(20), -- positive, neutral, negative
    
    -- Automation
    is_automated BOOLEAN DEFAULT false,
    template_used VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB -- Additional tracking data
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_customers_postcode ON customers(postcode);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Service area indexes
CREATE INDEX IF NOT EXISTS idx_service_areas_postcode ON service_areas(postcode_prefix);

-- Communication indexes
CREATE INDEX IF NOT EXISTS idx_communications_customer ON customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_communications_booking ON customer_communications(booking_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON customer_communications(communication_type);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON customer_communications(created_at);

-- =============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (for booking form)
DROP POLICY IF EXISTS "Allow anonymous booking submission" ON customers;
CREATE POLICY "Allow anonymous booking submission" ON customers
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous booking creation" ON bookings;
CREATE POLICY "Allow anonymous booking creation" ON bookings
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous communication creation" ON customer_communications;
CREATE POLICY "Allow anonymous communication creation" ON customer_communications
    FOR INSERT WITH CHECK (true);

-- Allow reading services and service areas for everyone
DROP POLICY IF EXISTS "Allow public service reading" ON services;
CREATE POLICY "Allow public service reading" ON services
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Allow public service area reading" ON service_areas;
CREATE POLICY "Allow public service area reading" ON service_areas
    FOR SELECT USING (active = true);

-- =============================================================================
-- SAMPLE DATA INSERTION
-- =============================================================================

-- Insert sample services
INSERT INTO services (name, slug, description, base_price, price_unit, estimated_duration_minutes, active) VALUES
('Standard Window Cleaning', 'window-cleaning', 'External window cleaning with frames and sills included', 25.00, 'per_job', 45, true),
('Full House Clean', 'full-house-clean', 'Internal and external window cleaning service', 45.00, 'per_job', 90, true),
('Conservatory Cleaning', 'conservatory-cleaning', 'Professional conservatory roof and frame cleaning', 65.00, 'per_job', 120, true),
('Gutter Cleaning', 'gutter-cleaning', 'Complete gutter clearance and cleaning service', 55.00, 'per_job', 90, true),
('Solar Panel Cleaning', 'solar-panel-cleaning', 'Specialist solar panel cleaning and maintenance', 75.00, 'per_job', 60, true),
('Commercial Window Cleaning', 'commercial-cleaning', 'Regular commercial premises window cleaning', 1.50, 'per_window', 120, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample service areas
INSERT INTO service_areas (postcode_prefix, area_name, travel_time_minutes, service_charge_multiplier, active) VALUES
('BA16', 'Street', 0, 1.0, true),
('BA6', 'Glastonbury', 10, 1.0, true),
('BA5', 'Wells', 15, 1.05, true),
('TA1', 'Taunton', 25, 1.15, true),
('BA21', 'Yeovil', 30, 1.20, true)
ON CONFLICT (postcode_prefix) DO NOTHING;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Somerset Window Cleaning database schema created successfully!';
    RAISE NOTICE '📊 Tables created: customers, services, service_areas, bookings, customer_communications';
    RAISE NOTICE '🔧 Sample data inserted: 6 services, 5 service areas';
    RAISE NOTICE '🔒 Row Level Security enabled with public booking access';
    RAISE NOTICE '🚀 Ready for booking form integration!';
END $$;