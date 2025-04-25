const logger = require('../utils/logger');
const { sendReport } = require('../utils/emailSender');
const { getSydneyTime, formatDateForFile, formatDateForDisplay } = require('../utils/time');
const configValidator = require('../utils/configValidator');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const { OpenAI } = require('openai');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');

// Validate configuration before starting
try {
    configValidator.validate();
} catch (error) {
    logger.error('Configuration validation failed:', error);
    process.exit(1);
}

class SEOBot {
    constructor() {
        this.config = {
            targetUrl: process.env.TARGET_URL,
            dataDir: path.join(process.cwd(), 'data', 'seo'),
            openai: new OpenAI({ 
                apiKey: process.env.OPENAI_API_KEY,
                maxRetries: 3,
                timeout: 30000
            }),
            maxPages: parseInt(process.env.MAX_PAGES) || 100,
            reportTime: process.env.REPORT_TIME || '09:00',
            timezone: process.env.TIMEZONE || 'Australia/Sydney'
        };
        this.visitedUrls = new Set();
        this.results = [];
    }

    async initialize() {
        try {
            await fs.mkdir(this.config.dataDir, { recursive: true });
            logger.info('SEO Bot initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize SEO Bot:', error);
            throw error;
        }
    }

    async runLighthouse(url, retryCount = 0) {
        let chrome;
        try {
            chrome = await chromeLauncher.launch({
                chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
            });
            
            const options = {
                logLevel: 'error',
                output: 'json',
                onlyCategories: ['performance', 'accessibility', 'seo'],
                port: chrome.port,
                quiet: true,
                emulatedFormFactor: 'desktop'
            };

            const runnerResult = await lighthouse(url, options);
            await chrome.kill();

            if (!runnerResult || !runnerResult.lhr || !runnerResult.lhr.categories) {
                throw new Error('Invalid Lighthouse result');
            }

            return {
                performance: Math.round(runnerResult.lhr.categories.performance.score * 100),
                accessibility: Math.round(runnerResult.lhr.categories.accessibility.score * 100),
                seo: Math.round(runnerResult.lhr.categories.seo.score * 100)
            };
        } catch (error) {
            if (chrome) {
                await chrome.kill();
            }
            if (retryCount < 3) {
                logger.warn(`Lighthouse error for ${url}, retrying (${retryCount + 1}/3):`, error);
                await new Promise(resolve => setTimeout(resolve, 5000));
                return this.runLighthouse(url, retryCount + 1);
            }
            logger.error(`Lighthouse error for ${url} after 3 retries:`, error);
            return {
                performance: 0,
                accessibility: 0,
                seo: 0
            };
        }
    }

    async analyzePage(url, retryCount = 0) {
        try {
            const response = await axios.get(url, {
                timeout: 30000,
                maxRedirects: 5
            });
            const $ = cheerio.load(response.data);
            
            const analysis = {
                url,
                title: $('title').text(),
                metaDescription: $('meta[name="description"]').attr('content'),
                h1Count: $('h1').length,
                h2Count: $('h2').length,
                imageCount: $('img').length,
                imagesWithoutAlt: $('img:not([alt])').length,
                wordCount: $('body').text().split(/\s+/).length,
                lighthouse: await this.runLighthouse(url)
            };

            // Get AI content feedback and SEO suggestions
            const content = $('body').text().substring(0, 4000);
            const title = $('h1').first().text() || $('title').text();
            const summary = $('meta[name="description"]').attr('content') || '';
            
            const seoSuggestions = await this.generateSEOSuggestions(title, summary, content);
            analysis.seoSuggestions = seoSuggestions;

            this.results.push(analysis);
            await this.saveResults(analysis);
            
            return analysis;
        } catch (error) {
            if (retryCount < 3) {
                logger.warn(`Error analyzing page ${url}, retrying (${retryCount + 1}/3):`, error);
                await new Promise(resolve => setTimeout(resolve, 5000));
                return this.analyzePage(url, retryCount + 1);
            }
            logger.error(`Error analyzing page ${url} after 3 retries:`, error);
            throw error;
        }
    }

    async generateSEOSuggestions(title, summary, content) {
        try {
            const response = await this.config.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are an SEO expert. Generate optimized metadata for the following content.
                        Follow these rules:
                        - Meta title: max 60 characters
                        - Meta description: max 160 characters
                        - Keywords: 5-10 relevant terms
                        - OG title: engaging and shareable
                        - OG description: compelling and clickable
                        - Image alt text: descriptive and SEO-friendly`
                    },
                    {
                        role: "user",
                        content: `Title: ${title}\nSummary: ${summary}\nContent: ${content.substring(0, 2000)}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            const suggestions = response.choices[0].message.content;
            return this.parseSEOSuggestions(suggestions);
        } catch (error) {
            logger.error('Error generating SEO suggestions:', error);
            return this.generateFallbackSEOSuggestions(title, summary);
        }
    }

    parseSEOSuggestions(suggestions) {
        try {
            const lines = suggestions.split('\n');
            const result = {
                metaTitle: '',
                metaDescription: '',
                keywords: [],
                ogTitle: '',
                ogDescription: '',
                imageAlt: ''
            };

            for (const line of lines) {
                if (line.toLowerCase().includes('meta title:')) {
                    result.metaTitle = line.split(':')[1].trim();
                } else if (line.toLowerCase().includes('meta description:')) {
                    result.metaDescription = line.split(':')[1].trim();
                } else if (line.toLowerCase().includes('keywords:')) {
                    result.keywords = line.split(':')[1].trim().split(',').map(k => k.trim());
                } else if (line.toLowerCase().includes('og title:')) {
                    result.ogTitle = line.split(':')[1].trim();
                } else if (line.toLowerCase().includes('og description:')) {
                    result.ogDescription = line.split(':')[1].trim();
                } else if (line.toLowerCase().includes('image alt:')) {
                    result.imageAlt = line.split(':')[1].trim();
                }
            }

            // Validate lengths
            if (result.metaTitle.length > 60) {
                result.metaTitle = result.metaTitle.substring(0, 57) + '...';
            }
            if (result.metaDescription.length > 160) {
                result.metaDescription = result.metaDescription.substring(0, 157) + '...';
            }

            return result;
        } catch (error) {
            logger.error('Error parsing SEO suggestions:', error);
            return this.generateFallbackSEOSuggestions('', '');
        }
    }

    generateFallbackSEOSuggestions(title, summary) {
        return {
            metaTitle: title.substring(0, 60),
            metaDescription: summary.substring(0, 160),
            keywords: ['travel', 'destination', 'guide', 'tips', 'adventure'],
            ogTitle: title,
            ogDescription: summary,
            imageAlt: 'Travel destination image'
        };
    }

    async updateArticleMetadata(articleId, seoSuggestions) {
        try {
            const articlesPath = path.join(process.cwd(), 'data', 'articles.json');
            const articles = JSON.parse(await fs.readFile(articlesPath, 'utf-8'));
            
            const article = articles.find(a => a.id === articleId);
            if (!article) {
                throw new Error(`Article ${articleId} not found`);
            }

            // Update article metadata
            article.seo = {
                title: seoSuggestions.metaTitle,
                description: seoSuggestions.metaDescription,
                keywords: seoSuggestions.keywords
            };

            if (!article.featuredImage) {
                article.featuredImage = {};
            }
            article.featuredImage.alt = seoSuggestions.imageAlt;

            // Save updated articles
            await fs.writeFile(articlesPath, JSON.stringify(articles, null, 2));
            logger.info(`Updated SEO metadata for article ${articleId}`);
        } catch (error) {
            logger.error('Error updating article metadata:', error);
            throw error;
        }
    }

    async getContentFeedback(content) {
        try {
            // Implementation details
            return 'Content analysis completed';
        } catch (error) {
            logger.error('Analysis error:', error);
            return 'Content analysis unavailable';
        }
    }

    async saveResults(analysis) {
        try {
            const filename = path.join(
                this.config.dataDir,
                `${Buffer.from(analysis.url).toString('base64')}.json`
            );
            await fs.writeFile(filename, JSON.stringify(analysis, null, 2));
        } catch (error) {
            logger.error('Error saving results:', error);
            throw error;
        }
    }

    async generateReport() {
        try {
            const report = {
                timestamp: new Date().toISOString(),
                totalPages: this.results.length,
                averageMetrics: this.calculateAverages(),
                topPages: this.getTopPages(),
                recommendations: await this.generateRecommendations()
            };

            const reportPath = path.join(
                this.config.dataDir,
                `report-${new Date().toISOString().split('T')[0]}.json`
            );
            
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            return report;
        } catch (error) {
            logger.error('Error generating report:', error);
            throw error;
        }
    }

    calculateAverages() {
        return {
            performance: this.results.reduce((sum, r) => sum + (r.lighthouse?.performance || 0), 0) / this.results.length,
            accessibility: this.results.reduce((sum, r) => sum + (r.lighthouse?.accessibility || 0), 0) / this.results.length,
            seo: this.results.reduce((sum, r) => sum + (r.lighthouse?.seo || 0), 0) / this.results.length
        };
    }

    getTopPages() {
        return this.results
            .sort((a, b) => b.wordCount - a.wordCount)
            .slice(0, 5)
            .map(page => ({
                url: page.url,
                title: page.title,
                wordCount: page.wordCount
            }));
    }

    async generateRecommendations() {
        if (process.env.ENABLE_AI === 'false') {
            return this.generateBasicRecommendations();
        }

        const summary = this.results
            .map(page => `URL: ${page.url}\nAnalysis: ${page.contentFeedback}`)
            .join('\n\n');

        try {
            const response = await this.config.openai.chat.completions.create({
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

    generateBasicRecommendations() {
        const recommendations = [];
        const firstPage = this.results[0];

        if (firstPage) {
            if (firstPage.h1Count !== 1) {
                recommendations.push('Each page should have exactly one H1 heading');
            }
            if (firstPage.h2Count < 2) {
                recommendations.push('Consider adding more H2 headings for better content structure');
            }
            if (firstPage.imagesWithoutAlt > 0) {
                recommendations.push('Add alt text to all images for better accessibility');
            }
            if (firstPage.wordCount < 1000) {
                recommendations.push('Consider increasing content length for better depth');
            }
            if (!firstPage.metaDescription) {
                recommendations.push('Add meta description for better search results');
            }
        }

        return recommendations.join('\n');
    }

    async sendEmailReport(report) {
        try {
            if (!process.env.EMAIL_HOST || !process.env.EMAIL_FROM || !process.env.EMAIL_PASS) {
                throw new Error('Email configuration is incomplete');
            }

            const html = `
                <h1>SEO Report - ${formatDateForDisplay(getSydneyTime())}</h1>
                <h2>Summary</h2>
                <p>Total Pages Analyzed: ${report.totalPages}</p>
                <p>Average Performance Score: ${report.averageMetrics.performance.toFixed(1)}%</p>
                <p>Average Accessibility Score: ${report.averageMetrics.accessibility.toFixed(1)}%</p>
                <p>Average SEO Score: ${report.averageMetrics.seo.toFixed(1)}%</p>
                
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

            await sendReport(
                `SEO Report - ${formatDateForDisplay(getSydneyTime())}`,
                html,
                process.env.EMAIL_TO,
                process.env.NODE_ENV === 'test'
            );
        } catch (error) {
            logger.error('Error sending email report:', error);
            throw error;
        }
    }

    async start() {
        try {
            await this.initialize();
            
            // Schedule daily analysis
            const [hours, minutes] = this.config.reportTime.split(':');
            cron.schedule(`${minutes} ${hours} * * *`, async () => {
                try {
                    logger.info('Starting scheduled SEO analysis');
                    await this.analyzePage(this.config.targetUrl);
                    const report = await this.generateReport();
                    if (process.env.ENABLE_EMAIL_REPORTS !== 'false') {
                        await this.sendEmailReport(report);
                    }
                    logger.info('Scheduled analysis completed');
                } catch (error) {
                    logger.error('Scheduled analysis failed:', error);
                }
            }, {
                timezone: this.config.timezone
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

module.exports = SEOBot; 