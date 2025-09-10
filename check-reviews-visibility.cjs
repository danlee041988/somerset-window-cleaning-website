const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4321', { waitUntil: 'networkidle' });
  
  // Wait for page to load
  await page.waitForTimeout(2000);
  
  // Scroll to reviews section
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'reviews-visibility-final.png' });
  
  console.log('Reviews section screenshot taken');
  
  await browser.close();
})();