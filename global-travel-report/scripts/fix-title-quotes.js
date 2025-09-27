/**
 * Script to fix title quotes in all story files
 * 
 * This script:
 * 1. Removes unnecessary quotes around titles
 * 2. Fixes escaped apostrophes in titles
 * 3. Removes ">" and "-" characters from titles
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

// Function to fix title quotes in all story files
async function fixTitleQuotes() {
  try {
    console.log('Starting to fix title quotes in all story files...');
    
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
        
        // Check if the title has quotes or special characters
        let titleFixed = false;
        if (frontmatter.title && typeof frontmatter.title === 'string') {
          // Store the original title for comparison
          const originalTitle = frontmatter.title;
          
          // Remove quotes around the title
          if (frontmatter.title.startsWith("'") || frontmatter.title.startsWith('"')) {
            frontmatter.title = frontmatter.title.replace(/^['"](.*)['"]$/, '$1');
          }
          
          // Fix escaped apostrophes
          frontmatter.title = frontmatter.title.replace(/''/, "'");
          
          // Remove ">" and "-" characters
          frontmatter.title = frontmatter.title.replace(/^>-\s*/, '');
          
          // Check if the title was changed
          if (originalTitle !== frontmatter.title) {
            titleFixed = true;
            console.log(`Fixed title for ${file}: "${originalTitle}" -> "${frontmatter.title}"`);
          }
        }
        
        // Only update the file if changes were made
        if (titleFixed) {
          // Write the updated content back to the file
          const updatedFileContent = matter.stringify(content, frontmatter);
          fs.writeFileSync(filePath, updatedFileContent);
          
          fixedCount++;
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Finished processing files. Fixed ${fixedCount} files. Encountered ${errorCount} errors.`);
    
  } catch (error) {
    console.error('Error fixing title quotes:', error);
  }
}

// Run the script
fixTitleQuotes();
