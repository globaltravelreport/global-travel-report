const axios = require('axios');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const { Configuration, OpenAIApi } = require('openai');
const { google } = require('googleapis');
const { WebClient } = require('@slack/web-api');
const winston = require('winston');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const { RateLimiter } = require('limiter');

// === CONFIGURATION ===
class Config {
  constructor() {
    this.targetUrl = process.env.TARGET_URL || 'https://yourwebsite.com';
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.slackToken = process.env.SLACK_TOKEN;
    this.slackChannel = process.env.SLACK_CHANNEL || '#seo-alerts';
    this.googleClientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    this.googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY;
    this.googleProjectId = process.env.GOOGLE_PROJECT_ID;
    this.crawlInterval = process.env.CRAWL_INTERVAL || '0 0 * * *'; // Daily at midnight
    this.maxPages = parseInt(process.env.MAX_PAGES) || 1000;
    this.timeout = parseInt(process.env.TIMEOUT_MS) || 15000;
    this.dataDir = process.env.DATA_DIR || './data';
  }

  validate() {
    const errors = [];
    if (!this.openaiApiKey) errors.push('OPENAI_API_KEY is required');
    if (!this.slackToken) errors.push('SLACK_TOKEN is required');
    if (!this.googleClientEmail || !this.googlePrivateKey || !this.googleProjectId) {
      errors.push('Google Search Console credentials are required');
    }
    return errors;
  }
}

// === LOGGING ===
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
      format: winston.format.simple()
    })
  ]
});

// === ERROR HANDLING ===
class SEOBotError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'SEOBotError';
    this.code = code;
    this.details = details;
  }
}

async function handleError(error, context = {}) {
  logger.error('SEO Bot Error', { error: error.message, context });
  
  if (error instanceof SEOBotError) {
    await sendSlackAlert(`🚨 SEO Bot Error (${error.code}): ${error.message}`, {
      context,
      details: error.details
    });
  } else {
    await sendSlackAlert('🚨 Unexpected SEO Bot Error', {
      error: error.message,
      context
    });
  }
}

// === SLACK INTEGRATION ===
const slack = new WebClient(process.env.SLACK_TOKEN);

async function sendSlackAlert(message, data = {}) {
  try {
    await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL,
      text: message,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '```' + JSON.stringify(data, null, 2) + '```'
          }
        }
      ]
    });
  } catch (error) {
    logger.error('Failed to send Slack alert', { error: error.message });
  }
}

// === GOOGLE SEARCH CONSOLE INTEGRATION ===
async function getSearchConsoleData(siteUrl) {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/webmasters.readonly']
    );

    const webmasters = google.webmasters({ version: 'v3', auth });
    
    const response = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: '30daysAgo',
        endDate: 'today',
        dimensions: ['query', 'page'],
        rowLimit: 1000
      }
    });

    return response.data;
  } catch (error) {
    throw new SEOBotError('Failed to fetch Search Console data', 'SEARCH_CONSOLE_ERROR', { error: error.message });
  }
}

// === CRAWLER ===
class Crawler {
  constructor(config) {
    this.config = config;
    this.visited = new Set();
    this.internalLinks = [];
    this.queue = [];
    this.processing = false;
    this.rateLimiter = new RateLimiter(10, 1000); // 10 requests per second
  }

  async crawl(url, base) {
    if (this.visited.size >= this.config.maxPages) {
      logger.info('Reached maximum page limit');
      return;
    }

    if (this.visited.has(url) || !url.startsWith(base)) return;
    
    this.visited.add(url);
    this.queue.push(url);

    while (this.queue.length > 0 && !this.processing) {
      this.processing = true;
      const currentUrl = this.queue.shift();
      
      try {
        await this.rateLimiter.wait();
        const { data } = await axios.get(currentUrl, { 
          timeout: this.config.timeout,
          headers: {
            'User-Agent': 'SEO-Bot/1.0 (+https://yourwebsite.com)'
          }
        });

        const $ = cheerio.load(data);
        this.internalLinks.push(currentUrl);

        // Find and queue more internal links
        $('a[href]').each((_, el) => {
          let href = $(el).attr('href');
          if (href && href.startsWith('/')) href = base + href;
          if (href && href.startsWith(base) && !this.visited.has(href)) {
            this.queue.push(href);
          }
        });

        // Save page data
        await this.savePageData(currentUrl, {
          title: $('title').text(),
          description: $('meta[name="description"]').attr('content'),
          canonical: $('link[rel="canonical"]').attr('href'),
          h1: $('h1').first().text(),
          lastCrawled: new Date().toISOString()
        });

      } catch (error) {
        logger.error('Crawl error', { url: currentUrl, error: error.message });
        await handleError(new SEOBotError('Crawl failed', 'CRAWL_ERROR', { url: currentUrl, error: error.message }));
      } finally {
        this.processing = false;
      }
    }
  }

  async savePageData(url, data) {
    try {
      const filename = path.join(this.config.dataDir, 'pages', `${Buffer.from(url).toString('base64')}.json`);
      await fs.mkdir(path.dirname(filename), { recursive: true });
      await fs.writeFile(filename, JSON.stringify(data, null, 2));
    } catch (error) {
      logger.error('Failed to save page data', { url, error: error.message });
    }
  }
}

// === RATE LIMITER ===
class RateLimiter {
  constructor(requestsPerInterval, intervalMs) {
    this.requestsPerInterval = requestsPerInterval;
    this.intervalMs = intervalMs;
    this.queue = [];
    this.processing = false;
  }

  async wait() {
    return new Promise(resolve => {
      this.queue.push(resolve);
      if (!this.processing) this.processQueue();
    });
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const resolve = this.queue.shift();
    resolve();

    setTimeout(() => {
      this.processQueue();
    }, this.intervalMs / this.requestsPerInterval);
  }
}

// === ON-PAGE SEO ANALYSIS ===
class SEOAnalyzer {
  constructor(config) {
    this.config = config;
    this.openai = new OpenAIApi(new Configuration({ apiKey: config.openaiApiKey }));
  }

  async analyzePage(url) {
    try {
      const { data } = await axios.get(url, { timeout: this.config.timeout });
      const $ = cheerio.load(data);

      const content = $('body').text()
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 2000);

      const [aiAnalysis, lighthouseResults] = await Promise.all([
        this.analyzeContent(content),
        this.runLighthouse(url)
      ]);

      return {
        url,
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        canonical: $('link[rel="canonical"]').attr('href'),
        h1: $('h1').first().text(),
        images: $('img').map((_, el) => ({
          src: $(el).attr('src'),
          alt: $(el).attr('alt'),
        })).get(),
        aiContentFeedback: aiAnalysis,
        ...lighthouseResults
      };
    } catch (error) {
      throw new SEOBotError('Page analysis failed', 'ANALYSIS_ERROR', { url, error: error.message });
    }
  }

  async analyzeContent(content) {
    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert SEO auditor.' },
          { role: 'user', content: `Analyze this page content for SEO quality and suggest improvements:\n\n${content}` }
        ],
        max_tokens: 300,
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      throw new SEOBotError('AI analysis failed', 'AI_ANALYSIS_ERROR', { error: error.message });
    }
  }

  async runLighthouse(url) {
    return new Promise((resolve) => {
      exec(`npx lighthouse ${url} --quiet --chrome-flags="--headless" --output=json --output-path=stdout`, (err, stdout) => {
        if (err) {
          resolve({ error: err.message });
          return;
        }
        try {
          const report = JSON.parse(stdout);
          resolve({
            performance: report.categories.performance.score,
            accessibility: report.categories.accessibility.score,
            bestPractices: report.categories['best-practices'].score,
            seo: report.categories.seo.score,
          });
        } catch (e) {
          resolve({ error: 'Lighthouse parse error' });
        }
      });
    });
  }
}

// === MAIN BOT LOGIC ===
class SEOBot {
  constructor() {
    this.config = new Config();
    this.crawler = new Crawler(this.config);
    this.analyzer = new SEOAnalyzer(this.config);
    this.isRunning = false;
  }

  async initialize() {
    const errors = this.config.validate();
    if (errors.length > 0) {
      throw new SEOBotError('Configuration validation failed', 'CONFIG_ERROR', { errors });
    }

    try {
      await fs.mkdir(this.config.dataDir, { recursive: true });
      await fs.mkdir(path.join(this.config.dataDir, 'pages'), { recursive: true });
      await fs.mkdir(path.join(this.config.dataDir, 'logs'), { recursive: true });
    } catch (error) {
      throw new SEOBotError('Failed to initialize data directories', 'INIT_ERROR', { error: error.message });
    }
  }

  async runAnalysis() {
    try {
      logger.info('Starting SEO analysis...');
      
      // Get Search Console data
      const searchData = await getSearchConsoleData(this.config.targetUrl);
      
      // Crawl and analyze pages
      await this.crawler.crawl(this.config.targetUrl, this.config.targetUrl);
      
      const results = [];
      for (const url of this.crawler.internalLinks) {
        try {
          const analysis = await this.analyzer.analyzePage(url);
          results.push(analysis);
          
          // Check for critical issues
          if (analysis.seo < 0.8) {
            await sendSlackAlert(`⚠️ Low SEO Score for ${url}`, {
              score: analysis.seo,
              issues: analysis.aiContentFeedback
            });
          }
        } catch (error) {
          logger.error('Page analysis failed', { url, error: error.message });
        }
      }

      // Generate and send report
      await this.sendReport(results, searchData);
      
      logger.info('SEO analysis completed');
    } catch (error) {
      await handleError(error);
    }
  }

  async sendReport(results, searchData) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPages: results.length,
        averageSeoScore: this.calculateAverage(results, 'seo'),
        averagePerformanceScore: this.calculateAverage(results, 'performance'),
        criticalIssues: results.filter(r => r.seo < 0.8).length
      },
      topPages: this.getTopPages(results),
      searchData: this.analyzeSearchData(searchData),
      recommendations: await this.generateRecommendations(results)
    };

    await sendSlackAlert('📊 SEO Audit Report', report);
    
    // Save report to file
    const reportPath = path.join(this.config.dataDir, 'reports', `${new Date().toISOString().split('T')[0]}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  }

  calculateAverage(results, metric) {
    const validScores = results.filter(r => r[metric] !== undefined).map(r => r[metric]);
    return validScores.length > 0 
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length 
      : 0;
  }

  getTopPages(results) {
    return results
      .sort((a, b) => b.seo - a.seo)
      .slice(0, 5)
      .map(r => ({
        url: r.url,
        seoScore: r.seo,
        performanceScore: r.performance
      }));
  }

  analyzeSearchData(data) {
    if (!data || !data.rows) return null;
    
    return {
      totalClicks: data.rows.reduce((sum, row) => sum + parseInt(row.clicks), 0),
      totalImpressions: data.rows.reduce((sum, row) => sum + parseInt(row.impressions), 0),
      averagePosition: data.rows.reduce((sum, row) => sum + parseFloat(row.position), 0) / data.rows.length,
      topQueries: data.rows
        .sort((a, b) => parseInt(b.clicks) - parseInt(a.clicks))
        .slice(0, 5)
        .map(row => ({
          query: row.keys[0],
          clicks: parseInt(row.clicks),
          impressions: parseInt(row.impressions)
        }))
    };
  }

  async generateRecommendations(results) {
    const content = results
      .map(r => `URL: ${r.url}\nSEO Score: ${r.seo}\nIssues: ${r.aiContentFeedback}`)
      .join('\n\n');

    try {
      const response = await this.analyzer.openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert SEO consultant.' },
          { role: 'user', content: `Based on these SEO audit results, provide 5 key recommendations for improvement:\n\n${content}` }
        ],
        max_tokens: 500
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      logger.error('Failed to generate recommendations', { error: error.message });
      return 'Failed to generate AI recommendations';
    }
  }

  async start() {
    try {
      await this.initialize();
      this.isRunning = true;

      // Run initial analysis
      await this.runAnalysis();

      // Schedule regular analysis
      cron.schedule(this.config.crawlInterval, async () => {
        if (this.isRunning) {
          await this.runAnalysis();
        }
      });

      logger.info('SEO Bot started successfully');
    } catch (error) {
      await handleError(error);
      process.exit(1);
    }
  }

  stop() {
    this.isRunning = false;
    logger.info('SEO Bot stopped');
  }
}

// Start the bot
const bot = new SEOBot();
bot.start().catch(async (error) => {
  await handleError(error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  bot.stop();
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  await handleError(error);
  process.exit(1);
});

process.on('unhandledRejection', async (error) => {
  await handleError(error);
  process.exit(1);
}); 