// ✅ UPDATED SEO BOT USING GOOGLE GEMINI

require('dotenv').config();
const winston = require('winston');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { WebClient } = require('@slack/web-api');
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Logger Setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Clients
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const slack = new WebClient(process.env.SLACK_TOKEN);
const searchConsole = google.searchconsole('v1');

// Email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

class SEOBot {
  constructor() {
    this.config = {
      targetUrl: process.env.TARGET_URL,
      maxPages: parseInt(process.env.MAX_PAGES) || 1000,
      timeout: parseInt(process.env.TIMEOUT_MS) || 15000,
      dataDir: process.env.DATA_DIR || './data'
    };
    this.visitedUrls = new Set();
    this.pageData = [];
  }

  async initialize() {
    await fs.mkdir(this.config.dataDir, { recursive: true });
    await fs.mkdir(path.join(this.config.dataDir, 'pages'), { recursive: true });
    await fs.mkdir(path.join(this.config.dataDir, 'reports'), { recursive: true });
    logger.info('SEO Bot initialized');
  }

  async crawl() {
    logger.info('Crawling:', this.config.targetUrl);
    const res = await axios.get(this.config.targetUrl, { timeout: this.config.timeout });
    const $ = cheerio.load(res.data);
    const links = [];

    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !this.visitedUrls.has(href)) {
        links.push(href);
        this.visitedUrls.add(href);
      }
    });

    logger.info(`Found ${links.length} links`);
    return links;
  }

  async analyzePage(url) {
    const res = await axios.get(url, { timeout: this.config.timeout });
    const $ = cheerio.load(res.data);

    const analysis = {
      url,
      title: $('title').text(),
      metaDescription: $('meta[name="description"]').attr('content'),
      h1Count: $('h1').length,
      h2Count: $('h2').length,
      imageCount: $('img').length,
      wordCount: $('body').text().split(/\s+/).length,
      loadTime: res.headers['x-response-time'] || 'N/A'
    };

    const content = $('body').text().substring(0, 4000);
    analysis.aiFeedback = await this.getAIContentFeedback(content);

    this.pageData.push(analysis);
    await this.savePageData(analysis);
  }

  async getAIContentFeedback(content) {
    try {
      const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent([
        "You are an SEO expert. Analyze and provide specific SEO improvements for this content:",
        content
      ]);
      const response = await result.response;
      return response.text();
    } catch (err) {
      logger.error('Gemini API Error:', err);
      return 'AI feedback failed.';
    }
  }

  async savePageData(analysis) {
    const filename = path.join(
      this.config.dataDir,
      'pages',
      `${Buffer.from(analysis.url).toString('base64')}.json`
    );
    await fs.writeFile(filename, JSON.stringify(analysis, null, 2));
  }

  calculateAverage(metric) {
    const values = this.pageData.map(p => typeof p[metric] === 'number' ? p[metric] : 0);
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  getTopPages() {
    return this.pageData
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 5);
  }

  async generateRecommendations() {
    const summary = this.pageData
      .map(p => `URL: ${p.url}\nAI Feedback: ${p.aiFeedback}`)
      .join('\n\n');

    try {
      const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent([
        "Based on the SEO feedback, provide site-wide improvements:",
        summary
      ]);
      const response = await result.response;
      return response.text();
    } catch (err) {
      logger.error('Gemini recommendations error:', err);
      return 'Recommendation generation failed.';
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalPages: this.pageData.length,
      averageWordCount: this.calculateAverage('wordCount'),
      averageLoadTime: this.calculateAverage('loadTime'),
      topPages: this.getTopPages(),
      recommendations: await this.generateRecommendations()
    };

    const reportPath = path.join(
      this.config.dataDir,
      'reports',
      `report-${new Date().toISOString().split('T')[0]}.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    return report;
  }

  async sendEmailReport(report) {
    const html = `
      <h1>SEO Report - ${new Date().toLocaleDateString()}</h1>
      <p>Total Pages: ${report.totalPages}</p>
      <p>Avg Word Count: ${report.averageWordCount}</p>
      <p>Avg Load Time: ${report.averageLoadTime}</p>
      <h2>Top Pages</h2>
      <ul>${report.topPages.map(p => `<li>${p.title} (${p.wordCount} words) - ${p.url}</li>`).join('')}</ul>
      <h2>Recommendations</h2>
      <pre>${report.recommendations}</pre>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.REPORT_EMAIL,
      subject: `SEO Report - ${new Date().toLocaleDateString()}`,
      html
    });
  }

  async sendSlackAlert(message) {
    await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL,
      text: message
    });
  }

  async start() {
    await this.initialize();
    cron.schedule(process.env.CRAWL_INTERVAL, async () => {
      try {
        logger.info('Scheduled crawl started');
        const links = await this.crawl();

        for (const link of links) {
          if (this.pageData.length >= this.config.maxPages) break;
          await this.analyzePage(link);
        }

        const report = await this.generateReport();
        await this.sendEmailReport(report);
        await this.sendSlackAlert('SEO report completed');
      } catch (err) {
        logger.error('Scheduled task error:', err);
        await this.sendSlackAlert('SEO bot failed: ' + err.message);
      }
    });
  }
}

process.on('SIGINT', () => {
  logger.info('Gracefully shutting down...');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled promise rejection:', err);
  process.exit(1);
});

const bot = new SEOBot();
bot.start().catch(err => {
  logger.error('Fatal error:', err);
  process.exit(1);
});