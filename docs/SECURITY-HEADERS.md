# Security Headers Configuration & Verification

## Overview

This document describes the security headers implemented for Somerset Window Cleaning website and how to verify they are properly configured in production.

## Configured Security Headers

### 1. Content Security Policy (CSP)
**Purpose**: Prevents XSS attacks by controlling which resources can be loaded.

**Configuration**:
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net https://www.gstatic.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: https: blob:;
connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://api.emailjs.com wss://*.supabase.co https://vitals.vercel-insights.com https://vercel.live;
frame-src 'self' https://www.google.com https://www.gstatic.com;
object-src 'none';
base-uri 'self';
form-action 'self' https://api.emailjs.com;
frame-ancestors 'self';
upgrade-insecure-requests;
block-all-mixed-content;
```

### 2. X-Frame-Options
**Purpose**: Prevents clickjacking attacks.
**Value**: `SAMEORIGIN`

### 3. X-Content-Type-Options
**Purpose**: Prevents MIME type sniffing.
**Value**: `nosniff`

### 4. Referrer-Policy
**Purpose**: Controls referrer information sent with requests.
**Value**: `strict-origin-when-cross-origin`

### 5. X-XSS-Protection
**Purpose**: Enables browser's XSS filter (legacy).
**Value**: `1; mode=block`

### 6. Permissions-Policy
**Purpose**: Controls browser features and APIs.
**Value**: `camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()`

### 7. Strict-Transport-Security (HSTS)
**Purpose**: Forces HTTPS connections.
**Value**: `max-age=31536000; includeSubDomains; preload`

## Configuration Locations

Security headers are configured in two places:

1. **vercel.json** - Platform-level configuration
2. **src/middleware.ts** - Application-level middleware

Both configurations work together to ensure headers are always sent.

## Verification Methods

### Method 1: Using the Verification Script

Run the provided verification script:

```bash
./scripts/verify-security-headers.sh
```

This script will:
- Check all security headers
- Verify SSL certificate
- Check for header exposures
- Provide links to online scanners

### Method 2: Manual Browser Check

1. Open Chrome DevTools (F12)
2. Navigate to https://somersetwindowcleaning.co.uk
3. Go to Network tab
4. Reload the page
5. Click on the first request (the document)
6. Check the Response Headers section

### Method 3: Online Security Scanners

Use these online tools for comprehensive analysis:

1. **Security Headers Scanner**
   - URL: https://securityheaders.com
   - Enter: https://somersetwindowcleaning.co.uk
   - Target Grade: A or A+

2. **Mozilla Observatory**
   - URL: https://observatory.mozilla.org
   - Enter: https://somersetwindowcleaning.co.uk
   - Target Grade: B+ or higher

3. **SSL Labs**
   - URL: https://www.ssllabs.com/ssltest/
   - Enter: somersetwindowcleaning.co.uk
   - Target Grade: A or A+

### Method 4: Command Line Check

Quick check using curl:

```bash
curl -I https://somersetwindowcleaning.co.uk
```

## Expected Results

When properly configured, you should see:

✅ All 7 security headers present
✅ No server version exposed
✅ Valid SSL certificate
✅ Security Headers grade: A or A+
✅ Mozilla Observatory grade: B+ or higher
✅ SSL Labs grade: A or A+

## Troubleshooting

### Headers Not Showing

1. **Check Vercel deployment**
   - Ensure latest version is deployed
   - Check Vercel dashboard for errors

2. **Clear CDN cache**
   - Headers might be cached
   - Wait 5-10 minutes or purge cache

3. **Check middleware**
   - Ensure middleware.ts is not throwing errors
   - Check server logs

### CSP Violations

If CSP is blocking legitimate resources:

1. Check browser console for CSP errors
2. Update CSP directives in both locations
3. Test thoroughly before deploying

### HSTS Issues

HSTS is permanent once enabled. Be careful with:
- includeSubDomains
- preload directive

## Security Best Practices

1. **Regular Reviews**
   - Check headers monthly
   - Update CSP as needed
   - Monitor for new security recommendations

2. **Testing**
   - Test all functionality after CSP changes
   - Use staging environment first
   - Monitor browser console for violations

3. **Documentation**
   - Document all CSP exceptions
   - Keep this guide updated
   - Log security decisions

## Additional Resources

- [MDN Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Report URI](https://report-uri.com/) - For CSP reporting

## Contact

For security concerns or questions, contact the development team through proper channels.