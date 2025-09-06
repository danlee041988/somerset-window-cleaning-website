#!/usr/bin/env node
const pa11y = require('pa11y');
const fs = require('fs');
const path = require('path');

const testConfig = {
  standard: 'WCAG2AA',
  level: 'error',
  threshold: 0,
  timeout: 30000,
  wait: 2000,
  includeWarnings: true,
  includeNotices: false,
  chromeLaunchConfig: { args: ['--no-sandbox', '--disable-dev-shm-usage'] },
  actions: ['wait for element body to be visible']
};

const urlsToTest = [
  { url: 'http://localhost:4321/', name: 'Homepage' },
  { url: 'http://localhost:4321/services', name: 'Services' },
  { url: 'http://localhost:4321/contact', name: 'Contact' },
  { url: 'http://localhost:4321/areas', name: 'Areas' },
  { url: 'http://localhost:4321/book-now', name: 'Book Now' }
];

(async () => {
  let total = 0;
  const resultsAll = [];
  for (const p of urlsToTest) {
    const res = await pa11y(p.url, testConfig);
    total += res.issues.length;
    resultsAll.push({ page: p, count: res.issues.length, issues: res.issues });
    console.log(`${p.name}: ${res.issues.length} issue(s)`);
  }
  fs.writeFileSync(path.join(__dirname, 'accessibility-report.json'), JSON.stringify(resultsAll, null, 2));
  console.log(`Total issues: ${total}`);
  process.exit(total ? 1 : 0);
})();
