-- Enhanced Quote Management Database Migration
-- Somerset Window Cleaning Staff Portal Enhancements

-- Add new columns to bookings_simple table for enhanced quote management
ALTER TABLE bookings_simple
ADD COLUMN IF NOT EXISTS quote_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS quote_status VARCHAR(20) DEFAULT 'pending' CHECK (quote_status IN ('pending', 'accepted', 'rejected', 'negotiating')),
ADD COLUMN IF NOT EXISTS quote_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS first_clean_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS first_clean_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS customer_feedback TEXT,
ADD COLUMN IF NOT EXISTS revenue_potential DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS quote_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS service_frequency VARCHAR(20),
ADD COLUMN IF NOT EXISTS next_service_date DATE,
ADD COLUMN IF NOT EXISTS customer_satisfaction_score INTEGER CHECK (customer_satisfaction_score >= 1 AND customer_satisfaction_score <= 5),
ADD COLUMN IF NOT EXISTS staff_notes TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_simple_quote_status ON bookings_simple(quote_status);
CREATE INDEX IF NOT EXISTS idx_bookings_simple_follow_up_date ON bookings_simple(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_bookings_simple_first_clean_completed ON bookings_simple(first_clean_completed);
CREATE INDEX IF NOT EXISTS idx_bookings_simple_next_service_date ON bookings_simple(next_service_date);
CREATE INDEX IF NOT EXISTS idx_bookings_simple_priority ON bookings_simple(priority);

-- Create a function to automatically update revenue_potential when quote_amount changes
CREATE OR REPLACE FUNCTION update_revenue_potential()
RETURNS TRIGGER AS $$
BEGIN
    -- Set revenue_potential to quote_amount when quote is created/updated
    IF NEW.quote_amount IS NOT NULL THEN
        NEW.revenue_potential := NEW.quote_amount;
    END IF;
    
    -- Set quote_date if not already set and quote_amount is being added
    IF NEW.quote_amount IS NOT NULL AND OLD.quote_amount IS NULL AND NEW.quote_date IS NULL THEN
        NEW.quote_date := NOW();
    END IF;
    
    -- Update status to 'quoted' when quote amount is added
    IF NEW.quote_amount IS NOT NULL AND OLD.quote_amount IS NULL THEN
        NEW.status := 'quoted';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic revenue potential updates
DROP TRIGGER IF EXISTS trigger_update_revenue_potential ON bookings_simple;
CREATE TRIGGER trigger_update_revenue_potential
    BEFORE UPDATE ON bookings_simple
    FOR EACH ROW
    EXECUTE FUNCTION update_revenue_potential();

-- Create a function to log quote history
CREATE OR REPLACE FUNCTION log_quote_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if quote_amount or quote_status changed
    IF (OLD.quote_amount IS DISTINCT FROM NEW.quote_amount) OR 
       (OLD.quote_status IS DISTINCT FROM NEW.quote_status) THEN
        
        NEW.quote_history := COALESCE(NEW.quote_history, '[]'::jsonb) || 
        jsonb_build_object(
            'timestamp', NOW(),
            'old_amount', OLD.quote_amount,
            'new_amount', NEW.quote_amount,
            'old_status', OLD.quote_status,
            'new_status', NEW.quote_status,
            'changed_by', 'system'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quote history logging
DROP TRIGGER IF EXISTS trigger_log_quote_history ON bookings_simple;
CREATE TRIGGER trigger_log_quote_history
    BEFORE UPDATE ON bookings_simple
    FOR EACH ROW
    EXECUTE FUNCTION log_quote_history();

-- Update existing records with default values
UPDATE bookings_simple 
SET 
    quote_status = 'pending',
    revenue_potential = estimated_price,
    quote_amount = estimated_price
WHERE estimated_price IS NOT NULL AND quote_amount IS NULL;

-- Create a view for analytics and reporting
CREATE OR REPLACE VIEW booking_analytics AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    status,
    quote_status,
    COUNT(*) as booking_count,
    AVG(quote_amount) as avg_quote_amount,
    SUM(quote_amount) as total_quote_value,
    SUM(CASE WHEN quote_status = 'accepted' THEN quote_amount ELSE 0 END) as accepted_revenue,
    ROUND(
        (COUNT(CASE WHEN quote_status = 'accepted' THEN 1 END)::decimal / 
         NULLIF(COUNT(CASE WHEN status = 'quoted' THEN 1 END), 0)) * 100, 2
    ) as acceptance_rate
FROM bookings_simple
WHERE created_at >= DATE_TRUNC('year', NOW()) - INTERVAL '1 year'
GROUP BY DATE_TRUNC('month', created_at), status, quote_status
ORDER BY month DESC, status, quote_status;

-- Create a function to get follow-up reminders
CREATE OR REPLACE FUNCTION get_follow_up_reminders(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
    id INTEGER,
    full_name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    days_overdue INTEGER,
    status VARCHAR,
    quote_status VARCHAR,
    quote_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.full_name,
        b.email,
        b.phone,
        b.follow_up_date,
        CASE 
            WHEN b.follow_up_date < NOW() THEN 
                EXTRACT(DAY FROM NOW() - b.follow_up_date)::INTEGER
            ELSE 0
        END as days_overdue,
        b.status,
        b.quote_status,
        b.quote_amount
    FROM bookings_simple b
    WHERE b.follow_up_date IS NOT NULL 
        AND b.follow_up_date <= NOW() + INTERVAL '1 day' * days_ahead
        AND b.status NOT IN ('completed', 'cancelled')
    ORDER BY b.follow_up_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to automatically schedule next service
CREATE OR REPLACE FUNCTION schedule_next_service()
RETURNS TRIGGER AS $$
BEGIN
    -- When first clean is completed, calculate next service date based on frequency
    IF NEW.first_clean_completed = TRUE AND OLD.first_clean_completed = FALSE THEN
        NEW.next_service_date := CASE 
            WHEN NEW.service_frequency = '4-weekly' THEN NEW.first_clean_date + INTERVAL '4 weeks'
            WHEN NEW.service_frequency = '8-weekly' THEN NEW.first_clean_date + INTERVAL '8 weeks'
            WHEN NEW.service_frequency = '12-weekly' THEN NEW.first_clean_date + INTERVAL '12 weeks'
            WHEN NEW.service_frequency = 'monthly' THEN NEW.first_clean_date + INTERVAL '1 month'
            WHEN NEW.service_frequency = 'quarterly' THEN NEW.first_clean_date + INTERVAL '3 months'
            ELSE NULL
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic next service scheduling
DROP TRIGGER IF EXISTS trigger_schedule_next_service ON bookings_simple;
CREATE TRIGGER trigger_schedule_next_service
    BEFORE UPDATE ON bookings_simple
    FOR EACH ROW
    EXECUTE FUNCTION schedule_next_service();

-- Grant necessary permissions
GRANT SELECT, UPDATE ON bookings_simple TO anon;
GRANT SELECT ON booking_analytics TO anon;
GRANT EXECUTE ON FUNCTION get_follow_up_reminders(INTEGER) TO anon;

-- Insert some sample data for testing (if no existing data)
DO $$
BEGIN
    -- Only insert if table is empty
    IF NOT EXISTS (SELECT 1 FROM bookings_simple LIMIT 1) THEN
        INSERT INTO bookings_simple (
            full_name, email, phone, postcode, property_type, status, 
            quote_amount, quote_status, service_frequency, priority, created_at
        ) VALUES 
        ('John Smith', 'john@example.com', '07700900001', 'BA16 0HW', 'Semi-Detached House', 'new', 
         25.00, 'pending', '4-weekly', 'normal', NOW() - INTERVAL '2 hours'),
        ('Sarah Johnson', 'sarah@example.com', '07700900002', 'BA16 0HX', 'Terraced House', 'contacted', 
         20.00, 'pending', '8-weekly', 'high', NOW() - INTERVAL '1 day'),
        ('Mike Wilson', 'mike@example.com', '07700900003', 'BA16 0HY', 'Detached House', 'quoted', 
         35.00, 'accepted', '4-weekly', 'normal', NOW() - INTERVAL '3 days'),
        ('Emma Davis', 'emma@example.com', '07700900004', 'BA16 0HZ', 'Semi-Detached House', 'ready', 
         25.00, 'accepted', '4-weekly', 'normal', NOW() - INTERVAL '1 week');
    END IF;
END $$;

COMMIT;