
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
    { name: 'Jakob Owens', url: 'https://unsplash.com/@jakobowens1', imageUrl: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&h=600&fit=crop&crop=center' },
    { name: 'Asoggetti', url: 'https://unsplash.com/@asoggetti', imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop&crop=center' },
    { name: 'Jaromir Kavan', url: 'https://unsplash.com/@jerrykavan', imageUrl: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&h=600&fit=crop&crop=center' },
    { name: 'Dino Reichmuth', url: 'https://i.pinimg.com/originals/51/0f/5c/510f5c46255585b7e57b6bc3c12d69fb.jpg', imageUrl: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&h=600&fit=crop&crop=center' },
    { name: 'Sylvain Mauroux', url: 'https://i.pinimg.com/originals/4a/ef/c7/4aefc76d89f60dae5d72ee4df85dca2e.jpg', imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop&crop=center' },
    { name: 'Sime Basioli', url: 'https://images.unsplash.com/photo-1585238827869-205910be89bf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80', imageUrl: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&h=600&fit=crop&crop=center' },
    { name: 'Braden Jarvis', url: 'https://i.pinimg.com/originals/76/f3/00/76f300a955ddfac2de2a1369f0329844.png', imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop&crop=center' },
    { name: 'Simon Migaj', url: 'https://images.pexels.com/photos/1166881/pexels-photo-1166881.jpeg?cs=srgb&dl=pexels-simon-migaj-1166881.jpg&fm=jpg', imageUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&h=600&fit=crop&crop=center' },
    { name: 'Arto Marttinen', url: 'https://images.unsplash.com/photo-1470125634816-ede3f51bbb42?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8N3x8fGVufDB8fHx8fA%3D%3D', imageUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop&crop=center' },
    { name: 'Emile Guillemot', url: 'https://i.pinimg.com/736x/85/ba/a7/85baa739cc3b61f4428c84adffdaffec.jpg', imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop&crop=center' },
    { name: 'Thomas Tucker', url: 'https://images.unsplash.com/photo-1713643562822-5a992959ead3?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MjB8fHxlbnwwfHx8fHw%3D', imageUrl: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&h=600&fit=crop&crop=center' },
    { name: 'Davide Cantelli', url: 'http://images.unsplash.com/photo-1551746698-990d4dfb835e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjEyMDd9', imageUrl: 'https://images.unsplash.com/profile-1627997363862-ef8e932e79adimage?bg=fff&crop=faces&h=150&w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }
  ],
  'Cruise': [
    { name: 'Alonso Reyes', url: 'https://i.pinimg.com/originals/29/3d/22/293d22e8ef163d1cbb23b3d97b50d051.jpg', imageUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&h=600&fit=crop&crop=center' },
    { name: 'Josiah Farrow', url: 'https://images.pexels.com/photos/3686884/pexels-photo-3686884.jpeg?cs=srgb&dl=pexels-josiahfarrow-3686884.jpg&fm=jpg', imageUrl: 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?w=800&h=600&fit=crop&crop=center' },
    { name: 'Vidar Nordli-Mathisen', url: 'https://i.pinimg.com/originals/e4/5a/2f/e45a2f7bd6a13e9c5a8bfedb38210120.jpg', imageUrl: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800&h=600&fit=crop&crop=center' }
  ],
  'Culture': [
    { name: 'Anthony Tran', url: 'https://i.pinimg.com/originals/a1/7f/a8/a17fa81846cd4f78c8df7247678293a2.png', imageUrl: 'https://images.unsplash.com/photo-1557296387-5358ad7997bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bW9kZWwlMjBmYWNlfGVufDB8fDB8fHww&w=1000&q=80' },
    { name: 'Jingda Chen', url: 'https://i.pinimg.com/736x/0d/a4/88/0da488a56c585bbe6fd1f6dd210c8fe3.jpg', imageUrl: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' },
    { name: 'Esteban Castle', url: 'https://i.pinimg.com/736x/33/e1/30/33e130c6601181be70b263ec691fd876.jpg', imageUrl: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=800&h=600&fit=crop&crop=center' },
    { name: 'Jezael Melgoza', url: 'https://images.unsplash.com/opengraph/1x1.png?auto=format&fit=crop&w=1200&h=630&q=60&mark-w=64&mark-align=top%2Cleft&mark-pad=50&blend-w=1&mark=https:%2F%2Fimages.unsplash.com%2Fopengraph%2Flogo.png&blend=https:%2F%2Fimages.unsplash.com%2Fopengraph%2F1x1.png%3Fauto%3Dformat%26fit%3Dcrop%26w%3D1200%26h%3D630%26q%3D60%26mark-align%3Dcenter%26mark-y%3D365%26mark%3Dhttps%253A%252F%252Fassets.imgix.net%252F~text%253Fauto%253Dformat%2526fit%253Dcrop%2526w%253D840%2526h%253D180%2526q%253D60%2526mark-align%253Dcenter%2526txt-color%253Dfff%2526txt-size%253D64%2526txt-align%253Dtop%25252Ccenter%2526fm%253Dpng%2526txt-font%253DHelvetica%25252520Neue%25252520Bol%2526txt%253DJezael%252520Melgoza%26blend%3Dhttps%253A%252F%252Fimages.unsplash.com%252Fphoto-1670269216771-11c9d6c98f8b%253Fcrop%253Dfaces%25252Cedges%2526cs%253Dtinysrgb%2526fit%253Dcrop%2526fm%253Djpg%2526ixid%253DMnwxMjA3fDB8MXxhbGx8MXx8fHx8fDJ8fDE2NzA0MTU3ODI%2526ixlib%253Drb-4.0.3%2526q%253D60%2526w%253D1200%2526auto%253Dformat%2526h%253D630%2526mark-w%253D160%2526mark-align%253Dcenter%2526mark-y%253D190%2526blend-mode%253Dnormal%2526blend-alpha%253D30%2526mark%253Dhttps%25253A%25252F%25252Fimages.unsplash.com%25252Fprofile-1511465047921-6b140eb0210b%25253Fixlib%25253Drb-4.0.3%252526crop%25253Dfaces%252526fit%25253Dcrop%252526w%25253D160%252526h%25253D160%252526auto%25253Dformat%252526q%25253D60%252526fm%25253Dpng%252526mask%25253Dellipse%2526blend%253D000000', imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop&crop=center' },
    { name: 'Raimond Klavins', url: 'https://i.pinimg.com/originals/7f/ee/8d/7fee8d2fa0ccc4784d809dfd32e823eb.png', imageUrl: 'https://images.unsplash.com/photo-1551913902-c92207136625?w=800&h=600&fit=crop&crop=center' },
    { name: 'Heidi Kaden', url: 'https://images.unsplash.com/profile-1618902649659-eacbad541215image?bg=fff&crop=faces&h=150&w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', imageUrl: 'https://images.unsplash.com/photo-1552084117-56a987666449?w=800&h=600&fit=crop&crop=center' },
    { name: 'Shifaaz Shamoon', url: 'https://i.pinimg.com/originals/7c/0b/93/7c0b93a032f84dff322403519db5766f.jpg', imageUrl: 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=800&h=600&fit=crop&crop=center' },
    { name: 'Dario Bronnimann', url: 'https://i.pinimg.com/originals/2e/f7/d7/2ef7d781f64f6c4104ba88bac5840feb.jpg', imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&h=600&fit=crop&crop=center' }
  ],
  'Food & Wine': [
    { name: 'Brooke Lark', url: 'https://images.unsplash.com/photo-1546456674-8aa8c81b9b8e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&crop=center' },
    { name: 'Kelsey Knight', url: 'https://i.pinimg.com/736x/2b/48/00/2b480080ad71392701d9b7020c09c17e--homework-portrait-photo.jpg', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop&crop=center' }
  ],
  'Adventure': [
    { name: 'Flo Maderebner', url: 'https://i.pinimg.com/736x/a7/18/d5/a718d57ed5d12cba64418ef521e96fd6.jpg', imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop&crop=center' }
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
      imageUrl: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&h=600&fit=crop&crop=center',
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
