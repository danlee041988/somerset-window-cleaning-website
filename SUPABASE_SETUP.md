# Supabase Integration Setup Guide

This guide will help you set up the Supabase database integration for the Somerset Window Cleaning booking form.

## Prerequisites

- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- Node.js and npm installed
- The Somerset Window Cleaning website codebase

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/create an account
2. Click "New Project" 
3. Choose your organization
4. Set up your project:
   - **Name**: `somerset-window-cleaning`
   - **Database Password**: Generate a secure password
   - **Region**: Choose the closest region to your users (UK/Europe)
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy the contents of `supabase_migration_schema.sql` from your project root
3. Paste it into the SQL Editor and click **Run**
4. This will create all necessary tables, functions, and indexes

## Step 3: Configure Environment Variables

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **Public anon key**
3. In your project root, create/update the `.env` file:

```bash
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

Replace the placeholder values with your actual Supabase credentials.

## Step 4: Set Up Row Level Security (Optional but Recommended)

The database schema includes RLS policies, but you may want to customize them:

1. Go to **Authentication** → **Policies** in your Supabase dashboard
2. Review and adjust the existing policies if needed
3. The default setup allows authenticated users to read data

## Step 5: Populate Sample Data

1. Go to the **SQL Editor** in your Supabase dashboard
2. The migration schema already includes sample services and service areas
3. You can add more services or areas by running additional INSERT statements

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/book-now` on your local site
3. Fill out the booking form and submit
4. Check the browser console for logs
5. Check your Supabase dashboard **Table Editor** to see if data was inserted

## Step 7: Configure Email Notifications (Optional)

The booking form includes an email service for notifications. To enable real email sending:

1. **Option A - SendGrid Integration**:
   ```bash
   npm install @sendgrid/mail
   ```
   Update `src/lib/email-service.js` to use SendGrid API

2. **Option B - Resend Integration**:
   ```bash
   npm install resend
   ```
   Update `src/lib/email-service.js` to use Resend API

3. **Option C - Use Supabase Edge Functions** (Recommended):
   - Create edge functions for email sending
   - Deploy them to your Supabase project
   - Update the email service to call your edge functions

## Step 8: Production Deployment

1. **Vercel** (Recommended):
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on git push

2. **Other Platforms**:
   - Ensure environment variables are set
   - Build with `npm run build`
   - Deploy the `dist` folder

## Database Tables Overview

The booking system uses these main tables:

- **customers**: Store customer information and preferences
- **services**: Available services with pricing
- **bookings**: Individual booking records with status tracking
- **service_areas**: Geographic coverage areas with pricing modifiers
- **customer_communications**: Track all customer interactions

## Security Considerations

- ✅ Row Level Security (RLS) is enabled
- ✅ Environment variables are used for credentials
- ✅ Input validation on both client and server side
- ✅ reCAPTCHA integration for spam protection
- ✅ Secure customer data handling

## Troubleshooting

### Common Issues:

1. **"Service not found" error**:
   - Check that sample services were inserted into the `services` table
   - Ensure the 'window-cleaning' service exists with `active = true`

2. **Database connection errors**:
   - Verify your Supabase URL and anon key
   - Check that your project is active in Supabase dashboard

3. **Form submission fails**:
   - Open browser developer tools and check console for errors
   - Verify the Supabase client is properly configured

4. **Email notifications not working**:
   - Currently configured for console logging only
   - Follow Step 7 to enable real email sending

### Getting Help:

- Check the browser console for detailed error messages
- Review the Supabase logs in your dashboard
- Ensure all environment variables are properly set
- Test database connectivity using the Supabase SQL Editor

## Next Steps

1. **Analytics**: Set up tracking for booking conversions
2. **Admin Dashboard**: Create an admin interface for managing bookings
3. **Payment Integration**: Add Stripe/PayPal for online payments
4. **SMS Notifications**: Integrate Twilio for SMS confirmations
5. **Calendar Integration**: Connect with Google Calendar for scheduling

## Support

For technical support with this integration:
- Check the project README.md
- Review error logs in browser console and Supabase dashboard
- Ensure all dependencies are installed: `npm install`