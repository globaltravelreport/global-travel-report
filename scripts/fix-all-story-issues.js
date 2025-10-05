#!/usr/bin/env node

/**
 * Comprehensive script to fix all story issues
 * 
 * This script:
 * 1. Removes "Title: " prefix from all story titles in the frontmatter
 * 2. Removes unnecessary quotes around titles
 * 3. Fixes future dates (2025) to use current dates
 * 4. Fixes slugs to remove "title-" prefixes
 * 5. Fixes ">-" placeholders in titles and countries
 * 6. Ensures all stories have proper images
 * 7. Fixes missing photographer attribution
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

// Statistics
const stats = {
  totalFiles: 0,
  titleFixed: 0,
  dateFixed: 0,
  slugFixed: 0,
  placeholderFixed: 0,
  imageFixed: 0,
  photographerFixed: 0,
  errors: 0
};

/**
 * Helper function to escape special characters in a string for use in a regex
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate a random date within the last 30 days
 */
function getRandomRecentDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30); // Random number between 0 and 29
  return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
}

/**
 * Get a default image URL for a category
 */
function getDefaultImage(category) {
  const categoryImages = {
    'Travel': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&q=80&w=2400',
    'Adventure': 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&q=80&w=2400',
    'Cruise': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&q=80&w=2400',
    'Airline': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&q=80&w=2400',
    'Destination': 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=2400',
    'Culture': 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&q=80&w=2400',
    'Food': 'https://images.unsplash.com/photo-1493707553966-283afac8c358?auto=format&q=80&w=2400',
    'Hotel': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&q=80&w=2400',
    'Luxury': 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&q=80&w=2400',
    'Budget': 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&q=80&w=2400',
    'Family': 'https://images.unsplash.com/photo-1577083552431-6e5fd01988a5?auto=format&q=80&w=2400',
    'Solo': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&q=80&w=2400',
    'Beach': 'https://images.unsplash.com/photo-1548690396-1fae5d6a3f8a?auto=format&q=80&w=2400',
    'Mountain': 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&q=80&w=2400'
  };

  return categoryImages[category] || categoryImages['Travel'];
}

/**
 * Fix all issues in a story file
 */
async function fixStoryFile(filePath) {
  try {
    // Read the file
    const content = await fs.readFile(filePath, 'utf8');
    
    // Parse frontmatter
    const { data: frontmatter, content: markdownContent } = matter(content);
    let modified = false;
    
    // 1. Fix the title
    if (frontmatter.title) {
      const originalTitle = frontmatter.title;
      
      // Remove "Title: " prefix
      frontmatter.title = frontmatter.title.replace(/^Title:\s*/i, '');
      
      // Remove quotes around the title
      if (frontmatter.title.startsWith('"') && frontmatter.title.endsWith('"') ||
          frontmatter.title.startsWith("'") && frontmatter.title.endsWith("'")) {
        frontmatter.title = frontmatter.title.substring(1, frontmatter.title.length - 1);
      }
      
      // Fix placeholder titles
      if (frontmatter.title === '>-' || frontmatter.title === '|-' || frontmatter.title === '') {
        frontmatter.title = path.basename(filePath, '.md')
          .replace(/^title-/, '')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        stats.placeholderFixed++;
      }
      
      if (frontmatter.title !== originalTitle) {
        modified = true;
        stats.titleFixed++;
      }
    }
    
    // 2. Fix the date (future dates)
    if (frontmatter.date && frontmatter.date.includes('2025')) {
      frontmatter.date = getRandomRecentDate().toISOString();
      modified = true;
      stats.dateFixed++;
    }
    
    // 3. Fix the slug
    if (frontmatter.slug) {
      const originalSlug = frontmatter.slug;
      
      // Remove "title-" prefix from slug
      frontmatter.slug = frontmatter.slug.replace(/^title-/, '');
      
      if (frontmatter.slug !== originalSlug) {
        modified = true;
        stats.slugFixed++;
      }
    }
    
    // 4. Fix placeholder countries
    if (frontmatter.country === '>-' || frontmatter.country === '|-' || frontmatter.country === '') {
      frontmatter.country = 'Global';
      modified = true;
      stats.placeholderFixed++;
    }
    
    // 5. Ensure the story has an image
    if (!frontmatter.imageUrl || frontmatter.imageUrl.trim() === '') {
      const category = frontmatter.category || 'Travel';
      frontmatter.imageUrl = getDefaultImage(category);
      modified = true;
      stats.imageFixed++;
    }
    
    // 6. Ensure photographer attribution
    if (!frontmatter.photographer || !frontmatter.photographer.name) {
      frontmatter.photographer = {
        name: 'Unsplash',
        url: 'https://unsplash.com'
      };
      modified = true;
      stats.photographerFixed++;
    }
    
    // 7. Fix the content
    let updatedContent = markdownContent;
    
    // Remove the title from the beginning of the content if it exists
    if (frontmatter.title) {
      // Try different patterns to match the title at the beginning of the content
      const patterns = [
        // Title: "Title" pattern
        new RegExp(`^\\s*Title:\\s*["']?${escapeRegExp(frontmatter.title)}["']?\\s*\\n+`, 'm'),
        // Just the title without "Title: "
        new RegExp(`^\\s*["']?${escapeRegExp(frontmatter.title)}["']?\\s*\\n+`, 'm'),
        // Title with quotes
        new RegExp(`^\\s*["']${escapeRegExp(frontmatter.title)}["']\\s*\\n+`, 'm')
      ];
      
      // Try each pattern
      for (const pattern of patterns) {
        if (pattern.test(updatedContent)) {
          updatedContent = updatedContent.replace(pattern, '');
          modified = true;
          break;
        }
      }
    }
    
    // Remove "Metadata:" from the end of the content if it exists
    const metadataPatterns = [
      /\s*Metadata:\s*$/,
      /\s*Metadata in JSON:\s*$/
    ];
    
    for (const pattern of metadataPatterns) {
      if (pattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(pattern, '');
        modified = true;
      }
    }
    
    // Only update the file if changes were made
    if (modified) {
      // Write the updated content back to the file
      const updatedFileContent = matter.stringify(updatedContent, frontmatter);
      await fs.writeFile(filePath, updatedFileContent);
      
      console.log(`Updated ${path.basename(filePath)}: ${frontmatter.title}`);
    }
    
    return modified;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    stats.errors++;
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Check if the articles directory exists
    try {
      await fs.access(ARTICLES_DIRECTORY);
    } catch (__error) {
      console.error(`Articles directory not found: ${ARTICLES_DIRECTORY}`);
      return;
    }
    
    // Get all markdown files
    const files = await fs.readdir(ARTICLES_DIRECTORY);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    stats.totalFiles = markdownFiles.length;
    
    console.log(`Found ${markdownFiles.length} story files. Fixing issues...`);
    
    // Process each file
    for (const file of markdownFiles) {
      const filePath = path.join(ARTICLES_DIRECTORY, file);
      await fixStoryFile(filePath);
    }
    
    // Print summary
    console.log('\n✨ Summary:');
    console.log(`Total files: ${stats.totalFiles}`);
    console.log(`Titles fixed: ${stats.titleFixed}`);
    console.log(`Dates fixed: ${stats.dateFixed}`);
    console.log(`Slugs fixed: ${stats.slugFixed}`);
    console.log(`Placeholders fixed: ${stats.placeholderFixed}`);
    console.log(`Images fixed: ${stats.imageFixed}`);
    console.log(`Photographer attributions fixed: ${stats.photographerFixed}`);
    console.log(`Errors: ${stats.errors}`);
    
  } catch (error) {
    console.error('Error running script:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
