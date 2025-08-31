import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.toString() || 'https://somersetwindowcleaning.co.uk';
  
  const robotsTxt = `User-agent: *
Allow: /

# Important pages for SEO
Allow: /services/
Allow: /areas
Allow: /instant-quote
Allow: /contact

# Disallow admin/private areas
Disallow: /admin
Disallow: /staff
Disallow: /_astro
Disallow: /api

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (optional - helps prevent overwhelming the server)
Crawl-delay: 1`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    }
  });
};