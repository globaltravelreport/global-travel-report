require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });  // Load .env.local and override any existing values
const logger = require('../bots/utils/logger');

// Override environment variables for testing
process.env.TARGET_URL = 'http://localhost:3000';
process.env.MAX_PAGES = '10';
process.env.ENABLE_AI = 'false';  // Disable AI features
process.env.EMAIL_HOST = 'smtp.ethereal.email';
process.env.EMAIL_PORT = '587';
process.env.EMAIL_USER = 'test@ethereal.email';
process.env.EMAIL_PASS = 'testpass123';
process.env.EMAIL_FROM = 'test@ethereal.email';
process.env.EMAIL_TO = 'test@ethereal.email';
process.env.SMTP_HOST = process.env.EMAIL_HOST;
process.env.SMTP_PORT = process.env.EMAIL_PORT;
process.env.SMTP_USER = process.env.EMAIL_USER;
process.env.SMTP_PASS = process.env.EMAIL_PASS;

async function runAnalysis() {
    try {
        const SEOBot = require('../bots/seo/seoBot');
        const bot = new SEOBot();
        await bot.initialize();
        
        logger.info('Starting SEO analysis...');
        const results = await bot.analyzePage(process.env.TARGET_URL);
        logger.info('Analysis completed', results);
        
        const report = await bot.generateReport();
        logger.info('Report generated', report);
        
        process.exit(0);
    } catch (error) {
        logger.error('Error running SEO analysis:', error);
        process.exit(1);
    }
}

runAnalysis(); 