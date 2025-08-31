import type { MiddlewareHandler } from 'astro';

const protectedRoutes = ['/staff/bookings', '/staff/dashboard'];

export const onRequest: MiddlewareHandler = async ({ request, cookies, redirect, url }, next) => {
  const pathname = url.pathname;
  
  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // Check for authentication cookie
    const authCookie = cookies.get('staff-auth')?.value;
    
    if (!authCookie || authCookie !== 'authenticated') {
      // Redirect to login page
      return redirect('/staff/login');
    }
    
    // Check session expiry
    const sessionCookie = cookies.get('staff-session')?.value;
    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie);
        if (new Date(session.expiresAt) < new Date()) {
          // Session expired, clear cookies and redirect
          cookies.delete('staff-auth', { path: '/' });
          cookies.delete('staff-session', { path: '/' });
          return redirect('/staff/login');
        }
      } catch (e) {
        // Invalid session data, clear and redirect
        cookies.delete('staff-auth', { path: '/' });
        cookies.delete('staff-session', { path: '/' });
        return redirect('/staff/login');
      }
    }
  }
  
  // Process the request
  const response = await next();
  
  // Add security headers to all responses
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  const isDev = import.meta.env.DEV;
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.emailjs.com ${isDev ? "'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://api.emailjs.com https://www.google-analytics.com wss://*.supabase.co",
    "frame-src 'self' https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ];
  
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
  
  // Permissions Policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://somersetwindowcleaning.co.uk',
      'https://www.somersetwindowcleaning.co.uk',
      'http://localhost:4321',
      'http://localhost:4322',
      'http://localhost:3000'
    ];
    
    if (isDev || !origin || allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Max-Age', '86400');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    // Add API-specific headers
    response.headers.set('X-API-Version', '1.0');
    
    // Cache control for API responses
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  // Add HSTS header for production
  if (!isDev) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  return response;
};