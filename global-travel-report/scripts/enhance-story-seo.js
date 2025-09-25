#!/usr/bin/env node

/**
 * Story SEO Enhancement Script
 *
 * This script enhances the SEO of all existing stories by:
 * 1. Loading all stories from the content directory
 * 2. Applying SEO enhancements to each story
 * 3. Updating the stories with optimized metadata
 * 4. Generating a report of improvements made
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

// Define our own slugify function since we can't import it
function slugify(text) {
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
const LOG_FILE = path.join(process.cwd(), 'logs', `story-seo-enhancement-${new Date().toISOString().split('T')[0]}.log`);

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
  const existingTags = story.keywords ? story.keywords.split(',').map(k => k.trim()) : [];
  const suggestedTags = [];

  // Add country-specific keywords
  const countryKeywords = COUNTRY_KEYWORDS[story.country] || COUNTRY_KEYWORDS['Global'];
  suggestedTags.push(...countryKeywords);

  // Add category-specific keywords
  const mainCategory = (story.category || 'Travel').split(',')[0].trim();
  const categoryKeywords = CATEGORY_KEYWORDS[mainCategory] || CATEGORY_KEYWORDS['Travel'];
  suggestedTags.push(...categoryKeywords);

  // Add popular travel keywords
  suggestedTags.push(...POPULAR_TRAVEL_KEYWORDS);

  // Extract potential keywords from title and content
  const titleWords = story.title.split(' ')
    .filter(word => word.length > 5)
    .map(word => word.toLowerCase());

  suggestedTags.push(...titleWords);

  // Combine existing and suggested tags, remove duplicates, and limit to 15 tags
  const allTags = [...existingTags, ...suggestedTags];
  const uniqueTags = Array.from(new Set(allTags.map(tag => tag.toLowerCase())))
    .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)); // Capitalize first letter

  return uniqueTags.slice(0, 15);
}

/**
 * Generate an SEO-optimized slug for a story
 * @param {Object} story The story to generate a slug for
 * @returns {String} An optimized slug
 */
function generateOptimizedSlug(story) {
  // Start with the title
  let baseSlug = story.title;

  // Add country if it's not already in the title
  if (story.country && story.country !== 'Global' && !story.title.includes(story.country)) {
    baseSlug = `${baseSlug} ${story.country}`;
  }

  // Add main category if it's not already in the title
  const mainCategory = (story.category || 'Travel').split(',')[0].trim();
  if (mainCategory && !story.title.toLowerCase().includes(mainCategory.toLowerCase())) {
    baseSlug = `${baseSlug} ${mainCategory}`;
  }

  // Generate the slug
  const optimizedSlug = slugify(baseSlug);

  // Ensure the slug is not too long (max 60 characters)
  return optimizedSlug.length > 60 ? optimizedSlug.substring(0, 60) : optimizedSlug;
}

/**
 * Generate an SEO-optimized meta description
 * @param {Object} story The story to generate a description for
 * @returns {String} An optimized meta description
 */
function generateOptimizedDescription(story) {
  // Start with the excerpt if available
  let description = story.excerpt || '';

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
  if (!description) {
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
  let altText = story.title;

  // Add country if not in the title and not Global
  if (story.country && story.country !== 'Global' && !altText.toLowerCase().includes(story.country.toLowerCase())) {
    altText = `${altText} in ${story.country}`;
  }

  // Add category if not in the title
  if (story.category && !altText.toLowerCase().includes(story.category.toLowerCase())) {
    altText = `${altText} - ${story.category} Guide`;
  }

  // Add photographer attribution
  if (story.photographer) {
    altText = `${altText} | Photo by ${story.photographer}`;
  }

  // Ensure alt text is not too long (max 125 characters)
  if (altText.length > 125) {
    altText = altText.substring(0, 122) + '...';
  }

  return altText;
}

/**
 * Enhance a story with SEO optimizations
 * @param {Object} story The story to enhance
 * @returns {Object} The enhanced story
 */
function enhanceStoryForSEO(story) {
  // Generate optimized tags
  const optimizedTags = generateOptimizedTags(story);

  // Generate optimized slug if needed
  const currentSlug = story.slug || '';
  const optimizedSlug = generateOptimizedSlug(story);
  const slug = currentSlug.length > 0 ? currentSlug : optimizedSlug;

  // Generate optimized excerpt if needed
  const excerpt = story.excerpt || generateOptimizedDescription(story);

  // Generate optimized alt text
  const altText = generateSeoAltText(story);

  // Return the enhanced story
  return {
    ...story,
    keywords: optimizedTags.join(', '),
    slug,
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

    // Parse the frontmatter
    const { data: frontmatter, content } = matter(fileContent);

    // Track original values for reporting
    const originalKeywords = frontmatter.keywords || '';
    const originalSlug = frontmatter.slug || '';
    const originalExcerpt = frontmatter.excerpt || '';

    // Enhance the story
    const enhancedStory = enhanceStoryForSEO({
      ...frontmatter,
      content
    });

    // Update the frontmatter
    const updatedFrontmatter = {
      ...frontmatter,
      keywords: enhancedStory.keywords,
      slug: enhancedStory.slug,
      excerpt: enhancedStory.excerpt,
      imageAlt: enhancedStory.imageAlt
    };

    // Create the updated file content
    const updatedFileContent = matter.stringify(content, updatedFrontmatter);

    // Write the updated file
    await fs.writeFile(filePath, updatedFileContent);

    // Update statistics
    stats.processed++;

    if (originalKeywords !== enhancedStory.keywords) {
      stats.keywordsUpdated++;
    }

    if (originalSlug !== enhancedStory.slug) {
      stats.slugsUpdated++;
    }

    if (originalExcerpt !== enhancedStory.excerpt) {
      stats.excerptsUpdated++;
    }

    // Log the changes
    const changes = [];

    if (originalKeywords !== enhancedStory.keywords) {
      changes.push(`Keywords: "${originalKeywords}" -> "${enhancedStory.keywords}"`);
    }

    if (originalSlug !== enhancedStory.slug) {
      changes.push(`Slug: "${originalSlug}" -> "${enhancedStory.slug}"`);
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
    await fs.writeFile(LOG_FILE, `Story SEO Enhancement Log - ${new Date().toISOString()}\n\n`);

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
      slugsUpdated: 0,
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
- Slugs updated: ${stats.slugsUpdated}
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
