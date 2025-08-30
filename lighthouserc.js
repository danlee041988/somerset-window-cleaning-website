export default {
  ci: {
    collect: {
      url: ['http://localhost:4321/', 'http://localhost:4321/contact', 'http://localhost:4321/services'],
      startServerCommand: 'npm run preview',
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': 'off',
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Other important metrics
        'speed-index': ['warn', { maxNumericValue: 4000 }],
        'interactive': ['warn', { maxNumericValue: 4000 }],
        
        // Best practices
        'uses-https': 'error',
        'uses-http2': 'warn',
        'uses-responsive-images': 'warn',
        'modern-image-formats': 'warn',
        'efficient-animated-content': 'warn',
        
        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'valid-lang': 'error',
        'meta-viewport': 'error',
        
        // SEO
        'document-title': 'error',
        'meta-description': 'error',
        'link-text': 'warn',
        'hreflang': 'warn',
        'canonical': 'warn'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};