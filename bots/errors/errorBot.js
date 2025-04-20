require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { sendReport } = require('../utils/emailSender');
const logger = require('../utils/logger');

class ErrorBot {
  constructor() {
    // Validate required environment variables
    if (!process.env.TARGET_URL) {
      throw new Error('TARGET_URL environment variable is required');
    }

    this.targetUrl = process.env.TARGET_URL.replace(/\/$/, ''); // Remove trailing slash if present
    this.dataDir = path.join(process.cwd(), 'data', 'errors');
    this.timeout = parseInt(process.env.TIMEOUT_MS || '15000');
    this.maxRetries = 3;
    this.rateLimit = 1000; // 1 second between requests
    this.visitedUrls = new Set(); // Track visited URLs to avoid duplicates
  }

  async initialize() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      logger.info('Error bot initialized', { targetUrl: this.targetUrl });
    } catch (error) {
      logger.error('Failed to initialize error bot:', error);
      throw error;
    }
  }

  async checkUrl(url, retryCount = 0) {
    try {
      // Skip if already visited
      if (this.visitedUrls.has(url)) {
        return null;
      }
      this.visitedUrls.add(url);

      const response = await axios.get(url, {
        timeout: this.timeout,
        validateStatus: null // Accept all status codes
      });
      
      return {
        url,
        status: response.status,
        ok: response.status >= 200 && response.status < 400
      };
    } catch (error) {
      if (retryCount < this.maxRetries) {
        logger.warn(`Error checking ${url}, retrying (${retryCount + 1}/${this.maxRetries}):`, error.message);
        await new Promise(resolve => setTimeout(resolve, this.rateLimit * Math.pow(2, retryCount)));
        return this.checkUrl(url, retryCount + 1);
      }
      return {
        url,
        status: 0,
        ok: false,
        error: error.message
      };
    }
  }

  async crawlPage(url) {
    try {
      const response = await axios.get(url, { timeout: this.timeout });
      const $ = cheerio.load(response.data);
      const errors = [];

      // Check all links
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          try {
            const absoluteUrl = new URL(href, url).toString();
            // Only check URLs from our domain
            if (absoluteUrl.startsWith(this.targetUrl)) {
              errors.push(this.checkUrl(absoluteUrl));
            }
          } catch (error) {
            logger.warn(`Invalid URL: ${href}`, { error: error.message });
          }
        }
      });

      // Check all images
      $('img').each((_, element) => {
        const src = $(element).attr('src');
        const alt = $(element).attr('alt');
        if (src) {
          try {
            const absoluteUrl = new URL(src, url).toString();
            errors.push(this.checkUrl(absoluteUrl));
            if (!alt) {
              errors.push({
                type: 'missing_alt',
                url: absoluteUrl,
                element: 'img'
              });
            }
          } catch (error) {
            logger.warn(`Invalid image URL: ${src}`, { error: error.message });
          }
        }
      });

      const results = await Promise.all(errors.filter(Boolean));
      return results.filter(result => result && !result.ok);
    } catch (error) {
      logger.error(`Error crawling ${url}:`, error);
      return [{
        url,
        error: error.message
      }];
    }
  }

  async saveResults(errors) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = path.join(this.dataDir, `errors-${timestamp}.json`);
      await fs.promises.writeFile(filename, JSON.stringify(errors, null, 2));
      logger.info(`Error report saved to ${filename}`);
    } catch (error) {
      logger.error('Error saving results:', error);
      throw error;
    }
  }

  async generateReport(errors) {
    const brokenLinks = errors.filter(e => e.status && e.status >= 400);
    const missingAlts = errors.filter(e => e.type === 'missing_alt');
    const otherErrors = errors.filter(e => !e.status && !e.type);

    return {
      timestamp: new Date().toISOString(),
      totalErrors: errors.length,
      brokenLinks: {
        count: brokenLinks.length,
        urls: brokenLinks.map(e => e.url)
      },
      missingAlts: {
        count: missingAlts.length,
        urls: missingAlts.map(e => e.url)
      },
      otherErrors: {
        count: otherErrors.length,
        details: otherErrors
      }
    };
  }

  async sendEmailReport(report) {
    const subject = '🔍 Website Error Report';
    const html = `
      <h1>Website Error Report</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <p>Target URL: ${this.targetUrl}</p>
      
      <h2>Summary</h2>
      <p>Total Errors Found: ${report.totalErrors}</p>
      
      <h3>Broken Links (${report.brokenLinks.count})</h3>
      <ul>
        ${report.brokenLinks.urls.map(url => `<li>${url}</li>`).join('')}
      </ul>
      
      <h3>Images Missing Alt Text (${report.missingAlts.count})</h3>
      <ul>
        ${report.missingAlts.urls.map(url => `<li>${url}</li>`).join('')}
      </ul>
      
      ${report.otherErrors.count > 0 ? `
        <h3>Other Errors (${report.otherErrors.count})</h3>
        <ul>
          ${report.otherErrors.details.map(error => `
            <li>${error.url}: ${error.error}</li>
          `).join('')}
        </ul>
      ` : ''}
    `;

    await sendReport(subject, html);
  }

  async run() {
    try {
      await this.initialize();
      const errors = await this.crawlPage(this.targetUrl);
      await this.saveResults(errors);
      const report = await this.generateReport(errors);
      await this.sendEmailReport(report);
      logger.info('Error bot completed successfully');
    } catch (error) {
      logger.error('Error bot failed:', error);
      throw error;
    }
  }
}

// Start the bot if this file is run directly
if (require.main === module) {
  const bot = new ErrorBot();
  bot.run().catch(error => {
    logger.error('Fatal error in error bot:', error);
    process.exit(1);
  });
}

module.exports = ErrorBot; 