
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

// Define the category-specific photographers with their images
const CATEGORY_PHOTOGRAPHERS: Record<string, Array<{ name: string, url: string, imageUrl: string }>> = {
  'Travel': [
    { name: 'Jakob Owens', url: 'https://unsplash.com/@jakobowens1', imageUrl: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=2400' },
    { name: 'Asoggetti', url: 'https://unsplash.com/@asoggetti', imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&q=80&w=2400' },
    { name: 'Jaromir Kavan', url: 'https://unsplash.com/@jerrykavan', imageUrl: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&q=80&w=2400' },
    { name: 'Dino Reichmuth', url: 'https://i.pinimg.com/originals/51/0f/5c/510f5c46255585b7e57b6bc3c12d69fb.jpg', imageUrl: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&q=80&w=2400' },
    { name: 'Sylvain Mauroux', url: 'https://i.pinimg.com/originals/4a/ef/c7/4aefc76d89f60dae5d72ee4df85dca2e.jpg', imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&q=80&w=2400' },
    { name: 'Sime Basioli', url: 'https://images.unsplash.com/photo-1585238827869-205910be89bf?auto=format&q=80&w=2400', imageUrl: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&q=80&w=2400' },
    { name: 'Braden Jarvis', url: 'https://i.pinimg.com/originals/76/f3/00/76f300a955ddfac2de2a1369f0329844.png', imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&q=80&w=2400' },
    { name: 'Simon Migaj', url: 'https://images.pexels.com/photos/1166881/pexels-photo-1166881.jpeg?cs=srgb&dl=pexels-simon-migaj-1166881.jpg&fm=jpg', imageUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&q=80&w=2400' },
    { name: 'Arto Marttinen', url: 'https://images.unsplash.com/photo-1470125634816-ede3f51bbb42?auto=format&q=80&w=2400', imageUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&q=80&w=2400' },
    { name: 'Emile Guillemot', url: 'https://i.pinimg.com/736x/85/ba/a7/85baa739cc3b61f4428c84adffdaffec.jpg', imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&q=80&w=2400' },
    { name: 'Thomas Tucker', url: 'https://images.unsplash.com/photo-1713643562822-5a992959ead3?auto=format&q=80&w=2400', imageUrl: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&q=80&w=2400' },
    { name: 'Davide Cantelli', url: 'http://images.unsplash.com/photo-1551746698-990d4dfb835e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjEyMDd9', imageUrl: 'https://images.unsplash.com/profile-1627997363862-ef8e932e79adimage?auto=format&q=80&w=2400' }
  ],
  'Cruise': [
    { name: 'Alonso Reyes', url: 'https://i.pinimg.com/originals/29/3d/22/293d22e8ef163d1cbb23b3d97b50d051.jpg', imageUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&q=80&w=2400' },
    { name: 'Josiah Farrow', url: 'https://images.pexels.com/photos/3686884/pexels-photo-3686884.jpeg?cs=srgb&dl=pexels-josiahfarrow-3686884.jpg&fm=jpg', imageUrl: 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&q=80&w=2400' },
    { name: 'Vidar Nordli-Mathisen', url: 'https://i.pinimg.com/originals/e4/5a/2f/e45a2f7bd6a13e9c5a8bfedb38210120.jpg', imageUrl: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&q=80&w=2400' }
  ],
  'Culture': [
    { name: 'Anthony Tran', url: 'https://i.pinimg.com/originals/a1/7f/a8/a17fa81846cd4f78c8df7247678293a2.png', imageUrl: 'https://images.unsplash.com/photo-1557296387-5358ad7997bb?auto=format&q=80&w=2400' },
    { name: 'Jingda Chen', url: 'https://i.pinimg.com/736x/0d/a4/88/0da488a56c585bbe6fd1f6dd210c8fe3.jpg', imageUrl: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&q=80&w=2400' },
    { name: 'Esteban Castle', url: 'https://i.pinimg.com/736x/33/e1/30/33e130c6601181be70b263ec691fd876.jpg', imageUrl: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&q=80&w=2400' },
    { name: 'Jezael Melgoza', url: 'https://images.unsplash.com/1x1.png?auto=format&q=80&w=2400', imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&q=80&w=2400' },
    { name: 'Raimond Klavins', url: 'https://i.pinimg.com/originals/7f/ee/8d/7fee8d2fa0ccc4784d809dfd32e823eb.png', imageUrl: 'https://images.unsplash.com/photo-1551913902-c92207136625?auto=format&q=80&w=2400' },
    { name: 'Heidi Kaden', url: 'https://images.unsplash.com/profile-1618902649659-eacbad541215image?auto=format&q=80&w=2400', imageUrl: 'https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&q=80&w=2400' },
    { name: 'Shifaaz Shamoon', url: 'https://i.pinimg.com/originals/7c/0b/93/7c0b93a032f84dff322403519db5766f.jpg', imageUrl: 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?auto=format&q=80&w=2400' },
    { name: 'Dario Bronnimann', url: 'https://i.pinimg.com/originals/2e/f7/d7/2ef7d781f64f6c4104ba88bac5840feb.jpg', imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&q=80&w=2400' }
  ],
  'Food & Wine': [
    { name: 'Brooke Lark', url: 'https://images.unsplash.com/photo-1546456674-8aa8c81b9b8e?auto=format&q=80&w=2400', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&q=80&w=2400' },
    { name: 'Kelsey Knight', url: 'https://i.pinimg.com/736x/2b/48/00/2b480080ad71392701d9b7020c09c17e--homework-portrait-photo.jpg', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&q=80&w=2400' }
  ],
  'Adventure': [
    { name: 'Flo Maderebner', url: 'https://i.pinimg.com/736x/a7/18/d5/a718d57ed5d12cba64418ef521e96fd6.jpg', imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&q=80&w=2400' }
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

    if (!selectedPhotographer) {
      throw new Error(`Photographer not found for image: ${leastUsedImage}`);
    }

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
      imageUrl: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=2400',
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
