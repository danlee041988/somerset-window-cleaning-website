# Somerset Window Cleaning - Database Setup Guide

## Overview
This guide will help you set up the complete Supabase database schema for Somerset Window Cleaning, including all tables, relationships, sample data, and verification steps.

## Prerequisites
- Access to your Supabase project dashboard: https://puqfbuqfxghffdbbqrvo.supabase.co
- Admin/Owner permissions on the Supabase project

## Database Schema Files
- `supabase_migration_schema_corrected.sql` - The complete, corrected migration schema
- `setup-database.js` - Node.js script to verify the setup

## Setup Methods

### Method 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://puqfbuqfxghffdbbqrvo.supabase.co
   - Sign in to your account

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Copy the entire contents of `supabase_migration_schema_corrected.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

4. **Verify Success**
   - You should see success messages for each part of the schema
   - Check the "Table Editor" to see the new tables

### Method 2: Using psql (Advanced)

If you have the database connection details:

```bash
/opt/homebrew/opt/postgresql@14/bin/psql \
  -h db.puqfbuqfxghffdbbqrvo.supabase.co \
  -U postgres \
  -d postgres \
  -f supabase_migration_schema_corrected.sql
```

## What the Schema Creates

### Core Tables
1. **customers** - Customer profiles with geographic location
2. **services** - Service offerings with dynamic pricing
3. **service_areas** - Geographic service boundaries
4. **bookings** - Booking management with status tracking
5. **customer_communications** - Communication history
6. **business_metrics** - Analytics and reporting data
7. **competitor_intelligence** - Competitive analysis data

### Key Features
- **PostGIS Integration** - Geographic data for service areas and customer locations
- **Full-text Search** - Advanced customer search capabilities
- **Dynamic Pricing** - Automated pricing based on location, season, and frequency
- **Real-time Updates** - Live booking status updates
- **Row Level Security** - Data access control
- **Business Intelligence** - Comprehensive analytics views

### Sample Data Included
- **6 Services**: Window cleaning, conservatory cleaning, gutter cleaning, etc.
- **5 Service Areas**: Street (BA16), Glastonbury (BA6), Wells (BA5), Taunton (TA1), Yeovil (BA21)
- **Pricing Structure**: Base prices with area multipliers

## Verification Steps

### Step 1: Run Verification Script
```bash
node setup-database.js
```

Expected output when successful:
```
🚀 Somerset Window Cleaning - Supabase Database Setup
============================================================
✅ Connection successful!
✅ Found 6 services:
   - Standard Window Cleaning (window-cleaning): £25.00
   - Full House Clean (full-house-clean): £45.00
   - ... etc
✅ Found 5 service areas:
   - Street (BA16): 1.0x multiplier
   - Glastonbury (BA6): 1.0x multiplier
   - ... etc
✅ All core tables accessible
🎉 Database setup appears to be working correctly!
```

### Step 2: Manual Verification in Dashboard

1. **Check Tables**
   - Go to "Table Editor" in Supabase dashboard
   - Verify all tables exist: customers, services, service_areas, bookings, etc.

2. **Check Sample Data**
   - Open the `services` table - should show 6 services
   - Open the `service_areas` table - should show 5 areas
   - Verify data looks correct

3. **Test Views**
   - Go to SQL Editor
   - Run: `SELECT * FROM customer_lifetime_value LIMIT 5;`
   - Run: `SELECT * FROM monthly_revenue_dashboard LIMIT 5;`

### Step 3: Test Website Integration

1. **Test Booking Form**
   - Go to your website's booking page
   - Fill out and submit a test booking
   - Check if it appears in the `bookings` table

2. **Check Real-time Features**
   - Monitor the dashboard while submitting bookings
   - Verify real-time updates are working

## Troubleshooting

### Common Issues

1. **Permission Errors**
   - Ensure you're using an admin account
   - Check that you have the correct project selected

2. **PostGIS Extension Errors**
   - PostGIS should be available in Supabase by default
   - If errors occur, the schema will skip geographic features

3. **ENUM Type Errors**
   - The corrected schema moves ENUM definitions to the top
   - If you see ENUM errors, ensure you're using the corrected schema

4. **Connection Issues**
   - Verify your project URL is correct
   - Check that your anon key is valid

### Getting Help

If you encounter issues:
1. Check the Supabase dashboard logs
2. Run the verification script to identify specific problems
3. Review the SQL execution output for error messages

## Post-Setup Configuration

### Row Level Security (RLS)
The schema includes basic RLS policies. You may want to customize these based on your authentication setup.

### Real-time Subscriptions
The schema enables real-time subscriptions on key tables (bookings, communications). Test these features with your frontend application.

### Backup and Monitoring
- Set up automated backups in Supabase dashboard
- Configure monitoring and alerts for your database

## Next Steps

1. ✅ Complete the database migration
2. ✅ Verify all tables and sample data
3. ✅ Test the booking form integration
4. Configure authentication and user management
5. Set up automated email/SMS notifications
6. Implement advanced analytics and reporting
7. Configure production security settings

## Files Reference

- `supabase_migration_schema_corrected.sql` - Complete database schema
- `setup-database.js` - Verification and testing script
- `src/lib/supabase.js` - Application database integration
- `.env` - Environment configuration with Supabase credentials

## Database Connection Details

- **URL**: https://puqfbuqfxghffdbbqrvo.supabase.co
- **Project ID**: puqfbuqfxghffdbbqrvo
- **Anon Key**: Available in `.env` file
- **Service Key**: Available in Supabase dashboard (needed for schema operations)

---

**Note**: This setup creates a production-ready database schema with advanced features. Take your time to understand each component and customize as needed for your specific requirements.