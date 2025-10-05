#!/usr/bin/env node

/**
 * Robust SEO Enhancement Script
 * 
 * This script enhances the SEO of all existing stories by:
 * 1. Loading all stories from the content directory
 * 2. Applying SEO enhancements to each story
 * 3. Updating the stories with optimized metadata
 * 4. Generating a report of improvements made
 * 
 * This version is more robust and can handle YAML parsing issues.
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Define our own slugify function
function _slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Configuration
const CONTENT_DIR = path.join(process.cwd(), 'content/articles');
const BACKUP_DIR = path.join(process.cwd(), 'content-backup/articles');
const LOG_FILE = path.join(process.cwd(), 'logs', `robust-seo-enhancement-${new Date().toISOString().split('T')[0]}.log`);

// Popular travel-related keywords for better SEO
const POPULAR_TRAVEL_KEYWORDS = [
  'travel guide', 'best places', 'hidden gems', 'travel tips', 'must visit',
  'budget travel', 'luxury travel', 'adventure travel', 'family vacation',
  'travel itinerary', 'local cuisine', 'cultural experience', 'scenic views',
  'tourist attractions', 'off the beaten path', 'travel photography',
  'travel inspiration', 'bucket list', 'weekend getaway', 'road trip',
  'backpacking', 'solo travel', 'eco tourism', 'sustainable travel',
  'all-inclusive', 'travel deals', 'travel hacks', 'travel planning'
];

// Country-specific keywords to enhance location relevance
const COUNTRY_KEYWORDS = {
  'Australia': ['aussie', 'down under', 'outback', 'great barrier reef', 'sydney', 'melbourne'],
  'USA': ['america', 'united states', 'national parks', 'new york', 'california', 'florida'],
  'UK': ['britain', 'england', 'london', 'scotland', 'wales', 'british'],
  'France': ['paris', 'french riviera', 'provence', 'normandy', 'loire valley'],
  'Italy': ['rome', 'venice', 'florence', 'tuscany', 'amalfi coast', 'sicily'],
  'Japan': ['tokyo', 'kyoto', 'osaka', 'mount fuji', 'japanese culture'],
  'Thailand': ['bangkok', 'phuket', 'chiang mai', 'thai islands', 'thai food'],
  'Global': ['international', 'worldwide', 'global destinations', 'world travel']
};

// Category-specific keywords
const CATEGORY_KEYWORDS = {
  'Travel': ['destinations', 'places to visit', 'travel guide', 'vacation spots'],
  'Cruise': ['cruise ships', 'cruise lines', 'cruise destinations', 'cruise deals', 'cruise tips'],
  'Adventure': ['outdoor activities', 'adventure sports', 'hiking', 'trekking', 'extreme sports'],
  'Luxury': ['luxury hotels', 'luxury resorts', 'luxury travel', 'exclusive destinations'],
  'Budget': ['affordable travel', 'budget destinations', 'cheap flights', 'backpacking'],
  'Family': ['family-friendly', 'kid-friendly', 'family destinations', 'family activities'],
  'Food': ['food tourism', 'culinary travel', 'food destinations', 'local cuisine', 'food guide'],
  'Culture': ['cultural tourism', 'historical sites', 'museums', 'local traditions', 'festivals']
};

/**
 * Generate optimized tags for a story based on its content
 * @param {Object} story The story to generate tags for
 * @returns {Array} An array of optimized tags
 */
function generateOptimizedTags(story) {
  const existingTags = story.keywords ? 
    (typeof story.keywords === 'string' ? 
      story.keywords.split(',').map(k => k.trim()) : 
      []) : 
    [];
  
  const suggestedTags = [];
  
  // Add country-specific keywords
  const country = story.country || 'Global';
  const countryKeywords = COUNTRY_KEYWORDS[country] || COUNTRY_KEYWORDS['Global'];
  if (countryKeywords) {
    suggestedTags.push(...countryKeywords);
  }
  
  // Add category-specific keywords
  const category = story.type || story.category || 'Travel';
  const mainCategory = typeof category === 'string' ? 
    category.split(',')[0].trim() : 
    'Travel';
  
  const categoryKeywords = CATEGORY_KEYWORDS[mainCategory] || CATEGORY_KEYWORDS['Travel'];
  if (categoryKeywords) {
    suggestedTags.push(...categoryKeywords);
  }
  
  // Add popular travel keywords
  suggestedTags.push(...POPULAR_TRAVEL_KEYWORDS);
  
  // Extract potential keywords from title
  if (story.title) {
    const titleWords = story.title.split(' ')
      .filter(word => word.length > 5)
      .map(word => word.toLowerCase());
    
    suggestedTags.push(...titleWords);
  }
  
  // Combine existing and suggested tags, remove duplicates, and limit to 15 tags
  const allTags = [...existingTags, ...suggestedTags];
  const uniqueTags = Array.from(new Set(allTags.map(tag => tag.toLowerCase())))
    .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)); // Capitalize first letter
  
  return uniqueTags.slice(0, 15);
}

/**
 * Generate an SEO-optimized meta description
 * @param {Object} story The story to generate a description for
 * @returns {String} An optimized meta description
 */
function generateOptimizedDescription(story) {
  // Start with the excerpt if available
  let description = story.summary || story.excerpt || '';
  
  // If no excerpt, use the first 150 characters of the content
  if (!description && story.content) {
    description = story.content.substring(0, 150).trim();
    
    // Ensure it doesn't cut off in the middle of a word
    const lastSpaceIndex = description.lastIndexOf(' ');
    if (lastSpaceIndex > 0) {
      description = description.substring(0, lastSpaceIndex);
    }
    
    description += '...';
  }
  
  // If still no description, create one from the title
  if (!description && story.title) {
    description = `Discover everything about ${story.title}. Read our comprehensive guide on ${story.title} at Global Travel Report.`;
  }
  
  // Add country and category if not already mentioned
  if (story.country && story.country !== 'Global' && !description.includes(story.country)) {
    description = `${description} Explore ${story.country} with our expert travel insights.`;
  }
  
  // Ensure the description is not too long (max 160 characters)
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }
  
  return description;
}

/**
 * Generate SEO-friendly alt text for a story image
 * @param {Object} story The story the image belongs to
 * @returns {String} SEO-optimized alt text
 */
function generateSeoAltText(story) {
  // Start with the title
  let altText = story.title || '';
  
  // Add country if not in the title and not Global
  if (story.country && story.country !== 'Global' && !altText.toLowerCase().includes(story.country.toLowerCase())) {
    altText = `${altText} in ${story.country}`;
  }
  
  // Add category if not in the title
  const category = story.type || story.category || '';
  if (category && typeof category === 'string' && !altText.toLowerCase().includes(category.toLowerCase())) {
    altText = `${altText} - ${category} Guide`;
  }
  
  // Add photographer attribution
  if (story.photographer && typeof story.photographer === 'object' && story.photographer.name) {
    altText = `${altText} | Photo by ${story.photographer.name}`;
  } else if (story.photographer && typeof story.photographer === 'string') {
    altText = `${altText} | Photo by ${story.photographer}`;
  }
  
  // Ensure alt text is not too long (max 125 characters)
  if (altText.length > 125) {
    altText = altText.substring(0, 122) + '...';
  }
  
  return altText;
}

/**
 * Parse a Markdown file with YAML frontmatter
 * @param {String} content The file content
 * @returns {Object} The parsed frontmatter and content
 */
function parseMarkdownWithYaml(content) {
  try {
    // Find the YAML frontmatter
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!match) {
      return { frontmatter: {}, content: content };
    }
    
    const yamlString = match[1];
    const markdownContent = match[2];
    
    // Parse the YAML frontmatter
    let frontmatter = {};
    try {
      frontmatter = yaml.load(yamlString);
    } catch (error) {
      // If YAML parsing fails, try a more robust approach
      frontmatter = parseYamlManually(yamlString);
    }
    
    return { frontmatter, content: markdownContent };
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return { frontmatter: {}, content: content };
  }
}

/**
 * Parse YAML manually line by line
 * @param {String} yamlString The YAML string to parse
 * @returns {Object} The parsed YAML object
 */
function parseYamlManually(yamlString) {
  const result = {};
  const lines = yamlString.split('\n');
  
  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Look for key-value pairs
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Handle quoted values
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      result[key] = value;
    }
  }
  
  // Handle photographer object
  if (lines.some(line => line.trim() === 'photographer:')) {
    result.photographer = {};
    
    // Find the photographer name and URL
    const nameMatch = lines.find(line => line.trim().startsWith('name:'));
    const urlMatch = lines.find(line => line.trim().startsWith('url:'));
    
    if (nameMatch) {
      const match = nameMatch.match(/name:\s*(.*)$/);
      if (match) {
        let value = match[1].trim();
        if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        } else if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        result.photographer.name = value;
      }
    }
    
    if (urlMatch) {
      const match = urlMatch.match(/url:\s*(.*)$/);
      if (match) {
        let value = match[1].trim();
        if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        } else if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        result.photographer.url = value;
      }
    }
  }
  
  return result;
}

/**
 * Enhance a story with SEO optimizations
 * @param {Object} story The story to enhance
 * @returns {Object} The enhanced story
 */
function enhanceStoryForSEO(story) {
  // Generate optimized tags
  const optimizedTags = generateOptimizedTags(story);
  
  // Generate optimized excerpt if needed
  const excerpt = story.summary || story.excerpt || generateOptimizedDescription(story);
  
  // Generate optimized alt text
  const altText = generateSeoAltText(story);
  
  // Return the enhanced story
  return {
    ...story,
    keywords: optimizedTags.join(', '),
    excerpt,
    imageAlt: altText
  };
}

/**
 * Process a single story file
 * @param {String} filePath Path to the story file
 * @param {Object} stats Statistics object to update
 * @returns {Promise} Promise that resolves when the story is processed
 */
async function processStoryFile(filePath, stats) {
  try {
    // Read the file
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // Parse the frontmatter and content
    const { frontmatter, content } = parseMarkdownWithYaml(fileContent);
    
    // Track original values for reporting
    const originalKeywords = frontmatter.keywords || '';
    const originalExcerpt = frontmatter.summary || frontmatter.excerpt || '';
    
    // Enhance the story
    const enhancedStory = enhanceStoryForSEO({
      ...frontmatter,
      content
    });
    
    // Update the frontmatter
    const updatedFrontmatter = {
      ...frontmatter,
      keywords: enhancedStory.keywords,
      summary: enhancedStory.excerpt,
      imageAlt: enhancedStory.imageAlt
    };
    
    // Create the updated YAML frontmatter
    const yamlString = yaml.dump(updatedFrontmatter, {
      lineWidth: -1,
      quotingType: "'"
    });
    
    // Create the updated file content
    const updatedFileContent = `---\n${yamlString}---\n${content}`;
    
    // Write the updated file
    await fs.writeFile(filePath, updatedFileContent);
    
    // Update statistics
    stats.processed++;
    
    if (originalKeywords !== enhancedStory.keywords) {
      stats.keywordsUpdated++;
    }
    
    if (originalExcerpt !== enhancedStory.excerpt) {
      stats.excerptsUpdated++;
    }
    
    // Log the changes
    const changes = [];
    
    if (originalKeywords !== enhancedStory.keywords) {
      changes.push(`Keywords: "${originalKeywords}" -> "${enhancedStory.keywords}"`);
    }
    
    if (originalExcerpt !== enhancedStory.excerpt) {
      changes.push(`Excerpt: "${originalExcerpt}" -> "${enhancedStory.excerpt}"`);
    }
    
    if (changes.length > 0) {
      await fs.appendFile(LOG_FILE, `\nFile: ${path.basename(filePath)}\n${changes.join('\n')}\n`);
    }
    
    return {
      file: path.basename(filePath),
      changes
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    stats.errors++;
    await fs.appendFile(LOG_FILE, `\nError processing file ${filePath}: ${error.message}\n`);
    return null;
  }
}

/**
 * Create a backup of the content directory
 * @returns {Promise} Promise that resolves when the backup is created
 */
async function createBackup() {
  try {
    // Create the backup directory if it doesn't exist
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    // Get all files in the content directory
    const files = await fs.readdir(CONTENT_DIR);
    
    // Copy each file to the backup directory
    for (const file of files) {
      const sourcePath = path.join(CONTENT_DIR, file);
      const destPath = path.join(BACKUP_DIR, file);
      
      // Check if it's a file
      const stats = await fs.stat(sourcePath);
      if (stats.isFile()) {
        await fs.copyFile(sourcePath, destPath);
      }
    }
    
    console.log(`Backup created in ${BACKUP_DIR}`);
    return true;
  } catch (error) {
    console.error('Error creating backup:', error);
    return false;
  }
}

/**
 * Main function to enhance all stories
 */
async function enhanceAllStories() {
  try {
    // Create logs directory if it doesn't exist
    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
    
    // Initialize the log file
    await fs.writeFile(LOG_FILE, `Robust Story SEO Enhancement Log - ${new Date().toISOString()}\n\n`);
    
    console.log('Creating backup of content directory...');
    const backupCreated = await createBackup();
    
    if (!backupCreated) {
      console.error('Failed to create backup. Aborting.');
      return;
    }
    
    console.log('Reading story files...');
    const files = await fs.readdir(CONTENT_DIR);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    console.log(`Found ${markdownFiles.length} story files.`);
    
    // Initialize statistics
    const stats = {
      total: markdownFiles.length,
      processed: 0,
      keywordsUpdated: 0,
      excerptsUpdated: 0,
      errors: 0
    };
    
    console.log('Enhancing stories...');
    
    // Process each file
    for (const file of markdownFiles) {
      const filePath = path.join(CONTENT_DIR, file);
      await processStoryFile(filePath, stats);
      
      // Show progress
      process.stdout.write(`\rProcessed ${stats.processed}/${stats.total} stories...`);
    }
    
    console.log('\nDone!');
    
    // Log statistics
    const statsLog = `
Statistics:
- Total stories: ${stats.total}
- Processed: ${stats.processed}
- Keywords updated: ${stats.keywordsUpdated}
- Excerpts updated: ${stats.excerptsUpdated}
- Errors: ${stats.errors}
`;
    
    console.log(statsLog);
    await fs.appendFile(LOG_FILE, statsLog);
    
    console.log(`Log file created at: ${LOG_FILE}`);
  } catch (error) {
    console.error('Error enhancing stories:', error);
  }
}

// Run the script
enhanceAllStories();
