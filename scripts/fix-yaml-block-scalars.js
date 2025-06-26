/**
 * Script to fix YAML block scalar indicators in story files
 * 
 * This script:
 * 1. Removes YAML block scalar indicators (|- and >-) from the frontmatter
 * 2. Ensures proper formatting of multi-line strings in the frontmatter
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

// Function to fix YAML block scalar indicators in all story files
async function fixYamlBlockScalars() {
  try {
    console.log('Starting to fix YAML block scalar indicators in all story files...');
    
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
        
        // Read the file content directly
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Check if the file contains YAML block scalar indicators
        const containsBlockScalars = fileContent.includes('summary: |-') || 
                                    fileContent.includes('metaDescription: |-') || 
                                    fileContent.includes('summary: >-') || 
                                    fileContent.includes('metaDescription: >-');
        
        if (!containsBlockScalars) {
          continue; // Skip files without block scalar indicators
        }
        
        // Fix the file content by replacing block scalar indicators
        let updatedContent = fileContent
          .replace(/summary: \|-\n/g, 'summary: "')
          .replace(/metaDescription: \|-\n/g, 'metaDescription: "')
          .replace(/summary: >-\n/g, 'summary: "')
          .replace(/metaDescription: >-\n/g, 'metaDescription: "');
        
        // Find where the block content ends and add closing quotes
        const lines = updatedContent.split('\n');
        let inSummaryBlock = false;
        let inMetaDescriptionBlock = false;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // Check if we're entering a summary block
          if (line.includes('summary: "') && !line.includes('summary: ""')) {
            inSummaryBlock = true;
            continue;
          }
          
          // Check if we're entering a metaDescription block
          if (line.includes('metaDescription: "') && !line.includes('metaDescription: ""')) {
            inMetaDescriptionBlock = true;
            continue;
          }
          
          // If we're in a block and the next line is not indented, close the block
          if ((inSummaryBlock || inMetaDescriptionBlock) && 
              (i + 1 < lines.length && !lines[i + 1].startsWith('  '))) {
            
            // Add closing quote to the current line
            if (inSummaryBlock) {
              lines[i] = lines[i] + '"';
              inSummaryBlock = false;
            }
            
            if (inMetaDescriptionBlock) {
              lines[i] = lines[i] + '"';
              inMetaDescriptionBlock = false;
            }
          }
        }
        
        // Join the lines back together
        updatedContent = lines.join('\n');
        
        // Write the updated content back to the file
        fs.writeFileSync(filePath, updatedContent);
        
        console.log(`Fixed block scalar indicators in ${file}`);
        fixedCount++;
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Finished processing files. Fixed ${fixedCount} files. Encountered ${errorCount} errors.`);
    
  } catch (error) {
    console.error('Error fixing YAML block scalar indicators:', error);
  }
}

// Run the script
fixYamlBlockScalars();
