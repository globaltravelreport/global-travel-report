/**
 * Script to fix invalid imageLink values in story files
 * 
 * This script reads all story files in the content/articles directory,
 * checks for invalid imageLink values, and fixes them by setting a valid URL.
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

// Default image link URL
const DEFAULT_IMAGE_LINK = 'https://unsplash.com';

/**
 * Fix invalid imageLink values in story files
 */
async function fixImageLinks() {
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
          const storyData = {};
          
          for (const line of frontmatterLines) {
            const match = line.match(/^(\w+):\s*(.*)$/);
            if (match) {
              const [, key, value] = match;
              storyData[key] = value.replace(/^"(.*)"$/, '$1'); // Remove quotes if present
            }
          }
          
          // Check if the imageLink is invalid
          let needsUpdate = false;
          
          if (storyData.imageLink === '>-' || !storyData.imageLink) {
            needsUpdate = true;
            storyData.imageLink = DEFAULT_IMAGE_LINK;
            
            // If there's a photographer URL, use that instead
            if (storyData.photographer && storyData.photographer.url) {
              storyData.imageLink = storyData.photographer.url;
            }
          }
          
          // If we need to update the frontmatter
          if (needsUpdate) {
            console.log(`Fixing invalid imageLink in file: ${file}`);
            
            // Reconstruct the frontmatter
            let newFrontmatter = '---\n';
            for (const key in storyData) {
              if (key === 'tags' && Array.isArray(storyData[key])) {
                newFrontmatter += `${key}: "${storyData[key].join(', ')}"\n`;
              } else if (key === 'photographer') {
                newFrontmatter += `photographer:\n  name: "${storyData[key].name}"\n  url: "${storyData[key].url}"\n`;
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
    
    console.log(`Fixed ${fixedCount} files with invalid imageLink values`);
    console.log(`Encountered errors in ${errorCount} files`);
    
  } catch (error) {
    console.error('Error fixing imageLink values:', error);
  }
}

// Run the script
fixImageLinks().then(() => {
  console.log('Done fixing imageLink values');
}).catch(error => {
  console.error('Error running script:', error);
});
