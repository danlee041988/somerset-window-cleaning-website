# Somerset Window Cleaning Website - Development Documentation

This document contains detailed development notes, troubleshooting guides, and technical documentation for the Somerset Window Cleaning website.

## Overview

The Somerset Window Cleaning website is a professional service business website built with Astro 5.12, featuring an advanced booking system, local SEO optimization, and full accessibility compliance. The site serves customers across Somerset, UK, providing window cleaning and related services.

## Recent Changes & Fixes

### Booking Form Refactoring (Latest Update)

#### Issues Resolved
- **Console Errors**: Fixed undefined variable references and module loading issues
- **Form Validation**: Improved validation logic with better error handling
- **Accessibility**: Enhanced WCAG 2.1 AA compliance with proper ARIA labels
- **Mobile Experience**: Optimized touch interactions with 44px+ targets
- **Progressive Disclosure**: Improved user flow with step-by-step form progression

#### Key Improvements Made

**1. AccessibleBookingForm.astro Enhancements**
- Added comprehensive ARIA labels and live regions
- Implemented proper fieldset/legend structure for form sections
- Added keyboard navigation support with focus management
- Enhanced screen reader announcements for step changes
- Improved error messaging with `aria-live` regions

**2. JavaScript Form Logic**
- Fixed module initialization and dependency loading
- Added proper event listener binding with error handling
- Implemented real-time pricing calculations
- Added form state management with validation
- Enhanced step navigation with accessibility announcements

**3. Mobile Optimization**
- Ensured all interactive elements meet 44px minimum size
- Added touch-friendly hover states and focus indicators
- Implemented swipe-friendly form navigation
- Optimized form layout for small screens

## Architecture & Tech Stack

### Core Technologies
- **Astro 5.12**: Static site generation with island architecture
- **Tailwind CSS 3.4+**: Utility-first CSS framework with custom design system
- **TypeScript**: Type-safe JavaScript development
- **Supabase**: PostgreSQL database with real-time capabilities
- **Vercel**: Deployment platform with edge functions

### Key Dependencies
```json
{
  "astro": "^5.12.9",
  "@supabase/supabase-js": "^2.56.1",
  "@astrojs/tailwind": "^5.1.5",
  "@astrojs/sitemap": "^3.4.2",
  "astro-icon": "^1.1.5"
}
```

### Development Tools
- **Playwright**: End-to-end testing framework
- **Lighthouse CI**: Performance monitoring
- **Pa11y**: Accessibility testing
- **ESLint + Prettier**: Code quality and formatting

## Booking System Implementation

### Form Architecture

The booking system is implemented as a multi-step form with the following components:

**1. AccessibleBookingForm.astro**
- Location: `src/components/forms/AccessibleBookingForm.astro`
- Features: Progressive disclosure, real-time validation, accessibility compliance
- Integrations: EmailJS for form submission, reCAPTCHA for spam protection

**2. Pricing Engine**
- Dynamic pricing based on property type, size, and frequency
- Real-time updates as user selects options
- Special deal detection (e.g., gutter services bundle)
- Extension/conservatory add-ons calculation

**3. Form Validation**
- Client-side validation with immediate feedback
- Server-side validation for security
- Accessibility-compliant error messaging
- Progressive enhancement for non-JS users

### Implementation Details

#### Step 1: Property Details
```javascript
// Property type selection with pricing calculation
function selectPropertyType(propertyType) {
  formData.propertyType = propertyType;
  updateQuoteDisplay();
  showNextSection();
}
```

#### Step 2: Services Selection
```javascript
// Service addon handling with deal detection
function toggleAddon(addonId, isSelected) {
  if (isSelected) {
    formData.addons[addonId] = { selected: true, price: calculateAddonPrice(addonId) };
  }
  checkGutterDeal(); // Special offer logic
  updateQuoteDisplay();
}
```

#### Step 3: Contact Information
- Form validation with regex patterns
- Autocomplete attributes for better UX
- Required field validation with user-friendly messages

### Accessibility Implementation

#### WCAG 2.1 AA Compliance Features
- **Semantic HTML**: Proper heading hierarchy and landmark roles
- **ARIA Labels**: Comprehensive labeling for form controls
- **Keyboard Navigation**: Full keyboard accessibility with focus management
- **Screen Reader Support**: Live regions for dynamic content updates
- **Color Contrast**: High contrast ratios meeting WCAG standards
- **Touch Targets**: Minimum 44px size for mobile interactions

#### Screen Reader Enhancements
```html
<!-- Progressive form steps with proper announcement -->
<div role="progressbar" aria-valuenow="1" aria-valuemin="1" aria-valuemax="3">
  <!-- Step indicators -->
</div>

<!-- Live regions for dynamic updates -->
<div id="form-announcements" aria-live="polite" aria-atomic="true" class="sr-only"></div>
```

## Environment Configuration

### Required Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Supabase Configuration (Required)
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Analytics and Tracking
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
RECAPTCHA_SITE_KEY=your-recaptcha-site-key

# Optional: EmailJS Configuration
EMAILJS_PUBLIC_KEY=your-emailjs-public-key
EMAILJS_SERVICE_ID=your-emailjs-service-id
EMAILJS_TEMPLATE_ID=your-emailjs-template-id
```

### Supabase Setup

#### Database Schema
The application expects the following Supabase tables:

1. **bookings** - Customer booking requests
2. **service_areas** - Geographic service coverage
3. **pricing** - Dynamic pricing configurations
4. **contacts** - Contact form submissions

#### Row Level Security (RLS)
Ensure proper RLS policies are configured:
```sql
-- Allow public read access to service areas
CREATE POLICY "Public read access" ON service_areas FOR SELECT TO anon USING (true);

-- Allow booking insertions from public
CREATE POLICY "Public booking creation" ON bookings FOR INSERT TO anon WITH CHECK (true);
```

## Deployment Guide

### Vercel Deployment (Recommended)

#### 1. Repository Setup
```bash
# Connect your repository to Vercel
vercel link

# Set environment variables
vercel env add PUBLIC_SUPABASE_URL
vercel env add PUBLIC_SUPABASE_ANON_KEY
```

#### 2. Build Configuration
The `astro.config.ts` is already optimized for Vercel:
```typescript
export default defineConfig({
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
    splitting: true,
    sourcemap: false,
  }
});
```

#### 3. Performance Optimizations
- **Image Optimization**: WebP/AVIF support with Astro Assets
- **CSS Inlining**: Critical CSS inlined automatically
- **Code Splitting**: Vendor chunks separated for better caching
- **Compression**: Astro Compress plugin for asset optimization

### CI/CD Pipeline

#### GitHub Actions Integration
The repository includes automated testing:
```yaml
# .github/workflows/ci.yml (if needed)
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm run test
      - name: Run accessibility tests
        run: npm run accessibility
```

## Performance Monitoring

### Lighthouse CI Configuration

The site includes automated performance testing:
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4321"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:seo": ["warn", {"minScore": 0.9}]
      }
    }
  }
}
```

### Performance Metrics Targets
- **Performance Score**: >90
- **Accessibility Score**: >95
- **SEO Score**: >90
- **Best Practices**: >90

## Troubleshooting Guide

### Common Issues & Solutions

#### 1. Build Errors

**Issue**: TypeScript compilation errors
```bash
Error: Cannot find module '~/components/...'
```
**Solution**: Check `tsconfig.json` path mapping:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["src/*"]
    }
  }
}
```

**Issue**: Image optimization errors
```bash
Error: Sharp installation failed
```
**Solution**: Reinstall Sharp with platform-specific binary:
```bash
npm uninstall sharp
npm install sharp --platform=linux --arch=x64
```

#### 2. Development Server Issues

**Issue**: Hot Module Replacement (HMR) not working
```bash
WebSocket connection failed
```
**Solution**: Check `astro.config.ts` HMR configuration:
```typescript
export default defineConfig({
  server: {
    hmr: {
      port: 4321,
      protocol: 'ws',
      host: 'localhost',
    }
  }
});
```

**Issue**: Port already in use
```bash
Error: Port 4321 is already in use
```
**Solution**: Kill existing process or use different port:
```bash
lsof -ti:4321 | xargs kill -9
# or
npm run dev -- --port 4322
```

#### 3. Form Submission Issues

**Issue**: Supabase connection errors
```bash
Error: Invalid API key
```
**Solution**: Verify environment variables:
```bash
# Check if variables are loaded
echo $PUBLIC_SUPABASE_URL
echo $PUBLIC_SUPABASE_ANON_KEY

# Restart development server after changes
npm run dev
```

**Issue**: reCAPTCHA validation failing
```bash
Error: reCAPTCHA verification failed
```
**Solution**: 
1. Verify reCAPTCHA site key is correct
2. Check domain is registered with reCAPTCHA
3. Ensure HTTPS is used in production

#### 4. Accessibility Issues

**Issue**: Form controls not accessible
**Solution**: Verify proper labeling:
```html
<!-- Correct implementation -->
<label for="email" class="field-label required">Email Address</label>
<input 
  type="email" 
  id="email" 
  name="email" 
  required 
  aria-describedby="email-help email-error"
>
<div id="email-help" class="field-help">We'll send your quote here</div>
<div id="email-error" class="error-message" aria-live="polite"></div>
```

#### 5. Performance Issues

**Issue**: Large bundle sizes
**Solution**: Analyze bundle with webpack-bundle-analyzer:
```bash
npm run build
npx webpack-bundle-analyzer dist/_astro/
```

**Issue**: Slow image loading
**Solution**: Ensure images are optimized:
```astro
---
import { Image } from 'astro:assets';
import heroImage from '~/assets/images/hero.webp';
---

<Image 
  src={heroImage}
  alt="Professional window cleaning"
  width={800}
  height={600}
  loading="eager"
  format="webp"
/>
```

### Debugging Tools

#### Enable Debug Mode
```bash
# Start with debug logging
DEBUG=astro:* npm run dev

# Enable Vite debugging
DEBUG=vite:* npm run dev
```

#### Browser DevTools
1. **Network Tab**: Check for failed requests
2. **Console**: Monitor for JavaScript errors
3. **Lighthouse**: Run performance audits
4. **Accessibility Tab**: Check ARIA implementation

#### Supabase Debugging
```javascript
// Enable debug mode in Supabase client
const supabase = createClient(url, key, {
  auth: {
    debug: true
  }
});
```

## Code Quality & Standards

### ESLint Configuration
```json
{
  "extends": [
    "@astrojs/eslint-config-astro",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "astro/no-set-html-directive": "error",
    "@typescript-eslint/no-unused-vars": "warn"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-astro"]
}
```

### Naming Conventions
- **Components**: PascalCase (`BookingForm.astro`)
- **Pages**: kebab-case (`contact-us.astro`)
- **Utilities**: camelCase (`formatPrice.ts`)
- **CSS Classes**: Tailwind utility classes preferred

## Testing Strategy

### End-to-End Testing with Playwright
```typescript
// tests/booking-form.spec.ts
import { test, expect } from '@playwright/test';

test('booking form submission', async ({ page }) => {
  await page.goto('/booking');
  
  // Fill form steps
  await page.click('[data-bedrooms="3 Bed"]');
  await page.click('[data-property-type="Semi-Detached House"]');
  await page.click('[data-frequency="4-weekly"]');
  
  // Continue to contact details
  await page.click('#continue-to-details');
  
  // Fill contact form
  await page.fill('#firstName', 'John');
  await page.fill('#lastName', 'Doe');
  await page.fill('#email', 'john@example.com');
  
  // Submit form
  await page.click('#submit-booking');
  
  // Verify success
  await expect(page.locator('.form-success')).toBeVisible();
});
```

### Accessibility Testing with Pa11y
```javascript
// pa11y-test.js
const pa11y = require('pa11y');
const urls = [
  'http://localhost:4321/',
  'http://localhost:4321/booking',
  'http://localhost:4321/services',
  'http://localhost:4321/contact'
];

urls.forEach(async url => {
  const results = await pa11y(url, {
    standard: 'WCAG2AA'
  });
  console.log(`${url}: ${results.issues.length} issues`);
});
```

## Security Considerations

### Content Security Policy
```html
<!-- Recommended CSP for production -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' *.googleapis.com *.emailjs.com; 
               style-src 'self' 'unsafe-inline' *.googleapis.com; 
               img-src 'self' data: *.supabase.co;">
```

### Input Sanitization
```javascript
// Always sanitize user inputs
function sanitizeInput(input) {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .substring(0, 500); // Limit length
}
```

### Rate Limiting
Implement rate limiting for form submissions:
```javascript
// Simple rate limiting example
const submissions = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const userSubmissions = submissions.get(ip) || [];
  
  // Remove old submissions (older than 1 hour)
  const recentSubmissions = userSubmissions.filter(time => now - time < 3600000);
  
  if (recentSubmissions.length >= 5) {
    throw new Error('Rate limit exceeded');
  }
  
  recentSubmissions.push(now);
  submissions.set(ip, recentSubmissions);
}
```

## Maintenance & Updates

### Regular Maintenance Tasks

#### Daily Monitoring
- [ ] Check Vercel dashboard for errors
- [ ] Monitor booking form submissions
- [ ] Review server response times
- [ ] Check for security alerts

#### Weekly Tasks
- [ ] Review website analytics
- [ ] Check form submission success rate
- [ ] Monitor Core Web Vitals
- [ ] Review and respond to customer inquiries
- [ ] Check for broken links: `npm run test:links`
- [ ] Review error logs in Vercel dashboard

#### Monthly Tasks
- [ ] Update dependencies:
  ```bash
  npm outdated
  npm update
  npm audit fix
  ```
- [ ] Run full test suite:
  ```bash
  npm run test:cross-browser
  npm run accessibility
  npm run performance:audit
  ```
- [ ] Review and update:
  - Service area content
  - Pricing information
  - Business hours
  - Contact information
- [ ] Backup database:
  ```bash
  # Export Supabase data
  npx supabase db dump -f backup-$(date +%Y%m%d).sql
  ```
- [ ] Review SEO performance:
  - Google Search Console
  - Local business listings
  - Schema markup validation

#### Quarterly Tasks
- [ ] Major dependency updates:
  ```bash
  npx npm-check-updates -u
  npm install
  npm run test
  ```
- [ ] Security audit:
  ```bash
  npm audit
  # Check for exposed secrets
  git secrets --scan
  ```
- [ ] Performance optimization:
  - Review bundle size
  - Optimize images
  - Update critical CSS
- [ ] Content audit:
  - Update service descriptions
  - Refresh testimonials
  - Add new service areas
- [ ] Infrastructure review:
  - Vercel usage and costs
  - Supabase usage and scaling
  - EmailJS quota usage

#### Annual Tasks
- [ ] SSL certificate renewal (automatic with Vercel)
- [ ] Domain renewal
- [ ] Complete accessibility audit
- [ ] Update privacy policy and terms
- [ ] Review and update all dependencies
- [ ] Plan major feature updates

### Dependency Update Process
```bash
# Check for outdated packages
npm outdated

# Update patch/minor versions
npm update

# Update major versions (carefully)
npm install package@latest

# Test thoroughly after updates
npm run build
npm run test
npm run lighthouse
```

## Contact & Support

### Technical Support
For technical issues with the website:
1. Check this troubleshooting guide first
2. Review recent changes in git history
3. Check environment variables configuration
4. Verify Supabase connection and API keys

### Business Contact
Somerset Window Cleaning
- Website: https://somersetwindowcleaning.co.uk
- Phone: 01458 860339
- Email: Via website contact form
- Address: 13 Rockhaven Business Centre, Gravenchon Way, Highbridge, Somerset BA16 0HW

---

**Last Updated**: January 2025
**Version**: 3.0 (Astro 5.12 + Enhanced Accessibility)