#!/usr/bin/env node

const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const SERVER_URL = 'http://localhost:4322';
const CHECK_INTERVAL = 5000; // 5 seconds
const LOG_FILE = path.join(__dirname, 'astro-monitor.log');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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
  const logMessage = `[${timestamp()}] ${message}`;
  
  console.log(`${color}${logMessage}${colors.reset}`);
  
  // Also write to log file
  fs.appendFileSync(LOG_FILE, `${logMessage}\n`);
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

// Monitor specific patterns in server output
class OutputMonitor {
  constructor() {
    this.patterns = {
      error: /\[ERROR\]|\[error\]|Error:|ERROR/i,
      warning: /\[WARN\]|\[warning\]|Warning:/i,
      hmr: /HMR|hot module replacement|websocket/i,
      emailjs: /emailjs|EmailJS|email-js/i,
      booking: /booking|BookingForm|form submission/i,
      auth: /auth|authentication|unauthorized/i,
      moduleError: /Cannot find module|Module not found|Failed to resolve/i,
      buildError: /Build failed|Failed to compile|Syntax error/i,
      websocketError: /WebSocket.*error|ws.*error|connection.*failed/i
    };
    
    this.recentErrors = [];
    this.hmrIssueCount = 0;
  }

  analyze(data) {
    const text = data.toString();
    const lines = text.split('\n').filter(line => line.trim());

    lines.forEach(line => {
      // Check for errors
      if (this.patterns.error.test(line)) {
        this.recentErrors.push({ time: new Date(), message: line });
        
        // Special handling for specific error types
        if (this.patterns.moduleError.test(line)) {
          log(`MODULE ERROR: ${line}`, 'error');
        } else if (this.patterns.buildError.test(line)) {
          log(`BUILD ERROR: ${line}`, 'error');
        } else if (this.patterns.websocketError.test(line)) {
          this.hmrIssueCount++;
          log(`WEBSOCKET ERROR: ${line}`, 'error');
          log('Consider switching to a real browser if using embedded preview', 'warning');
        } else if (this.patterns.emailjs.test(line) || this.patterns.booking.test(line)) {
          log(`BOOKING/EMAIL ERROR: ${line}`, 'error');
        } else if (this.patterns.auth.test(line)) {
          log(`AUTH ERROR: ${line}`, 'error');
        } else {
          log(`ERROR: ${line}`, 'error');
        }
      }
      
      // Check for warnings
      else if (this.patterns.warning.test(line)) {
        log(`WARNING: ${line}`, 'warning');
      }
      
      // Check for HMR issues
      else if (this.patterns.hmr.test(line) && this.patterns.error.test(line)) {
        this.hmrIssueCount++;
        log(`HMR ISSUE: ${line}`, 'warning');
      }
    });
  }

  getStatus() {
    const recentErrorCount = this.recentErrors.filter(
      err => (new Date() - err.time) < 60000 // Errors in last minute
    ).length;

    return {
      recentErrorCount,
      hmrIssueCount: this.hmrIssueCount,
      hasBookingErrors: this.recentErrors.some(err => 
        this.patterns.booking.test(err.message) || 
        this.patterns.emailjs.test(err.message)
      ),
      hasAuthErrors: this.recentErrors.some(err => 
        this.patterns.auth.test(err.message)
      )
    };
  }
}

// Main monitoring function
async function monitor() {
  log('Starting Astro Dev Server Monitor', 'info');
  log(`Monitoring server at ${SERVER_URL}`, 'info');
  
  const outputMonitor = new OutputMonitor();
  let consecutiveFailures = 0;
  let serverProcess = null;
  
  // Function to start/restart server
  function startServer() {
    if (serverProcess) {
      log('Stopping existing server process', 'warning');
      serverProcess.kill();
    }
    
    log('Starting Astro dev server...', 'info');
    serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: __dirname,
      shell: true
    });
    
    serverProcess.stdout.on('data', (data) => {
      outputMonitor.analyze(data);
    });
    
    serverProcess.stderr.on('data', (data) => {
      outputMonitor.analyze(data);
    });
    
    serverProcess.on('exit', (code, signal) => {
      log(`Server process exited with code ${code} and signal ${signal}`, 'error');
      setTimeout(() => {
        log('Attempting to restart server...', 'warning');
        startServer();
      }, 5000);
    });
  }
  
  // Health check loop
  setInterval(async () => {
    const health = await checkServerHealth();
    const status = outputMonitor.getStatus();
    
    if (!health.healthy) {
      consecutiveFailures++;
      log(`Server health check failed (${consecutiveFailures}): ${health.error || `Status ${health.statusCode}`}`, 'error');
      
      if (consecutiveFailures >= 3) {
        log('Multiple consecutive failures detected. Server may need restart.', 'error');
        // Don't auto-restart if we're already managing the process
        if (!serverProcess) {
          startServer();
        }
      }
    } else {
      if (consecutiveFailures > 0) {
        log('Server recovered', 'success');
      }
      consecutiveFailures = 0;
    }
    
    // Report status
    if (status.recentErrorCount > 0 || status.hmrIssueCount > 0) {
      log(`Status Report:`, 'info');
      log(`  - Recent errors: ${status.recentErrorCount}`, status.recentErrorCount > 0 ? 'warning' : 'info');
      log(`  - HMR issues: ${status.hmrIssueCount}`, status.hmrIssueCount > 0 ? 'warning' : 'info');
      
      if (status.hasBookingErrors) {
        log(`  - BOOKING FORM ERRORS DETECTED`, 'error');
      }
      if (status.hasAuthErrors) {
        log(`  - AUTHENTICATION ERRORS DETECTED`, 'error');
      }
      
      if (status.hmrIssueCount > 5) {
        log('Multiple HMR issues detected. Recommendations:', 'warning');
        log('  1. Try refreshing your browser (Cmd+R)', 'info');
        log('  2. Clear browser cache if issues persist', 'info');
        log('  3. Switch to a real browser if using embedded preview', 'info');
      }
    }
  }, CHECK_INTERVAL);
  
  // Monitor for git branch changes
  let lastBranch = '';
  
  setInterval(() => {
    try {
      const currentBranch = fs.readFileSync(path.join(__dirname, '.git/HEAD'), 'utf8').trim();
      if (lastBranch && lastBranch !== currentBranch) {
        log(`Branch change detected: ${lastBranch} -> ${currentBranch}`, 'warning');
        log('Running astro sync...', 'info');
        
        const sync = spawn('npx', ['astro', 'sync'], {
          cwd: __dirname,
          shell: true
        });
        
        sync.on('exit', (code) => {
          if (code === 0) {
            log('Astro sync completed successfully', 'success');
            log('Running astro check...', 'info');
            
            const check = spawn('npx', ['astro', 'check'], {
              cwd: __dirname,
              shell: true
            });
            
            check.on('exit', (checkCode) => {
              if (checkCode === 0) {
                log('Astro check completed successfully', 'success');
              } else {
                log('Astro check found issues', 'warning');
              }
            });
          } else {
            log('Astro sync failed', 'error');
          }
        });
      }
      lastBranch = currentBranch;
    } catch (err) {
      // Not a git repo or other error - ignore
    }
  }, 10000); // Check every 10 seconds
  
  // Initial health check
  const initialHealth = await checkServerHealth();
  if (initialHealth.healthy) {
    log('Initial server health check: OK', 'success');
  } else {
    log('Initial server health check: FAILED', 'error');
    if (!serverProcess) {
      startServer();
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('Monitor shutting down...', 'info');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Monitor shutting down...', 'info');
  process.exit(0);
});

// Start monitoring
monitor().catch(err => {
  log(`Monitor failed to start: ${err.message}`, 'error');
  process.exit(1);
});