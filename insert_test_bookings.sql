-- Insert test customers first
INSERT INTO customers (first_name, last_name, email, phone, address, postcode, city, property_type) VALUES
('John', 'Smith', 'john.smith@example.com', '07700900001', '23 High Street', 'BA16 0HW', 'Burnham-on-Sea', 'semi-detached'),
('Sarah', 'Johnson', 'sarah.j@example.com', '07700900002', '45 Queens Road', 'TA8 1BQ', 'Burnham-on-Sea', 'detached'),
('Michael', 'Brown', 'mike.brown@example.com', '07700900003', '12 Victoria Avenue', 'BA16 0LD', 'Highbridge', 'terraced'),
('Emma', 'Wilson', 'emma.wilson@example.com', '07700900004', '78 Park Lane', 'TA9 3HP', 'Bridgwater', 'detached'),
('David', 'Taylor', 'david.t@example.com', '07700900005', '34 Church Street', 'BA6 8QB', 'Glastonbury', 'semi-detached'),
('Lucy', 'Davis', 'lucy.davis@example.com', '07700900006', '56 Station Road', 'BS25 1HD', 'Weston-super-Mare', 'flat'),
('James', 'Miller', 'james.m@example.com', '07700900007', '90 Somerset Way', 'BA5 1PX', 'Wells', 'bungalow'),
('Sophie', 'Anderson', 'sophie.a@example.com', '07700900008', '15 Market Street', 'BA11 1BB', 'Frome', 'terraced');

-- Get the customer IDs (assuming they are sequential from the insert)
-- In production, you'd use RETURNING or query the IDs
-- For this test data, we'll assume they start from 1 and increment

-- Insert test bookings with various statuses
INSERT INTO bookings (
    customer_id, 
    service_id, 
    total_price, 
    status, 
    booking_date,
    booking_status,
    internal_notes,
    processed_to_squeegee,
    created_at
) VALUES
-- New bookings (created today)
(
    (SELECT id FROM customers WHERE email = 'john.smith@example.com'), 
    1, 
    25.00, 
    'pending', 
    CURRENT_DATE + INTERVAL '7 days',
    'new',
    NULL,
    false,
    NOW()
),
(
    (SELECT id FROM customers WHERE email = 'sarah.j@example.com'), 
    1, 
    35.00, 
    'pending', 
    CURRENT_DATE + INTERVAL '5 days',
    'new',
    NULL,
    false,
    NOW() - INTERVAL '2 hours'
),
-- Contacted bookings
(
    (SELECT id FROM customers WHERE email = 'michael.brown@example.com'), 
    1, 
    20.00, 
    'pending', 
    CURRENT_DATE + INTERVAL '10 days',
    'contacted',
    'Spoke to customer, wants service every 4 weeks. Prefers Thursdays.',
    false,
    NOW() - INTERVAL '1 day'
),
(
    (SELECT id FROM customers WHERE email = 'emma.wilson@example.com'), 
    1, 
    40.00, 
    'pending', 
    CURRENT_DATE + INTERVAL '8 days',
    'contacted',
    'Large property with conservatory. Quoted £40 including conservatory roof.',
    false,
    NOW() - INTERVAL '2 days'
),
-- Quoted bookings
(
    (SELECT id FROM customers WHERE email = 'david.t@example.com'), 
    1, 
    28.00, 
    'pending', 
    CURRENT_DATE + INTERVAL '14 days',
    'quoted',
    'Customer accepted quote. Wants to start next month. Has 2 dogs - gate code 1234.',
    false,
    NOW() - INTERVAL '3 days'
),
(
    (SELECT id FROM customers WHERE email = 'lucy.davis@example.com'), 
    1, 
    18.00, 
    'pending', 
    CURRENT_DATE + INTERVAL '6 days',
    'quoted',
    '2nd floor flat, needs ladder access from rear. Monthly service.',
    false,
    NOW() - INTERVAL '4 days'
),
-- Ready for Squeegee
(
    (SELECT id FROM customers WHERE email = 'james.m@example.com'), 
    1, 
    30.00, 
    'confirmed', 
    CURRENT_DATE + INTERVAL '3 days',
    'ready',
    'Bungalow with easy access. Customer usually home. Includes garage windows.',
    false,
    NOW() - INTERVAL '5 days'
),
(
    (SELECT id FROM customers WHERE email = 'sophie.a@example.com'), 
    1, 
    22.00, 
    'confirmed', 
    CURRENT_DATE + INTERVAL '4 days',
    'ready',
    'Small terraced house. Park on Market Street. 6-weekly service requested.',
    false,
    NOW() - INTERVAL '6 days'
);

-- Update the status timestamps for better visualization
UPDATE bookings SET status_updated_at = NOW() - INTERVAL '30 minutes' WHERE booking_status = 'contacted';
UPDATE bookings SET status_updated_at = NOW() - INTERVAL '1 day' WHERE booking_status = 'quoted';
UPDATE bookings SET status_updated_at = NOW() - INTERVAL '2 days' WHERE booking_status = 'ready';