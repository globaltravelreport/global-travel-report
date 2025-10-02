/**
 * Script to fix photographer names and URLs in story files
 */
const fs = require('fs');
const path = require('path');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

// Default photographers for different categories
const DEFAULT_PHOTOGRAPHERS = {
  'Travel': [
    { name: 'Jakob Owens', url: 'https://unsplash.com/@jakobowens1' },
    { name: 'Asoggetti', url: 'https://unsplash.com/@asoggetti' },
    { name: 'Jaromir Kavan', url: 'https://unsplash.com/@jerrykavan' },
    { name: 'Dino Reichmuth', url: 'https://unsplash.com/@dinoreichmuth' },
    { name: 'Sylvain Mauroux', url: 'https://unsplash.com/@sylvainmauroux' }
  ],
  'Cruise': [
    { name: 'Alonso Reyes', url: 'https://unsplash.com/@alonsoreyes' },
    { name: 'Josiah Farrow', url: 'https://unsplash.com/@josiahfarrow' },
    { name: 'Vidar Nordli-Mathisen', url: 'https://unsplash.com/@vidarnm' }
  ],
  'Culture': [
    { name: 'Anthony Tran', url: 'https://unsplash.com/@anthonytran' },
    { name: 'Jingda Chen', url: 'https://unsplash.com/@jingda' },
    { name: 'Esteban Castle', url: 'https://unsplash.com/@estebancastle' },
    { name: 'Raimond Klavins', url: 'https://unsplash.com/@raimondklavins' }
  ],
  'Food & Wine': [
    { name: 'Brooke Lark', url: 'https://unsplash.com/@brookelark' },
    { name: 'Kelsey Knight', url: 'https://unsplash.com/@kelseyannvere' }
  ],
  'Adventure': [
    { name: 'Flo Maderebner', url: 'https://unsplash.com/@flomaderebner' },
    { name: 'Dino Reichmuth', url: 'https://unsplash.com/@dinoreichmuth' },
    { name: 'Simon Migaj', url: 'https://unsplash.com/@simonmigaj' }
  ],
  'General': [
    { name: 'Jakob Owens', url: 'https://unsplash.com/@jakobowens1' },
    { name: 'Dino Reichmuth', url: 'https://unsplash.com/@dinoreichmuth' },
    { name: 'Simon Migaj', url: 'https://unsplash.com/@simonmigaj' }
  ]
};

// Function to get a random photographer for a category
function getRandomPhotographer(category) {
  const categoryKey = Object.keys(DEFAULT_PHOTOGRAPHERS).find(key =>
    category.toLowerCase().includes(key.toLowerCase())
  ) || 'General';

  const photographers = DEFAULT_PHOTOGRAPHERS[categoryKey];
  const randomIndex = Math.floor(Math.random() * photographers.length);
  return photographers[randomIndex];
}

// Function to fix photographer names in story files
async function fixPhotographerNames() {
  try {
    console.log('Starting to fix photographer names in story files...');

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
          const photographerData = { name: '', url: '' };

          for (const line of frontmatterLines) {
            // Check if we're entering the photographer block
            if (line.trim() === 'photographer:') {
              inPhotographerBlock = true;
              continue;
            }

            // Parse photographer block
            if (inPhotographerBlock) {
              if (line.startsWith('  name:')) {
                photographerData.name = line.replace(/^ {2}name:\s*"?([^"]*)"?$/, '$1');
              } else if (line.startsWith('  url:')) {
                photographerData.url = line.replace(/^ {2}url:\s*"?([^"]*)"?$/, '$1');
              } else if (!line.startsWith('  ')) {
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

          // Check if the photographer name is invalid or generic
          let needsUpdate = false;

          if (!photographerData.name ||
              photographerData.name === 'undefined' ||
              photographerData.name === 'Story Capturer' ||
              photographerData.name === 'Editorial Photographer' ||
              photographerData.name === 'Narrative Lens' ||
              photographerData.name === 'Unsplash Photographer' ||
              photographerData.name === 'Paris Photographer') {
            needsUpdate = true;

            // Get a random photographer based on the story category
            const category = storyData.category || storyData.type || 'General';
            const randomPhotographer = getRandomPhotographer(category);

            photographerData.name = randomPhotographer.name;
            photographerData.url = randomPhotographer.url;
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
        console.error(`Error processing file ${file}:`, error);
        errorCount++;
      }
    }

    console.log(`Finished processing files. Fixed ${fixedCount} files. Encountered ${errorCount} errors.`);

  } catch (error) {
    console.error('Error fixing photographer names:', error);
  }
}

// Run the script
fixPhotographerNames();
