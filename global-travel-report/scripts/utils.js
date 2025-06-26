/**
 * Shared utility functions for scripts
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

/**
 * Get the content directory path
 * @returns {string} Path to the content directory
 */
const getContentDir = () => {
  const contentDir = path.join(process.cwd(), 'content');

  // Create content directory if it doesn't exist
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  return contentDir;
};

/**
 * Get the articles directory path
 * @returns {string} Path to the articles directory
 */
const getArticlesDir = () => {
  const articlesDir = path.join(getContentDir(), 'articles');

  // Create articles directory if it doesn't exist
  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
  }

  return articlesDir;
};

/**
 * Get all story files
 * @returns {string[]} Array of story file paths
 */
const getStoryFiles = () => {
  const articlesDir = getArticlesDir();
  return fs.readdirSync(articlesDir)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(articlesDir, file));
};

/**
 * Load a story from a file
 * @param {string} filePath Path to the story file
 * @returns {Object} Story object
 */
const loadStory = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  return {
    ...data,
    content,
    filePath
  };
};

/**
 * Save a story to a file
 * @param {Object} story Story object
 * @returns {boolean} Success status
 */
const saveStory = (story) => {
  try {
    if (!story.filePath) {
      console.error('Cannot save story: No file path provided');
      return false;
    }

    const fileContent = matter.stringify(story.content, story);
    fs.writeFileSync(story.filePath, fileContent);

    return true;
  } catch (error) {
    console.error('Error saving story:', error);
    return false;
  }
};

/**
 * Fix image URLs in stories
 * @param {boolean} dryRun Whether to perform a dry run
 * @returns {number} Number of stories fixed
 */
const fixImageUrls = (dryRun = false) => {
  console.log(`Starting image URL fix ${dryRun ? '(dry run)' : ''}`);

  const storyFiles = getStoryFiles();
  let fixedCount = 0;

  storyFiles.forEach(filePath => {
    try {
      const story = loadStory(filePath);

      // Check if the story has an image URL
      if (!story.imageUrl && !story.image) {
        return;
      }

      // Get the image URL
      const imageUrl = story.imageUrl || story.image;

      // Check if the image URL is already correct
      if (imageUrl.startsWith('https://images.unsplash.com/')) {
        return;
      }

      // Fix the image URL
      const fixedImageUrl = `https://images.unsplash.com/${imageUrl.split('/').pop()}`;

      console.log(`Fixing image URL in ${path.basename(filePath)}`);
      console.log(`  Old: ${imageUrl}`);
      console.log(`  New: ${fixedImageUrl}`);

      // Update the story
      story.imageUrl = fixedImageUrl;
      story.image = fixedImageUrl;

      // Save the story
      if (!dryRun) {
        saveStory(story);
      }

      fixedCount++;
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  });

  console.log(`Fixed ${fixedCount} stories`);
  return fixedCount;
};

/**
 * Fix photographer attribution in stories
 * @param {boolean} dryRun Whether to perform a dry run
 * @returns {number} Number of stories fixed
 */
const fixPhotographerAttribution = (dryRun = false) => {
  console.log(`Starting photographer attribution fix ${dryRun ? '(dry run)' : ''}`);

  const storyFiles = getStoryFiles();
  let fixedCount = 0;

  storyFiles.forEach(filePath => {
    try {
      const story = loadStory(filePath);

      // Check if the story has an image URL
      if (!story.imageUrl && !story.image) {
        return;
      }

      // Get the image URL
      const imageUrl = story.imageUrl || story.image;

      // Check if the image URL is from Unsplash
      if (!imageUrl.includes('unsplash.com')) {
        return;
      }

      // Extract the photographer from the URL
      const match = imageUrl.match(/photo-[0-9]+-([a-zA-Z0-9]+)/);
      if (!match) {
        return;
      }

      const photographerId = match[1];

      // Check if the photographer is already set
      if (story.photographer && typeof story.photographer === 'object' && story.photographer.username === photographerId) {
        return;
      }

      console.log(`Fixing photographer attribution in ${path.basename(filePath)}`);
      console.log(`  Photographer ID: ${photographerId}`);

      // Update the story
      story.photographer = {
        name: photographerId,
        username: photographerId,
        profileUrl: `https://unsplash.com/@${photographerId}`
      };

      // Save the story
      if (!dryRun) {
        saveStory(story);
      }

      fixedCount++;
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  });

  console.log(`Fixed ${fixedCount} stories`);
  return fixedCount;
};

/**
 * Fix story dates
 * @param {boolean} dryRun Whether to perform a dry run
 * @returns {number} Number of stories fixed
 */
const fixStoryDates = (dryRun = false) => {
  console.log(`Starting story date fix ${dryRun ? '(dry run)' : ''}`);

  const storyFiles = getStoryFiles();
  let fixedCount = 0;

  storyFiles.forEach(filePath => {
    try {
      const story = loadStory(filePath);

      // Check if the story has a date
      if (!story.date && !story.publishedAt) {
        return;
      }

      // Get the date
      const date = story.publishedAt || story.date;
      let needsFixing = false;
      let newDate = null;

      // Check if the date is valid
      try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          // Invalid date
          needsFixing = true;

          // Check if we can extract a year from the filename
          const filename = path.basename(filePath, '.md');
          const yearMatch = filename.match(/\d{4}/);

          if (yearMatch) {
            // Try to create a date from the year
            const year = yearMatch[0];
            // Use January 1st of that year as a fallback
            newDate = new Date(`${year}-01-01T00:00:00.000Z`).toISOString();
          } else {
            // If we can't extract a year, use a random date in the past (1-30 days ago)
            const daysAgo = Math.floor(Math.random() * 30) + 1;
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - daysAgo);
            newDate = pastDate.toISOString();
          }
        } else if (dateObj > new Date()) {
          // Future date
          needsFixing = true;

          // If it's a 2025 date (common issue), set it to the same day/month in 2024
          if (dateObj.getFullYear() === 2025) {
            const correctedDate = new Date(dateObj);
            correctedDate.setFullYear(2024);
            newDate = correctedDate.toISOString();
          } else {
            // Otherwise, set it to a random date in the past (1-30 days ago)
            const daysAgo = Math.floor(Math.random() * 30) + 1;
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - daysAgo);
            newDate = pastDate.toISOString();
          }
        }

        // If the date needs fixing, update the story
        if (needsFixing && newDate) {
          console.log(`Fixing date in ${path.basename(filePath)}`);
          console.log(`  Old: ${date}`);
          console.log(`  New: ${newDate}`);

          // Update the dates
          story.publishedAt = newDate;
          story.date = newDate;

          // Save the story
          if (!dryRun) {
            saveStory(story);
          }

          fixedCount++;
        }
      } catch (error) {
        console.error(`Error processing date in ${path.basename(filePath)}:`, error);
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  });

  console.log(`Fixed ${fixedCount} stories`);
  return fixedCount;
};

module.exports = {
  getContentDir,
  getArticlesDir,
  getStoryFiles,
  loadStory,
  saveStory,
  fixImageUrls,
  fixPhotographerAttribution,
  fixStoryDates
};
