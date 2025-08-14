#!/usr/bin/env node

/**
 * Pa11y Accessibility Test Suite for Somerset Window Cleaning
 * 
 * Comprehensive WCAG 2.1 AA compliance testing across all key pages.
 * Tests are configured with zero tolerance for accessibility violations.
 * 
 * This script runs automated accessibility tests against the local development
 * server and generates detailed reports for any violations found.
 */

const pa11y = require('pa11y');
const fs = require('fs');
const path = require('path');

// Test configuration aligned with WCAG 2.1 AA standards
const testConfig = {
  standard: 'WCAG2AA',
  level: 'error',
  threshold: 0, // Zero tolerance for violations
  timeout: 30000,
  wait: 2000,
  ignore: [], // No ignored rules - full compliance required
  includeWarnings: true,
  includeNotices: false,
  chromeLaunchConfig: {
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  },
  actions: [
    'wait for element body to be visible',
    'wait for 2000'
  ]
};

// URLs to test - covering all key user journeys
const urlsToTest = [
  {
    url: 'http://localhost:4321/',
    name: 'Homepage',
    description: 'Main landing page with hero, services overview, and contact forms'
  },
  {
    url: 'http://localhost:4321/services',
    name: 'Services',
    description: 'Detailed services page with features and call-to-action'
  },
  {
    url: 'http://localhost:4321/about',
    name: 'About',
    description: 'About page with team information and company details'
  },
  {
    url: 'http://localhost:4321/contact',
    name: 'Contact',
    description: 'Contact form with postcode checker and business information'
  },
  {
    url: 'http://localhost:4321/areas',
    name: 'Service Areas',
    description: 'Areas page with postcode coverage and location information'
  }
];

async function runAccessibilityTests() {
  console.log('🔍 Starting Pa11y accessibility tests...\n');
  console.log('📋 Testing against WCAG 2.1 AA standards with zero tolerance for violations\n');
  
  let totalIssues = 0;
  let testResults = [];
  
  for (const testUrl of urlsToTest) {
    console.log(`Testing: ${testUrl.name} (${testUrl.url})`);
    console.log(`Description: ${testUrl.description}`);
    
    try {
      const results = await pa11y(testUrl.url, testConfig);
      
      if (results.issues.length === 0) {
        console.log('✅ PASS - No accessibility violations found\n');
      } else {
        console.log(`❌ FAIL - ${results.issues.length} accessibility violations found:`);
        
        results.issues.forEach((issue, index) => {
          console.log(`\n  ${index + 1}. ${issue.type.toUpperCase()}: ${issue.message}`);
          console.log(`     Code: ${issue.code}`);
          console.log(`     Element: ${issue.context}`);
          console.log(`     Selector: ${issue.selector}`);
        });
        console.log('');
      }
      
      totalIssues += results.issues.length;
      testResults.push({
        url: testUrl.url,
        name: testUrl.name,
        description: testUrl.description,
        issues: results.issues,
        passed: results.issues.length === 0
      });
      
    } catch (error) {
      console.log(`❌ ERROR - Failed to test ${testUrl.name}: ${error.message}\n`);
      testResults.push({
        url: testUrl.url,
        name: testUrl.name,
        description: testUrl.description,
        issues: [],
        passed: false,
        error: error.message
      });
    }
  }
  
  // Generate summary report
  console.log('📊 Test Summary:');
  console.log('================');
  console.log(`Total pages tested: ${urlsToTest.length}`);
  console.log(`Total violations found: ${totalIssues}`);
  
  const passedTests = testResults.filter(result => result.passed).length;
  const failedTests = testResults.filter(result => !result.passed).length;
  
  console.log(`Pages passing: ${passedTests}`);
  console.log(`Pages failing: ${failedTests}`);
  
  if (totalIssues === 0) {
    console.log('\n🎉 All accessibility tests passed! Your site is WCAG 2.1 AA compliant.');
  } else {
    console.log('\n⚠️  Accessibility violations found. Please address the issues above.');
    console.log('\nCommon fixes:');
    console.log('- Ensure sufficient colour contrast (4.5:1 for normal text, 3:1 for large text)');
    console.log('- Add proper alt text for all images');
    console.log('- Ensure all interactive elements have accessible names');
    console.log('- Use proper heading hierarchy (h1, h2, h3, etc.)');
    console.log('- Add ARIA labels where needed');
    console.log('- Ensure keyboard navigation works properly');
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'accessibility-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: urlsToTest.length,
      totalViolations: totalIssues,
      pagesPassed: passedTests,
      pagesFailed: failedTests
    },
    results: testResults
  }, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Exit with error code if violations found
  process.exit(totalIssues > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
runAccessibilityTests();