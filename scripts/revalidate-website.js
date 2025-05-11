/**
 * Script to revalidate the website
 *
 * This script:
 * 1. Revalidates the homepage
 * 2. Revalidates the stories page
 * 3. Revalidates all category pages
 * 4. Revalidates all story pages
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const fetch = require('node-fetch');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com';

// Function to revalidate the website
async function revalidateWebsite() {
  try {
    console.log('Starting to revalidate the website...');

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

    // Revalidate the homepage
    console.log('Revalidating homepage...');
    await revalidatePath('/');

    // Revalidate the stories page
    console.log('Revalidating stories page...');
    await revalidatePath('/stories');

    // Revalidate all category pages
    console.log('Revalidating category pages...');
    const categories = [
      'travel',
      'cruise',
      'adventure',
      'culture',
      'food-wine',
      'airline',
      'hotel',
      'destination'
    ];

    for (const category of categories) {
      await revalidatePath(`/categories/${category}`);
    }

    // Process each file to revalidate individual story pages
    console.log('Revalidating individual story pages...');
    let revalidatedCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        const filePath = path.join(ARTICLES_DIRECTORY, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Parse the frontmatter
        const { data: frontmatter } = matter(fileContent);

        // Get the slug
        const slug = frontmatter.slug || file.replace('.md', '');

        if (slug) {
          // Revalidate the story page
          await revalidatePath(`/stories/${slug}`);
          revalidatedCount++;

          // Log progress every 10 stories
          if (revalidatedCount % 10 === 0) {
            console.log(`Revalidated ${revalidatedCount}/${files.length} story pages...`);
          }
        }
      } catch (error) {
        console.error(`Error revalidating story ${file}:`, error);
        errorCount++;
      }
    }

    console.log(`Finished revalidating the website. Revalidated ${revalidatedCount} story pages. Encountered ${errorCount} errors.`);

  } catch (error) {
    console.error('Error revalidating the website:', error);
  }
}

// Function to revalidate a specific path
async function revalidatePath(path) {
  try {
    // Make a request to the revalidate API with the secret key
    const response = await fetch(`${SITE_URL}/api/revalidate?path=${path}`, {
      headers: {
        'x-api-key': '3zoLqWJSBP'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`Successfully revalidated path: ${path}`, data);
    } else {
      console.error(`Failed to revalidate path: ${path}`, await response.text());
    }
  } catch (error) {
    console.error(`Error revalidating path ${path}:`, error);
  }
}

// Run the script
revalidateWebsite();
