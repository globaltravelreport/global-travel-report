/**
 * Save Stories to Disk
 *
 * This script fetches stories from the API and saves them as Markdown files.
 * It's useful for persisting stories that have been generated but not saved to disk.
 *
 * Usage:
 * 1. Run this script: `node scripts/saveStoriesToDisk.js`
 */

const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// Function to create a slug from a title
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w-]+/g, '')     // Remove all non-word chars
    .replace(/--+/g, '-')        // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

// Function to ensure the articles directory exists
async function ensureArticlesDirectory() {
  const articlesDir = path.join(process.cwd(), 'content', 'articles');
  try {
    await fs.access(articlesDir);
  } catch {
    console.log('📁 Creating articles directory...');
    await fs.mkdir(articlesDir, { recursive: true });
  }
  return articlesDir;
}

// Function to save a story as a Markdown file
async function saveStoryToMarkdown(story, articlesDir) {
  try {
    // Generate slug and filename
    const slug = story.slug || slugify(story.title);
    const date = new Date().toISOString();
    const filename = `${slug}.md`;
    const filepath = path.join(articlesDir, filename);

    // Create YAML frontmatter
    const frontmatter = `---
title: "${story.title}"
summary: "${story.excerpt || ''}"
date: "${date}"
country: "${story.country || 'Global'}"
type: "${story.category || 'Article'}"
imageUrl: "${story.imageUrl || ''}"
${story.photographer ? `photographer:
  name: "${story.photographer.name || 'Unsplash Photographer'}"
  url: "${story.photographer.url || 'https://unsplash.com'}"` : ''}
---

${story.content || ''}`;

    // Write the file
    await fs.writeFile(filepath, frontmatter, 'utf8');
    console.log(`✅ Saved story: ${filename}`);

    return {
      filename,
      slug,
      date
    };
  } catch (error) {
    console.error(`❌ Error saving story "${story.title}":`, error.message);
    throw error;
  }
}

// Function to fetch stories from the API
async function fetchStories() {
  try {
    console.log('Fetching stories from API...');

    // Get the secret key from environment variables
    const secretKey = process.env.CRON_SECRET_KEY;

    // Prepare headers
    const headers = {};
    if (secretKey) {
      headers['x-api-key'] = secretKey;
    }

    // Make the request
    const response = await fetch('https://www.globaltravelreport.com/api/stories', { headers });

    // Parse the response
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch stories');
    }

    return data.stories || [];
  } catch (error) {
    console.error('Error fetching stories:', error.message);
    return [];
  }
}

// Main function to save stories to disk
async function saveStoriesToDisk() {
  try {
    console.log('Starting to save stories to disk...');

    // Fetch stories from the API
    const stories = await fetchStories();

    if (stories.length === 0) {
      console.log('No stories found to save.');
      return;
    }

    console.log(`Found ${stories.length} stories to save.`);

    // Ensure articles directory exists
    const articlesDir = await ensureArticlesDirectory();

    // Save each story to disk
    const savedStories = [];
    for (const [index, story] of stories.entries()) {
      console.log(`\n📄 Processing story ${index + 1}/${stories.length}:`);
      console.log('📌 Title:', story.title);

      try {
        const saved = await saveStoryToMarkdown(story, articlesDir);
        savedStories.push(saved);
      } catch (error) {
        console.error(`❌ Failed to save story: ${error.message}`);
        continue;
      }
    }

    console.log('\n✨ Finished saving stories');
    console.log(`📊 Total stories saved: ${savedStories.length}`);

    return savedStories;
  } catch (error) {
    console.error('❌ Error in main process:', error.message);
    throw error;
  }
}

// Run the script
saveStoriesToDisk();
