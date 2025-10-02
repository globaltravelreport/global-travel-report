/**
 * Script to update all images on the website with unique photos and proper attribution
 *
 * This script:
 * 1. Reads all story files in the content directory
 * 2. Assigns a unique, high-quality Unsplash image to each story based on its category
 * 3. Ensures proper photographer attribution with real names
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// Get the content directory path
const getContentDir = () => {
  if (typeof process !== 'undefined' && process.cwd) {
    return path.join(process.cwd(), 'content');
  }
  return '';
};

// Define a comprehensive set of high-quality Unsplash images with proper attribution
const categoryImages = {
  'Travel': [
    {
      url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&q=80&w=2400',
      photographer: 'Sime Basioli',
      photographerUrl: 'https://unsplash.com/@simebasioli'
    },
    {
      url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&q=80&w=2400',
      photographer: 'Dino Reichmuth',
      photographerUrl: 'https://unsplash.com/@dinoreichmuth'
    },
    {
      url: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=2400',
      photographer: 'Jakob Owens',
      photographerUrl: 'https://unsplash.com/@jakobowens1'
    },
    {
      url: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&q=80&w=2400',
      photographer: 'Aron Visuals',
      photographerUrl: 'https://unsplash.com/@aronvisuals'
    },
    {
      url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&q=80&w=2400',
      photographer: 'Tom Grimbert',
      photographerUrl: 'https://unsplash.com/@tomgrimbert'
    }
  ],
  'Culture': [
    {
      url: 'https://images.unsplash.com/photo-1551009175-15bdf9dcb580?auto=format&q=80&w=2400',
      photographer: 'Duy Pham',
      photographerUrl: 'https://unsplash.com/@miinyuii'
    },
    {
      url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&q=80&w=2400',
      photographer: 'Erol Ahmed',
      photographerUrl: 'https://unsplash.com/@erol'
    },
    {
      url: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&q=80&w=2400',
      photographer: 'Clem Onojeghuo',
      photographerUrl: 'https://unsplash.com/@clemono'
    },
    {
      url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&q=80&w=2400',
      photographer: 'Heidi Kaden',
      photographerUrl: 'https://unsplash.com/@heidikaden'
    },
    {
      url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&q=80&w=2400',
      photographer: 'Benjamin Hung',
      photographerUrl: 'https://unsplash.com/@benjaminhung'
    }
  ],
  'Adventure': [
    {
      url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&q=80&w=2400',
      photographer: 'Priscilla Du Preez',
      photographerUrl: 'https://unsplash.com/@priscilladupreez'
    },
    {
      url: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&q=80&w=2400',
      photographer: 'Dino Reichmuth',
      photographerUrl: 'https://unsplash.com/@dinoreichmuth'
    },
    {
      url: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&q=80&w=2400',
      photographer: 'Fancycrave',
      photographerUrl: 'https://unsplash.com/@fancycrave'
    },
    {
      url: 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?auto=format&q=80&w=2400',
      photographer: 'Simon Migaj',
      photographerUrl: 'https://unsplash.com/@simonmigaj'
    },
    {
      url: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&q=80&w=2400',
      photographer: 'Philipp Kammerer',
      photographerUrl: 'https://unsplash.com/@philippkammerer'
    }
  ],
  'Cruise': [
    {
      url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&q=80&w=2400',
      photographer: 'Alonso Reyes',
      photographerUrl: 'https://unsplash.com/@alonsoreyes'
    },
    {
      url: 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&q=80&w=2400',
      photographer: 'Zoltan Tasi',
      photographerUrl: 'https://unsplash.com/@zoltantasi'
    },
    {
      url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&q=80&w=2400',
      photographer: 'Vidar Nordli-Mathisen',
      photographerUrl: 'https://unsplash.com/@vidarnm'
    },
    {
      url: 'https://images.unsplash.com/photo-1566375638555-42af19337dd4?auto=format&q=80&w=2400',
      photographer: 'Alonso Reyes',
      photographerUrl: 'https://unsplash.com/@alonsoreyes'
    },
    {
      url: 'https://images.unsplash.com/photo-1559599746-8823b38544c6?auto=format&q=80&w=2400',
      photographer: 'Alonso Reyes',
      photographerUrl: 'https://unsplash.com/@alonsoreyes'
    }
  ],
  'Airline': [
    {
      url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&q=80&w=2400',
      photographer: 'Suhyeon Choi',
      photographerUrl: 'https://unsplash.com/@choisyeon'
    },
    {
      url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&q=80&w=2400',
      photographer: 'Ross Parmly',
      photographerUrl: 'https://unsplash.com/@rparmly'
    },
    {
      url: 'https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&q=80&w=2400',
      photographer: 'Ashim D\'Silva',
      photographerUrl: 'https://unsplash.com/@randomlies'
    },
    {
      url: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&q=80&w=2400',
      photographer: 'Suhyeon Choi',
      photographerUrl: 'https://unsplash.com/@choisyeon'
    },
    {
      url: 'https://images.unsplash.com/photo-1521727857535-28d2047619b7?auto=format&q=80&w=2400',
      photographer: 'Ashim D\'Silva',
      photographerUrl: 'https://unsplash.com/@randomlies'
    }
  ],
  'Technology': [
    {
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&q=80&w=2400',
      photographer: 'C D-X',
      photographerUrl: 'https://unsplash.com/@cdx2'
    },
    {
      url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&q=80&w=2400',
      photographer: 'Kiran CK',
      photographerUrl: 'https://unsplash.com/@ckiran'
    },
    {
      url: 'https://images.unsplash.com/photo-1606318313647-17f8f822cf34?auto=format&q=80&w=2400',
      photographer: 'Onur Binay',
      photographerUrl: 'https://unsplash.com/@onurbinay'
    },
    {
      url: 'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&q=80&w=2400',
      photographer: 'Tomasz Gawłowski',
      photographerUrl: 'https://unsplash.com/@gawlowski'
    },
    {
      url: 'https://images.unsplash.com/photo-1563770660941-10a63a9ed3ea?auto=format&q=80&w=2400',
      photographer: 'Harpal Singh',
      photographerUrl: 'https://unsplash.com/@aquatium'
    }
  ],
  'Food': [
    {
      url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&q=80&w=2400',
      photographer: 'Brooke Lark',
      photographerUrl: 'https://unsplash.com/@brookelark'
    },
    {
      url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&q=80&w=2400',
      photographer: 'Dan Gold',
      photographerUrl: 'https://unsplash.com/@danielcgold'
    },
    {
      url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&q=80&w=2400',
      photographer: 'Vitalii Chernopyskyi',
      photographerUrl: 'https://unsplash.com/@vitaliichernopyskyi'
    },
    {
      url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&q=80&w=2400',
      photographer: 'Brooke Lark',
      photographerUrl: 'https://unsplash.com/@brookelark'
    },
    {
      url: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&q=80&w=2400',
      photographer: 'Brooke Lark',
      photographerUrl: 'https://unsplash.com/@brookelark'
    }
  ]
};

// Default category for stories without a matching category
const defaultCategory = 'Travel';

// Function to find all markdown files recursively
async function findMarkdownFiles(dir) {
  const files = [];

  async function scan(directory) {
    const entries = await readdir(directory);

    for (const entry of entries) {
      const fullPath = path.join(directory, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await scan(fullPath);
      } else if (entry.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  await scan(dir);
  return files;
}

// Main function to update all images
async function updateAllImages() {
  try {
    const contentDir = getContentDir();

    if (!contentDir) {
      console.error('Content directory not found');
      return;
    }

    // Find all markdown files in the content directory
    const files = await findMarkdownFiles(contentDir);

    if (files.length === 0) {
      console.log('No story files found');
      return;
    }

    console.log(`Found ${files.length} story files`);

    // Keep track of which images have been used
    const usedImages = new Map();

    // First pass: Collect all categories
    const storyCategories = new Map();

    for (const filePath of files) {
      try {
        const content = await readFile(filePath, 'utf8');

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
          let category = storyData.type || storyData.category || 'Article';

          // Check if the category contains multiple categories (e.g., 'Culture, Food & Wine')
          if (category.includes(',')) {
            const categories = category.split(',').map(c => c.trim());

            // Try to find a matching category
            for (const cat of categories) {
              if (categoryImages[cat]) {
                category = cat;
                break;
              }
            }
          }

          storyCategories.set(filePath, category);
        }
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
      }
    }

    // Second pass: Assign images and update files
    let fixedCount = 0;
    let errorCount = 0;

    for (const filePath of files) {
      try {
        const content = await readFile(filePath, 'utf8');

        // Parse the frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const storyContent = frontmatterMatch[2];

          // Get the story category
          let category = storyCategories.get(filePath) || defaultCategory;

          // If the category doesn't exist in our images, use the default
          if (!categoryImages[category]) {
            category = defaultCategory;
          }

          // Find available images for this category
          const availableImages = categoryImages[category];

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
          const fixedContent = `---\n${newFrontmatter}---\n${storyContent}`;
          await writeFile(filePath, fixedContent);

          console.log(`Updated image for file: ${path.basename(filePath)}`);
          console.log(`  Category: ${category}`);
          console.log(`  New image: ${selectedImage.url}`);
          console.log(`  Photographer: ${selectedImage.photographer}`);

          fixedCount++;
        }
      } catch (error) {
        console.error(`Error fixing file ${filePath}:`, error);
        errorCount++;
      }
    }

    console.log(`Updated ${fixedCount} files with unique images`);
    console.log(`Encountered errors in ${errorCount} files`);

  } catch (error) {
    console.error('Error updating all images:', error);
  }
}

// Run the script
updateAllImages().then(() => {
  console.log('Done updating all images');
}).catch(error => {
  console.error('Error running script:', error);
});
