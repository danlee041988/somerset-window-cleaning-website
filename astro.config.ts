import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import compress from 'astro-compress';
import type { AstroIntegration } from 'astro';

import astrowind from './vendor/integration';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin, lazyImagesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hasExternalScripts = false;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

export default defineConfig({
  output: 'static',
  site: 'https://www.somersetwindowcleaning.co.uk',

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) => !page.includes('/homes/') && !page.includes('/landing/') && !page.includes('/blog/'),
      customPages: [
        'https://www.somersetwindowcleaning.co.uk/',
        'https://www.somersetwindowcleaning.co.uk/services',
        'https://www.somersetwindowcleaning.co.uk/booking-2step',
        'https://www.somersetwindowcleaning.co.uk/areas',
        'https://www.somersetwindowcleaning.co.uk/contact',
        'https://www.somersetwindowcleaning.co.uk/about',
      ],
      serialize(item) {
        // Set priority and change frequency based on page type
        if (item.url.endsWith('/')) {
          // Homepage
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/booking') || item.url.includes('/services')) {
          // High priority pages
          item.priority = 0.9;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/areas/')) {
          // Location pages
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else if (item.url.includes('/contact') || item.url.includes('/about')) {
          // Static pages
          item.priority = 0.7;
          item.changefreq = 'monthly';
        } else {
          // Other pages
          item.priority = 0.6;
          item.changefreq = 'monthly';
        }
        return item;
      },
    }),
    mdx(),
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
      },
    }),

    ...whenExternalScripts(() =>
      partytown({
        config: { forward: ['dataLayer.push'] },
      })
    ),

    compress({
      CSS: true,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
        },
      },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),

    astrowind({
      config: './src/config.yaml',
    }),
  ],

  image: {
    // Allow images from trusted domains
    domains: ['cdn.pixabay.com', 'somersetwindowcleaning.co.uk'],
    // Enable WebP and AVIF for better compression
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
  },

  // Build optimisations for performance
  build: {
    // Inline stylesheets smaller than 4KB for critical CSS
    inlineStylesheets: 'auto',
    // Enable code splitting for better caching
    splitting: true,
    // Generate source maps only in development
    sourcemap: process.env.NODE_ENV === 'development',
  },

  // Performance optimisations
  server: {
    // Enable port reuse for faster dev starts
    port: 4321,
  },

  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],
    rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
  },

  vite: {
    build: {
      // Optimize chunk size for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor chunks for better caching
            vendor: ['astro', 'react', 'react-dom'],
            ui: ['@astrojs/tailwind', '@astrojs/mdx'],
          },
        },
      },
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Minify for production
      minify: 'terser',
    },
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
