#!/usr/bin/env node

/**
 * Health Check Script
 * 
 * Simple monitoring script to check if the site is healthy
 * Can be used with uptime monitoring services or cron jobs
 */

const https = require('https');
const http = require('http');

const SITE_URL = process.env.SITE_URL || 'http://localhost:4321';
const HEALTH_ENDPOINT = '/api/health';
const TIMEOUT = 10000; // 10 seconds

function checkHealth() {
  const url = new URL(HEALTH_ENDPOINT, SITE_URL);
  const protocol = url.protocol === 'https:' ? https : http;

  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'GET',
    timeout: TIMEOUT,
    headers: {
      'User-Agent': 'Somerset-Health-Check/1.0',
    },
  };

  return new Promise((resolve, reject) => {
    const req = protocol.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          if (res.statusCode === 200 && health.status === 'healthy') {
            console.log(`✅ Site is healthy at ${new Date().toISOString()}`);
            console.log(`   Database: ${health.checks.database ? '✓' : '✗'}`);
            console.log(`   Uptime: ${Math.floor(health.uptime / 60)} minutes`);
            resolve(true);
          } else {
            console.error(`⚠️  Site is degraded at ${new Date().toISOString()}`);
            console.error(`   Status: ${health.status}`);
            console.error(`   Database: ${health.checks.database ? '✓' : '✗'}`);
            resolve(false);
          }
        } catch (error) {
          console.error(`❌ Failed to parse health response: ${error.message}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Health check failed at ${new Date().toISOString()}: ${error.message}`);
      reject(error);
    });

    req.on('timeout', () => {
      console.error(`❌ Health check timed out at ${new Date().toISOString()}`);
      req.abort();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Run health check
if (require.main === module) {
  checkHealth()
    .then((healthy) => {
      process.exit(healthy ? 0 : 1);
    })
    .catch(() => {
      process.exit(1);
    });
}

module.exports = { checkHealth };