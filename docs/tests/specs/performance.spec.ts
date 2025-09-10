import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { ContactPage } from '../pages/contact-page';

test.describe('Performance Tests', () => {
  test('should load home page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    const loadTime = Date.now() - startTime;
    
    // Home page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`Home page loaded in ${loadTime}ms`);
  });

  test('should measure Core Web Vitals', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Measure Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {};
        
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID) - approximate with click delay
        const startTime = performance.now();
        document.addEventListener('click', () => {
          vitals.fid = performance.now() - startTime;
        }, { once: true });
        
        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // First Contentful Paint (FCP)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          vitals.fcp = entries[0].startTime;
          
          // Resolve after a short delay to collect metrics
          setTimeout(() => resolve(vitals), 2000);
        }).observe({ entryTypes: ['paint'] });
      });
    });
    
    console.log('Core Web Vitals:', webVitals);
    
    // Check Core Web Vitals thresholds
    if (webVitals.lcp) {
      expect(webVitals.lcp).toBeLessThan(2500); // LCP should be under 2.5s
    }
    if (webVitals.fcp) {
      expect(webVitals.fcp).toBeLessThan(1800); // FCP should be under 1.8s
    }
    if (webVitals.cls !== undefined) {
      expect(webVitals.cls).toBeLessThan(0.1); // CLS should be under 0.1
    }
  });

  test('should measure time to interactive', async ({ page }) => {
    const startTime = Date.now();
    
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Wait for page to be interactive (can click buttons)
    await homePage.getQuoteButton.waitFor({ state: 'attached' });
    await homePage.getQuoteButton.waitFor({ state: 'visible' });
    
    const timeToInteractive = Date.now() - startTime;
    
    // Should be interactive within 3 seconds
    expect(timeToInteractive).toBeLessThan(3000);
    
    console.log(`Time to interactive: ${timeToInteractive}ms`);
  });

  test('should have reasonable bundle sizes', async ({ page }) => {
    // Monitor network requests
    const resourceSizes: { [key: string]: number } = {};
    
    page.on('response', async (response) => {
      if (response.url().includes('localhost:4321')) {
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          const type = response.url().includes('.js') ? 'js' :
                      response.url().includes('.css') ? 'css' :
                      response.url().includes('.html') ? 'html' : 'other';
          
          resourceSizes[type] = (resourceSizes[type] || 0) + parseInt(contentLength);
        }
      }
    });
    
    const homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    console.log('Resource sizes:', resourceSizes);
    
    // Check bundle size limits (in bytes)
    if (resourceSizes.js) {
      expect(resourceSizes.js).toBeLessThan(500 * 1024); // JS under 500KB
    }
    if (resourceSizes.css) {
      expect(resourceSizes.css).toBeLessThan(100 * 1024); // CSS under 100KB
    }
  });

  test('should load images efficiently', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Check image loading performance
    const imageMetrics = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.map(img => ({
        src: img.src,
        width: img.naturalWidth,
        height: img.naturalHeight,
        loading: img.loading,
        decoded: img.complete && img.naturalWidth > 0
      }));
    });
    
    console.log(`Found ${imageMetrics.length} images`);
    
    // Check that images are properly optimized
    imageMetrics.forEach(img => {
      if (img.decoded) {
        // Image dimensions should be reasonable (not excessively large)
        expect(img.width).toBeLessThan(2000);
        expect(img.height).toBeLessThan(2000);
      }
    });
    
    // Check for lazy loading on images below the fold
    const lazyImages = imageMetrics.filter(img => img.loading === 'lazy');
    console.log(`${lazyImages.length} images are lazy loaded`);
  });

  test('should handle concurrent users simulation', async ({ browser }) => {
    const pages = [];
    const loadTimes = [];
    
    // Simulate 5 concurrent users
    for (let i = 0; i < 5; i++) {
      const page = await browser.newPage();
      pages.push(page);
    }
    
    try {
      // Load home page concurrently
      const loadPromises = pages.map(async (page, index) => {
        const startTime = Date.now();
        const homePage = new HomePage(page);
        await homePage.goto();
        const loadTime = Date.now() - startTime;
        loadTimes.push(loadTime);
        console.log(`User ${index + 1} load time: ${loadTime}ms`);
        return loadTime;
      });
      
      await Promise.all(loadPromises);
      
      // Calculate average load time
      const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
      console.log(`Average load time with 5 concurrent users: ${avgLoadTime}ms`);
      
      // Should handle concurrent load within reasonable time
      expect(avgLoadTime).toBeLessThan(5000);
      
      // No load time should be excessively long
      loadTimes.forEach(time => {
        expect(time).toBeLessThan(10000);
      });
      
    } finally {
      // Clean up
      await Promise.all(pages.map(page => page.close()));
    }
  });

  test('should measure contact form performance', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Measure form interaction performance
    const startTime = Date.now();
    
    await contactPage.fillContactForm({
      fullName: 'Performance Test',
      email: 'perf@test.com',
      phone: '07123456789',
      address: '123 Test St',
      postcode: 'BA6 8AB',
      propertyType: 'Semi-detached (3 bed)',
      frequency: 'Every 4 weeks'
    });
    
    const fillTime = Date.now() - startTime;
    
    // Form should be responsive
    expect(fillTime).toBeLessThan(2000);
    console.log(`Form fill time: ${fillTime}ms`);
  });

  test('should measure postcode checker performance', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    
    // Measure postcode checker performance
    const startTime = Date.now();
    
    await contactPage.postcodeInput.fill('BA6 8AB');
    await contactPage.postcodeButton.click();
    
    // Wait for navigation
    await page.waitForURL(/postcode=/, { timeout: 5000 });
    
    const checkTime = Date.now() - startTime;
    
    // Postcode check should be fast
    expect(checkTime).toBeLessThan(3000);
    console.log(`Postcode check time: ${checkTime}ms`);
  });

  test('should check memory usage', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null;
    });
    
    if (initialMemory) {
      console.log('Memory usage:', initialMemory);
      
      // Memory usage should be reasonable (under 50MB)
      expect(initialMemory.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024);
    }
  });

  test('should validate font loading performance', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Monitor font loading
    const fontLoadTimes: number[] = [];
    
    page.on('response', async (response) => {
      if (response.url().includes('font') && response.url().includes('localhost:4321')) {
        const timing = response.timing();
        fontLoadTimes.push(timing.responseEnd);
      }
    });
    
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    // Check for font display swap
    const fontDisplayValues = await page.evaluate(() => {
      const stylesheets = Array.from(document.styleSheets);
      const fontFaces: string[] = [];
      
      stylesheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach(rule => {
            if (rule.constructor.name === 'CSSFontFaceRule') {
              const fontFaceRule = rule as CSSFontFaceRule;
              fontFaces.push(fontFaceRule.style.fontDisplay || 'auto');
            }
          });
        } catch (e) {
          // Cross-origin stylesheet
        }
      });
      
      return fontFaces;
    });
    
    console.log('Font display values:', fontDisplayValues);
    console.log('Font load times:', fontLoadTimes);
  });

  test('should check Third-party script performance', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Monitor third-party requests
    const thirdPartyRequests: string[] = [];
    
    page.on('request', (request) => {
      const url = request.url();
      if (!url.includes('localhost:4321') && 
          !url.startsWith('data:') && 
          !url.startsWith('blob:')) {
        thirdPartyRequests.push(url);
      }
    });
    
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    console.log('Third-party requests:', thirdPartyRequests);
    
    // Should minimize third-party requests
    expect(thirdPartyRequests.length).toBeLessThan(10);
  });
});