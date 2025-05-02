/**
 * Script to fix invalid dates in story files
 *
 * This script reads all story files in the content/articles directory,
 * checks for invalid dates, and fixes them by setting a valid date.
 */

const fs = require('fs');
const path = require('path');

// Get the content directory path
const getContentDir = () => {
  if (typeof process !== 'undefined' && process.cwd) {
    return path.join(process.cwd(), 'content');
  }
  return '';
};

// Get the articles directory path
const getArticlesDir = () => {
  const contentDir = getContentDir();
  if (contentDir) {
    return path.join(contentDir, 'articles');
  }
  return '';
};

/**
 * Safely convert a date string to an ISO string
 * @param dateStr - The date string to convert
 * @returns A valid ISO date string
 */
function safeToISOString(dateStr: string | Date | undefined): string {
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
 * Fix invalid dates in story files
 */
async function fixStoryDates() {
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
        const content = fs.readFileSync(filePath, 'utf8');

        // Parse the frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const storyContent = frontmatterMatch[2];

          // Parse the frontmatter into key-value pairs
          const frontmatterLines = frontmatter.split('\n');
          const storyData: Record<string, any> = {};

          for (const line of frontmatterLines) {
            const match = line.match(/^(\w+):\s*(.*)$/);
            if (match) {
              const [, key, value] = match;
              storyData[key] = value.replace(/^"(.*)"$/, '$1'); // Remove quotes if present
            }
          }

          // Check if the date is valid
          let dateIsValid = true;
          if (storyData.date) {
            try {
              const date = new Date(storyData.date);
              dateIsValid = !isNaN(date.getTime());
            } catch (error) {
              dateIsValid = false;
            }
          }

          // If the date is invalid, fix it
          if (!dateIsValid || !storyData.date) {
            console.log(`Fixing invalid date in file: ${file}`);

            // Set a new valid date
            storyData.date = new Date().toISOString();

            // Reconstruct the frontmatter
            let newFrontmatter = '---\n';
            for (const key in storyData) {
              if (key === 'tags' && Array.isArray(storyData[key])) {
                newFrontmatter += `${key}: "${storyData[key].join(', ')}"\n`;
              } else {
                newFrontmatter += `${key}: "${storyData[key]}"\n`;
              }
            }
            newFrontmatter += '---\n';

            // Write the fixed content back to the file
            const fixedContent = `${newFrontmatter}\n${storyContent}`;
            fs.writeFileSync(filePath, fixedContent);

            fixedCount++;
          }
        }
      } catch (error) {
        console.error(`Error fixing file ${file}:`, error);
        errorCount++;
      }
    }

    console.log(`Fixed ${fixedCount} files with invalid dates`);
    console.log(`Encountered errors in ${errorCount} files`);

  } catch (error) {
    console.error('Error fixing story dates:', error);
  }
}

// Run the script
fixStoryDates().then(() => {
  console.log('Done fixing story dates');
}).catch(error => {
  console.error('Error running script:', error);
});
