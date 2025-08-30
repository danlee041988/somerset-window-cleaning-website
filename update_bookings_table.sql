-- Add new fields to the bookings table for staff tracking

-- Add booking status enum type
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('new', 'contacted', 'quoted', 'ready', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_status booking_status DEFAULT 'new',
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS processed_to_squeegee BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS status_updated_by VARCHAR(100);

-- Create an index on booking_status for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);

-- Create an index on processed_to_squeegee for filtering active bookings
CREATE INDEX IF NOT EXISTS idx_bookings_processed ON bookings(processed_to_squeegee);

-- Create a view for active bookings (not processed to Squeegee)
CREATE OR REPLACE VIEW active_bookings AS
SELECT 
    b.*,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.address,
    c.postcode,
    c.city,
    c.property_type,
    s.name as service_name,
    s.description as service_description
FROM bookings b
JOIN customers c ON b.customer_id = c.id
LEFT JOIN services s ON b.service_id = s.id
WHERE b.processed_to_squeegee = FALSE
AND b.booking_status != 'archived'
ORDER BY b.created_at DESC;

-- Create a function to update booking status with timestamp
CREATE OR REPLACE FUNCTION update_booking_status(
    p_booking_id INTEGER,
    p_new_status booking_status,
    p_updated_by VARCHAR(100),
    p_note TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE bookings
    SET 
        booking_status = p_new_status,
        status_updated_at = NOW(),
        status_updated_by = p_updated_by,
        internal_notes = CASE 
            WHEN p_note IS NOT NULL THEN 
                COALESCE(internal_notes || E'\n\n', '') || 
                '[' || TO_CHAR(NOW(), 'DD/MM/YY HH24:MI') || ' - ' || p_updated_by || '] ' || p_note
            ELSE internal_notes
        END
    WHERE id = p_booking_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Add some example data for testing (optional)
-- This will set all existing bookings to 'new' status if they don't have one
UPDATE bookings 
SET booking_status = 'new' 
WHERE booking_status IS NULL;