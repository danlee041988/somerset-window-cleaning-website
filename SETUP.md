# Somerset Window Cleaning - Setup Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- EmailJS account (free tier = 200 emails/month)
- Vercel account for deployment

## Quick Start

### 1. Clone & Install
```bash
git clone [your-repo]
cd SWC-Website/website
npm run install:all
```

### 2. Environment Setup
```bash
cd frontend
cp .env.example .env
# Edit .env with your keys:
```

Required environment variables:
```env
PUBLIC_SUPABASE_URL=https://qppxwkfnygdwxhmbroox.supabase.co
PUBLIC_SUPABASE_ANON_KEY=[get from Supabase dashboard]
PUBLIC_EMAILJS_SERVICE_ID=[get from EmailJS]
PUBLIC_EMAILJS_PUBLIC_KEY=[get from EmailJS]
```

### 3. Supabase Setup
1. The database tables are already created
2. RLS policies are configured
3. Edge functions are ready to deploy

### 4. EmailJS Setup
1. Create account at https://emailjs.com
2. Add email service (Gmail/Outlook)
3. Create 3 templates:
   - `template_booking` - Customer confirmation
   - `template_contact` - Contact form notification
   - `template_admin` - Admin notifications

### 5. Development
```bash
npm run dev
# Visit http://localhost:4321
```

### 6. Deployment
```bash
# Connect to Vercel
vercel

# Deploy
npm run deploy
```

## Architecture

```
Frontend (Astro) → Supabase (Database) → EmailJS (Notifications)
     ↓                    ↓
  Vercel              Edge Functions
```

## Testing Checklist
- [ ] Submit booking form
- [ ] Check Supabase dashboard for new booking
- [ ] Verify customer receives email
- [ ] Verify admin receives notification
- [ ] Test assistant at `/api/assistant/answer?q=pricing`

## Support
- Supabase Docs: https://supabase.com/docs
- EmailJS Docs: https://www.emailjs.com/docs/
- Vercel Docs: https://vercel.com/docs