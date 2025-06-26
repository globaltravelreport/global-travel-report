/**
 * Script to fix photographer names in story files
 * 
 * This script reads all story files in the content/articles directory,
 * checks for invalid photographer names, and fixes them by setting a valid name.
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

/**
 * Fix photographer names in story files
 */
async function fixPhotographerNames() {
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
          let inPhotographerBlock = false;
          let photographerData = {};
          
          for (const line of frontmatterLines) {
            // Check if we're entering the photographer block
            if (line.trim() === 'photographer:') {
              inPhotographerBlock = true;
              continue;
            }
            
            // If we're in the photographer block, parse the photographer data
            if (inPhotographerBlock) {
              // Check if the line is indented (part of the photographer block)
              if (line.startsWith('  ')) {
                const match = line.match(/^\s+(\w+):\s*(.*)$/);
                if (match) {
                  const [, key, value] = match;
                  photographerData[key] = value.replace(/^"(.*)"$/, '$1'); // Remove quotes if present
                }
              } else {
                // We've exited the photographer block
                inPhotographerBlock = false;
              }
            }
            
            // Parse regular key-value pairs
            if (!inPhotographerBlock) {
              const match = line.match(/^(\w+):\s*(.*)$/);
              if (match) {
                const [, key, value] = match;
                storyData[key] = value.replace(/^"(.*)"$/, '$1'); // Remove quotes if present
              }
            }
          }
          
          // Check if the photographer name is invalid
          let needsUpdate = false;
          
          if (!photographerData.name || photographerData.name === 'undefined') {
            needsUpdate = true;
            
            // Use imageCredit if available, otherwise use a default name
            if (storyData.imageCredit && storyData.imageCredit !== '>-') {
              photographerData.name = storyData.imageCredit;
            } else {
              photographerData.name = 'Unsplash Photographer';
            }
          }
          
          if (!photographerData.url || photographerData.url === 'undefined') {
            needsUpdate = true;
            
            // Use imageLink if available, otherwise use a default URL
            if (storyData.imageLink && storyData.imageLink !== '>-') {
              photographerData.url = storyData.imageLink;
            } else {
              photographerData.url = 'https://unsplash.com';
            }
          }
          
          // If we need to update the frontmatter
          if (needsUpdate) {
            console.log(`Fixing photographer name in file: ${file}`);
            
            // Reconstruct the frontmatter
            let newFrontmatter = '';
            
            // Add all the regular key-value pairs
            for (const line of frontmatterLines) {
              // Skip the photographer block
              if (line.trim() === 'photographer:' || (inPhotographerBlock && line.startsWith('  '))) {
                continue;
              }
              
              newFrontmatter += line + '\n';
            }
            
            // Add the updated photographer block
            newFrontmatter += `photographer:
  name: "${photographerData.name}"
  url: "${photographerData.url}"
`;
            
            // Write the fixed content back to the file
            const fixedContent = `---\n${newFrontmatter}---\n\n${storyContent}`;
            fs.writeFileSync(filePath, fixedContent);
            
            fixedCount++;
          }
        }
      } catch (error) {
        console.error(`Error fixing file ${file}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Fixed ${fixedCount} files with invalid photographer names`);
    console.log(`Encountered errors in ${errorCount} files`);
    
  } catch (error) {
    console.error('Error fixing photographer names:', error);
  }
}

// Run the script
fixPhotographerNames().then(() => {
  console.log('Done fixing photographer names');
}).catch(error => {
  console.error('Error running script:', error);
});
