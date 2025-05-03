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
  'Simon Migaj': 'https://images.unsplash.com/photo-1508672019048-805c876b67e2'
};

// Category-specific photographers
const CATEGORY_PHOTOGRAPHERS = {
  'Travel': ['Jakob Owens', 'Asoggetti', 'Jaromir Kavan', 'Dino Reichmuth', 'Sylvain Mauroux'],
  'Cruise': ['Alonso Reyes', 'Josiah Farrow', 'Vidar Nordli-Mathisen'],
  'Destination': ['Jakob Owens', 'Asoggetti', 'Jaromir Kavan', 'Dino Reichmuth', 'Sylvain Mauroux'],
  'Adventure': ['Flo Maderebner', 'Dino Reichmuth', 'Simon Migaj'],
  'Culture': ['Anthony Tran', 'Jingda Chen', 'Esteban Castle', 'Jezael Melgoza'],
  'Food & Wine': ['Brooke Lark', 'Kelsey Knight'],
  'Airline': ['Jakob Owens', 'Dino Reichmuth', 'Simon Migaj'],
  'Hotel': ['Jakob Owens', 'Dino Reichmuth', 'Simon Migaj'],
  'Article': ['Jakob Owens', 'Dino Reichmuth', 'Simon Migaj', 'Asoggetti', 'Jaromir Kavan']
};

// Different photographers for different categories with real Unsplash photographers
const PHOTOGRAPHERS = {
  'Travel': [
    { name: 'Jakob Owens', url: 'https://unsplash.com/@jakobowens1' },
    { name: 'Asoggetti', url: 'https://unsplash.com/@asoggetti' },
    { name: 'Jaromir Kavan', url: 'https://unsplash.com/@jerrykavan' },
    { name: 'Dino Reichmuth', url: 'https://unsplash.com/@dinoreichmuth' },
    { name: 'Sylvain Mauroux', url: 'https://unsplash.com/@sylvainmauroux' }
  ],
  'Cruise': [
    { name: 'Alonso Reyes', url: 'https://unsplash.com/@alonsoreyes' },
    { name: 'Josiah Farrow', url: 'https://unsplash.com/@josiahfarrow' },
    { name: 'Vidar Nordli-Mathisen', url: 'https://unsplash.com/@vidarnm' }
  ],
  'Destination': [
    { name: 'Jakob Owens', url: 'https://unsplash.com/@jakobowens1' },
    { name: 'Asoggetti', url: 'https://unsplash.com/@asoggetti' },
    { name: 'Jaromir Kavan', url: 'https://unsplash.com/@jerrykavan' }
  ],
  'Adventure': [
    { name: 'Flo Maderebner', url: 'https://unsplash.com/@flomaderebner' },
    { name: 'Dino Reichmuth', url: 'https://unsplash.com/@dinoreichmuth' },
    { name: 'Simon Migaj', url: 'https://unsplash.com/@simonmigaj' }
  ],
  'Culture': [
    { name: 'Anthony Tran', url: 'https://unsplash.com/@anthonytran' },
    { name: 'Jingda Chen', url: 'https://unsplash.com/@jingda' },
    { name: 'Jezael Melgoza', url: 'https://unsplash.com/@jezar' }
  ],
  'Food & Wine': [
    { name: 'Brooke Lark', url: 'https://unsplash.com/@brookelark' },
    { name: 'Kelsey Knight', url: 'https://unsplash.com/@kelseyannvere' }
  ],
  'Airline': [
    { name: 'Jakob Owens', url: 'https://unsplash.com/@jakobowens1' },
    { name: 'Dino Reichmuth', url: 'https://unsplash.com/@dinoreichmuth' },
    { name: 'Simon Migaj', url: 'https://unsplash.com/@simonmigaj' }
  ],
  'Hotel': [
    { name: 'Jakob Owens', url: 'https://unsplash.com/@jakobowens1' },
    { name: 'Dino Reichmuth', url: 'https://unsplash.com/@dinoreichmuth' },
    { name: 'Simon Migaj', url: 'https://unsplash.com/@simonmigaj' }
  ],
  'Article': [
    { name: 'Jakob Owens', url: 'https://unsplash.com/@jakobowens1' },
    { name: 'Dino Reichmuth', url: 'https://unsplash.com/@dinoreichmuth' },
    { name: 'Simon Migaj', url: 'https://unsplash.com/@simonmigaj' }
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
    // Only consider it valid if it starts with http
    return url.startsWith('http');
  } catch (error) {
    return false;
  }
}

/**
 * Get a unique image URL and photographer based on the story title and category
 * @param {string} title - The story title
 * @param {string} category - The story category
 * @returns {Object} An object with imageUrl, photographer name and URL
 */
function getUniqueImageAndPhotographer(title, category) {
  // Find a matching category or use Article as default
  const categoryKey = Object.keys(CATEGORY_PHOTOGRAPHERS).find(key =>
    category.toLowerCase().includes(key.toLowerCase())
  ) || 'Article';

  // Get the photographers for this category
  const photographersForCategory = CATEGORY_PHOTOGRAPHERS[categoryKey];

  // Use the story title to deterministically select a photographer
  const titleHash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const photographerIndex = titleHash % photographersForCategory.length;
  const photographerName = photographersForCategory[photographerIndex];

  // Get the image URL for this photographer
  const imageUrl = PHOTOGRAPHER_IMAGES[photographerName];

  // Create the photographer object
  const photographer = {
    name: photographerName,
    url: `https://unsplash.com/@${photographerName.toLowerCase().replace(/\s+/g, '')}`
  };

  // Special cases for URLs that don't follow the pattern
  if (photographerName === 'Jakob Owens') {
    photographer.url = 'https://unsplash.com/@jakobowens1';
  } else if (photographerName === 'Jaromir Kavan') {
    photographer.url = 'https://unsplash.com/@jerrykavan';
  } else if (photographerName === 'Dino Reichmuth') {
    photographer.url = 'https://unsplash.com/@dinoreichmuth';
  } else if (photographerName === 'Sylvain Mauroux') {
    photographer.url = 'https://unsplash.com/@sylvainmauroux';
  } else if (photographerName === 'Vidar Nordli-Mathisen') {
    photographer.url = 'https://unsplash.com/@vidarnm';
  } else if (photographerName === 'Flo Maderebner') {
    photographer.url = 'https://unsplash.com/@flomaderebner';
  } else if (photographerName === 'Anthony Tran') {
    photographer.url = 'https://unsplash.com/@anthonytran';
  } else if (photographerName === 'Jingda Chen') {
    photographer.url = 'https://unsplash.com/@jingda';
  } else if (photographerName === 'Esteban Castle') {
    photographer.url = 'https://unsplash.com/@estebancastel';
  } else if (photographerName === 'Jezael Melgoza') {
    photographer.url = 'https://unsplash.com/@jezar';
  } else if (photographerName === 'Brooke Lark') {
    photographer.url = 'https://unsplash.com/@brookelark';
  } else if (photographerName === 'Kelsey Knight') {
    photographer.url = 'https://unsplash.com/@kelseyannvere';
  } else if (photographerName === 'Simon Migaj') {
    photographer.url = 'https://unsplash.com/@simonmigaj';
  } else if (photographerName === 'Alonso Reyes') {
    photographer.url = 'https://unsplash.com/@alonsoreyes';
  } else if (photographerName === 'Josiah Farrow') {
    photographer.url = 'https://unsplash.com/@josiahfarrow';
  }

  return {
    imageUrl: imageUrl,
    photographer: photographer
  };
}

/**
 * Get a unique image URL based on the story title and category
 * @param {string} title - The story title
 * @param {string} category - The story category
 * @returns {string} A valid image URL
 */
function getUniqueImageUrl(title, category) {
  return getUniqueImageAndPhotographer(title, category).imageUrl;
}

/**
 * Get a unique photographer based on the story title and category
 * @param {string} title - The story title
 * @param {string} category - The story category
 * @returns {Object} A photographer object with name and URL
 */
function getUniquePhotographer(title, category) {
  return getUniqueImageAndPhotographer(title, category).photographer;
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

        // Fix the >- YAML syntax in summary and metaDescription
        if (data.summary === '>-' || data.summary === '') {
          // Generate a summary based on the first paragraph of content
          const firstParagraph = content.split('\n\n').find(p => p.trim() !== '');
          data.summary = firstParagraph ? firstParagraph.substring(0, 150) + '...' : '';
        }

        if (data.metaDescription === '>-' || data.metaDescription === '') {
          // Use the summary as meta description
          data.metaDescription = data.summary;
        }

        // Always update the image URL to ensure uniqueness
        // Get the category or use 'Article' as default
        const category = data.type || data.category || 'Article';

        // Get a unique image URL and photographer based on the title, slug, and category
        // Adding the file name to ensure uniqueness
        const { imageUrl, photographer } = getUniqueImageAndPhotographer(data.title + '-' + file, category);

        // Update the image URL to match the photographer
        data.imageUrl = imageUrl;

        // Update the photographer information
        if (!data.photographer) {
          data.photographer = {};
        }

        data.photographer.name = photographer.name;
        data.photographer.url = photographer.url;

        // Log what we're doing
        console.log(`Setting image URL for ${file} to ${imageUrl} with photographer ${photographer.name}`);

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
  // Only consider URLs that start with http as valid
  return isValidUrl(url);
}

// Run the script
fixImageUrls();
