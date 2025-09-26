// Import required packages
const fs = require('fs').promises;
const path = require('path');

// Utility function to create URL-friendly slugs
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
}

// Function to create the articles directory if it doesn't exist
async function ensureArticlesDirectory() {
    const articlesDir = path.join(process.cwd(), 'content', 'articles');
    try {
        await fs.access(articlesDir);
    } catch {
        console.log('📁 Creating articles directory...');
        await fs.mkdir(articlesDir, { recursive: true });
    }
    return articlesDir;
}

// Function to generate the current date in YYYY-MM-DD format
function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

// Function to save an article as a Markdown file
async function saveArticleToMarkdown(article, articlesDir) {
    try {
        // Generate slug and filename
        const slug = slugify(article.title);
        const date = getCurrentDate();
        const filename = `${date}-${slug}.md`;
        const filepath = path.join(articlesDir, filename);

        // Create YAML frontmatter
        const frontmatter = `---
title: "${article.title}"
summary: "${article.summary}"
keywords: ${JSON.stringify(article.keywords)}
slug: ${slug}
date: ${date}
country: ${article.country || 'Global'}
type: ${article.type || 'Article'}${article.imageUrl ? `
imageUrl: "${article.imageUrl}"
imageAlt: "${article.imageAlt}"
imageCredit: "${article.imageCredit}"
imageLink: "${article.imageLink}"` : ''}
---

${article.content}`;

        // Write the file
        await fs.writeFile(filepath, frontmatter, 'utf8');
        console.log(`✅ Saved article: ${filename}`);
        
        return {
            filename,
            slug,
            date
        };
    } catch (error) {
        console.error(`❌ Error saving article "${article.title}":`, error.message);
        throw error;
    }
}

// Main function to process and save articles
async function saveArticles(articles) {
    try {
        console.log('📝 Starting article saving process...');
        
        // Ensure articles directory exists
        const articlesDir = await ensureArticlesDirectory();
        
        // Process each article
        const savedArticles = [];
        for (const [index, article] of articles.entries()) {
            console.log(`\n📄 Processing article ${index + 1}/${articles.length}:`);
            console.log('📌 Title:', article.title);
            
            try {
                const saved = await saveArticleToMarkdown(article, articlesDir);
                savedArticles.push(saved);
            } catch (error) {
                console.error(`❌ Failed to save article: ${error.message}`);
                continue;
            }
        }
        
        console.log('\n✨ Finished saving articles');
        console.log(`📊 Total articles saved: ${savedArticles.length}`);
        
        return savedArticles;
    } catch (error) {
        console.error('❌ Error in main process:', error.message);
        throw error;
    }
}

// Export the functions
module.exports = {
    saveArticles,
    saveArticleToMarkdown,
    slugify,
    getCurrentDate
}; 