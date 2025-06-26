/**
 * Script to assign unique Unsplash images to stories
 *
 * This script reads all story files in the content/articles directory,
 * and assigns a unique Unsplash image to each story based on its category.
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

// Define a set of high-quality Unsplash images for different categories
const categoryImages = {
  'Travel': [
    {
      url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Sime Basioli',
      photographerUrl: 'https://unsplash.com/@simebasioli'
    },
    {
      url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Dino Reichmuth',
      photographerUrl: 'https://unsplash.com/@dinoreichmuth'
    },
    {
      url: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2031&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Jakob Owens',
      photographerUrl: 'https://unsplash.com/@jakobowens1'
    }
  ],
  'Culture': [
    {
      url: 'https://images.unsplash.com/photo-1551009175-15bdf9dcb580?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Duy Pham',
      photographerUrl: 'https://unsplash.com/@miinyuii'
    },
    {
      url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Erol Ahmed',
      photographerUrl: 'https://unsplash.com/@erol'
    },
    {
      url: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Clem Onojeghuo',
      photographerUrl: 'https://unsplash.com/@clemono'
    }
  ],
  'Adventure': [
    {
      url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Priscilla Du Preez',
      photographerUrl: 'https://unsplash.com/@priscilladupreez'
    },
    {
      url: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Dino Reichmuth',
      photographerUrl: 'https://unsplash.com/@dinoreichmuth'
    },
    {
      url: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Fancycrave',
      photographerUrl: 'https://unsplash.com/@fancycrave'
    }
  ],
  'Cruise': [
    {
      url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=2064&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Alonso Reyes',
      photographerUrl: 'https://unsplash.com/@alonsoreyes'
    },
    {
      url: 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Zoltan Tasi',
      photographerUrl: 'https://unsplash.com/@zoltantasi'
    },
    {
      url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=2052&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Vidar Nordli-Mathisen',
      photographerUrl: 'https://unsplash.com/@vidarnm'
    }
  ],
  'Technology': [
    {
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'C D-X',
      photographerUrl: 'https://unsplash.com/@cdx2'
    },
    {
      url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Kiran CK',
      photographerUrl: 'https://unsplash.com/@ckiran'
    },
    {
      url: 'https://images.unsplash.com/photo-1606318313647-17f8f822cf34?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Onur Binay',
      photographerUrl: 'https://unsplash.com/@onurbinay'
    }
  ],
  'Article': [
    {
      url: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2031&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Jakob Owens',
      photographerUrl: 'https://unsplash.com/@jakobowens1'
    },
    {
      url: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Aron Visuals',
      photographerUrl: 'https://unsplash.com/@aronvisuals'
    },
    {
      url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      photographer: 'Dino Reichmuth',
      photographerUrl: 'https://unsplash.com/@dinoreichmuth'
    }
  ]
};

// Default category for stories without a matching category
const defaultCategory = 'Travel';

/**
 * Assign unique images to stories
 */
async function assignUniqueImages() {
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

    // Keep track of which images have been used
    const usedImages = new Map();

    // First pass: Collect all categories and prepare image assignments
    const storyCategories = new Map();

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

          for (const line of frontmatterLines) {
            const match = line.match(/^(\w+):\s*(.*)$/);
            if (match) {
              const [, key, value] = match;
              storyData[key] = value.replace(/^"(.*)"$/, '$1'); // Remove quotes if present
            }
          }

          // Get the story category (or type)
          const category = storyData.type || 'Article';
          storyCategories.set(file, category);
        }
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    }

    // Second pass: Assign images and update files
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

          // Get the story category
          const category = storyCategories.get(file) || defaultCategory;

          // Find available images for this category
          let availableImages = categoryImages[category] || categoryImages[defaultCategory];

          // If all images for this category have been used, reset the used images for this category
          if (availableImages.every(img => usedImages.has(img.url))) {
            availableImages.forEach(img => usedImages.delete(img.url));
          }

          // Select the first unused image
          const selectedImage = availableImages.find(img => !usedImages.has(img.url)) || availableImages[0];

          // Mark this image as used
          usedImages.set(selectedImage.url, true);

          // Reconstruct the frontmatter with the new image URL and photographer
          let newFrontmatter = '';
          let inPhotographerBlock = false;
          let imageUrlUpdated = false;

          const frontmatterLines = frontmatter.split('\n');

          for (const line of frontmatterLines) {
            // Skip the photographer block, we'll add it later
            if (line.trim() === 'photographer:') {
              inPhotographerBlock = true;
              continue;
            }

            if (inPhotographerBlock) {
              if (line.startsWith('  ')) {
                continue;
              } else {
                inPhotographerBlock = false;
              }
            }

            // Update the imageUrl line
            if (line.startsWith('imageUrl:')) {
              newFrontmatter += `imageUrl: "${selectedImage.url}"\n`;
              imageUrlUpdated = true;
            } else {
              newFrontmatter += line + '\n';
            }
          }

          // Add the imageUrl line if it wasn't updated
          if (!imageUrlUpdated) {
            newFrontmatter += `imageUrl: "${selectedImage.url}"\n`;
          }

          // Add the photographer block
          newFrontmatter += `photographer:
  name: "${selectedImage.photographer}"
  url: "${selectedImage.photographerUrl}"
`;

          // Write the fixed content back to the file
          const fixedContent = `---\n${newFrontmatter}---\n\n${storyContent}`;
          fs.writeFileSync(filePath, fixedContent);

          console.log(`Updated image for file: ${file}`);
          console.log(`  Category: ${category}`);
          console.log(`  New image: ${selectedImage.url}`);
          console.log(`  Photographer: ${selectedImage.photographer}`);

          fixedCount++;
        }
      } catch (error) {
        console.error(`Error fixing file ${file}:`, error);
        errorCount++;
      }
    }

    console.log(`Updated ${fixedCount} files with unique images`);
    console.log(`Encountered errors in ${errorCount} files`);

  } catch (error) {
    console.error('Error assigning unique images:', error);
  }
}

// Run the script
assignUniqueImages().then(() => {
  console.log('Done assigning unique images');
}).catch(error => {
  console.error('Error running script:', error);
});
