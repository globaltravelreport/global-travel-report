/**
 * Script to force revalidate all pages
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const fetch = require('node-fetch');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

// Function to force revalidate all pages
async function forceRevalidate() {
  try {
    console.log('Starting to force revalidate all pages...');
    
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
    await revalidatePath('/');
    
    // Revalidate the stories page
    await revalidatePath('/stories');
    
    // Revalidate all category pages
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
    
    // Process each file
    for (const file of files) {
      try {
        const filePath = path.join(ARTICLES_DIRECTORY, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Parse the frontmatter
        const { data: frontmatter } = matter(fileContent);
        
        // Get the slug
        const slug = frontmatter.slug;
        
        if (slug) {
          // Revalidate the story page
          await revalidatePath(`/stories/${slug}`);
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }
    
    console.log('Finished revalidating all pages');
    
  } catch (error) {
    console.error('Error revalidating pages:', error);
  }
}

// Function to revalidate a specific path
async function revalidatePath(path) {
  try {
    console.log(`Revalidating path: ${path}`);
    
    // Make a request to the revalidate API
    const response = await fetch(`http://localhost:3000/api/revalidate?path=${path}&secret=your-secret-token`);
    
    if (response.ok) {
      console.log(`Successfully revalidated path: ${path}`);
    } else {
      console.error(`Failed to revalidate path: ${path}`);
    }
  } catch (error) {
    console.error(`Error revalidating path ${path}:`, error);
  }
}

// Run the script
forceRevalidate();
