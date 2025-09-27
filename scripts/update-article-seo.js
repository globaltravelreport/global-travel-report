const SEOBot = require('../bots/seo/seoBot');
const logger = require('../bots/utils/logger');
const fs = require('fs').promises;
const path = require('path');

async function updateArticleSEO(articleId) {
    try {
        const seoBot = new SEOBot();
        await seoBot.initialize();

        // Read the article
        const articlesPath = path.join(process.cwd(), 'data', 'articles.json');
        const articles = JSON.parse(await fs.readFile(articlesPath, 'utf-8'));
        
        const article = articles.find(a => a.id === articleId);
        if (!article) {
            throw new Error(`Article ${articleId} not found`);
        }

        // Generate SEO suggestions
        const seoSuggestions = await seoBot.generateSEOSuggestions(
            article.title,
            article.summary,
            article.content
        );

        // Update article metadata
        await seoBot.updateArticleMetadata(articleId, seoSuggestions);
        
        logger.info(`Successfully updated SEO metadata for article ${articleId}`);
    } catch (error) {
        logger.error('Error updating article SEO:', error);
        throw error;
    }
}

// If running directly, get article ID from command line
if (require.main === module) {
    const articleId = process.argv[2];
    if (!articleId) {
        logger.error('Please provide an article ID');
        process.exit(1);
    }
    
    updateArticleSEO(articleId)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = updateArticleSEO; 