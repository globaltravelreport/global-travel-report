/**
 * Script to fix meta symbols in story files
 * 
 * This script:
 * 1. Removes '|-' from metaTitle fields
 * 2. Removes '|-' from other meta fields
 * 3. Ensures all stories have proper titles
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

// Function to fix meta symbols in all story files
async function fixMetaSymbols() {
  try {
    console.log('Starting to fix meta symbols in all story files...');
    
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
        
        let metaFixed = false;
        
        // Fix metaTitle with '|-'
        if (frontmatter.metaTitle === '|-') {
          frontmatter.metaTitle = frontmatter.title || '';
          metaFixed = true;
          console.log(`Fixed metaTitle for ${file}`);
        }
        
        // Fix country with '|-'
        if (frontmatter.country === '|-') {
          frontmatter.country = 'Global';
          metaFixed = true;
          console.log(`Fixed country for ${file}`);
        }
        
        // Fix title with '|-'
        if (frontmatter.title === '|-') {
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
            metaFixed = true;
            console.log(`Fixed title for ${file}: "${extractedTitle}"`);
          } else {
            // Use the filename as a fallback
            const titleFromFilename = file
              .replace('.md', '')
              .replace(/^\d+-/, '')
              .replace(/-/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
            
            frontmatter.title = titleFromFilename;
            metaFixed = true;
            console.log(`Fixed title for ${file} using filename: "${titleFromFilename}"`);
          }
        }
        
        // Fix originalTitle with '|-'
        if (frontmatter.originalTitle === '|-') {
          frontmatter.originalTitle = frontmatter.title || '';
          metaFixed = true;
          console.log(`Fixed originalTitle for ${file}`);
        }
        
        // Fix metaDescription with '|-'
        if (frontmatter.metaDescription === '|-') {
          frontmatter.metaDescription = frontmatter.excerpt || '';
          metaFixed = true;
          console.log(`Fixed metaDescription for ${file}`);
        }
        
        // Only update the file if changes were made
        if (metaFixed) {
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
    console.error('Error fixing meta symbols:', error);
  }
}

// Run the script
fixMetaSymbols();
