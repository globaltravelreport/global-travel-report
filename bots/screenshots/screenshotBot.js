const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { sendReport } = require('../utils/emailSender');
const logger = require('../utils/logger');

class ScreenshotBot {
  constructor() {
    this.targetUrl = process.env.TARGET_URL;
    this.pages = process.env.SCREENSHOT_PAGES ? process.env.SCREENSHOT_PAGES.split(',') : ['/'];
    this.screenshotDir = path.join(process.cwd(), 'data', 'screenshots');
  }

  async initialize() {
    try {
      if (!fs.existsSync(this.screenshotDir)) {
        fs.mkdirSync(this.screenshotDir, { recursive: true });
      }
      logger.info('Screenshot bot initialized');
    } catch (error) {
      logger.error('Failed to initialize screenshot bot:', error);
      throw error;
    }
  }

  async takeScreenshot(url, filename) {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      const screenshotPath = path.join(this.screenshotDir, filename);
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true
      });

      logger.info(`Screenshot taken: ${filename}`);
      return screenshotPath;
    } catch (error) {
      logger.error(`Failed to take screenshot of ${url}:`, error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  async run() {
    try {
      await this.initialize();
      const screenshots = [];
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      for (const page of this.pages) {
        const url = `${this.targetUrl}${page}`;
        const filename = `screenshot-${page.replace(/\//g, '-')}-${timestamp}.png`;
        const screenshotPath = await this.takeScreenshot(url, filename);
        screenshots.push({
          path: screenshotPath,
          url,
          filename
        });
      }

      await this.sendReport(screenshots);
      logger.info('Screenshot bot completed successfully');
    } catch (error) {
      logger.error('Screenshot bot failed:', error);
      throw error;
    }
  }

  async sendReport(screenshots) {
    const subject = '📸 Website Screenshots Report';
    const html = `
      <h1>Website Screenshots Report</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        ${screenshots.map(screenshot => `
          <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
            <h3>${screenshot.url}</h3>
            <img src="cid:${screenshot.filename}" style="max-width: 100%; height: auto;" />
          </div>
        `).join('')}
      </div>
    `;

    const attachments = screenshots.map(screenshot => ({
      filename: screenshot.filename,
      path: screenshot.path,
      cid: screenshot.filename
    }));

    await sendReport(subject, html, undefined, false, attachments);
  }
}

// Start the bot if this file is run directly
if (require.main === module) {
  const bot = new ScreenshotBot();
  bot.run().catch(error => {
    logger.error('Fatal error in screenshot bot:', error);
    process.exit(1);
  });
}

module.exports = ScreenshotBot; 