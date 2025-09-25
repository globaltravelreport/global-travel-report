/**
 * One-time script to fix all story dates
 * 
 * This script reads all story files in the content/articles directory,
 * and ensures that each story has a consistent date across all date fields.
 * It also makes sure no story has a future date.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Get the content directory path
const getContentDir = () => {
  const contentDir = path.join(process.cwd(), 'content');
  
  // Create content directory if it doesn't exist
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }
  
  return contentDir;
};

// Get the articles directory path
const getArticlesDir = () => {
  const articlesDir = path.join(getContentDir(), 'articles');
  
  // Create articles directory if it doesn't exist
  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
  }
  
  return articlesDir;
};

/**
 * Safely convert a date string to an ISO string
 * @param {string|Date} dateStr - The date string to convert
 * @returns {string} A valid ISO date string
 */
function safeToISOString(dateStr) {
  if (!dateStr) {
    return new Date().toISOString();
  }

  try {
    // If it's already a Date object
    if (dateStr instanceof Date) {
      return dateStr.toISOString();
    }

    // Try to parse the date string
    const date = new Date(dateStr);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateStr}, using current date instead`);
      return new Date().toISOString();
    }

    return date.toISOString();
  } catch (error) {
    console.warn(`Error converting date: ${dateStr}, using current date instead`, error);
    return new Date().toISOString();
  }
}

/**
 * Fix all story dates
 */
async function fixAllStoryDates() {
  try {
    const articlesDir = getArticlesDir();

    if (!articlesDir) {
      console.error('Articles directory not found');
      return;
    }

    // Check if the articles directory exists
    if (!fs.existsSync(articlesDir)) {
      console.error('Articles directory does not exist:', articlesDir);
      return;
    }

    // Get all markdown files in the articles directory
    const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.md'));

    if (files.length === 0) {
      console.log('No story files found');
      return;
    }

    console.log(`Found ${files.length} story files`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        const filePath = path.join(articlesDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Parse frontmatter
        const { data, content } = matter(fileContent);
        
        // Get the original date
        let originalDate = null;
        
        // Try to find the most reliable date
        if (data.publishedAt) {
          originalDate = data.publishedAt;
        } else if (data.date) {
          originalDate = data.date;
        } else {
          // If no date is found, try to extract a date from the filename
          const yearMatch = file.match(/\d{4}/);
          if (yearMatch) {
            // Use January 1st of that year as a fallback
            originalDate = new Date(`${yearMatch[0]}-01-01T00:00:00.000Z`).toISOString();
          } else {
            // If we can't extract a year, use a random date in the past (1-30 days ago)
            const daysAgo = Math.floor(Math.random() * 30) + 1;
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - daysAgo);
            originalDate = pastDate.toISOString();
          }
        }
        
        // Make sure the date is valid
        let dateObj;
        try {
          dateObj = new Date(originalDate);
          if (isNaN(dateObj.getTime())) {
            throw new Error('Invalid date');
          }
        } catch (error) {
          console.log(`Invalid date in ${file}: ${originalDate}`);
          // Use a random date in the past (1-30 days ago)
          const daysAgo = Math.floor(Math.random() * 30) + 1;
          const pastDate = new Date();
          pastDate.setDate(pastDate.getDate() - daysAgo);
          dateObj = pastDate;
          originalDate = dateObj.toISOString();
        }
        
        // Make sure the date is not in the future
        const now = new Date();
        if (dateObj > now) {
          console.log(`Future date in ${file}: ${originalDate}`);
          
          // If it's a 2025 date (common issue), set it to the same day/month in 2024
          if (dateObj.getFullYear() === 2025) {
            const correctedDate = new Date(dateObj);
            correctedDate.setFullYear(2024);
            dateObj = correctedDate;
            originalDate = dateObj.toISOString();
          } else {
            // Otherwise, set it to a random date in the past (1-30 days ago)
            const daysAgo = Math.floor(Math.random() * 30) + 1;
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - daysAgo);
            dateObj = pastDate;
            originalDate = dateObj.toISOString();
          }
        }
        
        // Update the frontmatter data
        data.publishedAt = originalDate;
        data.date = originalDate;
        
        // Check if we need to update the file
        if (data.publishedAt !== originalDate || data.date !== originalDate) {
          console.log(`Fixing dates in ${file}`);
          console.log(`  Setting date to: ${originalDate}`);
          
          // Create the updated content
          const updatedContent = matter.stringify(content, data);
          
          // Write the updated content back to the file
          fs.writeFileSync(filePath, updatedContent);
          
          fixedCount++;
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        errorCount++;
      }
    }

    console.log(`Fixed ${fixedCount} files with date issues`);
    console.log(`Encountered errors in ${errorCount} files`);

  } catch (error) {
    console.error('Error fixing story dates:', error);
  }
}

// Run the script
fixAllStoryDates().then(() => {
  console.log('Done fixing all story dates');
}).catch(error => {
  console.error('Error running script:', error);
});
