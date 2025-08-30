-- Somerset Window Cleaning Business Database Schema
-- This database will be used with the SQLite MCP server for business intelligence

-- Customer information and contact details
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT NOT NULL,
    postcode TEXT NOT NULL,
    city TEXT DEFAULT 'Somerset',
    latitude REAL,
    longitude REAL,
    customer_type TEXT CHECK(customer_type IN ('residential', 'commercial')) DEFAULT 'residential',
    source TEXT, -- How they found us (google, referral, facebook, etc.)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Service locations and coverage areas
CREATE TABLE service_areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postcode_prefix TEXT NOT NULL UNIQUE, -- BS21, BA16, etc.
    area_name TEXT NOT NULL, -- Taunton, Wells, Street, etc.
    travel_time_minutes INTEGER, -- Travel time from base
    service_charge_multiplier REAL DEFAULT 1.0, -- Pricing adjustment for distance
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service types and pricing
CREATE TABLE services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    base_price REAL NOT NULL,
    price_unit TEXT DEFAULT 'per_job', -- per_job, per_window, per_hour
    frequency TEXT, -- one_time, weekly, monthly, quarterly
    estimated_duration_minutes INTEGER,
    requires_equipment TEXT, -- List of equipment needed
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer bookings and job history
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    time_slot TEXT, -- morning, afternoon, specific_time
    status TEXT CHECK(status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'pending',
    total_price REAL NOT NULL,
    payment_status TEXT CHECK(payment_status IN ('pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
    payment_method TEXT, -- cash, card, bank_transfer, direct_debit
    special_instructions TEXT,
    completion_date DATETIME,
    quality_rating INTEGER CHECK(quality_rating >= 1 AND quality_rating <= 5),
    customer_feedback TEXT,
    before_photos TEXT, -- JSON array of photo URLs
    after_photos TEXT, -- JSON array of photo URLs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id),
    FOREIGN KEY (service_id) REFERENCES services (id)
);

-- Recurring service schedules
CREATE TABLE recurring_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    frequency_days INTEGER NOT NULL, -- 7, 14, 28, 56, 84 for weekly, fortnightly, monthly, etc.
    next_service_date DATE NOT NULL,
    last_service_date DATE,
    active BOOLEAN DEFAULT 1,
    preferred_time_slot TEXT,
    special_instructions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id),
    FOREIGN KEY (service_id) REFERENCES services (id)
);

-- Customer reviews and testimonials
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    booking_id INTEGER,
    platform TEXT, -- google, facebook, website, etc.
    rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT,
    reviewer_name TEXT,
    review_date DATE NOT NULL,
    response_text TEXT, -- Our response to the review
    response_date DATE,
    featured BOOLEAN DEFAULT 0, -- Whether to feature on website
    public BOOLEAN DEFAULT 1, -- Whether review is public
    source_url TEXT, -- Link to original review
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id),
    FOREIGN KEY (booking_id) REFERENCES bookings (id)
);

-- Marketing campaigns and lead tracking
CREATE TABLE marketing_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT, -- google_ads, facebook, leaflets, referral, etc.
    start_date DATE,
    end_date DATE,
    budget REAL,
    target_area TEXT, -- Which postcodes/areas targeted
    status TEXT CHECK(status IN ('planning', 'active', 'paused', 'completed')) DEFAULT 'planning',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Track lead sources and conversion
CREATE TABLE leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER, -- NULL until converted to customer
    campaign_id INTEGER,
    source TEXT NOT NULL, -- google, facebook, referral, website, phone, etc.
    source_detail TEXT, -- Specific ad, referrer name, etc.
    contact_method TEXT, -- phone, email, whatsapp, contact_form
    lead_date DATE NOT NULL,
    conversion_date DATE, -- When they became a paying customer
    estimated_value REAL, -- Potential job value
    actual_value REAL, -- Actual first job value
    notes TEXT,
    status TEXT CHECK(status IN ('new', 'contacted', 'quoted', 'converted', 'lost')) DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id),
    FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns (id)
);

-- Website analytics and performance tracking
CREATE TABLE website_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    bounce_rate REAL DEFAULT 0,
    avg_session_duration REAL DEFAULT 0,
    conversion_rate REAL DEFAULT 0, -- Contact form submissions / visitors
    top_pages TEXT, -- JSON array of popular pages
    traffic_sources TEXT, -- JSON object with source breakdown
    device_breakdown TEXT, -- JSON object with mobile/desktop stats
    location_data TEXT, -- JSON object with visitor locations
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Competitor analysis data
CREATE TABLE competitor_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competitor_name TEXT NOT NULL,
    website_url TEXT,
    service_areas TEXT, -- JSON array of areas they cover
    pricing_data TEXT, -- JSON object with their prices
    review_count INTEGER,
    average_rating REAL,
    google_ads_active BOOLEAN DEFAULT 0,
    social_media_presence TEXT, -- JSON object with platform links
    unique_selling_points TEXT, -- What makes them different
    analysis_date DATE NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Equipment and resource management
CREATE TABLE equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT, -- pole, squeegee, bucket, van, etc.
    purchase_date DATE,
    purchase_cost REAL,
    condition TEXT CHECK(condition IN ('excellent', 'good', 'fair', 'poor', 'needs_replacement')),
    maintenance_schedule_days INTEGER, -- How often it needs maintenance
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    location TEXT, -- Where it's stored/assigned
    active BOOLEAN DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial service data
INSERT INTO services (name, description, base_price, price_unit, estimated_duration_minutes) VALUES
('Standard Window Cleaning', 'External window cleaning with frames and sills', 15.00, 'per_job', 45),
('Internal & External Windows', 'Complete window cleaning service inside and out', 25.00, 'per_job', 75),
('Conservatory Roof Cleaning', 'Professional conservatory roof and frame cleaning', 45.00, 'per_job', 120),
('Gutter Cleaning', 'Complete gutter clearance and cleaning service', 35.00, 'per_job', 90),
('Fascia & Soffit Cleaning', 'UPVC fascia and soffit restoration cleaning', 40.00, 'per_job', 105),
('Solar Panel Cleaning', 'Professional solar panel cleaning and maintenance', 50.00, 'per_job', 90),
('Commercial Window Cleaning', 'Regular commercial premises window cleaning', 0.50, 'per_window', 120),
('One-Off Deep Clean', 'Comprehensive exterior cleaning package', 75.00, 'per_job', 180);

-- Insert Somerset service areas
INSERT INTO service_areas (postcode_prefix, area_name, travel_time_minutes, service_charge_multiplier) VALUES
('BA16', 'Street', 0, 1.0),
('BA6', 'Glastonbury', 10, 1.0),
('BA5', 'Wells', 15, 1.0),
('TA7', 'Bridgwater', 20, 1.1),
('TA1', 'Taunton', 25, 1.1),
('BA21', 'Yeovil', 30, 1.2),
('BS28', 'Weston-super-Mare', 35, 1.2),
('BA11', 'Frome', 25, 1.1),
('TA9', 'Burnham-on-Sea', 20, 1.1),
('TA8', 'Burnham-on-Sea', 20, 1.1);

-- Create indexes for better performance
CREATE INDEX idx_customers_postcode ON customers(postcode);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_date ON reviews(review_date);
CREATE INDEX idx_leads_date ON leads(lead_date);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_website_metrics_date ON website_metrics(date);

-- Create views for common business queries
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
        WHEN COUNT(rs.id) > 0 THEN 'Regular'
        ELSE 'One-off'
    END as customer_type
FROM customers c
LEFT JOIN bookings b ON c.id = b.customer_id AND b.status = 'completed'
LEFT JOIN recurring_schedules rs ON c.id = rs.customer_id AND rs.active = 1
GROUP BY c.id;

CREATE VIEW monthly_revenue AS
SELECT 
    strftime('%Y-%m', booking_date) as month,
    COUNT(*) as total_jobs,
    SUM(total_price) as revenue,
    AVG(total_price) as avg_job_value,
    COUNT(DISTINCT customer_id) as unique_customers
FROM bookings 
WHERE status = 'completed'
GROUP BY strftime('%Y-%m', booking_date)
ORDER BY month DESC;

CREATE VIEW area_performance AS
SELECT 
    sa.area_name,
    sa.postcode_prefix,
    COUNT(b.id) as total_jobs,
    SUM(b.total_price) as total_revenue,
    AVG(b.total_price) as avg_job_value,
    COUNT(DISTINCT b.customer_id) as unique_customers,
    AVG(b.quality_rating) as avg_rating
FROM service_areas sa
LEFT JOIN customers c ON c.postcode LIKE sa.postcode_prefix || '%'
LEFT JOIN bookings b ON c.id = b.customer_id AND b.status = 'completed'
WHERE sa.active = 1
GROUP BY sa.id, sa.area_name, sa.postcode_prefix
ORDER BY total_revenue DESC;