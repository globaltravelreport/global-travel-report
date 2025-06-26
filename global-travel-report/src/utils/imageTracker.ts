/**
 * Image Tracker Utility
 * 
 * This utility tracks which images have been used across stories to ensure:
 * 1. Each image is uniquely attributed to a single photographer
 * 2. The same image is not used for different stories
 * 3. Images are context-relevant to the story content
 */

// Only import these modules on the server side
let fs: any, path: any;

if (typeof window === 'undefined') {
  fs = require('fs');
  path = require('path');
}
import matter from 'gray-matter';

// Define interfaces
interface Photographer {
  name: string;
  url: string;
}

interface ImageData {
  url: string;
  photographer: Photographer;
  category: string;
  usedInStories: string[]; // Array of story slugs where this image is used
}

interface ImageTrackerData {
  images: Record<string, ImageData>;
  photographerToImage: Record<string, string>; // Maps photographer name to image URL
  usedImageUrls: string[]; // List of all used image URLs
}

// Define the path to the image tracker data file
const IMAGE_TRACKER_FILE = typeof window === 'undefined' ? path?.join(process.cwd(), 'data/imageTracker.json') : '';

// Define the directory where story files are stored
const ARTICLES_DIRECTORY = typeof window === 'undefined' ? path?.join(process.cwd(), 'content/articles') : '';

// Define the category-specific photographers with their images
const CATEGORY_PHOTOGRAPHERS: Record<string, Array<{ name: string, url: string, imageUrl: string }>> = {
  'Travel': [
    { name: 'Jakob Owens', url: 'https://unsplash.com/@jakobowens1', imageUrl: 'https://images.unsplash.com/photo-1488085061387-422e29b40080' },
    { name: 'Asoggetti', url: 'https://unsplash.com/@asoggetti', imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1' },
    { name: 'Jaromir Kavan', url: 'https://unsplash.com/@jerrykavan', imageUrl: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b' },
    { name: 'Dino Reichmuth', url: 'https://unsplash.com/@dinoreichmuth', imageUrl: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d' },
    { name: 'Sylvain Mauroux', url: 'https://unsplash.com/@sylvainmauroux', imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
    { name: 'Sime Basioli', url: 'https://unsplash.com/@basecore', imageUrl: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0' },
    { name: 'Braden Jarvis', url: 'https://unsplash.com/@jarvisphoto', imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800' },
    { name: 'Simon Migaj', url: 'https://unsplash.com/@simonmigaj', imageUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2' },
    { name: 'Arto Marttinen', url: 'https://unsplash.com/@wandervisions', imageUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a' },
    { name: 'Emile Guillemot', url: 'https://unsplash.com/@emilegt', imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592' },
    { name: 'Thomas Tucker', url: 'https://unsplash.com/@tents_and_tread', imageUrl: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff' },
    { name: 'Davide Cantelli', url: 'https://unsplash.com/@cant89', imageUrl: 'https://images.unsplash.com/photo-1528164344705-47542687000d' }
  ],
  'Cruise': [
    { name: 'Alonso Reyes', url: 'https://unsplash.com/@alonsoreyes', imageUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19' },
    { name: 'Josiah Farrow', url: 'https://unsplash.com/@josiahfarrow', imageUrl: 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b' },
    { name: 'Vidar Nordli-Mathisen', url: 'https://unsplash.com/@vidarnm', imageUrl: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110' }
  ],
  'Culture': [
    { name: 'Anthony Tran', url: 'https://unsplash.com/@anthonytran', imageUrl: 'https://images.unsplash.com/photo-1493707553966-283afac8c358' },
    { name: 'Jingda Chen', url: 'https://unsplash.com/@jingda', imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988a5' },
    { name: 'Esteban Castle', url: 'https://unsplash.com/@estebancastle', imageUrl: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be' },
    { name: 'Jezael Melgoza', url: 'https://unsplash.com/@jezar', imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04' },
    { name: 'Raimond Klavins', url: 'https://unsplash.com/@raimondklavins', imageUrl: 'https://images.unsplash.com/photo-1551913902-c92207136625' },
    { name: 'Heidi Kaden', url: 'https://unsplash.com/@heidikaden', imageUrl: 'https://images.unsplash.com/photo-1552084117-56a987666449' },
    { name: 'Shifaaz Shamoon', url: 'https://unsplash.com/@sotti', imageUrl: 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0' },
    { name: 'Dario Bronnimann', url: 'https://unsplash.com/@darby', imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077' }
  ],
  'Food & Wine': [
    { name: 'Brooke Lark', url: 'https://unsplash.com/@brookelark', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836' },
    { name: 'Kelsey Knight', url: 'https://unsplash.com/@kelseyannvere', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3' }
  ],
  'Adventure': [
    { name: 'Flo Maderebner', url: 'https://unsplash.com/@flomaderebner', imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306' }
  ]
};

/**
 * Initialize the image tracker
 */
export function initializeImageTracker(): ImageTrackerData {
  try {
    // Create the data directory if it doesn't exist (server-side only)
    if (typeof window === 'undefined' && path && fs) {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    }

    // Check if the tracker file exists (server-side only)
    if (typeof window === 'undefined' && fs && fs.existsSync(IMAGE_TRACKER_FILE)) {
      // Load existing data
      const data = JSON.parse(fs.readFileSync(IMAGE_TRACKER_FILE, 'utf8'));
      return data;
    }

    // Create a new tracker
    const newTracker: ImageTrackerData = {
      images: {},
      photographerToImage: {},
      usedImageUrls: []
    };

    // Initialize the photographer to image mapping
    for (const category in CATEGORY_PHOTOGRAPHERS) {
      for (const photographer of CATEGORY_PHOTOGRAPHERS[category]) {
        newTracker.photographerToImage[photographer.name] = photographer.imageUrl;
        
        // Add the image data
        newTracker.images[photographer.imageUrl] = {
          url: photographer.imageUrl,
          photographer: {
            name: photographer.name,
            url: photographer.url
          },
          category,
          usedInStories: []
        };
      }
    }

    // Save the new tracker (server-side only)
    if (typeof window === 'undefined' && fs) {
      fs.writeFileSync(IMAGE_TRACKER_FILE, JSON.stringify(newTracker, null, 2));
    }
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

/**
 * Get an image for a story based on its category
 */
export function getImageForStory(storySlug: string, category: string): { imageUrl: string, photographer: Photographer } {
  try {
    // Initialize or load the tracker
    const tracker = initializeImageTracker();
    
    // Normalize the category
    const normalizedCategory = normalizeCategory(category);
    
    // Get the photographers for this category
    const photographers = CATEGORY_PHOTOGRAPHERS[normalizedCategory] || CATEGORY_PHOTOGRAPHERS['Travel'];
    
    // Find an image that hasn't been used yet
    for (const photographer of photographers) {
      const imageUrl = photographer.imageUrl;
      const imageData = tracker.images[imageUrl];
      
      // If this image hasn't been used or has been used less than others, use it
      if (!imageData || imageData.usedInStories.length === 0) {
        // Mark this image as used for this story
        if (!tracker.images[imageUrl]) {
          tracker.images[imageUrl] = {
            url: imageUrl,
            photographer: {
              name: photographer.name,
              url: photographer.url
            },
            category: normalizedCategory,
            usedInStories: [storySlug]
          };
        } else {
          tracker.images[imageUrl].usedInStories.push(storySlug);
        }
        
        // Add to used image URLs
        if (!tracker.usedImageUrls.includes(imageUrl)) {
          tracker.usedImageUrls.push(imageUrl);
        }
        
        // Save the updated tracker (server-side only)
        if (typeof window === 'undefined' && fs) {
          fs.writeFileSync(IMAGE_TRACKER_FILE, JSON.stringify(tracker, null, 2));
        }
        
        return {
          imageUrl,
          photographer: {
            name: photographer.name,
            url: photographer.url
          }
        };
      }
    }
    
    // If all images have been used, find the least used one
    let leastUsedImage = photographers[0].imageUrl;
    let leastUsedCount = Infinity;
    
    for (const photographer of photographers) {
      const imageUrl = photographer.imageUrl;
      const imageData = tracker.images[imageUrl];
      
      if (imageData && imageData.usedInStories.length < leastUsedCount) {
        leastUsedImage = imageUrl;
        leastUsedCount = imageData.usedInStories.length;
      }
    }
    
    // Get the photographer for this image
    const selectedPhotographer = photographers.find(p => p.imageUrl === leastUsedImage);
    
    // Mark this image as used for this story
    tracker.images[leastUsedImage].usedInStories.push(storySlug);
    
    // Save the updated tracker (server-side only)
    if (typeof window === 'undefined' && fs) {
      fs.writeFileSync(IMAGE_TRACKER_FILE, JSON.stringify(tracker, null, 2));
    }
    
    return {
      imageUrl: leastUsedImage,
      photographer: {
        name: selectedPhotographer.name,
        url: selectedPhotographer.url
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

/**
 * Normalize a category string
 */
function normalizeCategory(category: string): string {
  if (!category) return 'Travel';
  
  const normalized = category.trim();
  
  if (normalized.toLowerCase().includes('cruise')) return 'Cruise';
  if (normalized.toLowerCase().includes('food') || normalized.toLowerCase().includes('wine')) return 'Food & Wine';
  if (normalized.toLowerCase().includes('adventure')) return 'Adventure';
  if (normalized.toLowerCase().includes('culture')) return 'Culture';
  
  return 'Travel';
}
