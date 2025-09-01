#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Run this to check if your deployment configuration is correct
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 Somerset Window Cleaning - Deployment Verification\n');

// Check for required files
const requiredFiles = [
  'package.json',
  'astro.config.ts',
  'vercel.json',
  '.env.example',
  'tsconfig.json'
];

console.log('📁 Checking required files:');
let filesOk = true;
for (const file of requiredFiles) {
  const filePath = join(projectRoot, file);
  if (existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    filesOk = false;
  }
}

// Check package.json
console.log('\n📦 Checking package.json:');
const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));

// Check Node version
const nodeVersion = packageJson.engines?.node;
if (nodeVersion) {
  console.log(`  ✅ Node version specified: ${nodeVersion}`);
} else {
  console.log('  ⚠️  No Node version specified');
}

// Check for required dependencies
const requiredDeps = [
  '@astrojs/vercel',
  '@astrojs/node',
  '@supabase/supabase-js',
  'astro',
  'nodemailer'
];

console.log('\n📚 Checking dependencies:');
let depsOk = true;
for (const dep of requiredDeps) {
  if (packageJson.dependencies?.[dep]) {
    console.log(`  ✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else if (packageJson.devDependencies?.[dep]) {
    console.log(`  ⚠️  ${dep}: ${packageJson.devDependencies[dep]} (in devDependencies - should be in dependencies)`);
    depsOk = false;
  } else {
    console.log(`  ❌ ${dep} - NOT FOUND`);
    depsOk = false;
  }
}

// Check Astro config
console.log('\n⚙️  Checking Astro configuration:');
const astroConfigContent = readFileSync(join(projectRoot, 'astro.config.ts'), 'utf8');
const astroChecks = [
  { pattern: /output:\s*['"]server['"]/, name: 'Server output mode' },
  { pattern: /adapter:\s*vercel\(\)/, name: 'Vercel adapter' },
  { pattern: /site:\s*['"]https:\/\//, name: 'Site URL configured' }
];

for (const check of astroChecks) {
  if (check.pattern.test(astroConfigContent)) {
    console.log(`  ✅ ${check.name}`);
  } else {
    console.log(`  ❌ ${check.name} - NOT FOUND`);
  }
}

// Check Vercel config
console.log('\n🚀 Checking Vercel configuration:');
const vercelJson = JSON.parse(readFileSync(join(projectRoot, 'vercel.json'), 'utf8'));
console.log(`  ✅ Build command: ${vercelJson.buildCommand || 'default'}`);
console.log(`  ✅ Output directory: ${vercelJson.outputDirectory || 'default'}`);
console.log(`  ✅ Framework: ${vercelJson.framework || 'auto-detected'}`);
console.log(`  ${vercelJson.headers ? '✅' : '⚠️ '} Security headers: ${vercelJson.headers ? 'configured' : 'not configured'}`);

// Check environment variables
console.log('\n🔐 Required Environment Variables:');
console.log('  Copy these to your Vercel dashboard:\n');

const envExample = readFileSync(join(projectRoot, '.env.example'), 'utf8');
const envVars = envExample.match(/^([A-Z_]+)=/gm) || [];
const publicVars = [];
const serverVars = [];

for (const varLine of envVars) {
  const varName = varLine.replace('=', '');
  if (varName.startsWith('PUBLIC_')) {
    publicVars.push(varName);
  } else {
    serverVars.push(varName);
  }
}

console.log('  🌐 Public Variables (safe for client):');
publicVars.forEach(v => console.log(`    - ${v}`));

console.log('\n  🔒 Server-Only Variables (keep secret):');
serverVars.forEach(v => console.log(`    - ${v}`));

// Check API routes
console.log('\n🔌 Checking API routes:');
const apiRoutes = [
  'src/pages/api/booking.ts',
  'src/pages/api/contact.ts',
  'src/pages/api/health.ts'
];

for (const route of apiRoutes) {
  const routePath = join(projectRoot, route);
  if (existsSync(routePath)) {
    console.log(`  ✅ ${route}`);
    
    // Check for common issues
    const content = readFileSync(routePath, 'utf8');
    if (content.includes('import.meta.env.EMAILJS_PUBLIC_KEY')) {
      console.log(`    ⚠️  Uses EMAILJS_PUBLIC_KEY - should be EMAILJS_PRIVATE_KEY`);
    }
  } else {
    console.log(`  ❌ ${route} - NOT FOUND`);
  }
}

// Summary
console.log('\n📊 Summary:');
const allOk = filesOk && depsOk;
if (allOk) {
  console.log('  ✅ Configuration looks good!');
  console.log('  📝 Next steps:');
  console.log('     1. Set up environment variables in Vercel dashboard');
  console.log('     2. Run "vercel" to deploy');
  console.log('     3. Test all API endpoints after deployment');
} else {
  console.log('  ⚠️  Some issues found - please fix them before deploying');
}

console.log('\n💡 Deployment Tips:');
console.log('  - Use "vercel --prod" for production deployment');
console.log('  - Use "vercel logs" to check function logs');
console.log('  - Test API routes with: curl https://your-domain.vercel.app/api/health');
console.log('  - Monitor build logs in Vercel dashboard\n');