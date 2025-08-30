import type { APIRoute } from 'astro';

// TEMPORARY: No password authentication - add back later
// TODO: Re-enable password authentication before production

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { remember } = await request.json();
    
    // TEMPORARY: Always allow login without password
    const isValid = true;
    
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