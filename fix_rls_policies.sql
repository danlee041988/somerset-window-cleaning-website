-- Fix RLS policies to allow anonymous access
-- Run this in Supabase SQL Editor if you want to test customer creation

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous booking submission" ON customers;
DROP POLICY IF EXISTS "Allow anonymous booking creation" ON bookings;
DROP POLICY IF EXISTS "Allow anonymous communication creation" ON customer_communications;

-- Create more permissive policies for anonymous access
CREATE POLICY "Enable anonymous inserts" ON customers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable anonymous inserts" ON bookings  
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable anonymous inserts" ON customer_communications
    FOR INSERT WITH CHECK (true);

-- Also allow reading for debugging
CREATE POLICY "Enable anonymous read" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Enable anonymous read" ON bookings
    FOR SELECT USING (true);