/**
 * Script to fix photographer attribution in story files
 * 
 * This script reads all story files in the content/articles directory,
 * checks for missing photographer information, and adds it based on imageCredit and imageLink fields.
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

// Default photographer information
const DEFAULT_PHOTOGRAPHER = {
  name: 'Unsplash Photographer',
  url: 'https://unsplash.com'
};

/**
 * Fix photographer attribution in story files
 */
async function fixPhotographerAttribution() {
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
          
          // Check if the photographer information is missing or incomplete
          let needsUpdate = false;
          
          // Check if photographer field exists
          if (!storyData.photographer) {
            needsUpdate = true;
          }
          
          // Extract photographer name from imageCredit if available
          let photographerName = DEFAULT_PHOTOGRAPHER.name;
          let photographerUrl = DEFAULT_PHOTOGRAPHER.url;
          
          if (storyData.imageCredit && storyData.imageCredit !== '>-') {
            photographerName = storyData.imageCredit;
          }
          
          if (storyData.imageLink && storyData.imageLink !== '>-') {
            photographerUrl = storyData.imageLink;
          }
          
          // If we need to update the frontmatter
          if (needsUpdate) {
            console.log(`Fixing photographer attribution in file: ${file}`);
            
            // Add photographer information to the frontmatter
            storyData.photographer = {
              name: photographerName,
              url: photographerUrl
            };
            
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
    
    console.log(`Fixed ${fixedCount} files with missing photographer attribution`);
    console.log(`Encountered errors in ${errorCount} files`);
    
  } catch (error) {
    console.error('Error fixing photographer attribution:', error);
  }
}

// Run the script
fixPhotographerAttribution().then(() => {
  console.log('Done fixing photographer attribution');
}).catch(error => {
  console.error('Error running script:', error);
});
