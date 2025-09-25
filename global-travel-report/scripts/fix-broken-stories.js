/**
 * Fix Broken Stories Script
 * 
 * This script scans all story files in the content/articles directory and fixes common issues:
 * 1. Incorrect frontmatter format
 * 2. Missing or incorrect photographer information
 * 3. Inconsistent category/type fields
 * 4. Excessive blank lines
 * 5. Invalid image URLs
 * 
 * Usage: node scripts/fix-broken-stories.js
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const CONTENT_DIR = path.join(process.cwd(), 'content/articles');
const LOGS_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOGS_DIR, `fix-broken-stories-${new Date().toISOString().split('T')[0]}.log`);

// Statistics
const stats = {
  total: 0,
  fixed: 0,
  errors: 0,
  fixedIssues: {
    frontmatter: 0,
    photographer: 0,
    category: 0,
    blankLines: 0,
    imageUrl: 0
  }
};

/**
 * Main function to fix broken stories
 */
async function fixBrokenStories() {
  try {
    console.log('🔍 Starting to fix broken stories...');
    
    // Create logs directory if it doesn't exist
    await fs.mkdir(LOGS_DIR, { recursive: true });
    
    // Initialize log file
    await fs.writeFile(LOG_FILE, `===== Fix Broken Stories Started at ${new Date().toISOString()} =====\n`, 'utf8');
    
    // Get all markdown files in the content directory
    const files = await fs.readdir(CONTENT_DIR);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    stats.total = markdownFiles.length;
    await log(`Found ${stats.total} story files to process`);
    
    // Process each file
    for (const file of markdownFiles) {
      try {
        const filePath = path.join(CONTENT_DIR, file);
        await log(`Processing file: ${file}`);
        
        // Read the file content
        const content = await fs.readFile(filePath, 'utf8');
        
        // Fix the file content
        const fixedContent = fixStoryContent(content, file);
        
        // If the content was changed, write it back to the file
        if (fixedContent !== content) {
          await fs.writeFile(filePath, fixedContent, 'utf8');
          stats.fixed++;
          await log(`✅ Fixed file: ${file}`);
        } else {
          await log(`✓ No issues found in file: ${file}`);
        }
      } catch (error) {
        stats.errors++;
        await log(`❌ Error processing file ${file}: ${error.message}`);
      }
    }
    
    // Log summary
    await log('\n📊 Summary:');
    await log(`- Total files processed: ${stats.total}`);
    await log(`- Files fixed: ${stats.fixed}`);
    await log(`- Errors: ${stats.errors}`);
    await log(`- Fixed issues:`);
    await log(`  - Frontmatter format: ${stats.fixedIssues.frontmatter}`);
    await log(`  - Photographer information: ${stats.fixedIssues.photographer}`);
    await log(`  - Category/type fields: ${stats.fixedIssues.category}`);
    await log(`  - Blank lines: ${stats.fixedIssues.blankLines}`);
    await log(`  - Image URLs: ${stats.fixedIssues.imageUrl}`);
    
    console.log('✅ Finished fixing broken stories');
    console.log(`📝 See ${LOG_FILE} for details`);
  } catch (error) {
    console.error(`❌ Error fixing broken stories: ${error.message}`);
  }
}

/**
 * Fix issues in a story file
 * @param {string} content - The file content
 * @param {string} filename - The filename
 * @returns {string} - The fixed content
 */
function fixStoryContent(content, filename) {
  // Check if the file has frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!frontmatterMatch) {
    // No valid frontmatter found, this is a serious issue
    // We'll try to extract what we can and create a new frontmatter
    return createNewFrontmatter(content, filename);
  }
  
  let frontmatter = frontmatterMatch[1];
  let storyContent = frontmatterMatch[2];
  
  // Parse the frontmatter
  let frontmatterData = parseFrontmatter(frontmatter);
  
  // Fix common issues in the frontmatter
  frontmatterData = fixFrontmatterIssues(frontmatterData, filename);
  
  // Fix excessive blank lines in the content
  if (storyContent.includes('\n\n\n')) {
    storyContent = storyContent.replace(/\n{3,}/g, '\n\n');
    stats.fixedIssues.blankLines++;
  }
  
  // Generate the fixed frontmatter
  const fixedFrontmatter = generateFrontmatter(frontmatterData);
  
  // Combine the fixed frontmatter and content
  return `---\n${fixedFrontmatter}---\n\n${storyContent.trim()}`;
}

/**
 * Parse frontmatter into an object
 * @param {string} frontmatter - The frontmatter string
 * @returns {Object} - The parsed frontmatter
 */
function parseFrontmatter(frontmatter) {
  try {
    // Try to parse as YAML
    return yaml.load(frontmatter) || {};
  } catch (error) {
    // If YAML parsing fails, try manual parsing
    const data = {};
    const lines = frontmatter.split('\n');
    
    let inNestedBlock = false;
    let currentBlock = '';
    let currentBlockData = {};
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;
      
      // Check if we're entering a nested block
      if (trimmedLine.endsWith(':') && !trimmedLine.includes(': ')) {
        inNestedBlock = true;
        currentBlock = trimmedLine.slice(0, -1);
        currentBlockData = {};
        continue;
      }
      
      // If we're in a nested block
      if (inNestedBlock) {
        // Check if the line is indented (part of the nested block)
        if (line.startsWith('  ')) {
          const match = line.match(/^\s+(\w+):\s*(.*)$/);
          if (match) {
            const [, key, value] = match;
            currentBlockData[key] = value.replace(/^["'](.*)["']$/, '$1'); // Remove quotes if present
          }
        } else {
          // We've exited the nested block
          inNestedBlock = false;
          data[currentBlock] = currentBlockData;
          
          // Process this line as a regular key-value pair
          const match = line.match(/^(\w+):\s*(.*)$/);
          if (match) {
            const [, key, value] = match;
            data[key] = value.replace(/^["'](.*)["']$/, '$1'); // Remove quotes if present
          }
        }
      } else {
        // Regular key-value pair
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (match) {
          const [, key, value] = match;
          data[key] = value.replace(/^["'](.*)["']$/, '$1'); // Remove quotes if present
        }
      }
    }
    
    // If we ended while still in a nested block, add it to the data
    if (inNestedBlock) {
      data[currentBlock] = currentBlockData;
    }
    
    return data;
  }
}

/**
 * Fix common issues in the frontmatter
 * @param {Object} data - The frontmatter data
 * @param {string} filename - The filename
 * @returns {Object} - The fixed frontmatter data
 */
function fixFrontmatterIssues(data, filename) {
  const slug = filename.replace('.md', '');
  const fixed = { ...data };
  
  // Fix missing or incorrect slug
  if (!fixed.slug || fixed.slug !== slug) {
    fixed.slug = slug;
    stats.fixedIssues.frontmatter++;
  }
  
  // Fix missing or incorrect title
  if (!fixed.title) {
    fixed.title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    stats.fixedIssues.frontmatter++;
  }
  
  // Fix date format
  if (fixed.date) {
    try {
      const date = new Date(fixed.date);
      if (!isNaN(date.getTime())) {
        fixed.date = date.toISOString();
      }
    } catch (error) {
      // If date parsing fails, use current date
      fixed.date = new Date().toISOString();
      stats.fixedIssues.frontmatter++;
    }
  } else {
    fixed.date = new Date().toISOString();
    stats.fixedIssues.frontmatter++;
  }
  
  // Fix category/type confusion
  if (fixed.country && (fixed.country.includes('Travel') || fixed.country.includes('Cruise'))) {
    // Country field contains a category, move it to the right place
    if (!fixed.type || fixed.type === 'General') {
      fixed.type = fixed.country;
    }
    fixed.country = 'Global';
    stats.fixedIssues.category++;
  }
  
  // Ensure country is set
  if (!fixed.country) {
    fixed.country = 'Global';
    stats.fixedIssues.frontmatter++;
  }
  
  // Ensure type/category is set
  if (!fixed.type) {
    if (fixed.category) {
      fixed.type = fixed.category;
    } else {
      fixed.type = 'Travel';
    }
    stats.fixedIssues.category++;
  }
  
  // Fix image URL
  if (fixed.imageUrl) {
    // Remove quotes and trim
    fixed.imageUrl = fixed.imageUrl.replace(/^["'](.*)["']$/, '$1').trim();
    
    // Ensure URL is valid
    if (!fixed.imageUrl.startsWith('http')) {
      fixed.imageUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=2400';
      stats.fixedIssues.imageUrl++;
    }
  } else {
    fixed.imageUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=2400';
    stats.fixedIssues.imageUrl++;
  }
  
  // Fix photographer information
  if (!fixed.photographer) {
    // Try to extract from imageCredit and imageLink
    if (fixed.imageCredit || fixed.imageLink) {
      fixed.photographer = {
        name: fixed.imageCredit || 'Unsplash Photographer',
        url: fixed.imageLink || 'https://unsplash.com'
      };
      stats.fixedIssues.photographer++;
    } else {
      // Default photographer
      fixed.photographer = {
        name: 'Unsplash Photographer',
        url: 'https://unsplash.com'
      };
      stats.fixedIssues.photographer++;
    }
  } else if (typeof fixed.photographer === 'string') {
    // Convert string photographer to object
    fixed.photographer = {
      name: fixed.photographer,
      url: 'https://unsplash.com'
    };
    stats.fixedIssues.photographer++;
  }
  
  // Ensure summary/excerpt is set
  if (!fixed.summary && !fixed.excerpt) {
    // Extract first sentence from content as summary
    const content = data.__content || '';
    const firstSentence = content.split(/[.!?](?:\s|$)/)[0];
    fixed.summary = firstSentence ? `${firstSentence}.` : `Article about ${fixed.type || 'travel'}.`;
    stats.fixedIssues.frontmatter++;
  }
  
  return fixed;
}

/**
 * Generate frontmatter string from data
 * @param {Object} data - The frontmatter data
 * @returns {string} - The frontmatter string
 */
function generateFrontmatter(data) {
  let frontmatter = '';
  
  // Add title
  frontmatter += `title: '${data.title}'\n`;
  
  // Add summary/excerpt
  frontmatter += `summary: '${data.summary || data.excerpt || ''}'\n`;
  
  // Add date
  frontmatter += `date: '${data.date}'\n`;
  
  // Add country
  frontmatter += `country: '${data.country}'\n`;
  
  // Add type/category
  frontmatter += `type: '${data.type || data.category || 'Travel'}'\n`;
  
  // Add image URL
  frontmatter += `imageUrl: '${data.imageUrl}'\n`;
  
  // Add slug
  frontmatter += `slug: ${data.slug}\n`;
  
  // Add meta information if available
  if (data.metaTitle) {
    frontmatter += `metaTitle: '${data.metaTitle}'\n`;
  }
  
  if (data.metaDescription) {
    frontmatter += `metaDescription: '${data.metaDescription}'\n`;
  }
  
  // Add keywords/tags
  if (data.keywords) {
    frontmatter += `keywords: '${data.keywords}'\n`;
  }
  
  // Add photographer information
  if (data.photographer) {
    frontmatter += `photographer:\n`;
    frontmatter += `  name: '${data.photographer.name || 'Unsplash Photographer'}'\n`;
    frontmatter += `  url: '${data.photographer.url || 'https://unsplash.com'}'\n`;
  }
  
  return frontmatter;
}

/**
 * Create new frontmatter for a file that doesn't have valid frontmatter
 * @param {string} content - The file content
 * @param {string} filename - The filename
 * @returns {string} - The content with new frontmatter
 */
function createNewFrontmatter(content, filename) {
  const slug = filename.replace('.md', '');
  const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  // Extract first paragraph as summary
  const firstParagraph = content.split('\n\n')[0].trim();
  const summary = firstParagraph.length > 150 ? firstParagraph.substring(0, 147) + '...' : firstParagraph;
  
  // Create new frontmatter data
  const frontmatterData = {
    title,
    summary,
    date: new Date().toISOString(),
    country: 'Global',
    type: 'Travel',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=2400',
    slug,
    photographer: {
      name: 'Unsplash Photographer',
      url: 'https://unsplash.com'
    }
  };
  
  // Generate frontmatter string
  const frontmatter = generateFrontmatter(frontmatterData);
  
  stats.fixedIssues.frontmatter++;
  
  // Return the content with new frontmatter
  return `---\n${frontmatter}---\n\n${content.trim()}`;
}

/**
 * Log a message to both console and log file
 * @param {string} message - The message to log
 */
async function log(message) {
  console.log(message);
  await fs.appendFile(LOG_FILE, message + '\n', 'utf8');
}

// Run the script if called directly
if (require.main === module) {
  fixBrokenStories()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = { fixBrokenStories };
