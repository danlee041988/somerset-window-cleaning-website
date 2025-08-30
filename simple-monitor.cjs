#!/usr/bin/env node

const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const SERVER_URL = 'http://localhost:4322';
const CHECK_INTERVAL = 5000; // 5 seconds

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
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
    'info': colors.cyan
  };
  
  const color = colorMap[level] || colors.reset;
  console.log(`${color}[${timestamp()}] ${message}${colors.reset}`);
}

// Server health check
async function checkServerHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 4322,
      path: '/',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      resolve({ 
        healthy: res.statusCode >= 200 && res.statusCode < 400,
        statusCode: res.statusCode 
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

// Check console output for errors
function checkConsoleErrors(callback) {
  exec('tail -n 50 astro-monitor.log 2>/dev/null', (error, stdout, stderr) => {
    if (stdout) {
      const lines = stdout.split('\n');
      const errors = {
        booking: [],
        emailjs: [],
        auth: [],
        websocket: [],
        module: [],
        other: []
      };
      
      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('error')) {
          if (lowerLine.includes('booking') || lowerLine.includes('form')) {
            errors.booking.push(line);
          } else if (lowerLine.includes('emailjs') || lowerLine.includes('email-js')) {
            errors.emailjs.push(line);
          } else if (lowerLine.includes('auth') || lowerLine.includes('unauthorized')) {
            errors.auth.push(line);
          } else if (lowerLine.includes('websocket') || lowerLine.includes('hmr')) {
            errors.websocket.push(line);
          } else if (lowerLine.includes('module') || lowerLine.includes('import')) {
            errors.module.push(line);
          } else {
            errors.other.push(line);
          }
        }
      });
      
      callback(errors);
    }
  });
}

// Main monitoring function
async function monitor() {
  log('Starting Astro Server Monitor (Simple Mode)', 'info');
  log(`Monitoring server at ${SERVER_URL}`, 'info');
  
  let consecutiveFailures = 0;
  let lastHealthStatus = null;
  
  // Initial check
  const initialHealth = await checkServerHealth();
  if (initialHealth.healthy) {
    log('Server is running and healthy', 'success');
  } else {
    log('Server appears to be down or unresponsive', 'error');
  }
  
  // Health check loop
  setInterval(async () => {
    const health = await checkServerHealth();
    
    // Only log status changes
    if (lastHealthStatus === null || lastHealthStatus !== health.healthy) {
      if (health.healthy) {
        log('Server is healthy', 'success');
        consecutiveFailures = 0;
      } else {
        log(`Server health check failed: ${health.error || `Status ${health.statusCode}`}`, 'error');
      }
      lastHealthStatus = health.healthy;
    }
    
    if (!health.healthy) {
      consecutiveFailures++;
      if (consecutiveFailures === 3) {
        log('ALERT: Server has been down for 15 seconds', 'error');
        log('Consider restarting the dev server manually', 'warning');
      }
    }
    
    // Check for console errors periodically
    if (Date.now() % 20000 < CHECK_INTERVAL) { // Every 20 seconds
      checkConsoleErrors((errors) => {
        const hasErrors = Object.values(errors).some(arr => arr.length > 0);
        
        if (hasErrors) {
          log('Recent errors detected:', 'warning');
          
          if (errors.booking.length > 0) {
            log(`  BOOKING FORM ERRORS: ${errors.booking.length} error(s)`, 'error');
            errors.booking.slice(-2).forEach(err => log(`    ${err}`, 'error'));
          }
          
          if (errors.emailjs.length > 0) {
            log(`  EMAILJS ERRORS: ${errors.emailjs.length} error(s)`, 'error');
            errors.emailjs.slice(-2).forEach(err => log(`    ${err}`, 'error'));
          }
          
          if (errors.auth.length > 0) {
            log(`  AUTHENTICATION ERRORS: ${errors.auth.length} error(s)`, 'error');
            errors.auth.slice(-2).forEach(err => log(`    ${err}`, 'error'));
          }
          
          if (errors.websocket.length > 0) {
            log(`  WEBSOCKET/HMR ERRORS: ${errors.websocket.length} error(s)`, 'warning');
            log('  Tip: Try refreshing your browser or switching to a real browser', 'info');
          }
          
          if (errors.module.length > 0) {
            log(`  MODULE LOADING ERRORS: ${errors.module.length} error(s)`, 'error');
            errors.module.slice(-2).forEach(err => log(`    ${err}`, 'error'));
          }
        }
      });
    }
  }, CHECK_INTERVAL);
  
  // Check specific endpoints
  log('Checking key endpoints...', 'info');
  
  // Check booking form endpoint
  const bookingCheck = await new Promise((resolve) => {
    http.get(`${SERVER_URL}/booking`, (res) => {
      resolve({ path: '/booking', status: res.statusCode });
    }).on('error', () => {
      resolve({ path: '/booking', status: 'error' });
    });
  });
  
  log(`Booking form page: ${bookingCheck.status === 200 ? 'OK' : `Status ${bookingCheck.status}`}`, 
      bookingCheck.status === 200 ? 'success' : 'warning');
}

// Handle process termination
process.on('SIGINT', () => {
  log('Monitor shutting down...', 'info');
  process.exit(0);
});

// Start monitoring
monitor().catch(err => {
  log(`Monitor failed to start: ${err.message}`, 'error');
  process.exit(1);
});