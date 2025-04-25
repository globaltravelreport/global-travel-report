import path from 'path';
import { promises as fs } from 'fs';
import matter from 'gray-matter';
import { logger } from '../app/utils/logger';
import { fetchUnsplashImage, trackUnsplashDownload } from '../app/lib/unsplash';

const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

async function updateStoryImages() {
  try {
    // Get all markdown files
    const files = await fs.readdir(ARTICLES_DIRECTORY);
    const markdownFiles = files.filter(file => file.endsWith('.md'));

    logger.info(`Found ${markdownFiles.length} stories to process`);

    for (const file of markdownFiles) {
      const filePath = path.join(ARTICLES_DIRECTORY, file);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const { data, content } = matter(fileContent);

      // Skip if no country or type
      if (!data.country || !data.type) {
        logger.warn(`Skipping ${file}: Missing country or type`);
        continue;
      }

      try {
        // Fetch new image
        const image = await fetchUnsplashImage(data.type, data.country);
        
        if (!image) {
          logger.warn(`No suitable image found for ${file}`);
          continue;
        }

        // Track the download
        await trackUnsplashDownload(image.downloadLocation);

        // Update frontmatter
        const updatedData = {
          ...data,
          imageUrl: image.url,
          imageAlt: image.alt,
          photographer: {
            name: image.photographer,
            username: image.photographerUsername,
            url: `https://unsplash.com/@${image.photographerUsername}?utm_source=globaltravelreport&utm_medium=referral`
          },
          source: 'Unsplash'
        };

        // Write updated content back to file
        const updatedContent = matter.stringify(content, updatedData);
        await fs.writeFile(filePath, updatedContent);

        logger.info(`Updated image for ${file}`);
      } catch (error) {
        logger.error(`Error updating image for ${file}:`, error);
      }
    }

    logger.info('Finished updating story images');
  } catch (error) {
    logger.error('Error updating story images:', error);
    process.exit(1);
  }
}

// Run the update
updateStoryImages(); 