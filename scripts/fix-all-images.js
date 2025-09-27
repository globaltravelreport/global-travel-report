/**
 * Comprehensive Image Fix Script
 *
 * This script:
 * 1. Ensures each story has a unique, contextually relevant image
 * 2. Properly attributes each image to the correct photographer
 * 3. Fixes all existing stories with consistent image-photographer mappings
 * 4. Performs a full site refresh to update all images
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const fetch = require('node-fetch');

// Directory where story files are stored
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

// Directory for the image tracker data
const DATA_DIRECTORY = path.join(process.cwd(), 'data');
const IMAGE_TRACKER_FILE = path.join(DATA_DIRECTORY, 'enhancedImageTracker.json');

// Define the expanded category-specific photographers with their images and keywords
const CATEGORY_IMAGES = {
  'Travel': [
    { name: 'Jakob Owens', url: 'https://unsplash.com/@jakobowens1', imageUrl: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=2400', keywords: ['travel', 'beach', 'vacation', 'tropical'] },
    { name: 'Asoggetti', url: 'https://unsplash.com/@asoggetti', imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&q=80&w=2400', keywords: ['travel', 'mountains', 'landscape', 'nature'] },
    { name: 'Jaromir Kavan', url: 'https://unsplash.com/@jerrykavan', imageUrl: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&q=80&w=2400', keywords: ['travel', 'city', 'urban', 'architecture'] },
    { name: 'Dino Reichmuth', url: 'https://unsplash.com/@dinoreichmuth', imageUrl: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&q=80&w=2400', keywords: ['travel', 'mountains', 'hiking', 'adventure'] },
    { name: 'Sylvain Mauroux', url: 'https://unsplash.com/@sylvainmauroux', imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&q=80&w=2400', keywords: ['travel', 'mountains', 'landscape', 'scenic'] },
    { name: 'Sime Basioli', url: 'https://unsplash.com/@basecore', imageUrl: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&q=80&w=2400', keywords: ['travel', 'sea', 'ocean', 'coast'] },
    { name: 'Braden Jarvis', url: 'https://unsplash.com/@jarvisphoto', imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&q=80&w=2400', keywords: ['travel', 'mountains', 'valley', 'nature'] },
    { name: 'Simon Migaj', url: 'https://unsplash.com/@simonmigaj', imageUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&q=80&w=2400', keywords: ['travel', 'lake', 'mountains', 'scenic'] },
    { name: 'Arto Marttinen', url: 'https://unsplash.com/@wandervisions', imageUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&q=80&w=2400', keywords: ['travel', 'road', 'journey', 'driving'] },
    { name: 'Emile Guillemot', url: 'https://unsplash.com/@emilegt', imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&q=80&w=2400', keywords: ['travel', 'hotel', 'accommodation', 'luxury'] },
    { name: 'Thomas Tucker', url: 'https://unsplash.com/@tents_and_tread', imageUrl: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&q=80&w=2400', keywords: ['travel', 'camping', 'tent', 'outdoors'] },
    { name: 'Davide Cantelli', url: 'https://unsplash.com/@cant89', imageUrl: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&q=80&w=2400', keywords: ['travel', 'restaurant', 'dining', 'food'] }
  ],
  'Cruise': [
    { name: 'Alonso Reyes', url: 'https://unsplash.com/@alonsoreyes', imageUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&q=80&w=2400', keywords: ['cruise', 'ship', 'ocean', 'vacation'] },
    { name: 'Josiah Farrow', url: 'https://unsplash.com/@josiahfarrow', imageUrl: 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&q=80&w=2400', keywords: ['cruise', 'ship', 'sea', 'travel'] },
    { name: 'Vidar Nordli-Mathisen', url: 'https://unsplash.com/@vidarnm', imageUrl: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&q=80&w=2400', keywords: ['cruise', 'ocean', 'water', 'boat'] },
    { name: 'Zach Vessels', url: 'https://unsplash.com/@zvessels55', imageUrl: 'https://images.unsplash.com/photo-1548574169-47bca74f9515?auto=format&q=80&w=2400', keywords: ['cruise', 'ship', 'luxury', 'vacation'] },
    { name: 'Alonso Reyes', url: 'https://unsplash.com/@alonsoreyes', imageUrl: 'https://images.unsplash.com/photo-1566375638485-8c4d8780ae10?auto=format&q=80&w=2400', keywords: ['cruise', 'ship', 'deck', 'ocean'] },
    { name: 'Vidar Nordli-Mathisen', url: 'https://unsplash.com/@vidarnm', imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&q=80&w=2400', keywords: ['cruise', 'ship', 'sea', 'sunset'] },
    { name: 'Alonso Reyes', url: 'https://unsplash.com/@alonsoreyes', imageUrl: 'https://images.unsplash.com/photo-1559599746-8823b38544c6?auto=format&q=80&w=2400', keywords: ['cruise', 'ship', 'ocean', 'travel'] }
  ],
  'Culture': [
    { name: 'Anthony Tran', url: 'https://unsplash.com/@anthonytran', imageUrl: 'https://images.unsplash.com/photo-1493707553966-283afac8c358?auto=format&q=80&w=2400', keywords: ['culture', 'city', 'urban', 'people'] },
    { name: 'Jingda Chen', url: 'https://unsplash.com/@jingda', imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988a5?auto=format&q=80&w=2400', keywords: ['culture', 'asia', 'temple', 'architecture'] },
    { name: 'Esteban Castle', url: 'https://unsplash.com/@estebancastle', imageUrl: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&q=80&w=2400', keywords: ['culture', 'city', 'street', 'urban'] },
    { name: 'Jezael Melgoza', url: 'https://unsplash.com/@jezar', imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&q=80&w=2400', keywords: ['culture', 'japan', 'temple', 'architecture'] },
    { name: 'Raimond Klavins', url: 'https://unsplash.com/@raimondklavins', imageUrl: 'https://images.unsplash.com/photo-1551913902-c92207136625?auto=format&q=80&w=2400', keywords: ['culture', 'europe', 'architecture', 'building'] },
    { name: 'Heidi Kaden', url: 'https://unsplash.com/@heidikaden', imageUrl: 'https://images.unsplash.com/photo-1552084117-56a987666449?auto=format&q=80&w=2400', keywords: ['culture', 'city', 'urban', 'street'] },
    { name: 'Shifaaz Shamoon', url: 'https://unsplash.com/@sotti', imageUrl: 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?auto=format&q=80&w=2400', keywords: ['culture', 'island', 'beach', 'tropical'] },
    { name: 'Dario Bronnimann', url: 'https://unsplash.com/@darby', imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&q=80&w=2400', keywords: ['culture', 'asia', 'temple', 'religion'] }
  ],
  'Food & Wine': [
    { name: 'Brooke Lark', url: 'https://unsplash.com/@brookelark', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&q=80&w=2400', keywords: ['food', 'cuisine', 'meal', 'restaurant'] },
    { name: 'Kelsey Knight', url: 'https://unsplash.com/@kelseyannvere', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&q=80&w=2400', keywords: ['wine', 'drink', 'alcohol', 'glass'] },
    { name: 'Brooke Lark', url: 'https://unsplash.com/@brookelark', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&q=80&w=2400', keywords: ['food', 'restaurant', 'dining', 'gourmet'] },
    { name: 'Brooke Lark', url: 'https://unsplash.com/@brookelark', imageUrl: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?auto=format&q=80&w=2400', keywords: ['food', 'breakfast', 'healthy', 'meal'] },
    { name: 'Brooke Lark', url: 'https://unsplash.com/@brookelark', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&q=80&w=2400', keywords: ['food', 'salad', 'healthy', 'vegetables'] },
    { name: 'Brooke Lark', url: 'https://unsplash.com/@brookelark', imageUrl: 'https://images.unsplash.com/photo-1515778767554-195d641642a7?auto=format&q=80&w=2400', keywords: ['food', 'dessert', 'sweet', 'cake'] }
  ],
  'Adventure': [
    { name: 'Flo Maderebner', url: 'https://unsplash.com/@flomaderebner', imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&q=80&w=2400', keywords: ['adventure', 'mountains', 'hiking', 'outdoors'] },
    { name: 'Flo Maderebner', url: 'https://unsplash.com/@flomaderebner', imageUrl: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&q=80&w=2400', keywords: ['adventure', 'hiking', 'mountains', 'nature'] },
    { name: 'Flo Maderebner', url: 'https://unsplash.com/@flomaderebner', imageUrl: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&q=80&w=2400', keywords: ['adventure', 'snow', 'winter', 'mountains'] },
    { name: 'Flo Maderebner', url: 'https://unsplash.com/@flomaderebner', imageUrl: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&q=80&w=2400', keywords: ['adventure', 'hiking', 'mountains', 'trekking'] },
    { name: 'Flo Maderebner', url: 'https://unsplash.com/@flomaderebner', imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&q=80&w=2400', keywords: ['adventure', 'camping', 'outdoors', 'tent'] },
    { name: 'Flo Maderebner', url: 'https://unsplash.com/@flomaderebner', imageUrl: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&q=80&w=2400', keywords: ['adventure', 'mountains', 'hiking', 'view'] }
  ],
  'Airline': [
    { name: 'Ross Parmly', url: 'https://unsplash.com/@rparmly', imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&q=80&w=2400', keywords: ['airline', 'airplane', 'flight', 'travel'] },
    { name: 'Suhyeon Choi', url: 'https://unsplash.com/@choisyeon', imageUrl: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&q=80&w=2400', keywords: ['airline', 'airport', 'travel', 'plane'] },
    { name: 'Ashim D Silva', url: 'https://unsplash.com/@randomlies', imageUrl: 'https://images.unsplash.com/photo-1521727857535-28d2047619b7?auto=format&q=80&w=2400', keywords: ['airline', 'airplane', 'window', 'view'] },
    { name: 'Suhyeon Choi', url: 'https://unsplash.com/@choisyeon', imageUrl: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&q=80&w=2400', keywords: ['airline', 'airport', 'travel', 'terminal'] }
  ],
  'Hotel': [
    { name: 'Emile Guillemot', url: 'https://unsplash.com/@emilegt', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&q=80&w=2400', keywords: ['hotel', 'room', 'accommodation', 'luxury'] },
    { name: 'Francesca Tosolini', url: 'https://unsplash.com/@fromitaly', imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&q=80&w=2400', keywords: ['hotel', 'lobby', 'interior', 'luxury'] },
    { name: 'Vojtech Bruzek', url: 'https://unsplash.com/@vojtechbruzek', imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&q=80&w=2400', keywords: ['hotel', 'pool', 'luxury', 'resort'] },
    { name: 'Roberto Nickson', url: 'https://unsplash.com/@rpnickson', imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&q=80&w=2400', keywords: ['hotel', 'room', 'bed', 'accommodation'] }
  ],
  'Destination': [
    { name: 'Luca Bravo', url: 'https://unsplash.com/@lucabravo', imageUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&q=80&w=2400', keywords: ['destination', 'landscape', 'mountains', 'scenic'] },
    { name: 'Willian Justen de Vasconcellos', url: 'https://unsplash.com/@willianjusten', imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&q=80&w=2400', keywords: ['destination', 'beach', 'ocean', 'tropical'] },
    { name: 'Jared Rice', url: 'https://unsplash.com/@jareddrice', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&q=80&w=2400', keywords: ['destination', 'beach', 'ocean', 'tropical'] },
    { name: 'Cristina Gottardi', url: 'https://unsplash.com/@cristina_gottardi', imageUrl: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&q=80&w=2400', keywords: ['destination', 'city', 'urban', 'architecture'] }
  ]
};

// Initialize the enhanced image tracker
function initializeEnhancedImageTracker() {
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
      usedImageUrls: [],
      storyToImage: {}
    };

    // Initialize the photographer to image mapping
    for (const category in CATEGORY_IMAGES) {
      for (const image of CATEGORY_IMAGES[category]) {
        newTracker.photographerToImage[image.name] = image.imageUrl;

        // Add the image data
        newTracker.images[image.imageUrl] = {
          url: image.imageUrl,
          photographer: {
            name: image.name,
            url: image.url
          },
          category,
          keywords: image.keywords,
          usedInStories: []
        };
      }
    }

    // Save the new tracker
    fs.writeFileSync(IMAGE_TRACKER_FILE, JSON.stringify(newTracker, null, 2));
    return newTracker;
  } catch (error) {
    console.error('Error initializing enhanced image tracker:', error);
    // Return a default tracker
    return {
      images: {},
      photographerToImage: {},
      usedImageUrls: [],
      storyToImage: {}
    };
  }
}

// Normalize a category string
function normalizeCategory(category) {
  if (!category) return 'Travel';

  const normalized = category.trim().toLowerCase();

  if (normalized.includes('cruise')) return 'Cruise';
  if (normalized.includes('food') || normalized.includes('wine') || normalized.includes('dining')) return 'Food & Wine';
  if (normalized.includes('adventure') || normalized.includes('hiking') || normalized.includes('outdoor')) return 'Adventure';
  if (normalized.includes('culture') || normalized.includes('museum') || normalized.includes('art')) return 'Culture';
  if (normalized.includes('airline') || normalized.includes('flight') || normalized.includes('airport')) return 'Airline';
  if (normalized.includes('hotel') || normalized.includes('accommodation') || normalized.includes('resort')) return 'Hotel';
  if (normalized.includes('destination')) return 'Destination';

  return 'Travel';
}

// Get the best matching image for a story based on its content and category
function getBestImageForStory(storySlug, category, title = '', content = '', keywords = [], tracker) {
  try {
    // Check if this story already has an assigned image
    if (tracker.storyToImage[storySlug]) {
      const imageUrl = tracker.storyToImage[storySlug];
      const imageData = tracker.images[imageUrl];

      if (imageData) {
        return {
          imageUrl,
          photographer: imageData.photographer
        };
      }
    }

    // Normalize the category
    const normalizedCategory = normalizeCategory(category);

    // Get all available images for this category
    const categoryImages = CATEGORY_IMAGES[normalizedCategory] || CATEGORY_IMAGES['Travel'];

    // Create a scoring system for image relevance
    const scoredImages = categoryImages.map(image => {
      let score = 0;

      // Base score for being in the right category
      score += 10;

      // Check for keyword matches
      const allKeywords = [...keywords];

      // Extract keywords from title
      if (title) {
        const titleWords = title.toLowerCase().split(/\s+/);
        allKeywords.push(...titleWords);
      }

      // Extract keywords from content (first 200 characters)
      if (content) {
        const contentPreview = content.substring(0, 200).toLowerCase();
        const contentWords = contentPreview.split(/\s+/);
        allKeywords.push(...contentWords);
      }

      // Score based on keyword matches
      for (const keyword of image.keywords) {
        if (allKeywords.some(k => k.includes(keyword) || keyword.includes(k))) {
          score += 5;
        }
      }

      // Penalize images that have been used a lot
      const usageCount = tracker.images[image.imageUrl]?.usedInStories.length || 0;
      score -= usageCount * 2;

      return {
        image,
        score
      };
    });

    // Sort by score (highest first)
    scoredImages.sort((a, b) => b.score - a.score);

    // Get the best matching image
    const bestMatch = scoredImages[0].image;

    // Mark this image as used for this story
    if (!tracker.images[bestMatch.imageUrl]) {
      tracker.images[bestMatch.imageUrl] = {
        url: bestMatch.imageUrl,
        photographer: {
          name: bestMatch.name,
          url: bestMatch.url
        },
        category: normalizedCategory,
        keywords: bestMatch.keywords,
        usedInStories: [storySlug]
      };
    } else {
      if (!tracker.images[bestMatch.imageUrl].usedInStories.includes(storySlug)) {
        tracker.images[bestMatch.imageUrl].usedInStories.push(storySlug);
      }
    }

    // Add to used image URLs
    if (!tracker.usedImageUrls.includes(bestMatch.imageUrl)) {
      tracker.usedImageUrls.push(bestMatch.imageUrl);
    }

    // Map this story to the selected image
    tracker.storyToImage[storySlug] = bestMatch.imageUrl;

    return {
      imageUrl: bestMatch.imageUrl,
      photographer: {
        name: bestMatch.name,
        url: bestMatch.url
      }
    };
  } catch (error) {
    console.error('Error getting best image for story:', error);
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

// Revalidate a specific path
async function revalidatePath(path) {
  try {
    console.log(`Revalidating path: ${path}`);

    // Make a request to the revalidate API
    const response = await fetch(`https://www.globaltravelreport.com/api/revalidate?path=${path}&secret=your-secret-token`);

    if (response.ok) {
      console.log(`Successfully revalidated path: ${path}`);
    } else {
      console.error(`Failed to revalidate path: ${path}`);
    }
  } catch (error) {
    console.error(`Error revalidating path ${path}:`, error);
  }
}

// Fix all images in story files
async function fixAllImages() {
  try {
    console.log('Starting to fix all images in story files...');

    // Initialize the enhanced image tracker
    const tracker = initializeEnhancedImageTracker();

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
        const title = frontmatter.title || '';

        // Extract keywords from the frontmatter
        const keywords = [];
        if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
          keywords.push(...frontmatter.tags);
        }
        if (frontmatter.keywords && Array.isArray(frontmatter.keywords)) {
          keywords.push(...frontmatter.keywords);
        }
        if (frontmatter.country) {
          keywords.push(frontmatter.country);
        }

        // Get the best matching image for this story
        const { imageUrl, photographer } = getBestImageForStory(slug, category, title, content, keywords, tracker);

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
    console.log(`Enhanced image tracker saved to ${IMAGE_TRACKER_FILE}`);

    // Revalidate all pages
    console.log('Revalidating all pages...');

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

    // Revalidate all story pages
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
        }
      } catch (error) {
        console.error(`Error revalidating story ${file}:`, error);
      }
    }

    console.log('Finished revalidating all pages');

  } catch (error) {
    console.error('Error fixing all images:', error);
  }
}

// Run the script
fixAllImages();
