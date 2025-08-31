import type { MiddlewareHandler } from 'astro';

/**
 * Security middleware for Somerset Window Cleaning website
 * Implements additional security measures at runtime
 */
export const security: MiddlewareHandler = async (context, next) => {
  const { request, url } = context;
  
  // Prevent clickjacking by checking origin
  const origin = request.headers.get('origin');
  const host = url.host;
  
  // Allow requests from same origin or no origin (direct navigation)
  if (origin && !origin.includes(host)) {
    // Log suspicious cross-origin requests
    console.warn(`Suspicious cross-origin request from ${origin} to ${url.pathname}`);
  }
  
  // Add security headers for API routes
  if (url.pathname.startsWith('/api/')) {
    const response = await next();
    
    // Additional API-specific headers
    response.headers.set('X-API-Version', '1.0');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    return response;
  }
  
  // Continue with the request
  return next();
};

/**
 * Rate limiting storage (in-memory for now, will be replaced with Redis)
 * Maps IP addresses to request timestamps
 */
const rateLimitStore = new Map<string, number[]>();

/**
 * Simple rate limiting function
 * @param ip - Client IP address
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const requests = rateLimitStore.get(ip) || [];
  
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
  
  if (validRequests.length >= limit) {
    return false; // Rate limited
  }
  
  // Add current request
  validRequests.push(now);
  rateLimitStore.set(ip, validRequests);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance on each request
    for (const [key, timestamps] of rateLimitStore.entries()) {
      const valid = timestamps.filter(t => now - t < windowMs);
      if (valid.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, valid);
      }
    }
  }
  
  return true;
}

/**
 * Get client IP address from request
 * Handles various proxy headers
 */
export function getClientIP(request: Request): string {
  // Check various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Vercel specific header
  const vercelIP = request.headers.get('x-vercel-forwarded-for');
  if (vercelIP) {
    return vercelIP.split(',')[0].trim();
  }
  
  // Default to a placeholder
  return '0.0.0.0';
}