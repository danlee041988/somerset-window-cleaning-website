# Somerset Window Cleaning - Complete Supabase Database Setup

## Overview

Your Supabase database is partially set up but needs RLS (Row Level Security) policies to allow public access for your booking API. This guide will help you complete the setup.

## Current Status

✅ **Supabase project created**
- URL: https://puqfbuqfxghffdbbqrvo.supabase.co
- Connection successful

✅ **Tables exist:**
- `customers` (normalized structure)
- `bookings` (normalized structure)
- `services` (with 3 services including window cleaning)
- `service_areas` (with 3 areas)
- `customer_communications`

❌ **Issues to fix:**
- RLS policies prevent public access to tables
- API expects a flat `bookings` table structure but database uses normalized structure

## Solution: Two Approaches

### Approach 1: Quick Fix (Recommended for immediate use)

1. **Run the SQL Setup Script**
   - Go to your Supabase Dashboard: https://puqfbuqfxghffdbbqrvo.supabase.co
   - Navigate to **SQL Editor**
   - Copy the entire contents of `supabase-complete-setup.sql`
   - Paste and click **Run**

2. **Update Your API**
   - Edit `src/pages/api/bookings/create.ts`
   - Find line 157: `.from('bookings')`
   - Change it to: `.from('bookings_simple')`

3. **Test the Setup**
   ```bash
   node test-simplified-bookings.js
   ```

### Approach 2: Use Normalized Structure (Better for long-term)

1. **Run only the RLS policies from the SQL script**
2. **Update your API to work with the normalized customer/bookings structure**
3. **Use the existing `BookingService` class in `src/lib/supabase.js`**

## Database Schema Details

### Current Normalized Structure
- `customers` table with customer details
- `bookings` table referencing customers
- Complex relationships and advanced features

### Simplified Structure (Created by setup script)
- `bookings_simple` table with all data in one place
- Matches exactly what your current API expects
- Easier to work with for the booking form

## Required Columns (API Compatibility)

Your API expects these columns in the bookings table:
- `property_type` ✅
- `frequency` ✅
- `full_name` ✅
- `email` ✅
- `phone` ✅
- `address` ✅
- `city` ✅
- `postcode` ✅
- `contact_method` ✅
- `preferred_date` ✅
- `notes` ✅
- `special_offer` ✅
- `estimated_price` ✅
- `status` ✅
- `source` ✅
- `additional_services` ✅

## Row Level Security Policies

The setup script creates these policies:
- **Public read access** for all tables
- **Public insert access** for bookings and customer communications
- **Public update access** for customers

## Testing Your Setup

After running the SQL setup, test your connection:

```bash
# Test basic connection and RLS
node test-supabase-connection.js

# Test simplified bookings table
node test-simplified-bookings.js
```

## Files Created/Modified

- ✅ `supabase-complete-setup.sql` - Complete database setup script
- ✅ `test-simplified-bookings.js` - Test script for simplified table
- ✅ `setup-supabase-rls.js` - RLS setup analysis script
- ✅ `update-api-for-simplified-table.js` - API update helper

## Next Steps

1. **Run the SQL setup script** in your Supabase Dashboard
2. **Choose your approach** (simplified or normalized)
3. **Update your API** accordingly
4. **Test your booking form** to ensure it works
5. **Monitor your database** through the Supabase Dashboard

## Troubleshooting

**If you get RLS errors:**
- Make sure you ran the complete SQL setup script
- Check that policies were created in the Supabase Dashboard under Authentication > Policies

**If the API still fails:**
- Verify environment variables are set correctly
- Check that the table name in the API matches what you're using
- Look at the browser console for detailed error messages

**If you want to use the normalized structure:**
- Remove references to `bookings_simple`
- Use the `BookingService` class from `src/lib/supabase.js`
- Update your API to call `BookingService.submitBooking(formData)`

## Contact

If you encounter issues, check:
1. Supabase Dashboard logs
2. Browser console errors
3. Server console output
4. Verify all environment variables are set correctly