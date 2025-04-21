const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
const dotenv = require('dotenv');

dotenv.config();

class ScreenshotBot {
  constructor() {
    this.targetUrl = process.env.TARGET_URL || 'https://www.globaltravelreport.com';
    this.screenshotPages = (process.env.SCREENSHOT_PAGES || '').split(',').filter(Boolean);
    this.outputDir = path.join(__dirname, 'screenshots');
    this.emailConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };
  }

  async initialize() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      console.log('Screenshot directory initialized');
    } catch (error) {
      console.error('Error initializing directory:', error);
      throw error;
    }
  }

  async captureScreenshots() {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const screenshots = [];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    try {
      for (const page of this.screenshotPages) {
        const url = new URL(page, this.targetUrl).toString();
        console.log(`Taking screenshot of ${url}`);

        const context = await browser.createIncognitoBrowserContext();
        const tab = await context.newPage();
        
        await tab.setViewport({ width: 1920, height: 1080 });
        await tab.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        
        const filename = `${path.basename(page) || 'home'}-${timestamp}.png`;
        const filepath = path.join(this.outputDir, filename);
        
        await tab.screenshot({ path: filepath, fullPage: true });
        screenshots.push({ url, filepath });
        
        await context.close();
      }
    } finally {
      await browser.close();
    }

    return screenshots;
  }

  async sendEmail(screenshots) {
    const transporter = nodemailer.createTransport(this.emailConfig);
    
    const attachments = screenshots.map(({ filepath }) => ({
      filename: path.basename(filepath),
      path: filepath
    }));

    const emailContent = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `Website Screenshots - ${new Date().toLocaleDateString()}`,
      text: `Screenshots of ${this.targetUrl} taken on ${new Date().toLocaleString()}`,
      attachments
    };

    await transporter.sendMail(emailContent);
    console.log('Screenshot report email sent');
  }

  async start() {
    try {
      await this.initialize();
      const screenshots = await this.captureScreenshots();
      await this.sendEmail(screenshots);
      console.log('Screenshot bot completed successfully');
    } catch (error) {
      console.error('Screenshot bot error:', error);
      throw error;
    }
  }
}

// Run the bot
if (require.main === module) {
  const bot = new ScreenshotBot();
  bot.start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ScreenshotBot; 