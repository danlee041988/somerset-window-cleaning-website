import type { APIRoute } from 'astro';
import { siteConfig } from '~/config/site';

// Define all the pages in the website
const pages = [
  { url: '', changefreq: 'daily', priority: '1.0' }, // Homepage
  { url: 'about', changefreq: 'monthly', priority: '0.8' },
  { url: 'areas', changefreq: 'monthly', priority: '0.8' },
  { url: 'contact', changefreq: 'monthly', priority: '0.7' },
  { url: 'instant-quote', changefreq: 'weekly', priority: '0.9' },
  { url: 'booking-2step', changefreq: 'weekly', priority: '0.9' },
  
  // Service pages - high priority for SEO
  { url: 'services/window-cleaning', changefreq: 'monthly', priority: '0.9' },
  { url: 'services/gutter-cleaning', changefreq: 'monthly', priority: '0.9' },
  { url: 'services/fascia-soffit-cleaning', changefreq: 'monthly', priority: '0.9' },
  { url: 'services/conservatory-cleaning', changefreq: 'monthly', priority: '0.9' },
  { url: 'services/solar-panel-cleaning', changefreq: 'monthly', priority: '0.9' },
  { url: 'services/commercial-window-cleaning', changefreq: 'monthly', priority: '0.8' },
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