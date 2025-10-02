/**
 * Script to fix YAML block scalar indicators in story files using direct string replacement
 * 
 * This script:
 * 1. Directly modifies the file content to remove YAML block scalar indicators
 * 2. Ensures proper formatting of multi-line strings in the frontmatter
 */

const fs = require('fs');
const path = require('path');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

// Function to fix YAML block scalar indicators in all story files
async function fixYamlBlockScalarsDirect() {
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
        
        // Replace the block scalar indicators with simple string values
        let updatedContent = fileContent;
        
        // Replace summary block
        if (updatedContent.includes('summary: |-') || updatedContent.includes('summary: >-')) {
          // Extract the summary content
          const summaryMatch = updatedContent.match(/summary: (\|-|>-)\n([\s\S]*?)(\n\w|$)/);
          
          if (summaryMatch) {
            const summaryContent = summaryMatch[2].trim();
            // Replace the entire summary block with a simple string
            updatedContent = updatedContent.replace(
              /summary: (\|-|>-)\n[\s\S]*?(\n\w|$)/,
              `summary: '${summaryContent}'$2`
            );
          }
        }
        
        // Replace metaDescription block
        if (updatedContent.includes('metaDescription: |-') || updatedContent.includes('metaDescription: >-')) {
          // Extract the metaDescription content
          const metaDescriptionMatch = updatedContent.match(/metaDescription: (\|-|>-)\n([\s\S]*?)(\n\w|$)/);
          
          if (metaDescriptionMatch) {
            const metaDescriptionContent = metaDescriptionMatch[2].trim();
            // Replace the entire metaDescription block with a simple string
            updatedContent = updatedContent.replace(
              /metaDescription: (\|-|>-)\n[\s\S]*?(\n\w|$)/,
              `metaDescription: '${metaDescriptionContent}'$3`
            );
          }
        }
        
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
fixYamlBlockScalarsDirect();
