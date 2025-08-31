import type { APIRoute } from 'astro';
import { siteConfig } from '~/config/site';

// Define all the pages in the website
const pages = [
  { url: '', changefreq: 'daily', priority: '1.0' }, // Homepage
  { url: 'about', changefreq: 'monthly', priority: '0.8' },
  { url: 'areas', changefreq: 'monthly', priority: '0.8' },
  { url: 'contact', changefreq: 'monthly', priority: '0.7' },
  { url: 'book-now', changefreq: 'weekly', priority: '0.9' },
  { url: 'services', changefreq: 'weekly', priority: '0.9' },
  
  // Service pages - high priority for SEO
  { url: 'services/window-cleaning', changefreq: 'monthly', priority: '0.9' },
  { url: 'services/gutter-cleaning', changefreq: 'monthly', priority: '0.9' },
  { url: 'services/fascia-soffit-cleaning', changefreq: 'monthly', priority: '0.9' },
  { url: 'services/conservatory-cleaning', changefreq: 'monthly', priority: '0.9' },
  { url: 'services/solar-panel-cleaning', changefreq: 'monthly', priority: '0.9' },
  { url: 'services/commercial-window-cleaning', changefreq: 'monthly', priority: '0.8' },
  
  // Area pages - important for local SEO
  { url: 'areas/ba-areas', changefreq: 'monthly', priority: '0.8' },
  { url: 'areas/bs-areas', changefreq: 'monthly', priority: '0.8' },
  { url: 'areas/ta-areas', changefreq: 'monthly', priority: '0.8' },
  
  // Individual town pages (if still active)
  { url: 'areas/bridgwater', changefreq: 'monthly', priority: '0.7' },
  { url: 'areas/glastonbury', changefreq: 'monthly', priority: '0.7' },
  { url: 'areas/street', changefreq: 'monthly', priority: '0.7' },
  { url: 'areas/taunton', changefreq: 'monthly', priority: '0.7' },
  { url: 'areas/wells', changefreq: 'monthly', priority: '0.7' },
  { url: 'areas/yeovil', changefreq: 'monthly', priority: '0.7' },
  
  // Guide pages
  { url: 'guides', changefreq: 'monthly', priority: '0.6' },
  { url: 'guides/domestic-window-cleaning', changefreq: 'yearly', priority: '0.5' },
  
  // Legal pages
  { url: 'terms', changefreq: 'yearly', priority: '0.3' },
  { url: 'privacy', changefreq: 'yearly', priority: '0.3' },
];

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.toString() || 'https://somersetwindowcleaning.co.uk';
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => 
  `  <url>
    <loc>${baseUrl}${page.url ? `/${page.url}` : ''}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    }
  });
};