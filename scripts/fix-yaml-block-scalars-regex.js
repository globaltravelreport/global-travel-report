/**
 * Script to fix YAML block scalar indicators in story files using regex
 * 
 * This script:
 * 1. Uses regex to find and replace YAML block scalar indicators
 * 2. Ensures proper formatting of multi-line strings in the frontmatter
 */

const fs = require('fs');
const path = require('path');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

// Function to fix YAML block scalar indicators in all story files
async function fixYamlBlockScalarsRegex() {
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
        let fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Define regex patterns for block scalar indicators
        const summaryPattern = /(summary:\s*\|-\s*\n)(\s+.*?)(\n\w|$)/s;
        const metaDescriptionPattern = /(metaDescription:\s*\|-\s*\n)(\s+.*?)(\n\w|$)/s;
        
        // Check if the file contains block scalar indicators
        const hasSummaryBlockScalar = summaryPattern.test(fileContent);
        const hasMetaDescriptionBlockScalar = metaDescriptionPattern.test(fileContent);
        
        if (!hasSummaryBlockScalar && !hasMetaDescriptionBlockScalar) {
          continue; // Skip files without block scalar indicators
        }
        
        let updatedContent = fileContent;
        
        // Fix summary block scalar
        if (hasSummaryBlockScalar) {
          const summaryMatch = updatedContent.match(summaryPattern);
          if (summaryMatch) {
            const summaryContent = summaryMatch[2].trim();
            updatedContent = updatedContent.replace(
              summaryPattern,
              `summary: '${summaryContent}'$3`
            );
          }
        }
        
        // Fix metaDescription block scalar
        if (hasMetaDescriptionBlockScalar) {
          const metaDescriptionMatch = updatedContent.match(metaDescriptionPattern);
          if (metaDescriptionMatch) {
            const metaDescriptionContent = metaDescriptionMatch[2].trim();
            updatedContent = updatedContent.replace(
              metaDescriptionPattern,
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
fixYamlBlockScalarsRegex();
