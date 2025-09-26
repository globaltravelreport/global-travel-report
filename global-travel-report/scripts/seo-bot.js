require('dotenv').config();
const winston = require('winston');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { OpenAI } = require('openai');
const { WebClient } = require('@slack/web-api');
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Configure logger
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

// Initialize clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const slack = new WebClient(process.env.SLACK_TOKEN);
const searchconsole = google.searchconsole('v1');

// Email transporter
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
    try {
      // Create necessary directories
      await fs.mkdir(this.config.dataDir, { recursive: true });
      await fs.mkdir(path.join(this.config.dataDir, 'pages'), { recursive: true });
      await fs.mkdir(path.join(this.config.dataDir, 'reports'), { recursive: true });
      
      logger.info('SEO Bot initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize SEO Bot:', error);
      throw error;
    }
  }

  async crawl() {
    try {
      logger.info('Starting crawl of:', this.config.targetUrl);
      const response = await axios.get(this.config.targetUrl, {
        timeout: this.config.timeout
      });
      
      const $ = cheerio.load(response.data);
      const links = [];
      
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (href && !this.visitedUrls.has(href)) {
          links.push(href);
          this.visitedUrls.add(href);
        }
      });

      logger.info(`Found ${links.length} new links to crawl`);
      return links;
    } catch (error) {
      logger.error('Crawl error:', error);
      throw error;
    }
  }

  async analyzePage(url) {
    try {
      const response = await axios.get(url, {
        timeout: this.config.timeout
      });
      
      const $ = cheerio.load(response.data);
      const analysis = {
        url,
        title: $('title').text(),
        metaDescription: $('meta[name="description"]').attr('content'),
        h1Count: $('h1').length,
        h2Count: $('h2').length,
        imageCount: $('img').length,
        wordCount: $('body').text().split(/\s+/).length,
        loadTime: response.headers['x-response-time'] || 'N/A'
      };

      // Get AI content feedback
      const content = $('body').text().substring(0, 4000);
      const aiFeedback = await this.getAIContentFeedback(content);
      analysis.aiFeedback = aiFeedback;

      this.pageData.push(analysis);
      await this.savePageData(analysis);
      
      return analysis;
    } catch (error) {
      logger.error(`Error analyzing page ${url}:`, error);
      throw error;
    }
  }

  async getAIContentFeedback(content) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an SEO expert. Analyze the following content and provide specific recommendations for improvement."
          },
          {
            role: "user",
            content: content
          }
        ]
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI API error:', error);
      return 'AI analysis failed. Please try again later.';
    }
  }

  async savePageData(analysis) {
    try {
      const filename = path.join(
        this.config.dataDir,
        'pages',
        `${Buffer.from(analysis.url).toString('base64')}.json`
      );
      await fs.writeFile(filename, JSON.stringify(analysis, null, 2));
    } catch (error) {
      logger.error('Error saving page data:', error);
      throw error;
    }
  }

  async generateReport() {
    try {
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
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  calculateAverage(metric) {
    const values = this.pageData.map(page => page[metric]);
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  getTopPages() {
    return this.pageData
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 5)
      .map(page => ({
        url: page.url,
        title: page.title,
        wordCount: page.wordCount
      }));
  }

  async generateRecommendations() {
    const summary = this.pageData
      .map(page => `URL: ${page.url}\nAI Feedback: ${page.aiFeedback}`)
      .join('\n\n');

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an SEO expert. Based on the following analysis, provide actionable recommendations."
          },
          {
            role: "user",
            content: summary
          }
        ]
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Error generating recommendations:', error);
      return 'Failed to generate recommendations.';
    }
  }

  async sendEmailReport(report) {
    try {
      const html = `
        <h1>SEO Report - ${new Date().toLocaleDateString()}</h1>
        <h2>Summary</h2>
        <p>Total Pages Analyzed: ${report.totalPages}</p>
        <p>Average Word Count: ${report.averageWordCount.toFixed(0)}</p>
        <p>Average Load Time: ${report.averageLoadTime}</p>
        
        <h2>Top Pages</h2>
        <ul>
          ${report.topPages.map(page => `
            <li>
              <strong>${page.title}</strong><br>
              URL: ${page.url}<br>
              Word Count: ${page.wordCount}
            </li>
          `).join('')}
        </ul>
        
        <h2>Recommendations</h2>
        <pre>${report.recommendations}</pre>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.REPORT_EMAIL,
        subject: `SEO Report - ${new Date().toLocaleDateString()}`,
        html
      });

      logger.info('Email report sent successfully');
    } catch (error) {
      logger.error('Error sending email report:', error);
      throw error;
    }
  }

  async sendSlackAlert(message) {
    try {
      await slack.chat.postMessage({
        channel: process.env.SLACK_CHANNEL,
        text: message
      });
      logger.info('Slack alert sent successfully');
    } catch (error) {
      logger.error('Error sending Slack alert:', error);
      throw error;
    }
  }

  async start() {
    try {
      await this.initialize();
      
      // Schedule daily analysis
      cron.schedule(process.env.CRAWL_INTERVAL, async () => {
        try {
          logger.info('Starting scheduled SEO analysis');
          const links = await this.crawl();
          
          for (const link of links) {
            if (this.pageData.length >= this.config.maxPages) {
              logger.info('Reached maximum pages limit');
              break;
            }
            await this.analyzePage(link);
          }
          
          const report = await this.generateReport();
          await this.sendEmailReport(report);
          await this.sendSlackAlert('Daily SEO analysis completed successfully');
          
          logger.info('Scheduled analysis completed');
        } catch (error) {
          logger.error('Scheduled analysis failed:', error);
          await this.sendSlackAlert(`SEO analysis failed: ${error.message}`);
        }
      });

      logger.info('SEO Bot started successfully');
    } catch (error) {
      logger.error('Failed to start SEO Bot:', error);
      throw error;
    }
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  logger.info('Shutting down SEO Bot...');
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', async (error) => {
  logger.error('Unhandled rejection:', error);
  process.exit(1);
});

// Start the bot
const bot = new SEOBot();
bot.start().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
}); 