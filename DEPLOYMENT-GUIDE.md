# Somerset Window Cleaning - Deployment Guide

## 🚀 Quick Start Deployment

### Prerequisites
- Node.js 18.17.1+ installed
- Vercel CLI installed (`npm i -g vercel`)
- Vercel account created
- Supabase account with project created
- EmailJS account with service configured

### Step 1: Clone and Install
```bash
git clone [your-repo-url]
cd somerset-window-cleaning-website-v3
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example file:
```bash
cp .env.example .env
```

2. Fill in your `.env` file with actual values

3. **CRITICAL**: Note these variable name corrections:
   - Use `EMAILJS_PRIVATE_KEY` (not `EMAILJS_PUBLIC_KEY`)
   - Use `SUPABASE_SERVICE_ROLE_KEY` (not `SUPABASE_SERVICE_KEY`)

### Step 3: Verify Configuration
```bash
node scripts/verify-deployment.js
```

### Step 4: Deploy to Vercel
```bash
vercel --prod
```

## 📋 Complete Environment Variable List

### Public Variables (Client-Safe)
These can be exposed to the browser:
- `PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `PUBLIC_SITE_URL` - Your production domain
- `PUBLIC_APP_NAME` - Site name (optional)
- `PUBLIC_GA_MEASUREMENT_ID` - Google Analytics (optional)

### Server-Only Variables (Keep Secret!)
These must NEVER be exposed to the client:
- `EMAILJS_SERVICE_ID` - EmailJS service identifier
- `EMAILJS_PRIVATE_KEY` - EmailJS private API key ⚠️
- `EMAILJS_TEMPLATE_ID` - Booking form template
- `EMAILJS_CONTACT_TEMPLATE_ID` - Contact form template
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service key ⚠️
- `SUPABASE_URL` - Supabase URL (server-side)
- `CSRF_SECRET` - Random 32-character string
- `SESSION_SECRET` - Random 32-character string
- `JWT_SECRET` - Random JWT secret

### Email Configuration (Optional)
If using SMTP instead of EmailJS:
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP port (usually 587)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `CONTACT_EMAIL` - Business contact email

## 🔧 Vercel Dashboard Setup

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Select "Astro" as framework preset

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add each variable from the list above
   - ⚠️ Double-check variable names match exactly

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

## 🧪 Post-Deployment Testing

### 1. Test API Endpoints
```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Get CSRF token
curl https://your-domain.vercel.app/api/booking
```

### 2. Test Form Submissions
- Submit a test booking through the form
- Submit a test contact message
- Verify emails are received

### 3. Check Logs
```bash
vercel logs --follow
```

## 🚨 Common Issues & Solutions

### Issue: "Module not found" errors
**Solution**: Ensure all imports in `dependencies` not `devDependencies`

### Issue: Environment variable undefined
**Solution**: 
- Check exact spelling (case-sensitive)
- Verify in Vercel dashboard
- Redeploy after adding variables

### Issue: API routes return 404
**Solution**:
- Ensure `output: 'server'` in astro.config.ts
- Check Vercel adapter is installed
- Verify API files in `src/pages/api/`

### Issue: EmailJS not sending
**Solution**:
- Verify `EMAILJS_PRIVATE_KEY` is set (not PUBLIC)
- Check EmailJS service is active
- Review API response for errors

### Issue: CORS errors
**Solution**:
- Check vercel.json headers configuration
- Ensure API responses include proper headers

## 📊 Performance Optimization

### 1. Enable Caching
Already configured in `vercel.json` for static assets

### 2. Image Optimization
- Run `npm run optimize:images` before deployment
- Vercel automatically optimizes images

### 3. Monitor Performance
- Use Vercel Analytics
- Run Lighthouse audits post-deployment

## 🔒 Security Checklist

- [x] EmailJS credentials server-side only
- [x] Input sanitization on all forms
- [x] CSRF protection enabled
- [x] Security headers in vercel.json
- [x] Supabase RLS policies active
- [ ] Rate limiting (configure in Vercel)
- [ ] Regular dependency updates

## 📞 Support

### Deployment Issues
1. Check Vercel build logs
2. Run `vercel logs` for function errors
3. Use `scripts/verify-deployment.js`

### Contact
- Technical issues: Create GitHub issue
- Business inquiries: info@somersetwindowcleaning.co.uk

---

Last Updated: January 2025