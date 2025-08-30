-- Somerset Window Cleaning - Supabase Migration Schema (Corrected)
-- Enhanced cloud database with real-time features, RLS, and business intelligence

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enable Row Level Security by default
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM public;

-- =============================================================================
-- ENUMS AND TYPES (MOVED TO TOP)
-- =============================================================================

CREATE TYPE customer_type_enum AS ENUM ('residential', 'commercial', 'industrial');
CREATE TYPE demand_level_enum AS ENUM ('low', 'medium', 'high', 'peak');
CREATE TYPE price_unit_enum AS ENUM ('per_job', 'per_window', 'per_hour', 'per_sqm');
CREATE TYPE skill_level_enum AS ENUM ('basic', 'standard', 'advanced', 'specialist');
CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_access');
CREATE TYPE priority_enum AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'processing', 'paid', 'failed', 'refunded', 'overdue');
CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'bank_transfer', 'direct_debit', 'paypal', 'stripe');
CREATE TYPE communication_type_enum AS ENUM ('booking_confirmation', 'reminder', 'arrival_notification', 'completion_notice', 'payment_request', 'follow_up', 'marketing', 'support');
CREATE TYPE communication_status_enum AS ENUM ('pending', 'sent', 'delivered', 'read', 'responded', 'failed', 'bounced');

-- =============================================================================
-- CORE BUSINESS TABLES
-- =============================================================================

-- Customer profiles with enhanced location and preferences
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    city VARCHAR(100) DEFAULT 'Somerset',
    -- PostGIS point for precise location
    location GEOGRAPHY(POINT, 4326),
    customer_type customer_type_enum DEFAULT 'residential',
    source VARCHAR(50), -- Marketing source tracking
    communication_preferences JSONB DEFAULT '{"email": true, "sms": false, "phone": true}',
    special_instructions TEXT,
    property_type VARCHAR(50), -- terraced, detached, apartment, etc.
    access_instructions TEXT, -- Gate codes, dogs, parking, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Full-text search index
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(first_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(last_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(email, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(address, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(postcode, '')), 'A')
    ) STORED
);

-- Service areas with geographic boundaries
CREATE TABLE service_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    postcode_prefix VARCHAR(10) NOT NULL UNIQUE,
    area_name VARCHAR(100) NOT NULL,
    -- Geographic boundary using PostGIS
    boundary GEOGRAPHY(POLYGON, 4326),
    center_point GEOGRAPHY(POINT, 4326),
    travel_time_minutes INTEGER,
    service_charge_multiplier DECIMAL(3,2) DEFAULT 1.0,
    fuel_cost_factor DECIMAL(3,2) DEFAULT 1.0,
    demand_level demand_level_enum DEFAULT 'medium',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Enhanced services with dynamic pricing
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    long_description TEXT,
    base_price DECIMAL(8,2) NOT NULL,
    price_unit price_unit_enum DEFAULT 'per_job',
    estimated_duration_minutes INTEGER,
    equipment_needed JSONB, -- Array of equipment IDs
    skill_level skill_level_enum DEFAULT 'standard',
    seasonal_multipliers JSONB, -- {"winter": 1.2, "summer": 0.9}
    frequency_discounts JSONB, -- {"weekly": 0.9, "monthly": 0.95}
    min_charge DECIMAL(8,2),
    max_charge DECIMAL(8,2),
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced bookings with real-time status tracking
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    booking_date DATE NOT NULL,
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
    
    -- Media
    before_photos JSONB, -- Array of photo URLs
    after_photos JSONB, -- Array of photo URLs
    
    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_rating CHECK (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5))
);

-- =============================================================================
-- ADVANCED BUSINESS FEATURES
-- =============================================================================

-- Real-time customer communications
CREATE TABLE customer_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    
    communication_type communication_type_enum NOT NULL,
    channel VARCHAR(50) NOT NULL, -- email, sms, phone, whatsapp
    
    subject VARCHAR(255),
    message TEXT NOT NULL,
    
    -- Status tracking
    status communication_status_enum DEFAULT 'pending',
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

-- Advanced analytics and reporting
CREATE TABLE business_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(12,2),
    metric_unit VARCHAR(20),
    
    -- Dimensional data
    service_area VARCHAR(50),
    service_type VARCHAR(50),
    customer_segment VARCHAR(50),
    
    -- Metadata
    calculation_method VARCHAR(100),
    data_sources JSONB,
    confidence_score DECIMAL(3,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint for daily metrics
    UNIQUE(date, metric_type, metric_name, service_area, service_type, customer_segment)
);

-- Competitor intelligence tracking
CREATE TABLE competitor_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_name VARCHAR(200) NOT NULL,
    website_url VARCHAR(500),
    
    -- Service analysis
    services_offered JSONB,
    pricing_data JSONB,
    service_areas JSONB,
    
    -- Online presence
    google_rating DECIMAL(2,1),
    google_review_count INTEGER,
    facebook_followers INTEGER,
    instagram_followers INTEGER,
    website_traffic_estimate INTEGER,
    
    -- SEO metrics
    domain_authority INTEGER,
    local_search_visibility DECIMAL(5,2),
    keyword_rankings JSONB,
    
    -- Analysis data
    strengths TEXT[],
    weaknesses TEXT[],
    opportunities TEXT[],
    threats TEXT[],
    
    analysis_date DATE NOT NULL,
    analyst VARCHAR(100), -- 'AI' or person name
    confidence_score DECIMAL(3,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Customer indexes
CREATE INDEX idx_customers_postcode ON customers(postcode);
CREATE INDEX idx_customers_location ON customers USING GIST(location);
CREATE INDEX idx_customers_search ON customers USING GIN(search_vector);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- Booking indexes
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Service area indexes
CREATE INDEX idx_service_areas_boundary ON service_areas USING GIST(boundary);
CREATE INDEX idx_service_areas_center ON service_areas USING GIST(center_point);
CREATE INDEX idx_service_areas_postcode ON service_areas(postcode_prefix);

-- Communication indexes
CREATE INDEX idx_communications_customer ON customer_communications(customer_id);
CREATE INDEX idx_communications_type ON customer_communications(communication_type);
CREATE INDEX idx_communications_status ON customer_communications(status);
CREATE INDEX idx_communications_created_at ON customer_communications(created_at);

-- Analytics indexes
CREATE INDEX idx_metrics_date ON business_metrics(date);
CREATE INDEX idx_metrics_type ON business_metrics(metric_type, metric_name);
CREATE INDEX idx_metrics_area ON business_metrics(service_area);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;

-- Basic policies (customize based on your authentication setup)
CREATE POLICY "Enable read access for authenticated users" ON customers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON bookings
    FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================================================
-- REAL-TIME SUBSCRIPTIONS
-- =============================================================================

-- Enable real-time for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE customer_communications;

-- =============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================================================

-- Calculate distance between customer and service area
CREATE OR REPLACE FUNCTION calculate_service_distance(customer_location geography, area_center geography)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ST_Distance(customer_location, area_center) / 1609.34; -- Convert to miles
END;
$$ LANGUAGE plpgsql;

-- Dynamic pricing calculation
CREATE OR REPLACE FUNCTION calculate_booking_price(
    p_service_id UUID,
    p_customer_id UUID,
    p_booking_date DATE
) RETURNS DECIMAL AS $$
DECLARE
    base_price DECIMAL;
    area_multiplier DECIMAL := 1.0;
    seasonal_multiplier DECIMAL := 1.0;
    frequency_discount DECIMAL := 1.0;
    final_price DECIMAL;
BEGIN
    -- Get base price
    SELECT s.base_price INTO base_price
    FROM services s
    WHERE s.id = p_service_id;
    
    -- Calculate area multiplier (simplified - would use PostGIS in practice)
    SELECT COALESCE(sa.service_charge_multiplier, 1.0) INTO area_multiplier
    FROM customers c
    JOIN service_areas sa ON c.postcode LIKE sa.postcode_prefix || '%'
    WHERE c.id = p_customer_id
    LIMIT 1;
    
    -- Calculate seasonal multiplier (simplified example)
    seasonal_multiplier := CASE
        WHEN EXTRACT(MONTH FROM p_booking_date) IN (12, 1, 2) THEN 1.1
        WHEN EXTRACT(MONTH FROM p_booking_date) IN (6, 7, 8) THEN 0.95
        ELSE 1.0
    END;
    
    -- Calculate frequency discount based on booking history
    SELECT CASE
        WHEN COUNT(*) >= 12 THEN 0.85  -- Loyal customer discount
        WHEN COUNT(*) >= 6 THEN 0.90   -- Regular customer discount
        WHEN COUNT(*) >= 3 THEN 0.95   -- Repeat customer discount
        ELSE 1.0
    END INTO frequency_discount
    FROM bookings b
    WHERE b.customer_id = p_customer_id
      AND b.status = 'completed'
      AND b.completion_time >= NOW() - INTERVAL '12 months';
    
    final_price := base_price * area_multiplier * seasonal_multiplier * frequency_discount;
    
    RETURN ROUND(final_price, 2);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS FOR AUTOMATION
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
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VIEWS FOR COMMON BUSINESS QUERIES
-- =============================================================================

-- Customer lifetime value view
CREATE VIEW customer_lifetime_value AS
SELECT 
    c.id,
    c.first_name || ' ' || c.last_name as customer_name,
    c.postcode,
    COUNT(b.id) as total_jobs,
    SUM(b.total_price) as total_revenue,
    AVG(b.quality_rating) as avg_rating,
    MIN(b.booking_date) as first_job_date,
    MAX(b.booking_date) as last_job_date,
    CASE 
        WHEN MAX(b.booking_date) >= CURRENT_DATE - INTERVAL '3 months' THEN 'Active'
        WHEN MAX(b.booking_date) >= CURRENT_DATE - INTERVAL '12 months' THEN 'Dormant'
        ELSE 'Inactive'
    END as status,
    ST_Y(c.location::geometry) as latitude,
    ST_X(c.location::geometry) as longitude
FROM customers c
LEFT JOIN bookings b ON c.id = b.customer_id AND b.status = 'completed'
GROUP BY c.id;

-- Monthly revenue dashboard
CREATE VIEW monthly_revenue_dashboard AS
SELECT 
    DATE_TRUNC('month', booking_date) as month,
    COUNT(*) as total_jobs,
    SUM(total_price) as revenue,
    AVG(total_price) as avg_job_value,
    COUNT(DISTINCT customer_id) as unique_customers,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_jobs,
    AVG(quality_rating) FILTER (WHERE quality_rating IS NOT NULL) as avg_rating
FROM bookings 
GROUP BY DATE_TRUNC('month', booking_date)
ORDER BY month DESC;

-- Service area performance
CREATE VIEW area_performance_dashboard AS
SELECT 
    sa.area_name,
    sa.postcode_prefix,
    COUNT(b.id) as total_jobs,
    SUM(b.total_price) as total_revenue,
    AVG(b.total_price) as avg_job_value,
    COUNT(DISTINCT b.customer_id) as unique_customers,
    AVG(b.quality_rating) FILTER (WHERE b.quality_rating IS NOT NULL) as avg_rating,
    sa.service_charge_multiplier,
    sa.demand_level
FROM service_areas sa
LEFT JOIN customers c ON ST_Contains(sa.boundary, c.location)
LEFT JOIN bookings b ON c.id = b.customer_id AND b.status = 'completed'
WHERE sa.active = true
GROUP BY sa.id, sa.area_name, sa.postcode_prefix, sa.service_charge_multiplier, sa.demand_level
ORDER BY total_revenue DESC NULLS LAST;

-- =============================================================================
-- SAMPLE DATA INSERTION
-- =============================================================================

-- Insert sample services
INSERT INTO services (name, slug, description, base_price, price_unit, estimated_duration_minutes) VALUES
('Standard Window Cleaning', 'window-cleaning', 'External window cleaning with frames and sills included', 25.00, 'per_job', 45),
('Full House Clean', 'full-house-clean', 'Internal and external window cleaning service', 45.00, 'per_job', 90),
('Conservatory Cleaning', 'conservatory-cleaning', 'Professional conservatory roof and frame cleaning', 65.00, 'per_job', 120),
('Gutter Cleaning', 'gutter-cleaning', 'Complete gutter clearance and cleaning service', 55.00, 'per_job', 90),
('Solar Panel Cleaning', 'solar-panel-cleaning', 'Specialist solar panel cleaning and maintenance', 75.00, 'per_job', 60),
('Commercial Window Cleaning', 'commercial-cleaning', 'Regular commercial premises window cleaning', 1.50, 'per_window', 120);

-- Insert sample service areas
INSERT INTO service_areas (postcode_prefix, area_name, center_point, travel_time_minutes, service_charge_multiplier) VALUES
('BA16', 'Street', ST_GeogFromText('POINT(-2.7387 51.2441)'), 0, 1.0),
('BA6', 'Glastonbury', ST_GeogFromText('POINT(-2.7144 51.1486)'), 10, 1.0),
('BA5', 'Wells', ST_GeogFromText('POINT(-2.6464 51.2090)'), 15, 1.05),
('TA1', 'Taunton', ST_GeogFromText('POINT(-3.1056 51.0147)'), 25, 1.15),
('BA21', 'Yeovil', ST_GeogFromText('POINT(-2.6316 50.9417)'), 30, 1.20);

-- This schema provides a robust foundation for your Somerset Window Cleaning business
-- with real-time capabilities, geographic intelligence, and advanced analytics.