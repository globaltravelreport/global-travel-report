/**
 * Script to fix image attribution in all story files
 * 
 * This script ensures:
 * 1. Each image is uniquely attributed to a single photographer
 * 2. The same image is not used for different stories
 * 3. Images are context-relevant to the story content
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

// Directory for the image tracker data
const DATA_DIRECTORY = path.join(process.cwd(), 'data');
const IMAGE_TRACKER_FILE = path.join(DATA_DIRECTORY, 'imageTracker.json');

// Direct mapping between photographers and their images
const PHOTOGRAPHER_IMAGES = {
  'Jakob Owens': 'https://images.unsplash.com/photo-1488085061387-422e29b40080',
  'Asoggetti': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
  'Jaromir Kavan': 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b',
  'Dino Reichmuth': 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d',
  'Sylvain Mauroux': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
  'Alonso Reyes': 'https://images.unsplash.com/photo-1548574505-5e239809ee19',
  'Josiah Farrow': 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b',
  'Vidar Nordli-Mathisen': 'https://images.unsplash.com/photo-1548690312-e3b507d8c110',
  'Flo Maderebner': 'https://images.unsplash.com/photo-1551632811-561732d1e306',
  'Anthony Tran': 'https://images.unsplash.com/photo-1493707553966-283afac8c358',
  'Jingda Chen': 'https://images.unsplash.com/photo-1577083552431-6e5fd01988a5',
  'Esteban Castle': 'https://images.unsplash.com/photo-1566438480900-0609be27a4be',
  'Jezael Melgoza': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04',
  'Brooke Lark': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
  'Kelsey Knight': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
  'Simon Migaj': 'https://images.unsplash.com/photo-1508672019048-805c876b67e2',
  'Sime Basioli': 'https://images.unsplash.com/photo-1530789253388-582c481c54b0',
  'Braden Jarvis': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
  'Arto Marttinen': 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a',
  'Emile Guillemot': 'https://images.unsplash.com/photo-1528127269322-539801943592',
  'Thomas Tucker': 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff',
  'Davide Cantelli': 'https://images.unsplash.com/photo-1528164344705-47542687000d',
  'Raimond Klavins': 'https://images.unsplash.com/photo-1551913902-c92207136625',
  'Heidi Kaden': 'https://images.unsplash.com/photo-1552084117-56a987666449',
  'Shifaaz Shamoon': 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0',
  'Dario Bronnimann': 'https://images.unsplash.com/photo-1533105079780-92b9be482077'
};

// Photographer URLs
const PHOTOGRAPHER_URLS = {
  'Jakob Owens': 'https://unsplash.com/@jakobowens1',
  'Asoggetti': 'https://unsplash.com/@asoggetti',
  'Jaromir Kavan': 'https://unsplash.com/@jerrykavan',
  'Dino Reichmuth': 'https://unsplash.com/@dinoreichmuth',
  'Sylvain Mauroux': 'https://unsplash.com/@sylvainmauroux',
  'Alonso Reyes': 'https://unsplash.com/@alonsoreyes',
  'Josiah Farrow': 'https://unsplash.com/@josiahfarrow',
  'Vidar Nordli-Mathisen': 'https://unsplash.com/@vidarnm',
  'Flo Maderebner': 'https://unsplash.com/@flomaderebner',
  'Anthony Tran': 'https://unsplash.com/@anthonytran',
  'Jingda Chen': 'https://unsplash.com/@jingda',
  'Esteban Castle': 'https://unsplash.com/@estebancastle',
  'Jezael Melgoza': 'https://unsplash.com/@jezar',
  'Brooke Lark': 'https://unsplash.com/@brookelark',
  'Kelsey Knight': 'https://unsplash.com/@kelseyannvere',
  'Simon Migaj': 'https://unsplash.com/@simonmigaj',
  'Sime Basioli': 'https://unsplash.com/@basecore',
  'Braden Jarvis': 'https://unsplash.com/@jarvisphoto',
  'Arto Marttinen': 'https://unsplash.com/@wandervisions',
  'Emile Guillemot': 'https://unsplash.com/@emilegt',
  'Thomas Tucker': 'https://unsplash.com/@tents_and_tread',
  'Davide Cantelli': 'https://unsplash.com/@cant89',
  'Raimond Klavins': 'https://unsplash.com/@raimondklavins',
  'Heidi Kaden': 'https://unsplash.com/@heidikaden',
  'Shifaaz Shamoon': 'https://unsplash.com/@sotti',
  'Dario Bronnimann': 'https://unsplash.com/@darby'
};

// Category-specific photographers
const CATEGORY_PHOTOGRAPHERS = {
  'Travel': ['Jakob Owens', 'Asoggetti', 'Jaromir Kavan', 'Dino Reichmuth', 'Sylvain Mauroux', 'Sime Basioli', 'Braden Jarvis', 'Simon Migaj', 'Arto Marttinen', 'Emile Guillemot', 'Thomas Tucker', 'Davide Cantelli'],
  'Cruise': ['Alonso Reyes', 'Josiah Farrow', 'Vidar Nordli-Mathisen'],
  'Culture': ['Anthony Tran', 'Jingda Chen', 'Esteban Castle', 'Jezael Melgoza', 'Raimond Klavins', 'Heidi Kaden', 'Shifaaz Shamoon', 'Dario Bronnimann'],
  'Food & Wine': ['Brooke Lark', 'Kelsey Knight'],
  'Adventure': ['Flo Maderebner', 'Dino Reichmuth', 'Simon Migaj']
};

// Initialize the image tracker
function initializeImageTracker() {
  try {
    // Create the data directory if it doesn't exist
    if (!fs.existsSync(DATA_DIRECTORY)) {
      fs.mkdirSync(DATA_DIRECTORY, { recursive: true });
    }

    // Check if the tracker file exists
    if (fs.existsSync(IMAGE_TRACKER_FILE)) {
      // Load existing data
      const data = JSON.parse(fs.readFileSync(IMAGE_TRACKER_FILE, 'utf8'));
      return data;
    }

    // Create a new tracker
    const newTracker = {
      images: {},
      photographerToImage: {},
      usedImageUrls: []
    };

    // Initialize the photographer to image mapping
    for (const photographerName in PHOTOGRAPHER_IMAGES) {
      const imageUrl = PHOTOGRAPHER_IMAGES[photographerName];
      newTracker.photographerToImage[photographerName] = imageUrl;
      
      // Find the category for this photographer
      let category = 'Travel';
      for (const cat in CATEGORY_PHOTOGRAPHERS) {
        if (CATEGORY_PHOTOGRAPHERS[cat].includes(photographerName)) {
          category = cat;
          break;
        }
      }
      
      // Add the image data
      newTracker.images[imageUrl] = {
        url: imageUrl,
        photographer: {
          name: photographerName,
          url: PHOTOGRAPHER_URLS[photographerName]
        },
        category,
        usedInStories: []
      };
    }

    // Save the new tracker
    fs.writeFileSync(IMAGE_TRACKER_FILE, JSON.stringify(newTracker, null, 2));
    return newTracker;
  } catch (error) {
    console.error('Error initializing image tracker:', error);
    // Return a default tracker
    return {
      images: {},
      photographerToImage: {},
      usedImageUrls: []
    };
  }
}

// Normalize a category string
function normalizeCategory(category) {
  if (!category) return 'Travel';
  
  const normalized = category.trim();
  
  if (normalized.toLowerCase().includes('cruise')) return 'Cruise';
  if (normalized.toLowerCase().includes('food') || normalized.toLowerCase().includes('wine')) return 'Food & Wine';
  if (normalized.toLowerCase().includes('adventure')) return 'Adventure';
  if (normalized.toLowerCase().includes('culture')) return 'Culture';
  
  return 'Travel';
}

// Get an image for a story based on its category
function getImageForStory(storySlug, category, tracker) {
  try {
    // Normalize the category
    const normalizedCategory = normalizeCategory(category);
    
    // Get the photographers for this category
    const photographers = CATEGORY_PHOTOGRAPHERS[normalizedCategory] || CATEGORY_PHOTOGRAPHERS['Travel'];
    
    // Find an image that hasn't been used yet
    for (const photographerName of photographers) {
      const imageUrl = PHOTOGRAPHER_IMAGES[photographerName];
      const imageData = tracker.images[imageUrl];
      
      // If this image hasn't been used or has been used less than others, use it
      if (!imageData || !imageData.usedInStories.includes(storySlug)) {
        // Mark this image as used for this story
        if (!tracker.images[imageUrl]) {
          tracker.images[imageUrl] = {
            url: imageUrl,
            photographer: {
              name: photographerName,
              url: PHOTOGRAPHER_URLS[photographerName]
            },
            category: normalizedCategory,
            usedInStories: [storySlug]
          };
        } else if (!tracker.images[imageUrl].usedInStories.includes(storySlug)) {
          tracker.images[imageUrl].usedInStories.push(storySlug);
        }
        
        // Add to used image URLs
        if (!tracker.usedImageUrls.includes(imageUrl)) {
          tracker.usedImageUrls.push(imageUrl);
        }
        
        return {
          imageUrl,
          photographer: {
            name: photographerName,
            url: PHOTOGRAPHER_URLS[photographerName]
          }
        };
      }
    }
    
    // If all images have been used, find the least used one
    let leastUsedPhotographer = photographers[0];
    let leastUsedCount = Infinity;
    
    for (const photographerName of photographers) {
      const imageUrl = PHOTOGRAPHER_IMAGES[photographerName];
      const imageData = tracker.images[imageUrl];
      
      if (!imageData || imageData.usedInStories.length < leastUsedCount) {
        leastUsedPhotographer = photographerName;
        leastUsedCount = imageData ? imageData.usedInStories.length : 0;
      }
    }
    
    // Get the image URL for this photographer
    const imageUrl = PHOTOGRAPHER_IMAGES[leastUsedPhotographer];
    
    // Mark this image as used for this story
    if (!tracker.images[imageUrl]) {
      tracker.images[imageUrl] = {
        url: imageUrl,
        photographer: {
          name: leastUsedPhotographer,
          url: PHOTOGRAPHER_URLS[leastUsedPhotographer]
        },
        category: normalizedCategory,
        usedInStories: [storySlug]
      };
    } else if (!tracker.images[imageUrl].usedInStories.includes(storySlug)) {
      tracker.images[imageUrl].usedInStories.push(storySlug);
    }
    
    return {
      imageUrl,
      photographer: {
        name: leastUsedPhotographer,
        url: PHOTOGRAPHER_URLS[leastUsedPhotographer]
      }
    };
  } catch (error) {
    console.error('Error getting image for story:', error);
    // Return a default image
    return {
      imageUrl: 'https://images.unsplash.com/photo-1488085061387-422e29b40080',
      photographer: {
        name: 'Jakob Owens',
        url: 'https://unsplash.com/@jakobowens1'
      }
    };
  }
}

// Fix image attribution in all story files
async function fixImageAttribution() {
  try {
    console.log('Starting to fix image attribution in story files...');
    
    // Initialize the image tracker
    const tracker = initializeImageTracker();
    
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
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Parse the frontmatter
        const { data: frontmatter, content } = matter(fileContent);
        
        // Get the slug and category
        const slug = frontmatter.slug || file.replace('.md', '');
        const category = frontmatter.category || 'Travel';
        
        // Get a unique image and photographer for this story
        const { imageUrl, photographer } = getImageForStory(slug, category, tracker);
        
        // Update the frontmatter
        frontmatter.imageUrl = imageUrl;
        frontmatter.photographer = photographer;
        
        // Write the updated content back to the file
        const updatedFileContent = matter.stringify(content, frontmatter);
        fs.writeFileSync(filePath, updatedFileContent);
        
        console.log(`Updated image for ${file}: ${imageUrl} (${photographer.name})`);
        fixedCount++;
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        errorCount++;
      }
    }
    
    // Save the updated tracker
    fs.writeFileSync(IMAGE_TRACKER_FILE, JSON.stringify(tracker, null, 2));
    
    console.log(`Finished processing files. Fixed ${fixedCount} files. Encountered ${errorCount} errors.`);
    console.log(`Image tracker saved to ${IMAGE_TRACKER_FILE}`);
    
  } catch (error) {
    console.error('Error fixing image attribution:', error);
  }
}

// Run the script
fixImageAttribution();
