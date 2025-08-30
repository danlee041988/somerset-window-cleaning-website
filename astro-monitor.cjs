#!/usr/bin/env node

const http = require('http');
const { spawn } = require('child_process');

// Configuration
const SERVER_PORT = 4321;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;
const CHECK_INTERVAL = 5000; // 5 seconds

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Helper functions
function timestamp() {
  return new Date().toISOString().split('T')[1].split('.')[0];
}

function log(message, level = 'info') {
  const colorMap = {
    'error': colors.red,
    'warning': colors.yellow,
    'success': colors.green,
    'info': colors.cyan,
    'special': colors.magenta
  };
  
  const color = colorMap[level] || colors.reset;
  console.log(`${color}[${timestamp()}] ${message}${colors.reset}`);
}

// Server health check
async function checkServerHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: SERVER_PORT,
      path: '/',
      method: 'GET',
      timeout: 3000,
      headers: {
        'Accept': 'text/html'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ 
          healthy: res.statusCode >= 200 && res.statusCode < 400,
          statusCode: res.statusCode,
          hasContent: data.length > 100
        });
      });
    });

    req.on('error', (err) => {
      resolve({ healthy: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ healthy: false, error: 'Request timeout' });
    });

    req.end();
  });
}

// Check specific endpoints
async function checkEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: SERVER_PORT,
      path: path,
      method: 'GET',
      timeout: 5000,
      headers: {
        'Accept': 'text/html'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ 
          path,
          status: res.statusCode,
          hasEmailJS: data.includes('emailjs') || data.includes('EmailJS'),
          hasBookingForm: data.includes('BookingForm') || data.includes('booking-form'),
          size: data.length
        });
      });
    });

    req.on('error', (err) => {
      resolve({ path, status: 'error', error: err.message });
    });

    req.end();
  });
}

// Monitor browser console errors
function monitorBrowserErrors() {
  // This would require a browser automation tool like Puppeteer
  // For now, we'll provide instructions
  log('To monitor browser console errors:', 'info');
  log('  1. Open http://localhost:4321 in Chrome/Firefox', 'info');
  log('  2. Open Developer Tools (F12)', 'info');
  log('  3. Check Console tab for errors', 'info');
  log('  4. Check Network tab for failed requests', 'info');
}

// Main monitoring function
async function monitor() {
  log('Somerset Window Cleaning - Astro Dev Server Monitor', 'special');
  log(`Monitoring server at ${SERVER_URL}`, 'info');
  log('Press Ctrl+C to stop monitoring', 'info');
  console.log('');
  
  let consecutiveFailures = 0;
  let lastStatus = null;
  let errorCounts = {
    websocket: 0,
    booking: 0,
    general: 0
  };
  
  // Initial server check
  const initialHealth = await checkServerHealth();
  if (initialHealth.healthy) {
    log(`Server is running (Status: ${initialHealth.statusCode})`, 'success');
  } else {
    log('Server is not responding!', 'error');
    log('Please ensure "npm run dev" is running', 'warning');
  }
  
  // Check critical endpoints
  log('Checking critical endpoints...', 'info');
  const endpoints = [
    '/booking-2step',
    '/services',
    '/contact'
  ];
  
  for (const endpoint of endpoints) {
    const result = await checkEndpoint(endpoint);
    if (result.status === 200) {
      log(`  ${endpoint}: OK`, 'success');
      if (endpoint.includes('booking')) {
        if (result.hasEmailJS) {
          log(`    EmailJS integration: FOUND`, 'success');
        } else {
          log(`    EmailJS integration: NOT FOUND`, 'warning');
        }
        if (result.hasBookingForm) {
          log(`    Booking form component: FOUND`, 'success');
        } else {
          log(`    Booking form component: NOT FOUND`, 'warning');
        }
      }
    } else {
      log(`  ${endpoint}: ${result.status} ${result.error || ''}`, 'error');
    }
  }
  
  console.log('');
  log('Starting continuous monitoring...', 'info');
  monitorBrowserErrors();
  console.log('');
  
  // Continuous monitoring
  setInterval(async () => {
    const health = await checkServerHealth();
    
    if (!health.healthy) {
      consecutiveFailures++;
      if (consecutiveFailures === 1 || consecutiveFailures % 5 === 0) {
        log(`Server down (${consecutiveFailures} checks failed): ${health.error || 'No response'}`, 'error');
      }
      
      if (consecutiveFailures === 3) {
        log('ALERT: Server has been down for 15 seconds!', 'error');
        log('Recommended actions:', 'warning');
        log('  1. Check if the dev server process crashed', 'info');
        log('  2. Look for build errors in the terminal', 'info');
        log('  3. Try restarting with: npm run dev', 'info');
      }
    } else {
      if (consecutiveFailures > 0) {
        log('Server recovered!', 'success');
        consecutiveFailures = 0;
      }
      
      // Only log status periodically or on change
      if (lastStatus !== 'healthy' || Date.now() % 60000 < CHECK_INTERVAL) {
        log(`Server healthy (Status: ${health.statusCode})`, 'success');
      }
      lastStatus = 'healthy';
    }
  }, CHECK_INTERVAL);
  
  // Monitor dev server output
  log('Monitoring server output for errors...', 'info');
  const devProcess = spawn('tail', ['-f', '/dev/null'], { shell: true });
  
  // Instead of tailing logs, provide guidance
  setTimeout(() => {
    log('Common issues to watch for:', 'warning');
    log('  - WebSocket connection errors (affects HMR)', 'info');
    log('  - Module resolution errors', 'info');
    log('  - EmailJS configuration errors', 'info');
    log('  - Form submission failures', 'info');
    log('  - Authentication/CORS errors', 'info');
  }, 2000);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  log('Shutting down monitor...', 'info');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Received termination signal', 'info');
  process.exit(0);
});

// Start monitoring
monitor().catch(err => {
  log(`Monitor failed: ${err.message}`, 'error');
  process.exit(1);
});