import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import { exec } from 'child_process';
import winston from 'winston';
import { OpenAI } from 'openai';

// === CONFIGURATION ===
const config = {
  reportPath: path.resolve('./data/seo-report.json'),
  reportTime: '0 7 * * *', // 0900 AEDT
  lighthouse: {
    url: process.env.SITE_URL || 'https://globaltravelreport.com',
    localUrl: 'http://localhost:3000',
    useLocalServer: process.env.USE_LOCAL_SERVER === 'true',
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    timeout: 60000, // 1 minute
    additionalFlags: '--only-categories=performance,accessibility,best-practices,seo'
  },
  email: {
    to: process.env.EMAIL_TO || 'editorial@globaltravelreport.com',
    from: process.env.EMAIL_FROM || 'noreply@globaltravelreport.com',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.your-email-provider.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      secure: process.env.SMTP_SECURE === 'true'
    }
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    fallbackModel: process.env.OPENAI_FALLBACK_MODEL || 'gpt-3.5-turbo',
    primaryModel: process.env.OPENAI_PRIMARY_MODEL || 'gpt-4'
  }
};

// === LOGGING ===
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/seo-bot-error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({
      filename: 'logs/seo-bot-combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// === EMAIL TRANSPORTER ===
const transporter = nodemailer.createTransport({
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  secure: config.email.smtp.secure,
  auth: {
    user: config.email.smtp.user,
    pass: config.email.smtp.pass
  }
});

// === OPENAI CLIENT ===
const openai = new OpenAI({
  apiKey: config.openai.apiKey
});

// === REPORT GENERATION ===
async function generateReport() {
  try {
    const report = {
      timestamp: new Date().toISOString(),
      summary: await analyzeSitePerformance(),
      recommendations: await generateRecommendations(),
      alerts: await checkForIssues()
    };

    // Save report
    await fs.promises.writeFile(
      config.reportPath,
      JSON.stringify(report, null, 2)
    );

    logger.info('SEO report generated successfully');
    return report;
  } catch (error) {
    logger.error('Failed to generate SEO report', { error: error.message });
    throw error;
  }
}

async function analyzeSitePerformance() {
  try {
    const lighthouseResults = await runLighthouse();
    return {
      performance: {
        score: lighthouseResults.performance,
        status: getPerformanceStatus(lighthouseResults.performance)
      },
      accessibility: {
        score: lighthouseResults.accessibility,
        status: getPerformanceStatus(lighthouseResults.accessibility)
      },
      seo: {
        score: lighthouseResults.seo,
        status: getPerformanceStatus(lighthouseResults.seo)
      },
      bestPractices: {
        score: lighthouseResults.bestPractices,
        status: getPerformanceStatus(lighthouseResults.bestPractices)
      }
    };
  } catch (error) {
    logger.error('Failed to analyze site performance', { error: error.message });
    return null;
  }
}

function getPerformanceStatus(score) {
  if (score < 50) return { level: 'critical', emoji: '❌' };
  if (score < 75) return { level: 'warning', emoji: '⚠️' };
  return { level: 'good', emoji: '✅' };
}

async function generateRecommendations() {
  try {
    const response = await openai.chat.completions.create({
      model: config.openai.primaryModel,
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO consultant. Provide clear, actionable recommendations.'
        },
        {
          role: 'user',
          content: 'Generate SEO recommendations based on the latest site analysis.'
        }
      ],
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    logger.warn('Primary OpenAI model failed, falling back to GPT-3.5', { error: error.message });

    try {
      const response = await openai.chat.completions.create({
        model: config.openai.fallbackModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO consultant. Provide clear, actionable recommendations.'
          },
          {
            role: 'user',
            content: 'Generate SEO recommendations based on the latest site analysis.'
          }
        ],
        max_tokens: 500
      });

      return response.choices[0].message.content;
    } catch (fallbackError) {
      logger.error('Both OpenAI models failed', {
        primaryError: error.message,
        fallbackError: fallbackError.message
      });
      return 'Unable to generate recommendations at this time.';
    }
  }
}

async function checkForIssues() {
  try {
    const report = JSON.parse(await fs.promises.readFile(config.reportPath, 'utf-8'));
    const issues = [];

    // Check performance metrics
    if (report.summary?.performance?.score < 75) {
      issues.push({
        type: 'performance',
        message: 'Site performance needs improvement',
        score: report.summary.performance.score
      });
    }

    // Check SEO metrics
    if (report.summary?.seo?.score < 75) {
      issues.push({
        type: 'seo',
        message: 'SEO score below target',
        score: report.summary.seo.score
      });
    }

    return issues;
  } catch (error) {
    logger.error('Failed to check for issues', { error: error.message });
    return [];
  }
}

// === EMAIL REPORTING ===
async function sendReportEmail() {
  try {
    if (!fs.existsSync(config.reportPath)) {
      throw new Error('SEO report not found');
    }

    const report = await fs.promises.readFile(config.reportPath, 'utf-8');
    const reportData = JSON.parse(report);

    const mailOptions = {
      from: config.email.from,
      to: config.email.to,
      subject: `📊 Daily SEO Report - ${new Date().toLocaleDateString('en-AU')}`,
      html: generateEmailHtml(reportData),
      attachments: [
        {
          filename: 'seo-report.json',
          content: report
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    logger.info('SEO report email sent successfully');
  } catch (error) {
    logger.error('Failed to send SEO report email', { error: error.message });
    throw error;
  }
}

function generateEmailHtml(report) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .metric { margin: 10px 0; }
          .critical { color: red; }
          .warning { color: orange; }
          .good { color: green; }
        </style>
      </head>
      <body>
        <h1>SEO Report - ${new Date().toLocaleDateString('en-AU')}</h1>
        <h2>Performance Metrics</h2>
        ${Object.entries(report.summary).map(([key, value]) => `
          <div class="metric">
            <strong>${key}:</strong>
            <span class="${value.status.level}">
              ${value.status.emoji} ${value.score}%
            </span>
          </div>
        `).join('')}
        <h2>Recommendations</h2>
        <pre>${report.recommendations}</pre>
        ${report.alerts.length > 0 ? `
          <h2>⚠️ Alerts</h2>
          <ul>
            ${report.alerts.map(alert => `
              <li>${alert.message} (Score: ${alert.score}%)</li>
            `).join('')}
          </ul>
        ` : ''}
      </body>
    </html>
  `;
}

// === SCHEDULING ===
cron.schedule(config.reportTime, async () => {
  logger.info('Starting scheduled SEO report generation');
  try {
    await generateReport();
    await sendReportEmail();
    logger.info('Scheduled SEO report completed successfully');
  } catch (error) {
    logger.error('Scheduled SEO report failed', { error: error.message });
  }
});

// === UTILITY FUNCTIONS ===
/**
 * Check if a local server is running
 * @returns {Promise<boolean>} True if the server is running
 */
async function isLocalServerRunning() {
  return new Promise((resolve) => {
    const testUrl = config.lighthouse.localUrl;
    const curl = exec(`curl -s -o /dev/null -w "%{http_code}" ${testUrl}`,
      { timeout: 5000 },
      (error, stdout) => {
        if (error) {
          logger.warn(`Local server check failed: ${error.message}`);
          resolve(false);
          return;
        }

        const statusCode = parseInt(stdout.trim(), 10);
        resolve(statusCode >= 200 && statusCode < 400);
      }
    );

    // Handle timeout
    setTimeout(() => {
      curl.kill();
      logger.warn('Local server check timed out');
      resolve(false);
    }, 5000);
  });
}

/**
 * Run Lighthouse with retries and configurable URL
 * @returns {Promise<Object>} Lighthouse scores
 */
async function runLighthouse() {
  // Determine which URL to use
  let targetUrl = config.lighthouse.url;

  if (config.lighthouse.useLocalServer) {
    const isRunning = await isLocalServerRunning();
    if (isRunning) {
      targetUrl = config.lighthouse.localUrl;
      logger.info(`Using local server for Lighthouse: ${targetUrl}`);
    } else {
      logger.warn(`Local server not running, using production URL: ${targetUrl}`);
    }
  }

  // Set up retry logic
  let retries = 0;
  const maxRetries = config.lighthouse.maxRetries;

  while (retries <= maxRetries) {
    try {
      logger.info(`Running Lighthouse on ${targetUrl} (attempt ${retries + 1}/${maxRetries + 1})`);

      const result = await new Promise((resolve, reject) => {
        const command = `npx lighthouse ${targetUrl} --quiet --chrome-flags="--headless" --output=json --output-path=stdout ${config.lighthouse.additionalFlags}`;

        const lighthouseProcess = exec(command, { timeout: config.lighthouse.timeout }, (err, stdout) => {
          if (err) {
            reject(err);
            return;
          }

          try {
            const report = JSON.parse(stdout);
            resolve({
              performance: report.categories.performance.score * 100,
              accessibility: report.categories.accessibility.score * 100,
              seo: report.categories.seo.score * 100,
              bestPractices: report.categories['best-practices'].score * 100
            });
          } catch (parseError) {
            reject(new Error(`Failed to parse Lighthouse results: ${parseError.message}`));
          }
        });

        // Handle timeout separately
        setTimeout(() => {
          lighthouseProcess.kill();
          reject(new Error('Lighthouse process timed out'));
        }, config.lighthouse.timeout);
      });

      logger.info('Lighthouse completed successfully', result);
      return result;
    } catch (error) {
      logger.error(`Lighthouse attempt ${retries + 1} failed:`, { error: error.message });

      if (retries >= maxRetries) {
        logger.error(`All ${maxRetries + 1} Lighthouse attempts failed`);
        return {
          performance: 0,
          accessibility: 0,
          seo: 0,
          bestPractices: 0
        };
      }

      // Wait before retrying
      logger.info(`Retrying in ${config.lighthouse.retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, config.lighthouse.retryDelay));
      retries++;
    }
  }
}

// Export functions for use in other modules
export {
  generateReport,
  sendReportEmail,
  analyzeSitePerformance,
  generateRecommendations,
  checkForIssues
};