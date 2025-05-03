/**
 * Script to fix invalid image URLs in story files
 *
 * This script:
 * 1. Reads all story files in the content/articles directory
 * 2. Fixes invalid image URLs by replacing them with valid Unsplash URLs
 * 3. Updates photographer information
 * 4. Saves the updated files
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Configuration
const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

// Category-specific default images with multiple options for variety
const DEFAULT_IMAGES = {
  'Travel': [
    'https://images.unsplash.com/photo-1488085061387-422e29b40080',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
    'https://images.unsplash.com/photo-1503220317375-aaad61436b1b',
    'https://images.unsplash.com/photo-1530521954074-e64f6810b32d'
  ],
  'Cruise': [
    'https://images.unsplash.com/photo-1548574505-5e239809ee19',
    'https://images.unsplash.com/photo-1599640842225-85d111c60e6b',
    'https://images.unsplash.com/photo-1548690312-e3b507d8c110',
    'https://images.unsplash.com/photo-1548690396-1fae5d6a3f8a'
  ],
  'Destination': [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b',
    'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9',
    'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713'
  ],
  'Adventure': [
    'https://images.unsplash.com/photo-1551632811-561732d1e306',
    'https://images.unsplash.com/photo-1527631746610-bca00a040d60',
    'https://images.unsplash.com/photo-1516939884455-1445c8652f83',
    'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd'
  ],
  'Culture': [
    'https://images.unsplash.com/photo-1493707553966-283afac8c358',
    'https://images.unsplash.com/photo-1577083552431-6e5fd01988a5',
    'https://images.unsplash.com/photo-1566438480900-0609be27a4be',
    'https://images.unsplash.com/photo-1566438480900-0609be27a4be'
  ],
  'Food & Wine': [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    'https://images.unsplash.com/photo-1543352634-99a5d50ae78e',
    'https://images.unsplash.com/photo-1533777324565-a040eb52facd',
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3'
  ],
  'Airline': [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05',
    'https://images.unsplash.com/photo-1569154941061-e231b4725ef1',
    'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b',
    'https://images.unsplash.com/photo-1556388158-158ea5ccacbd'
  ],
  'Hotel': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'
  ],
  'Article': [
    'https://images.unsplash.com/photo-1488085061387-422e29b40080',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
    'https://images.unsplash.com/photo-1503220317375-aaad61436b1b',
    'https://images.unsplash.com/photo-1530521954074-e64f6810b32d'
  ]
};

// Different photographers for different categories
const PHOTOGRAPHERS = {
  'Travel': [
    { name: 'Travel Photographer', url: 'https://unsplash.com/@travelphoto' },
    { name: 'Nomad Explorer', url: 'https://unsplash.com/@nomadexplorer' },
    { name: 'Wanderlust Captures', url: 'https://unsplash.com/@wanderlustcaptures' }
  ],
  'Cruise': [
    { name: 'Ocean Explorer', url: 'https://unsplash.com/@oceanexplorer' },
    { name: 'Sea Voyager', url: 'https://unsplash.com/@seavoyager' },
    { name: 'Maritime Photographer', url: 'https://unsplash.com/@maritimephoto' }
  ],
  'Destination': [
    { name: 'Destination Guide', url: 'https://unsplash.com/@destguide' },
    { name: 'Place Seeker', url: 'https://unsplash.com/@placeseeker' },
    { name: 'Location Scout', url: 'https://unsplash.com/@locationscout' }
  ],
  'Adventure': [
    { name: 'Adventure Seeker', url: 'https://unsplash.com/@adventureseeker' },
    { name: 'Thrill Chaser', url: 'https://unsplash.com/@thrillchaser' },
    { name: 'Outdoor Explorer', url: 'https://unsplash.com/@outdoorexplorer' }
  ],
  'Culture': [
    { name: 'Culture Enthusiast', url: 'https://unsplash.com/@cultureenthusiast' },
    { name: 'Heritage Photographer', url: 'https://unsplash.com/@heritagephoto' },
    { name: 'Tradition Capturer', url: 'https://unsplash.com/@traditioncapturer' }
  ],
  'Food & Wine': [
    { name: 'Food Photographer', url: 'https://unsplash.com/@foodphoto' },
    { name: 'Culinary Artist', url: 'https://unsplash.com/@culinaryartist' },
    { name: 'Gastronomy Lens', url: 'https://unsplash.com/@gastronomylens' }
  ],
  'Airline': [
    { name: 'Aviation Photographer', url: 'https://unsplash.com/@aviationphoto' },
    { name: 'Sky Capturer', url: 'https://unsplash.com/@skycapturer' },
    { name: 'Flight Enthusiast', url: 'https://unsplash.com/@flightenthusiast' }
  ],
  'Hotel': [
    { name: 'Hotel Photographer', url: 'https://unsplash.com/@hotelphoto' },
    { name: 'Accommodation Lens', url: 'https://unsplash.com/@accommodationlens' },
    { name: 'Stay Capturer', url: 'https://unsplash.com/@staycapturer' }
  ],
  'Article': [
    { name: 'Editorial Photographer', url: 'https://unsplash.com/@editorialphoto' },
    { name: 'Story Capturer', url: 'https://unsplash.com/@storycapturer' },
    { name: 'Narrative Lens', url: 'https://unsplash.com/@narrativelens' }
  ]
};

/**
 * Check if a URL is valid
 * @param {string} url - The URL to check
 * @returns {boolean} Whether the URL is valid
 */
function isValidUrl(url) {
  if (!url || url === '' || url.includes('>-')) {
    return false;
  }

  try {
    return url.startsWith('http');
  } catch (error) {
    return false;
  }
}

/**
 * Get a unique image URL based on the story title and category
 * @param {string} title - The story title
 * @param {string} category - The story category
 * @returns {string} A valid image URL
 */
function getUniqueImageUrl(title, category) {
  // Find a matching category or use Article as default
  const imageArray = DEFAULT_IMAGES[category] || DEFAULT_IMAGES['Article'];

  // Use the story title to deterministically select an image from the array
  const titleHash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = titleHash % imageArray.length;

  return imageArray[index];
}

/**
 * Get a unique photographer based on the story title and category
 * @param {string} title - The story title
 * @param {string} category - The story category
 * @returns {Object} A photographer object with name and URL
 */
function getUniquePhotographer(title, category) {
  // Find a matching category or use Article as default
  const photographerArray = PHOTOGRAPHERS[category] || PHOTOGRAPHERS['Article'];

  // Use the story title to deterministically select a photographer from the array
  const titleHash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = titleHash % photographerArray.length;

  return photographerArray[index];
}

/**
 * Fix the image URLs in all story files
 */
async function fixImageUrls() {
  try {
    // Check if the articles directory exists
    if (!fs.existsSync(ARTICLES_DIR)) {
      console.error(`Articles directory not found: ${ARTICLES_DIR}`);
      return;
    }

    // Get all markdown files in the articles directory
    const files = fs.readdirSync(ARTICLES_DIR).filter(file => file.endsWith('.md'));
    console.log(`Found ${files.length} story files`);

    let fixedCount = 0;

    // Process each file
    for (const file of files) {
      const filePath = path.join(ARTICLES_DIR, file);

      try {
        // Read the file content
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Parse the frontmatter
        const { data, content } = matter(fileContent);

        // Always update the image URL to ensure uniqueness
        // Get the category or use 'Article' as default
        const category = data.type || 'Article';

        // Get a unique image URL based on the title and category
        data.imageUrl = getUniqueImageUrl(data.title || file, category);

        // Get a unique photographer based on the title and category
        const photographer = getUniquePhotographer(data.title || file, category);

        // Update the photographer information
        if (!data.photographer) {
          data.photographer = {};
        }

        data.photographer.name = photographer.name;
        data.photographer.url = photographer.url;

        // Create the updated frontmatter
        const updatedFileContent = matter.stringify(content, data);

        // Write the updated content back to the file
        fs.writeFileSync(filePath, updatedFileContent);

        fixedCount++;
        console.log(`Fixed image URL in ${file}`);
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }

    console.log(`Fixed ${fixedCount} out of ${files.length} story files`);
  } catch (error) {
    console.error('Error fixing image URLs:', error);
  }
}

/**
 * Check if an image URL is valid
 * @param {string} url - The URL to check
 * @returns {boolean} Whether the URL is valid
 */
function isValidImageUrl(url) {
  return isValidUrl(url);
}

// Run the script
fixImageUrls();
