/**
 * Fix Photographer Attribution
 *
 * This script fixes the photographer attribution in story files.
 * It updates the frontmatter to include the photographer information.
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

async function fixPhotographerAttribution() {
  try {
    console.log('Starting photographer attribution fix...');

    // Check if the directory exists
    try {
      await fs.access(ARTICLES_DIRECTORY);
      console.log(`Articles directory found at: ${ARTICLES_DIRECTORY}`);
    } catch (error) {
      console.error(`Articles directory not found: ${ARTICLES_DIRECTORY}`);
      console.log('Creating directory...');
      await fs.mkdir(ARTICLES_DIRECTORY, { recursive: true });
    }

    // Get all markdown files
    const files = await fs.readdir(ARTICLES_DIRECTORY);
    console.log(`Found ${files.length} files in the directory.`);

    const markdownFiles = files.filter(file => file.endsWith('.md'));
    console.log(`Found ${markdownFiles.length} markdown files to process.`);

    let fixedCount = 0;

    for (const file of markdownFiles) {
      const filePath = path.join(ARTICLES_DIRECTORY, file);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const { data, content } = matter(fileContent);

      // Check if the file has an imageUrl
      if (data.imageUrl) {
        console.log(`Processing ${file}...`);
        console.log(`  Current data: ${JSON.stringify(data.photographer || {})}`);

        // Check if we need to fix the photographer info
        const needsFix = !data.photographer ||
                         !data.photographer.name ||
                         data.photographer.name === 'Paris Photographer' ||
                         (data.imageCredit && data.imageCredit.includes('Paris Photographer'));

        if (!needsFix) {
          console.log(`  Photographer info already correct: ${data.photographer?.name}`);
          continue;
        }

        // Extract photographer name from imageCredit if available
        let photographerName = 'Unsplash Photographer';
        let photographerUrl = 'https://unsplash.com';

        if (data.imageCredit) {
          console.log(`  Found imageCredit: ${data.imageCredit}`);
          // Try to extract photographer name from imageCredit
          const match = data.imageCredit.match(/Photo by (.*?) on Unsplash/);
          if (match && match[1]) {
            photographerName = match[1].trim();
            console.log(`  Extracted photographer name: ${photographerName}`);
          }
        }

        if (data.imageCreditUrl) {
          photographerUrl = data.imageCreditUrl;
        } else if (data.imageLink) {
          photographerUrl = data.imageLink;
        }

        // Update the frontmatter
        const updatedData = {
          ...data,
          photographer: {
            name: photographerName,
            url: photographerUrl
          }
        };

        // Write the updated content back to the file
        const updatedContent = matter.stringify(content, updatedData);
        await fs.writeFile(filePath, updatedContent);

        console.log(`  Updated photographer info: ${photographerName}`);
        fixedCount++;
      }
    }

    console.log(`\nFixed photographer attribution in ${fixedCount} files.`);

    if (fixedCount === 0) {
      console.log('No files needed fixing.');
    }

  } catch (error) {
    console.error('Error fixing photographer attribution:', error);
    process.exit(1);
  }
}

// Run the script
fixPhotographerAttribution();
