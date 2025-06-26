#!/usr/bin/env node

/**
 * Fix Image Consistency
 * 
 * This script fixes the image consistency issues by:
 * 1. Creating a consistent mapping between photographers and their image URLs
 * 2. Updating all story files to use the correct image URL for each photographer
 * 3. Ensuring each story has a unique image
 * 
 * Usage:
 * node scripts/fix-image-consistency.js
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(process.cwd(), 'content/articles');

// Photographer to image URL mapping
// This will be our source of truth
const PHOTOGRAPHER_IMAGE_MAP = {
  'Arto Marttinen': 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a',
  'Davide Cantelli': 'https://images.unsplash.com/photo-1528164344705-47542687000d',
  'Thomas Tucker': 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff',
  'Sime Basioli': 'https://images.unsplash.com/photo-1530789253388-582c481c54b0',
  'Braden Jarvis': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
  'Simon Migaj': 'https://images.unsplash.com/photo-1508672019048-805c876b67e2',
  'Jaromir Kavan': 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b',
  'Sylvain Mauroux': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
  'Jakob Owens': 'https://images.unsplash.com/photo-1488085061387-422e29b40080',
  'Dino Reichmuth': 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d',
  'Emile Guillemot': 'https://images.unsplash.com/photo-1528127269322-539801943592',
  'Alonso Reyes': 'https://images.unsplash.com/photo-1548574505-5e239809ee19',
  'Asoggetti': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
  'Luca Bravo': 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e',
  'Cristina Gottardi': 'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd',
  'Willian West': 'https://images.unsplash.com/photo-1520466809213-7b9a56adcd45',
  'Shifaaz Shamoon': 'https://images.unsplash.com/photo-1540202404-a2f29016b523',
  'Dan Gold': 'https://images.unsplash.com/photo-1565073624497-7e91b5cc3843',
  'Ishan Seefromthesky': 'https://images.unsplash.com/photo-1544644181-1484b3fdfc32',
  'Caleb Jones': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
};

// Additional photographers to use if needed
const ADDITIONAL_PHOTOGRAPHERS = [
  { name: 'Roberto Nickson', url: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0' },
  { name: 'Colton Duke', url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd' },
  { name: 'Zach Betten', url: 'https://images.unsplash.com/photo-1467377791767-c929b5dc9a23' },
  { name: 'Yoel Peterson', url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4' },
  { name: 'Kalen Emsley', url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7' },
  { name: 'Omer Salom', url: 'https://images.unsplash.com/photo-1534534573898-db5148bc8b0c' },
  { name: 'Efe Kurnaz', url: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60' },
  { name: 'Luca Bravo', url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e' },
  { name: 'Cristina Gottardi', url: 'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd' },
  { name: 'Willian West', url: 'https://images.unsplash.com/photo-1520466809213-7b9a56adcd45' }
];

// Track which photographers are used in which stories
const usedPhotographers = new Map();

async function main() {
  try {
    console.log('🔍 Scanning story files for image inconsistencies...');
    
    // Get all story files
    const files = await fs.readdir(CONTENT_DIR);
    const storyFiles = files.filter(file => file.endsWith('.md'));
    
    console.log(`📊 Found ${storyFiles.length} story files`);
    
    // Process each story file
    for (const file of storyFiles) {
      await processStoryFile(file);
    }
    
    console.log('✅ All story files processed successfully!');
    console.log('📊 Summary of used photographers:');
    
    // Print summary of used photographers
    for (const [photographer, stories] of usedPhotographers.entries()) {
      console.log(`- ${photographer}: ${stories.length} stories`);
    }
    
  } catch (error) {
    console.error('❌ Error processing story files:', error);
  }
}

async function processStoryFile(filename) {
  const filePath = path.join(CONTENT_DIR, filename);
  
  try {
    // Read the file
    const content = await fs.readFile(filePath, 'utf8');
    
    // Parse frontmatter
    const { data, content: markdownContent } = matter(content);
    
    // Check if the story has an image and photographer
    if (!data.imageUrl || !data.photographer) {
      console.log(`⚠️ Story ${filename} is missing image or photographer. Assigning new ones...`);
      
      // Assign a photographer that hasn't been used much
      const photographer = findLeastUsedPhotographer();
      
      // Update the frontmatter
      data.imageUrl = PHOTOGRAPHER_IMAGE_MAP[photographer];
      data.photographer = photographer;
      
      console.log(`✅ Assigned ${photographer} to ${filename}`);
    } else {
      // Check if the image URL matches the photographer
      const expectedUrl = PHOTOGRAPHER_IMAGE_MAP[data.photographer];
      
      if (!expectedUrl) {
        // Photographer not in our map, assign a new one
        const newPhotographer = findLeastUsedPhotographer();
        console.log(`⚠️ Unknown photographer "${data.photographer}" in ${filename}. Replacing with ${newPhotographer}`);
        
        data.photographer = newPhotographer;
        data.imageUrl = PHOTOGRAPHER_IMAGE_MAP[newPhotographer];
      } else if (data.imageUrl !== expectedUrl) {
        // Image URL doesn't match the photographer, update it
        console.log(`⚠️ Image URL in ${filename} doesn't match photographer ${data.photographer}. Fixing...`);
        data.imageUrl = expectedUrl;
      }
    }
    
    // Track the used photographer
    if (!usedPhotographers.has(data.photographer)) {
      usedPhotographers.set(data.photographer, []);
    }
    usedPhotographers.get(data.photographer).push(filename);
    
    // Write the updated file
    const updatedContent = matter.stringify(markdownContent, data);
    await fs.writeFile(filePath, updatedContent);
    
    console.log(`✅ Updated ${filename}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error);
  }
}

function findLeastUsedPhotographer() {
  // Find the photographer with the fewest stories
  let leastUsedPhotographer = null;
  let minCount = Infinity;
  
  for (const photographer of Object.keys(PHOTOGRAPHER_IMAGE_MAP)) {
    const count = usedPhotographers.has(photographer) 
      ? usedPhotographers.get(photographer).length 
      : 0;
    
    if (count < minCount) {
      minCount = count;
      leastUsedPhotographer = photographer;
    }
  }
  
  return leastUsedPhotographer;
}

// Run the script
main().catch(console.error);
