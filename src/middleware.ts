import type { MiddlewareHandler } from 'astro';

const protectedRoutes = ['/staff/bookings', '/staff/dashboard'];

export const onRequest: MiddlewareHandler = async ({ request, cookies, redirect }, next) => {
  const pathname = new URL(request.url).pathname;
  
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
  
  return next();
};