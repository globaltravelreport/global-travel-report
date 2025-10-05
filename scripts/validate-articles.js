const fs = require('fs');
const path = require('path');

// Required fields for articles
const REQUIRED_FIELDS = ['title', 'slug', 'content', 'date'];
const _OPTIONAL_FIELDS = ['featuredImage', 'summary', 'category', 'status', 'author'];

// Log function with timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function validateArticle(article, _index) {
  const errors = [];
  
  // Check required fields
  REQUIRED_FIELDS.forEach(field => {
    if (!article[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate slug format
  if (article.slug && !/^[a-z0-9-]+$/.test(article.slug)) {
    errors.push('Invalid slug format. Use lowercase letters, numbers, and hyphens only.');
  }

  // Validate date format
  if (article.date && !/^\d{4}-\d{2}-\d{2}$/.test(article.date)) {
    errors.push('Invalid date format. Use YYYY-MM-DD.');
  }

  // Validate featuredImage structure
  if (article.featuredImage) {
    if (!article.featuredImage.url || !article.featuredImage.alt) {
      errors.push('featuredImage must have both url and alt properties');
    }
  }

  // Validate status
  if (article.status && !['draft', 'published'].includes(article.status)) {
    errors.push('status must be either "draft" or "published"');
  }

  return errors;
}

function main() {
  log('Starting article validation...');
  
  const articlesPath = path.join(process.cwd(), 'app/data/articles.json');
  
  if (!fs.existsSync(articlesPath)) {
    log('ERROR: articles.json not found');
    process.exit(1);
  }

  try {
    const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
    
    if (!Array.isArray(articles)) {
      log('ERROR: articles.json must contain an array');
      process.exit(1);
    }

    let hasErrors = false;
    
    articles.forEach((article, index) => {
      const errors = validateArticle(article, index);
      
      if (errors.length > 0) {
        hasErrors = true;
        log(`\nArticle ${index + 1} errors:`);
        errors.forEach(error => log(`  - ${error}`));
      }
    });

    if (hasErrors) {
      log('\nValidation failed. Please fix the errors above.');
      process.exit(1);
    }

    log('✓ All articles validated successfully');
  } catch (error) {
    log(`ERROR: Failed to validate articles: ${error.message}`);
    process.exit(1);
  }
}

main(); 