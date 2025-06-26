/**
 * Script to ensure consistency between image URLs and photographer names
 * 
 * This script reads all story files in the content/articles directory,
 * creates a mapping of image URLs to photographer information,
 * and ensures that each unique image URL has consistent photographer attribution.
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

// Default photographer information for Unsplash
const DEFAULT_PHOTOGRAPHER = {
  name: 'Unsplash Photographer',
  url: 'https://unsplash.com'
};

/**
 * Fix image URL and photographer consistency in story files
 */
async function fixImageConsistency() {
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
    
    // First pass: Create a mapping of image URLs to photographer information
    const imageMap = new Map();
    
    for (const file of files) {
      try {
        const filePath = path.join(articlesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Parse the frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          
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
          
          // Add the photographer data to storyData
          if (Object.keys(photographerData).length > 0) {
            storyData.photographer = photographerData;
          }
          
          // If the story has an image URL and photographer information, add it to the map
          if (storyData.imageUrl && storyData.photographer) {
            // If this image URL is already in the map, check if the photographer information is different
            if (imageMap.has(storyData.imageUrl)) {
              const existingPhotographer = imageMap.get(storyData.imageUrl);
              
              // If the photographer information is different, log it
              if (existingPhotographer.name !== storyData.photographer.name || 
                  existingPhotographer.url !== storyData.photographer.url) {
                console.log(`Inconsistent photographer information for image URL: ${storyData.imageUrl}`);
                console.log(`  Existing: ${existingPhotographer.name} (${existingPhotographer.url})`);
                console.log(`  New: ${storyData.photographer.name} (${storyData.photographer.url})`);
                
                // Keep the first photographer information we found
                // (We could implement a more sophisticated selection algorithm here if needed)
              }
            } else {
              // Add the image URL and photographer information to the map
              imageMap.set(storyData.imageUrl, {
                name: storyData.photographer.name,
                url: storyData.photographer.url
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    }
    
    console.log(`Found ${imageMap.size} unique image URLs`);
    
    // Second pass: Update all story files to ensure consistent photographer information
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
          
          // Add the photographer data to storyData
          if (Object.keys(photographerData).length > 0) {
            storyData.photographer = photographerData;
          }
          
          // Check if the story has an image URL
          if (storyData.imageUrl) {
            // Get the consistent photographer information for this image URL
            const consistentPhotographer = imageMap.get(storyData.imageUrl) || DEFAULT_PHOTOGRAPHER;
            
            // Check if the photographer information needs to be updated
            let needsUpdate = false;
            
            if (!storyData.photographer) {
              needsUpdate = true;
            } else if (storyData.photographer.name !== consistentPhotographer.name || 
                       storyData.photographer.url !== consistentPhotographer.url) {
              needsUpdate = true;
            }
            
            // If the photographer information needs to be updated
            if (needsUpdate) {
              console.log(`Fixing photographer information in file: ${file}`);
              console.log(`  Image URL: ${storyData.imageUrl}`);
              console.log(`  Old photographer: ${storyData.photographer ? storyData.photographer.name : 'None'}`);
              console.log(`  New photographer: ${consistentPhotographer.name}`);
              
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
  name: "${consistentPhotographer.name}"
  url: "${consistentPhotographer.url}"
`;
              
              // Write the fixed content back to the file
              const fixedContent = `---\n${newFrontmatter}---\n\n${storyContent}`;
              fs.writeFileSync(filePath, fixedContent);
              
              fixedCount++;
            }
          }
        }
      } catch (error) {
        console.error(`Error fixing file ${file}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Fixed ${fixedCount} files with inconsistent photographer information`);
    console.log(`Encountered errors in ${errorCount} files`);
    
  } catch (error) {
    console.error('Error fixing image consistency:', error);
  }
}

// Run the script
fixImageConsistency().then(() => {
  console.log('Done fixing image consistency');
}).catch(error => {
  console.error('Error running script:', error);
});
