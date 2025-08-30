/**
 * Image Performance Test Utility for Somerset Window Cleaning
 * 
 * This utility helps test and validate image loading performance
 * across different pages and components.
 */

export class ImagePerformanceTest {
  constructor() {
    this.results = [];
    this.observer = null;
  }

  /**
   * Initialize performance monitoring for images
   */
  init() {
    if (typeof window === 'undefined') return;

    // Monitor image loading times
    this.monitorImageLoading();
    
    // Monitor Core Web Vitals related to images
    this.monitorCoreWebVitals();
    
    // Test accessibility features
    this.testAccessibility();
  }

  /**
   * Monitor image loading performance
   */
  monitorImageLoading() {
    const images = document.querySelectorAll('[data-optimized-image]');
    
    images.forEach((imageWrapper, index) => {
      const mainImage = imageWrapper.querySelector('.main-image img');
      const imageId = imageWrapper.getAttribute('data-image-id') || `image-${index}`;
      
      if (mainImage) {
        const startTime = performance.now();
        
        const onLoad = () => {
          const loadTime = performance.now() - startTime;
          
          this.results.push({
            id: imageId,
            loadTime,
            src: mainImage.src,
            width: mainImage.naturalWidth,
            height: mainImage.naturalHeight,
            format: this.detectFormat(mainImage.src),
            critical: imageWrapper.classList.contains('critical'),
            hasBlurUp: imageWrapper.classList.contains('blur-up')
          });
          
          // Mark performance for monitoring
          performance.mark(`image-loaded-${imageId}`);
          
          console.log(`Image ${imageId} loaded in ${loadTime.toFixed(2)}ms`);
        };
        
        const onError = () => {
          console.error(`Failed to load image: ${imageId}`);
          this.results.push({
            id: imageId,
            error: true,
            src: mainImage.src
          });
        };
        
        if (mainImage.complete) {
          onLoad();
        } else {
          mainImage.addEventListener('load', onLoad, { once: true });
          mainImage.addEventListener('error', onError, { once: true });
        }
      }
    });
  }

  /**
   * Monitor Core Web Vitals related to images
   */
  monitorCoreWebVitals() {
    // Monitor Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime.toFixed(2) + 'ms');
            
            // Check if LCP element is an image
            if (entry.element && entry.element.tagName === 'IMG') {
              console.log('LCP is an image:', entry.element.src);
            }
          }
          
          if (entry.entryType === 'layout-shift') {
            console.log('CLS score:', entry.value);
          }
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
    }
  }

  /**
   * Test accessibility features
   */
  testAccessibility() {
    const images = document.querySelectorAll('[data-optimized-image] img');
    const issues = [];
    
    images.forEach((img, index) => {
      // Check for alt text
      if (!img.alt || img.alt.trim() === '') {
        issues.push(`Image ${index}: Missing or empty alt text`);
      }
      
      // Check for proper loading attribute
      if (!img.hasAttribute('loading')) {
        issues.push(`Image ${index}: Missing loading attribute`);
      }
      
      // Check for proper width/height to prevent layout shift
      if (!img.width || !img.height) {
        issues.push(`Image ${index}: Missing width or height attribute`);
      }
    });
    
    if (issues.length > 0) {
      console.warn('Image accessibility issues:', issues);
    } else {
      console.log('All images pass accessibility checks');
    }
  }

  /**
   * Detect image format from URL
   */
  detectFormat(src) {
    if (src.includes('.avif')) return 'AVIF';
    if (src.includes('.webp')) return 'WebP';
    if (src.includes('.jpg') || src.includes('.jpeg')) return 'JPEG';
    if (src.includes('.png')) return 'PNG';
    return 'Unknown';
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const totalImages = this.results.length;
    const errorCount = this.results.filter(r => r.error).length;
    const avgLoadTime = this.results
      .filter(r => !r.error && r.loadTime)
      .reduce((sum, r) => sum + r.loadTime, 0) / (totalImages - errorCount);
    
    const formatDistribution = this.results
      .filter(r => !r.error)
      .reduce((acc, r) => {
        acc[r.format] = (acc[r.format] || 0) + 1;
        return acc;
      }, {});

    return {
      totalImages,
      errorCount,
      avgLoadTime: avgLoadTime.toFixed(2) + 'ms',
      formatDistribution,
      criticalImages: this.results.filter(r => r.critical).length,
      blurUpImages: this.results.filter(r => r.hasBlurUp).length
    };
  }
}

// Auto-initialize on page load for testing
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.imagePerformanceTest = new ImagePerformanceTest();
    window.imagePerformanceTest.init();
    
    // Log summary after all images are loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        const summary = window.imagePerformanceTest.getPerformanceSummary();
        console.log('Image Performance Summary:', summary);
      }, 2000);
    });
  });
}