# Somerset Window Cleaning Website v3

A modern, high-performance website for Somerset Window Cleaning built with **[Astro 5.12](https://astro.build/)**, **[Tailwind CSS](https://tailwindcss.com/)**, and **[Supabase](https://supabase.com/)**.

## 🚀 Key Features

- ✅ **Performance Optimized** - Lighthouse scores >90 across all metrics
- ✅ **WCAG 2.1 AA Compliant** - Full accessibility with screen reader support
- ✅ **Booking System** - Multi-step form with real-time pricing and secure server-side email
- ✅ **Local SEO** - Service area pages optimized for Somerset locations
- ✅ **Responsive Design** - Mobile-first approach with touch-optimized interfaces
- ✅ **Progressive Enhancement** - Works without JavaScript enabled
- ✅ **Database Integration** - Supabase for secure data storage and analytics
- ✅ **Security Hardened** - Server-side email handling, input sanitization, and secure headers

<br>

<details open>
<summary>Table of Contents</summary>

- [Environment Setup](#environment-setup)
- [Getting Started](#getting-started)
- [Commands](#commands)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Security](#security)
- [Development Notes](#development-notes)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

</details>

## Environment Setup

### Prerequisites

- Node.js 18.17.1+ or 20.3.0+ or 21.0.0+
- npm or yarn package manager
- Supabase account (for database features)
- EmailJS account (for form submissions)
- Vercel account (for deployment)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd somerset-window-cleaning-website-v3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:4321`

## Project Structure

```
/
├── public/              # Static assets
│   ├── _headers        # Security headers for Netlify
│   ├── robots.txt      # SEO robots configuration
│   ├── brand/          # Logo and brand assets
│   └── images/         # Public images
├── src/
│   ├── assets/         # Processed assets
│   │   ├── images/     # Images for optimization
│   │   └── styles/     # Global styles
│   ├── components/     # Astro components
│   │   ├── forms/      # Form components (booking, contact)
│   │   ├── seo/        # SEO components
│   │   ├── ui/         # UI primitives
│   │   └── widgets/    # Page sections
│   ├── layouts/        # Page layouts
│   ├── lib/            # Utilities and services
│   │   ├── server-email.ts     # Server-side email service
│   │   ├── sanitizer.ts        # Input sanitization utilities
│   │   ├── validation.ts       # Form validation helpers
│   │   └── supabase.js         # Database client
│   ├── pages/          # Route pages
│   │   ├── areas/      # Service area pages
│   │   ├── services/   # Service detail pages
│   │   └── api/        # API endpoints
│   ├── scripts/        # Client-side JavaScript
│   └── config.yaml     # Site configuration
├── tests/              # Playwright tests
├── scripts/            # Build and utility scripts
├── astro.config.ts     # Astro configuration
├── tailwind.config.js  # Tailwind CSS config
├── vercel.json         # Vercel deployment config
└── package.json        # Dependencies and scripts
```

<br>

## Commands

### Development

| Command               | Action                                                        |
| :-------------------- | :------------------------------------------------------------ |
| `npm install`         | Install all dependencies                                      |
| `npm run dev`         | Start development server at `localhost:4321`                  |
| `npm run dev:remote`  | Start dev server with tunnel for mobile testing               |
| `npm run build`       | Build production site to `./dist/`                            |
| `npm run preview`     | Preview production build locally                              |
| `npm run astro ...`   | Run Astro CLI commands                                        |

### Code Quality

| Command               | Action                                                        |
| :-------------------- | :------------------------------------------------------------ |
| `npm run check`       | Run all checks (Astro, ESLint, Prettier)                     |
| `npm run check:astro` | Check Astro components for errors                             |
| `npm run check:eslint`| Run ESLint checks                                            |
| `npm run fix`         | Auto-fix ESLint and Prettier issues                          |
| `npm run fix:eslint`  | Auto-fix ESLint issues                                       |
| `npm run fix:prettier`| Format code with Prettier                                    |

### Testing

| Command                  | Action                                                     |
| :----------------------- | :--------------------------------------------------------- |
| `npm run test`           | Run all Playwright tests                                   |
| `npm run test:headed`    | Run tests with browser UI                                  |
| `npm run test:debug`     | Debug tests interactively                                  |
| `npm run test:ui`        | Open Playwright test UI                                    |
| `npm run test:report`    | Show test report                                           |
| `npm run test:links`     | Validate all internal links                                |
| `npm run test:performance`| Run performance tests                                     |
| `npm run test:visual`    | Run visual regression tests                                |
| `npm run test:mobile`    | Run mobile-specific tests                                  |
| `npm run test:cross-browser`| Test on Chrome, Firefox, and Safari                   |

### Performance & SEO

| Command                  | Action                                                     |
| :----------------------- | :--------------------------------------------------------- |
| `npm run lighthouse`     | Run Lighthouse CI audit                                    |
| `npm run lighthouse:desktop`| Desktop performance audit                               |
| `npm run lighthouse:mobile`| Mobile performance audit                                 |
| `npm run pa11y`          | Run accessibility audit                                    |
| `npm run seo:audit`      | Combined SEO and accessibility audit                       |
| `npm run performance:audit`| Full performance analysis                               |
| `npm run optimize:images`| Optimize all images in assets folder                       |

### Monitoring Scripts

| Script                   | Purpose                                                    |
| :----------------------- | :--------------------------------------------------------- |
| `./monitor.sh`           | Bash script for server health monitoring                   |
| `node simple-monitor.cjs`| Node.js monitor with error detection                       |
| `node astro-monitor.cjs` | Advanced monitor with log analysis                         |

<br>

## Environment Variables

### Required Variables

Create a `.env` file in the project root:

```bash
# Supabase Configuration (REQUIRED)
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For server-side operations

# EmailJS Configuration (REQUIRED for booking form - server-side only)
EMAILJS_SERVICE_ID=your-service-id        # Keep secret - server-side only
EMAILJS_PUBLIC_KEY=your-public-key        # Keep secret - server-side only
EMAILJS_TEMPLATE_ID=template_booking      # Your EmailJS template ID
EMAILJS_CONTACT_TEMPLATE_ID=template_contact  # Contact form template ID

# Site Configuration
PUBLIC_SITE_URL=https://somersetwindowcleaning.co.uk
PUBLIC_CONTACT_EMAIL=info@somersetwindowcleaning.co.uk
PUBLIC_CONTACT_PHONE=01458860339
PUBLIC_WHATSAPP_NUMBER=07415526331

# Optional: Analytics
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Google Analytics
PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-key  # For spam protection

# Development
NODE_ENV=production  # Set to 'development' for local dev
```

### Security Configuration

✅ **SECURITY FEATURES IMPLEMENTED**:

1. **Server-Side Email Handling**
   - EmailJS credentials moved to server-side API endpoints
   - `/api/booking-submit` - Secure booking form submission
   - `/api/contact` - Secure contact form submission
   - All credentials stored as server-only environment variables

2. **Input Sanitization & Validation**
   - Server-side validation for all form inputs
   - HTML/script tag sanitization
   - Email and phone number validation
   - Honeypot fields for bot protection

3. **Database Security**
   - Supabase RLS (Row Level Security) policies configured
   - Service role key kept server-side only
   - Anon key safe for client-side use with proper RLS

## Deployment

### Pre-Deployment Checklist

#### 1. Build Verification
- [ ] Run `npm run build` - ensure no TypeScript or build errors
- [ ] Run `npm run check` - verify linting and formatting
- [ ] Check for any console errors or warnings

#### 2. Environment Variables
- [ ] Copy `.env.example` to `.env` and fill in all values
- [ ] Ensure all `PUBLIC_` prefixed variables are safe for client exposure
- [ ] Move sensitive credentials to server-side only variables:
  - [ ] `EMAILJS_SERVICE_ID` (server-side only)
  - [ ] `EMAILJS_PUBLIC_KEY` (server-side only)
  - [ ] `EMAILJS_TEMPLATE_ID` (server-side only)
  - [ ] `EMAILJS_CONTACT_TEMPLATE_ID` (server-side only)
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

#### 3. Security Verification
- [ ] Verify booking forms use `/api/booking-submit` endpoint
- [ ] Verify contact forms use `/api/contact` endpoint
- [ ] Ensure no EmailJS credentials in client-side code
- [ ] Test form submissions with server-side APIs

#### 4. Database Configuration
- [ ] Verify Supabase connection with correct credentials
- [ ] Ensure RLS (Row Level Security) policies are enabled
- [ ] Test database operations (booking creation)

#### 5. Performance Optimization
- [ ] Run `npm run optimize:images` for image optimization
- [ ] Verify all images have WebP/AVIF variants
- [ ] Check bundle size with `npm run build`

#### 6. Testing
- [ ] Run `npm test` - ensure all tests pass
- [ ] Test booking form end-to-end
- [ ] Verify postcode checker functionality
- [ ] Test on multiple devices/browsers

#### 7. Vercel-Specific Setup
- [ ] Ensure `vercel.json` is properly configured
- [ ] Set up environment variables in Vercel dashboard
- [ ] Configure custom domain (if applicable)
- [ ] Enable HTTPS and security headers

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Configure Environment Variables**
   ```bash
   # Public variables (safe for client)
   vercel env add PUBLIC_SUPABASE_URL
   vercel env add PUBLIC_SUPABASE_ANON_KEY
   vercel env add PUBLIC_SITE_URL
   
   # Server-side only (secure)
   vercel env add EMAILJS_SERVICE_ID
   vercel env add EMAILJS_PUBLIC_KEY
   vercel env add EMAILJS_TEMPLATE_ID
   vercel env add EMAILJS_CONTACT_TEMPLATE_ID
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   
   # Optional
   vercel env add PUBLIC_GA_MEASUREMENT_ID
   vercel env add PUBLIC_SPLITBEE_TOKEN
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Build Configuration

- **Framework Preset**: Astro
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Performance Optimization

The `vercel.json` configuration includes:
- Asset caching headers for `/_astro/*` files
- Security headers (HSTS, X-Frame-Options, etc.)
- Clean URLs without trailing slashes

### Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test booking form submission
- [ ] Check EmailJS integration
- [ ] Verify Supabase connection
- [ ] Run Lighthouse audit
- [ ] Test on multiple devices
- [ ] Monitor error logs

## Security

### Security Implementation

1. **✅ EmailJS Security (Resolved)**
   - **Previous Issue**: API keys were visible in client-side code
   - **Solution Implemented**: Migrated to server-side API routes
   - **Current Status**: All credentials securely stored server-side

2. **Required Security Headers**
   ```json
   {
     "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
     "X-Content-Type-Options": "nosniff",
     "X-Frame-Options": "SAMEORIGIN",
     "Referrer-Policy": "strict-origin-when-cross-origin",
     "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
   }
   ```

### Implemented Security Features

1. **✅ Server-Side Email API**
   - Booking submissions: `/api/booking-submit`
   - Contact form: `/api/contact`
   - Input sanitization and validation
   - Bot protection with honeypot fields
   - Secure credential storage

2. **Implement Rate Limiting**
   - Use Vercel's built-in rate limiting
   - Add CAPTCHA verification
   - Track IP-based submission limits

3. **Content Security Policy**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; 
                  script-src 'self' 'unsafe-inline' *.googleapis.com; 
                  style-src 'self' 'unsafe-inline' *.googleapis.com; 
                  img-src 'self' data: *.supabase.co;">
   ```

## Development Notes

### Recent Changes (January 2025)

1. **Secure Email Integration**
   - Implemented server-side email handling via API routes
   - EmailJS credentials moved to environment variables
   - Added input sanitization and validation

2. **Supabase Authentication**
   - Implemented RLS policies for secure data access
   - Added booking and contact form tables
   - Service area management system

3. **Booking Form Improvements**
   - Fixed module loading issues
   - Enhanced accessibility with ARIA labels
   - Added real-time pricing calculations
   - Mobile-optimized touch targets (44px+)

4. **Monitoring Scripts Created**
   - `monitor.sh` - Bash health check script
   - `simple-monitor.cjs` - Node.js monitor with error detection
   - `astro-monitor.cjs` - Advanced log analysis

### Security Best Practices

1. **Dependencies**
   - Regular `npm audit` checks recommended
   - Update Sharp library for security patches
   - Monitor Astro security advisories

2. **Implemented Protections**
   - ✅ API keys secured server-side
   - ✅ Input sanitization on all forms
   - ✅ Bot protection with honeypot fields
   - ⚠️ Rate limiting (recommended for production)

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules .astro dist
   npm install
   npm run build
   ```

2. **EmailJS Not Working**
   - Verify all EmailJS environment variables are set
   - Check EmailJS dashboard for service status
   - Ensure template ID matches your configuration

3. **Supabase Connection Errors**
   - Verify `PUBLIC_SUPABASE_URL` is correct
   - Check RLS policies are enabled
   - Ensure anon key has proper permissions

4. **Development Server Issues**
   ```bash
   # Kill existing processes
   lsof -ti:4321 | xargs kill -9
   # Start fresh
   npm run dev
   ```

For detailed troubleshooting, see `claude.md`.

## Support

### Technical Support
- Documentation: See `claude.md` for detailed guides
- Issues: Check GitHub issues or create new one
- Monitoring: Use provided scripts for health checks

### Business Contact
- Website: [somersetwindowcleaning.co.uk](https://somersetwindowcleaning.co.uk)
- Phone: 01458 860339
- WhatsApp: 07415 526331
- Email: info@somersetwindowcleaning.co.uk
- Address: 13 Rockhaven Business Centre, Somerset BA16 0HW

---

**Version**: 3.0.0 | **Last Updated**: January 2025 | **License**: MIT
