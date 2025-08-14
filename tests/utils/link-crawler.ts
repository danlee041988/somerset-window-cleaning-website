import { Page, Browser, chromium } from '@playwright/test';

export interface LinkValidationResult {
  url: string;
  status: number;
  statusText: string;
  isValid: boolean;
  error?: string;
  responseTime?: number;
}

export interface CrawlResult {
  totalLinks: number;
  validLinks: number;
  brokenLinks: LinkValidationResult[];
  allResults: LinkValidationResult[];
}

export class LinkCrawler {
  private browser: Browser | null = null;
  private visitedUrls = new Set<string>();
  private internalLinks = new Set<string>();
  private externalLinks = new Set<string>();
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:4321') {
    this.baseUrl = baseUrl;
  }

  async init() {
    this.browser = await chromium.launch();
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async crawlSite(): Promise<CrawlResult> {
    if (!this.browser) {
      await this.init();
    }

    const page = await this.browser!.newPage();
    
    try {
      // Start crawling from the home page
      await this.crawlPage(page, '/');
      
      // Crawl discovered internal pages
      const pagesToCrawl = Array.from(this.internalLinks);
      for (const url of pagesToCrawl) {
        if (!this.visitedUrls.has(url)) {
          await this.crawlPage(page, url);
        }
      }
      
      // Validate all discovered links
      const allLinks = [...this.internalLinks, ...this.externalLinks];
      const validationResults = await this.validateLinks(allLinks);
      
      const brokenLinks = validationResults.filter(result => !result.isValid);
      
      return {
        totalLinks: validationResults.length,
        validLinks: validationResults.length - brokenLinks.length,
        brokenLinks,
        allResults: validationResults
      };
      
    } finally {
      await page.close();
    }
  }

  private async crawlPage(page: Page, url: string) {
    if (this.visitedUrls.has(url)) {
      return;
    }

    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
      await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
      this.visitedUrls.add(url);

      // Extract all links from the page
      const links = await page.locator('a[href]').all();
      
      for (const link of links) {
        const href = await link.getAttribute('href');
        if (href) {
          this.categorizeLink(href);
        }
      }

      // Also check for links in JavaScript (onclick handlers, etc.)
      const jsLinks = await page.evaluate(() => {
        const links: string[] = [];
        const elements = document.querySelectorAll('[onclick], [data-href]');
        elements.forEach(el => {
          const onclick = el.getAttribute('onclick');
          const dataHref = el.getAttribute('data-href');
          
          if (onclick && onclick.includes('location')) {
            const match = onclick.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
            if (match) links.push(match[1]);
          }
          
          if (dataHref) links.push(dataHref);
        });
        return links;
      });

      jsLinks.forEach(link => this.categorizeLink(link));

    } catch (error) {
      console.warn(`Failed to crawl ${url}:`, error);
    }
  }

  private categorizeLink(href: string) {
    // Skip data URLs, mailto, tel, javascript, etc.
    if (href.startsWith('data:') || 
        href.startsWith('mailto:') || 
        href.startsWith('tel:') || 
        href.startsWith('javascript:') ||
        href.startsWith('#')) {
      return;
    }

    if (href.startsWith('http')) {
      if (href.startsWith(this.baseUrl)) {
        // Internal link
        const path = href.replace(this.baseUrl, '');
        this.internalLinks.add(path || '/');
      } else {
        // External link
        this.externalLinks.add(href);
      }
    } else if (href.startsWith('/')) {
      // Relative internal link
      this.internalLinks.add(href);
    } else {
      // Relative link (treat as internal)
      this.internalLinks.add(`/${href}`);
    }
  }

  private async validateLinks(links: string[]): Promise<LinkValidationResult[]> {
    const results: LinkValidationResult[] = [];
    const page = await this.browser!.newPage();

    try {
      for (const link of links) {
        const result = await this.validateSingleLink(page, link);
        results.push(result);
      }
    } finally {
      await page.close();
    }

    return results;
  }

  private async validateSingleLink(page: Page, link: string): Promise<LinkValidationResult> {
    const startTime = Date.now();
    
    try {
      const fullUrl = link.startsWith('http') ? link : `${this.baseUrl}${link}`;
      
      // Use HEAD request for external links to be respectful
      if (link.startsWith('http') && !link.startsWith(this.baseUrl)) {
        const response = await page.request.head(fullUrl, { timeout: 10000 });
        const responseTime = Date.now() - startTime;
        
        return {
          url: link,
          status: response.status(),
          statusText: response.statusText(),
          isValid: response.ok(),
          responseTime
        };
      } else {
        // Full GET request for internal links
        const response = await page.request.get(fullUrl, { timeout: 10000 });
        const responseTime = Date.now() - startTime;
        
        return {
          url: link,
          status: response.status(),
          statusText: response.statusText(),
          isValid: response.ok(),
          responseTime
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        url: link,
        status: 0,
        statusText: 'Error',
        isValid: false,
        error: error instanceof Error ? error.message : String(error),
        responseTime
      };
    }
  }

  // Method to validate specific page links only
  async validatePageLinks(page: Page, pagePath: string): Promise<LinkValidationResult[]> {
    await page.goto(`${this.baseUrl}${pagePath}`, { waitUntil: 'networkidle' });
    
    const links = await page.locator('a[href]').all();
    const linkUrls: string[] = [];
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        linkUrls.push(href);
      }
    }
    
    return await this.validateLinks(linkUrls);
  }

  // Generate a detailed report
  generateReport(result: CrawlResult): string {
    const report = [
      '# Link Validation Report',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Summary',
      `- Total links found: ${result.totalLinks}`,
      `- Valid links: ${result.validLinks}`,
      `- Broken links: ${result.brokenLinks.length}`,
      `- Success rate: ${((result.validLinks / result.totalLinks) * 100).toFixed(1)}%`,
      ''
    ];

    if (result.brokenLinks.length > 0) {
      report.push('## Broken Links');
      report.push('');
      
      result.brokenLinks.forEach(link => {
        report.push(`### ${link.url}`);
        report.push(`- Status: ${link.status} ${link.statusText}`);
        if (link.error) {
          report.push(`- Error: ${link.error}`);
        }
        if (link.responseTime) {
          report.push(`- Response time: ${link.responseTime}ms`);
        }
        report.push('');
      });
    }

    report.push('## All Links');
    report.push('');
    
    result.allResults.forEach(link => {
      const status = link.isValid ? '✅' : '❌';
      report.push(`${status} ${link.url} (${link.status})`);
    });

    return report.join('\n');
  }
}