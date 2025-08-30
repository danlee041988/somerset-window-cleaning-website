import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';

// In production, this should be in environment variables
// For now, using a hashed version of a simple password
// Default password: "SomersetStaff2024"
const STAFF_PASSWORD_HASH = '$2a$10$YH5Ia8zXqgRvNxWxR8kpkuWvZTxXEKkmEw9V3vXzYK8GfIlImUVOq';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { password, remember } = await request.json();
    
    // Verify password
    const isValid = await bcrypt.compare(password, STAFF_PASSWORD_HASH);
    
    if (isValid) {
      // Set authentication cookie
      const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 24 hours
      
      cookies.set('staff-auth', 'authenticated', {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'strict',
        maxAge: maxAge,
        path: '/',
      });
      
      // Set session data
      const sessionData = {
        loggedInAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + maxAge * 1000).toISOString(),
      };
      
      cookies.set('staff-session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'strict',
        maxAge: maxAge,
        path: '/',
      });
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new Response(JSON.stringify({ success: false, message: 'Invalid password' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const DELETE: APIRoute = async ({ cookies }) => {
  // Logout - clear cookies
  cookies.delete('staff-auth', { path: '/' });
  cookies.delete('staff-session', { path: '/' });
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};