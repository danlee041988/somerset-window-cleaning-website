-- Simple Somerset Window Cleaning Database Setup
-- Copy and paste this entire script into the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    city VARCHAR(100) DEFAULT 'Somerset',
    property_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    base_price DECIMAL(8,2) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create service_areas table
CREATE TABLE service_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    postcode_prefix VARCHAR(10) NOT NULL UNIQUE,
    area_name VARCHAR(100) NOT NULL,
    service_charge_multiplier DECIMAL(3,2) DEFAULT 1.0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    service_id UUID NOT NULL REFERENCES services(id),
    booking_date DATE,
    time_slot VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    base_price DECIMAL(8,2) NOT NULL,
    total_price DECIMAL(8,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customer_communications table
CREATE TABLE customer_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    booking_id UUID REFERENCES bookings(id),
    communication_type VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    is_automated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for booking form
CREATE POLICY "Allow anonymous booking submission" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous booking creation" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous communication creation" ON customer_communications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public service reading" ON services FOR SELECT USING (active = true);
CREATE POLICY "Allow public service area reading" ON service_areas FOR SELECT USING (active = true);

-- Insert sample services
INSERT INTO services (name, slug, description, base_price, active) VALUES
('Standard Window Cleaning', 'window-cleaning', 'External window cleaning with frames and sills included', 25.00, true),
('Full House Clean', 'full-house-clean', 'Internal and external window cleaning service', 45.00, true),
('Conservatory Cleaning', 'conservatory-cleaning', 'Professional conservatory roof and frame cleaning', 65.00, true),
('Gutter Cleaning', 'gutter-cleaning', 'Complete gutter clearance and cleaning service', 55.00, true),
('Solar Panel Cleaning', 'solar-panel-cleaning', 'Specialist solar panel cleaning and maintenance', 75.00, true),
('Commercial Window Cleaning', 'commercial-cleaning', 'Regular commercial premises window cleaning', 35.00, true);

-- Insert sample service areas
INSERT INTO service_areas (postcode_prefix, area_name, service_charge_multiplier, active) VALUES
('BA16', 'Street', 1.0, true),
('BA6', 'Glastonbury', 1.0, true),
('BA5', 'Wells', 1.05, true),
('TA1', 'Taunton', 1.15, true),
('BA21', 'Yeovil', 1.20, true);

-- Success message
SELECT 'Somerset Window Cleaning database setup complete!' as result;