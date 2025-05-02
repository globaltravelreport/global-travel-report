/**
 * Script to fix invalid image URLs in story files
 * 
 * This script reads all story files in the content/articles directory,
 * checks for invalid image URLs, and fixes them by setting a valid URL.
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

// Default image URL to use when an invalid URL is found
const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

/**
 * Check if a URL is valid
 * @param url - The URL to check
 * @returns Whether the URL is valid
 */
function isValidUrl(url: string): boolean {
  if (!url || url === '">-"' || url === '') {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Fix invalid image URLs in story files
 */
async function fixImageUrls() {
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
          
          // Check if the image URL is valid
          let imageUrlIsValid = false;
          if (storyData.imageUrl) {
            imageUrlIsValid = isValidUrl(storyData.imageUrl);
          }
          
          // If the image URL is invalid, fix it
          if (!imageUrlIsValid) {
            console.log(`Fixing invalid image URL in file: ${file}`);
            
            // Set a new valid image URL
            storyData.imageUrl = DEFAULT_IMAGE_URL;
            
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
    
    console.log(`Fixed ${fixedCount} files with invalid image URLs`);
    console.log(`Encountered errors in ${errorCount} files`);
    
  } catch (error) {
    console.error('Error fixing image URLs:', error);
  }
}

// Run the script
fixImageUrls().then(() => {
  console.log('Done fixing image URLs');
}).catch(error => {
  console.error('Error running script:', error);
});
