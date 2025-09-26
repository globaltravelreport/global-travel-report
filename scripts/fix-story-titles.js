/**
 * Script to fix story titles by removing "Title: " prefix and duplicate titles
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

// Function to fix story titles
async function fixStoryTitles() {
  try {
    console.log('Starting to fix story titles...');
    
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
        if (frontmatter.title && frontmatter.title.startsWith('Title: ')) {
          // Remove the "Title: " prefix
          frontmatter.title = frontmatter.title.replace(/^Title:\s*/, '');
          titleFixed = true;
        }
        
        // Also remove any quotes around the title if they exist
        if (frontmatter.title && (frontmatter.title.startsWith('"') || frontmatter.title.startsWith("'"))) {
          frontmatter.title = frontmatter.title.replace(/^["'](.*)["']$/, '$1');
          titleFixed = true;
        }
        
        // Check if the content starts with the title
        let contentFixed = false;
        let updatedContent = content;
        
        // Remove the title from the beginning of the content if it exists
        if (frontmatter.title) {
          const titleRegex = new RegExp(`^\\s*Title:\\s*["']?${escapeRegExp(frontmatter.title)}["']?\\s*\\n+`, 'm');
          if (titleRegex.test(updatedContent)) {
            updatedContent = updatedContent.replace(titleRegex, '');
            contentFixed = true;
          }
          
          // Also check for just the title without "Title: "
          const plainTitleRegex = new RegExp(`^\\s*["']?${escapeRegExp(frontmatter.title)}["']?\\s*\\n+`, 'm');
          if (plainTitleRegex.test(updatedContent)) {
            updatedContent = updatedContent.replace(plainTitleRegex, '');
            contentFixed = true;
          }
        }
        
        // Remove "Metadata:" from the end of the content if it exists
        if (updatedContent.includes('Metadata:')) {
          updatedContent = updatedContent.replace(/\s*Metadata:\s*$/, '');
          contentFixed = true;
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
    console.error('Error fixing story titles:', error);
  }
}

// Helper function to escape special characters in a string for use in a regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Run the script
fixStoryTitles();
