import type { APIRoute } from 'astro';
import { supabase } from '~/lib/supabase';

export const GET: APIRoute = async () => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: import.meta.env.MODE,
    checks: {
      server: true,
      database: false,
    },
  };

  // Check database connection
  try {
    const { error } = await supabase.from('bookings').select('count').limit(1);
    health.checks.database = !error;
  } catch (error) {
    health.checks.database = false;
  }

  // Overall health status
  const allHealthy = Object.values(health.checks).every(check => check === true);
  health.status = allHealthy ? 'healthy' : 'degraded';

  return new Response(JSON.stringify(health, null, 2), {
    status: allHealthy ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
};