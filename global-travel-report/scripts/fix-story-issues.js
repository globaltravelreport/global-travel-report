#!/usr/bin/env node

/**
 * Script to fix common issues in story files:
 * 1. Fix future dates (2025) to use current dates
 * 2. Ensure all stories have proper images
 * 3. Fix missing photographer attribution
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// Configuration
const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');
const DEFAULT_IMAGES = {
  'Travel': 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=2400',
  'Cruise': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&q=80&w=2400',
  'Destination': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&q=80&w=2400',
  'Hotel': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&q=80&w=2400',
  'Airline': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&q=80&w=2400',
  'Experience': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&q=80&w=2400',
  'Adventure': 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&q=80&w=2400',
  'Food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&q=80&w=2400',
  'Culture': 'https://images.unsplash.com/photo-1493707553966-283afac8c358?auto=format&q=80&w=2400',
  'Nature': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&q=80&w=2400',
  'Budget': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&q=80&w=2400',
};

const DEFAULT_PHOTOGRAPHERS = {
  'Travel': { name: 'Jakob Owens', url: 'https://unsplash.com/@jakobowens1' },
  'Cruise': { name: 'Alonso Reyes', url: 'https://unsplash.com/@alonsoreyes' },
  'Destination': { name: 'Dino Reichmuth', url: 'https://unsplash.com/@dinoreichmuth' },
  'Hotel': { name: 'Visualsofdana', url: 'https://unsplash.com/@visualsofdana' },
  'Airline': { name: 'Ross Parmly', url: 'https://unsplash.com/@rparmly' },
  'Experience': { name: 'Dino Reichmuth', url: 'https://unsplash.com/@dinoreichmuth' },
  'Adventure': { name: 'Flo Maderebner', url: 'https://unsplash.com/@flomaderebner' },
  'Food': { name: 'Brooke Lark', url: 'https://unsplash.com/@brookelark' },
  'Culture': { name: 'Anthony Tran', url: 'https://unsplash.com/@anthonytran' },
  'Nature': { name: 'Lukasz Szmigiel', url: 'https://unsplash.com/@szmigieldesign' },
  'Budget': { name: 'Fabian Blank', url: 'https://unsplash.com/@blankerwahnsinn' },
};

// Statistics
const stats = {
  totalFiles: 0,
  datesFixed: 0,
  imagesFixed: 0,
  photographersFixed: 0,
  errors: 0
};

/**
 * Generate a random date within the last 30 days
 * @returns {Date} A random date within the last 30 days
 */
function getRandomRecentDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30); // Random number between 0 and 30
  const hoursAgo = Math.floor(Math.random() * 24); // Random hour
  const minutesAgo = Math.floor(Math.random() * 60); // Random minute
  
  now.setDate(now.getDate() - daysAgo);
  now.setHours(now.getHours() - hoursAgo);
  now.setMinutes(now.getMinutes() - minutesAgo);
  
  return now;
}

/**
 * Get a default image URL based on the story category
 * @param {string} category - The story category
 * @returns {string} A default image URL
 */
function getDefaultImage(category) {
  if (!category) return DEFAULT_IMAGES['Travel'];
  
  // Check for category matches
  for (const [key, url] of Object.entries(DEFAULT_IMAGES)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return url;
    }
  }
  
  // If no match, return the travel default
  return DEFAULT_IMAGES['Travel'];
}

/**
 * Get a default photographer based on the story category
 * @param {string} category - The story category
 * @returns {Object} A default photographer object
 */
function getDefaultPhotographer(category) {
  if (!category) return DEFAULT_PHOTOGRAPHERS['Travel'];
  
  // Check for category matches
  for (const [key, photographer] of Object.entries(DEFAULT_PHOTOGRAPHERS)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return photographer;
    }
  }
  
  // If no match, return the travel default
  return DEFAULT_PHOTOGRAPHERS['Travel'];
}

/**
 * Fix issues in a story file
 * @param {string} filePath - Path to the story file
 */
async function fixStoryFile(filePath) {
  try {
    // Read the file
    const content = await fs.readFile(filePath, 'utf8');
    const { data, content: markdownContent } = matter(content);
    let modified = false;

    // 1. Fix future dates (2025)
    if (data.date && data.date.includes('2025')) {
      data.date = getRandomRecentDate().toISOString();
      modified = true;
      stats.datesFixed++;
    }

    // 2. Ensure the story has an image
    if (!data.imageUrl || data.imageUrl.trim() === '') {
      const category = data.category || data.type || 'Travel';
      data.imageUrl = getDefaultImage(category);
      modified = true;
      stats.imagesFixed++;
    }

    // 3. Fix missing photographer attribution
    if (!data.photographer || !data.photographer.name || !data.photographer.url) {
      const category = data.category || data.type || 'Travel';
      data.photographer = getDefaultPhotographer(category);
      modified = true;
      stats.photographersFixed++;
    }

    // Save the file if modified
    if (modified) {
      const updatedContent = matter.stringify(markdownContent, data);
      await fs.writeFile(filePath, updatedContent);
      console.log(`✅ Fixed issues in: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing file ${filePath}:`, error.message);
    stats.errors++;
  }
}

/**
 * Main function to fix all story files
 */
async function fixAllStoryFiles() {
  try {
    console.log('🔍 Scanning for story files...');
    
    // Get all markdown files
    const files = await fs.readdir(ARTICLES_DIR);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    stats.totalFiles = mdFiles.length;
    
    console.log(`📊 Found ${mdFiles.length} story files to process`);
    
    // Process each file
    for (const file of mdFiles) {
      const filePath = path.join(ARTICLES_DIR, file);
      await fixStoryFile(filePath);
    }
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log(`- Total files processed: ${stats.totalFiles}`);
    console.log(`- Future dates fixed: ${stats.datesFixed}`);
    console.log(`- Missing images fixed: ${stats.imagesFixed}`);
    console.log(`- Missing photographers fixed: ${stats.photographersFixed}`);
    console.log(`- Errors: ${stats.errors}`);
    
    if (stats.datesFixed > 0 || stats.imagesFixed > 0 || stats.photographersFixed > 0) {
      console.log('\n✅ Story files have been fixed successfully!');
    } else {
      console.log('\n✅ No issues found in story files.');
    }
  } catch (error) {
    console.error('❌ Error fixing story files:', error.message);
  }
}

// Run the script
fixAllStoryFiles();
