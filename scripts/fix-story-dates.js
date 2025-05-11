/**
 * Script to fix invalid dates in story files
 *
 * This script scans all story files in the content/articles directory
 * and fixes any invalid dates (including future dates) in the frontmatter.
 *
 * Usage:
 * ```
 * node scripts/fix-story-dates.js
 * ```
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Statistics
const stats = {
  totalFiles: 0,
  fixedFiles: 0,
  errors: 0
};

/**
 * Check if a date is valid
 * @param {string|Date} dateStr - The date to check
 * @returns {boolean} Whether the date is valid
 */
function isValidDate(dateStr) {
  if (!dateStr) return false;

  try {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
}

/**
 * Check if a date is in the future
 * @param {string|Date} dateStr - The date to check
 * @returns {boolean} Whether the date is in the future
 */
function isFutureDate(dateStr) {
  if (!dateStr) return false;

  try {
    const date = new Date(dateStr);
    const now = new Date();
    return date > now;
  } catch (error) {
    return false;
  }
}

/**
 * Check if a date is in 2025 (specific fix for our issue)
 * @param {string|Date} dateStr - The date to check
 * @returns {boolean} Whether the date is in 2025
 */
function is2025Date(dateStr) {
  if (!dateStr) return false;

  try {
    return dateStr.includes('2025');
  } catch (error) {
    return false;
  }
}

/**
 * Generate a random date within the last 30 days
 * @returns {Date} A random date within the last 30 days
 */
function getRandomRecentDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30); // Random number between 0 and 29
  return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
}

/**
 * Fix dates in a story file
 * @param {string} filePath - Path to the story file
 * @returns {boolean} Whether the file was fixed
 */
async function fixStoryFile(filePath) {
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');

    // Parse frontmatter
    const { data, content: markdownContent } = matter(content);
    let modified = false;

    // Check if the date is valid and not in the future
    if (!data.date || !isValidDate(data.date) || isFutureDate(data.date) || is2025Date(data.date)) {
      console.log(`Fixing invalid date in ${path.basename(filePath)}: ${data.date}`);
      data.date = getRandomRecentDate().toISOString();
      modified = true;
    }

    // If the file was modified, write it back
    if (modified) {
      const newContent = matter.stringify(markdownContent, data);
      fs.writeFileSync(filePath, newContent);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error fixing file ${filePath}:`, error);
    stats.errors++;
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  // Get the content directory
  const contentDir = path.join(process.cwd(), 'content');
  const articlesDir = path.join(contentDir, 'articles');

  // Check if the articles directory exists
  if (!fs.existsSync(articlesDir)) {
    console.log('Articles directory not found. Creating it...');
    fs.mkdirSync(articlesDir, { recursive: true });
    return;
  }

  // Get all markdown files
  const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.md'));
  stats.totalFiles = files.length;

  console.log(`Found ${files.length} story files. Checking for invalid dates...`);

  // Process each file
  for (const file of files) {
    const filePath = path.join(articlesDir, file);
    const fixed = await fixStoryFile(filePath);
    if (fixed) {
      stats.fixedFiles++;
    }
  }

  // Print statistics
  console.log('\nSummary:');
  console.log(`Total files: ${stats.totalFiles}`);
  console.log(`Fixed files: ${stats.fixedFiles}`);
  console.log(`Errors: ${stats.errors}`);
}

// Run the script
main().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
});
