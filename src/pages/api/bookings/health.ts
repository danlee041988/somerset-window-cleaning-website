import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const GET: APIRoute = async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };
  
  try {
    // Check environment variables
    const supabaseUrl = import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    
    const health = {
      status: 'checking',
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseKey,
        supabaseUrl: supabaseUrl?.substring(0, 30) + '...',
      },
      database: {
        connected: false,
        tableExists: false,
        error: null,
      }
    };
    
    if (!supabaseUrl || !supabaseKey) {
      health.status = 'error';
      health.database.error = 'Missing Supabase credentials';
      
      return new Response(JSON.stringify(health), {
        status: 503,
        headers
      });
    }
    
    // Test Supabase connection
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try to query the bookings_simple table
    const { data, error } = await supabase
      .from('bookings_simple')
      .select('count')
      .limit(1);
    
    if (error) {
      health.status = 'error';
      health.database.error = {
        message: error.message,
        code: error.code,
        hint: error.hint,
      };
      
      if (error.code === '42P01') {
        health.database.error.details = 'Table "bookings_simple" does not exist';
      }
    } else {
      health.status = 'healthy';
      health.database.connected = true;
      health.database.tableExists = true;
    }
    
    return new Response(JSON.stringify(health, null, 2), {
      status: health.status === 'healthy' ? 200 : 503,
      headers
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers
    });
  }
};