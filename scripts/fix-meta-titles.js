/**
 * Script to fix meta titles and empty titles in story files
 * 
 * This script:
 * 1. Fixes empty titles by extracting them from the content
 * 2. Removes '>-' from metaTitle and originalTitle fields
 * 3. Updates the title field with the actual title from the content
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

// Function to fix meta titles in all story files
async function fixMetaTitles() {
  try {
    console.log('Starting to fix meta titles in all story files...');
    
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
        
        let titleFixed = false;
        
        // Fix empty title by extracting it from the content
        if (!frontmatter.title || frontmatter.title === '') {
          // Extract the title from the content
          const contentLines = content.trim().split('\n');
          let extractedTitle = '';
          
          // Look for the first non-empty line in the content
          for (const line of contentLines) {
            if (line.trim() !== '') {
              extractedTitle = line.trim();
              break;
            }
          }
          
          if (extractedTitle) {
            frontmatter.title = extractedTitle;
            titleFixed = true;
            console.log(`Fixed empty title for ${file}: "${extractedTitle}"`);
          }
        }
        
        // Fix metaTitle with '>-'
        if (frontmatter.metaTitle === '>-') {
          frontmatter.metaTitle = frontmatter.title || '';
          titleFixed = true;
          console.log(`Fixed metaTitle for ${file}`);
        }
        
        // Fix originalTitle with '>-'
        if (frontmatter.originalTitle === '>-') {
          frontmatter.originalTitle = frontmatter.title || '';
          titleFixed = true;
          console.log(`Fixed originalTitle for ${file}`);
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
    console.error('Error fixing meta titles:', error);
  }
}

// Run the script
fixMetaTitles();
