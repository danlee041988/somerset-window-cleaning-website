#!/usr/bin/env node

/**
 * Development Server Wrapper
 * Automatically restarts the Astro dev server if it crashes
 */

const { spawn } = require('child_process');
const chalk = require('chalk');

// Configuration
const MAX_RESTART_ATTEMPTS = 10;
const RESTART_DELAY = 2000; // 2 seconds
const RESET_INTERVAL = 60000; // Reset restart count after 1 minute of stable running

let restartCount = 0;
let lastRestartTime = Date.now();
let currentProcess = null;
let isShuttingDown = false;

// ANSI escape codes for colors (in case chalk isn't installed)
const colors = {
  green: (text) => chalk ? chalk.green(text) : `\x1b[32m${text}\x1b[0m`,
  red: (text) => chalk ? chalk.red(text) : `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => chalk ? chalk.yellow(text) : `\x1b[33m${text}\x1b[0m`,
  blue: (text) => chalk ? chalk.blue(text) : `\x1b[34m${text}\x1b[0m`,
  gray: (text) => chalk ? chalk.gray(text) : `\x1b[90m${text}\x1b[0m`,
};

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = colors.gray(`[${timestamp}]`);
  
  switch(type) {
    case 'success':
      console.log(`${prefix} ${colors.green('✓')} ${message}`);
      break;
    case 'error':
      console.log(`${prefix} ${colors.red('✗')} ${message}`);
      break;
    case 'warning':
      console.log(`${prefix} ${colors.yellow('⚠')} ${message}`);
      break;
    case 'info':
    default:
      console.log(`${prefix} ${colors.blue('ℹ')} ${message}`);
      break;
  }
}

function startDevServer() {
  log('Starting Astro development server...', 'info');
  
  // Reset restart count if enough time has passed
  if (Date.now() - lastRestartTime > RESET_INTERVAL) {
    restartCount = 0;
  }
  
  // Check if we've exceeded max restart attempts
  if (restartCount >= MAX_RESTART_ATTEMPTS) {
    log(`Maximum restart attempts (${MAX_RESTART_ATTEMPTS}) reached. Please check for errors.`, 'error');
    process.exit(1);
  }
  
  // Spawn the dev server process
  currentProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      FORCE_COLOR: '1',
      // Add any environment variables to improve stability
      NODE_OPTIONS: '--max-old-space-size=4096', // Increase memory limit
    }
  });
  
  currentProcess.on('exit', (code, signal) => {
    if (isShuttingDown) {
      log('Dev server stopped gracefully', 'success');
      return;
    }
    
    if (code === 0) {
      log('Dev server exited normally', 'info');
    } else {
      log(`Dev server crashed with code ${code} (signal: ${signal})`, 'error');
      restartCount++;
      lastRestartTime = Date.now();
      
      log(`Restarting in ${RESTART_DELAY/1000} seconds... (attempt ${restartCount}/${MAX_RESTART_ATTEMPTS})`, 'warning');
      
      setTimeout(() => {
        if (!isShuttingDown) {
          startDevServer();
        }
      }, RESTART_DELAY);
    }
  });
  
  currentProcess.on('error', (error) => {
    log(`Failed to start dev server: ${error.message}`, 'error');
    restartCount++;
    
    setTimeout(() => {
      if (!isShuttingDown && restartCount < MAX_RESTART_ATTEMPTS) {
        startDevServer();
      }
    }, RESTART_DELAY);
  });
}

// Handle graceful shutdown
function shutdown() {
  if (isShuttingDown) return;
  
  isShuttingDown = true;
  log('\nShutting down dev server...', 'info');
  
  if (currentProcess && !currentProcess.killed) {
    currentProcess.kill('SIGTERM');
    
    // Force kill after 5 seconds if it hasn't shut down
    setTimeout(() => {
      if (currentProcess && !currentProcess.killed) {
        currentProcess.kill('SIGKILL');
      }
      process.exit(0);
    }, 5000);
  } else {
    process.exit(0);
  }
}

// Register shutdown handlers
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGUSR2', shutdown); // For nodemon restarts

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`, 'error');
  console.error(error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled rejection at: ${promise}, reason: ${reason}`, 'error');
  // Don't exit on unhandled rejections, just log them
});

// Start the server
log('Astro Dev Server Manager v1.0', 'success');
log('Press Ctrl+C to stop', 'info');
log('----------------------------------------', 'info');

startDevServer();