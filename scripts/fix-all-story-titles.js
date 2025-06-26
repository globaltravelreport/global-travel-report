/**
 * Comprehensive script to fix all story titles and content
 * 
 * This script:
 * 1. Removes "Title: " prefix from all story titles in the frontmatter
 * 2. Removes unnecessary quotes around titles
 * 3. Removes duplicate titles from the beginning of story content
 * 4. Removes "Metadata:" text at the end of stories
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

// Function to fix all story titles and content
async function fixAllStoryTitles() {
  try {
    console.log('Starting to fix all story titles and content...');
    
    // Check if the articles directory exists
    if (!fs.existsSync(ARTICLES_DIRECTORY)) {
      console.error('Articles directory does not exist:', ARTICLES_DIRECTORY);
      return;
    }
    
    // Get all markdown files in the articles directory
    const files = fs.readdirSync(ARTICLES_DIRECTORY).filter(file => file.endsWith('.md'));
    
    if (files.length === 0) {
      console.log('No story files found');
      return;
    }
    
    console.log(`Found ${files.length} story files to process`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    // Process each file
    for (const file of files) {
      try {
        const filePath = path.join(ARTICLES_DIRECTORY, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Parse the frontmatter
        const { data: frontmatter, content } = matter(fileContent);
        
        // Check if the title has "Title: " prefix
        let titleFixed = false;
        if (frontmatter.title && typeof frontmatter.title === 'string') {
          // Store the original title for comparison
          const originalTitle = frontmatter.title;
          
          // Remove the "Title: " prefix
          frontmatter.title = frontmatter.title.replace(/^Title:\s*/, '');
          
          // Also remove any quotes around the title if they exist
          if (frontmatter.title.startsWith('"') || frontmatter.title.startsWith("'")) {
            frontmatter.title = frontmatter.title.replace(/^["'](.*)["']$/, '$1');
          }
          
          // Check if the title was changed
          if (originalTitle !== frontmatter.title) {
            titleFixed = true;
          }
        }
        
        // Check if the content starts with the title
        let contentFixed = false;
        let updatedContent = content;
        
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
              contentFixed = true;
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
            contentFixed = true;
          }
        }
        
        // Only update the file if changes were made
        if (titleFixed || contentFixed) {
          // Write the updated content back to the file
          const updatedFileContent = matter.stringify(updatedContent, frontmatter);
          fs.writeFileSync(filePath, updatedFileContent);
          
          console.log(`Updated title for ${file}: ${frontmatter.title}`);
          fixedCount++;
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Finished processing files. Fixed ${fixedCount} files. Encountered ${errorCount} errors.`);
    
  } catch (error) {
    console.error('Error fixing all story titles:', error);
  }
}

// Helper function to escape special characters in a string for use in a regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Run the script
fixAllStoryTitles();
