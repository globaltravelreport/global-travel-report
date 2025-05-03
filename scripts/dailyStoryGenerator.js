/**
 * Daily Story Generator
 *
 * This script automatically:
 * 1. Fetches 8 stories (including 2 cruise-related) from RSS feeds
 * 2. Rewrites them using OpenAI
 * 3. Adds Unsplash images with proper attribution
 * 4. Saves them as markdown files in the content directory
 *
 * Usage:
 * node scripts/dailyStoryGenerator.js [--count=8] [--cruise-count=2]
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs').promises;
const path = require('path');
const Parser = require('rss-parser');
const OpenAI = require('openai');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const matter = require('gray-matter');

// Configuration
const DEFAULT_STORY_COUNT = 8;
const DEFAULT_CRUISE_COUNT = 2;
const CONTENT_DIR = path.join(process.cwd(), 'content/articles');

// Initialize RSS parser
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['content:encoded', 'contentEncoded']
    ]
  }
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// RSS Feed URLs
const TRAVEL_FEEDS = [
  'https://www.travelandleisure.com/feed/all',
  'https://www.lonelyplanet.com/blog/feed/atom',
  'https://www.afar.com/rss/magazine',
  'https://www.nationalgeographic.com/travel/feeds/rss/all',
  'https://www.cntraveler.com/feed/rss',
  'https://www.smartertravel.com/feed/',
  'https://www.travelweekly.com/rss',
  'https://www.travelpulse.com/rss',
  'https://www.traveloffpath.com/feed/',
  'https://www.traveldailynews.com/feed/'
];

const CRUISE_FEEDS = [
  'https://www.cruisecritic.com/news/feed/',
  'https://www.cruisehive.com/feed',
  'https://www.cruiseradio.net/feed/',
  'https://www.cruiseindustrynews.com/cruise-news/feed/',
  'https://www.royalcaribbeanblog.com/taxonomy/term/1/feed'
];

// Stats tracking
const stats = {
  storiesFetched: 0,
  storiesRewritten: 0,
  storiesSaved: 0,
  errors: {
    fetching: 0,
    rewriting: 0,
    images: 0,
    saving: 0
  }
};

/**
 * Main function to generate daily stories
 */
async function generateDailyStories() {
  try {
    console.log('🚀 Starting daily story generation...');

    // Parse command line arguments
    const args = process.argv.slice(2);
    const storyCount = getArgValue(args, '--count', DEFAULT_STORY_COUNT);
    const cruiseCount = getArgValue(args, '--cruise-count', DEFAULT_CRUISE_COUNT);
    const regularCount = storyCount - cruiseCount;

    console.log(`📊 Configuration: Total stories=${storyCount}, Cruise stories=${cruiseCount}, Regular stories=${regularCount}`);

    // Step 1: Fetch stories from RSS feeds
    console.log('\n📡 Fetching stories from RSS feeds...');
    const travelStories = await fetchStoriesFromFeeds(TRAVEL_FEEDS, regularCount);
    const cruiseStories = await fetchStoriesFromFeeds(CRUISE_FEEDS, cruiseCount);

    // Combine stories
    const allStories = [...cruiseStories, ...travelStories];
    stats.storiesFetched = allStories.length;

    console.log(`✅ Fetched ${allStories.length} stories (${cruiseStories.length} cruise, ${travelStories.length} travel)`);

    // Step 2: Process each story
    console.log('\n🔄 Processing stories...');
    const processedStories = [];

    for (let i = 0; i < allStories.length; i++) {
      const story = allStories[i];
      console.log(`\n📝 Processing story ${i + 1}/${allStories.length}: "${story.title}"`);

      try {
        // Step 2a: Rewrite the story using OpenAI
        console.log('🤖 Rewriting with OpenAI...');
        const rewrittenStory = await rewriteStoryWithOpenAI(story);
        stats.storiesRewritten++;

        // Step 2b: Add an image from Unsplash
        console.log('🖼️ Adding Unsplash image...');
        const storyWithImage = await addUnsplashImage(rewrittenStory);

        // Add to processed stories
        processedStories.push(storyWithImage);
      } catch (error) {
        console.error(`❌ Error processing story: ${error.message}`);
        continue;
      }
    }

    // Step 3: Save stories to markdown files
    console.log('\n💾 Saving stories to markdown files...');
    await saveStoriesToMarkdown(processedStories);

    // Print summary
    console.log('\n✨ Daily story generation completed successfully!');
    console.log('📊 Summary:');
    console.log(`- Stories fetched: ${stats.storiesFetched}`);
    console.log(`- Stories rewritten: ${stats.storiesRewritten}`);
    console.log(`- Stories saved: ${stats.storiesSaved}`);
    console.log(`- Errors: ${Object.values(stats.errors).reduce((a, b) => a + b, 0)}`);

    return processedStories;
  } catch (error) {
    console.error('❌ Error generating daily stories:', error);
    process.exit(1);
  }
}

/**
 * Fetch stories from a list of RSS feeds
 * @param {string[]} feedUrls - Array of RSS feed URLs
 * @param {number} count - Number of stories to fetch
 * @returns {Promise<Array>} - Array of story objects
 */
async function fetchStoriesFromFeeds(feedUrls, count) {
  const allItems = [];

  // Try each feed until we have enough stories
  for (const feedUrl of feedUrls) {
    if (allItems.length >= count) break;

    try {
      console.log(`📡 Fetching from: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);

      // Add items from this feed
      for (const item of feed.items) {
        if (allItems.length >= count) break;

        // Extract content from various possible fields
        let content = item.contentEncoded || item.content || item.description || '';

        // Create a story object
        allItems.push({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          content: content,
          feedTitle: feed.title || 'Unknown Source',
          feedUrl: feedUrl,
          guid: item.guid || item.id || uuidv4()
        });
      }
    } catch (error) {
      console.warn(`⚠️ Error fetching feed ${feedUrl}: ${error.message}`);
      stats.errors.fetching++;
      continue;
    }
  }

  return allItems.slice(0, count);
}

/**
 * Rewrite a story using OpenAI
 * @param {Object} story - Original story object
 * @returns {Promise<Object>} - Rewritten story object
 */
async function rewriteStoryWithOpenAI(story) {
  try {
    // Create a prompt for OpenAI
    const prompt = `Rewrite the following travel article in the style of a professional Australian travel journalist.
Use Australian English (no slang). Make it engaging, informative, and detailed, as if written for a national travel magazine.
Keep the same key information and facts, but improve the writing style.

Title: ${story.title}

Content: ${story.content}

Rewrite the article and format it as follows:
1. Start with a catchy title (different from the original)
2. Write 4-6 paragraphs of engaging content
3. Include a brief conclusion

Also, provide the following metadata in JSON format at the end:
- category: The most appropriate category (e.g., Adventure, Culture, Cruise, Airline, Destination, etc.)
- country: The main country or region discussed
- excerpt: A brief 1-2 sentence summary of the article
- keywords: 3-5 relevant keywords`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional Australian travel journalist. Your writing style is engaging, informative, and objective. You use Australian English without slang, and your tone is polished and professional."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content || '';

    // Parse the response
    const { title, content, metadata } = parseOpenAIResponse(response, story);

    // Create a slug from the title
    const slug = createSlug(title);

    // Return the rewritten story
    return {
      ...story,
      originalTitle: story.title,
      title,
      content,
      slug,
      ...metadata,
      rewritten: true
    };
  } catch (error) {
    console.error('❌ Error rewriting with OpenAI:', error.message);
    stats.errors.rewriting++;

    // Return original story if rewriting fails
    return {
      ...story,
      slug: createSlug(story.title),
      rewritten: false
    };
  }
}

/**
 * Parse the OpenAI response to extract title, content, and metadata
 */
function parseOpenAIResponse(response, originalStory) {
  try {
    // Split the response into lines
    const lines = response.split('\n');

    // Extract the title (first non-empty line)
    const title = lines.find(line => line.trim().length > 0) || originalStory.title;

    // Find JSON metadata block
    const jsonStartIndex = response.indexOf('{');
    const jsonEndIndex = response.lastIndexOf('}');

    let metadata = {};
    let content = response;

    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      // Extract and parse JSON
      const jsonStr = response.substring(jsonStartIndex, jsonEndIndex + 1);
      try {
        metadata = JSON.parse(jsonStr);
        // Remove JSON from content
        content = response.substring(0, jsonStartIndex).trim();
      } catch (e) {
        console.warn('⚠️ Could not parse metadata JSON, using default values');
      }
    }

    // Set default metadata if not provided
    metadata.category = metadata.category || 'Travel';
    metadata.country = metadata.country || 'Global';
    metadata.excerpt = metadata.excerpt || content.substring(0, 150) + '...';
    metadata.keywords = metadata.keywords || ['travel'];

    return { title, content, metadata };
  } catch (error) {
    console.warn('⚠️ Error parsing OpenAI response:', error.message);
    return {
      title: originalStory.title,
      content: response,
      metadata: { category: 'Travel', country: 'Global', excerpt: response.substring(0, 150) + '...', keywords: ['travel'] }
    };
  }
}

/**
 * Add an Unsplash image to a story
 * @param {Object} story - Story object
 * @returns {Promise<Object>} - Story with image
 */
async function addUnsplashImage(story) {
  try {
    // Build search query based on story content
    const searchQuery = story.keywords?.[0] || story.country || story.category || 'travel';

    console.log(`🔍 Searching Unsplash for: ${searchQuery}`);

    // Call Unsplash API
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: searchQuery,
        orientation: 'landscape',
        per_page: 1
      },
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      const photo = response.data.results[0];

      return {
        ...story,
        imageUrl: photo.urls.regular,
        photographer: {
          name: photo.user.name,
          url: photo.user.links.html
        }
      };
    }

    console.warn(`⚠️ No Unsplash images found for: ${searchQuery}`);
    return story;
  } catch (error) {
    console.error('❌ Error fetching Unsplash image:', error.message);
    stats.errors.images++;
    return story;
  }
}

/**
 * Save stories to markdown files
 * @param {Array} stories - Array of story objects
 */
async function saveStoriesToMarkdown(stories) {
  // Ensure content directory exists
  await fs.mkdir(CONTENT_DIR, { recursive: true });

  for (const story of stories) {
    try {
      // Create frontmatter
      const frontmatter = {
        title: story.title,
        date: new Date().toISOString(),
        slug: story.slug,
        category: story.category,
        country: story.country,
        excerpt: story.excerpt,
        imageUrl: story.imageUrl || '',
        photographer: story.photographer || { name: 'Unsplash', url: 'https://unsplash.com' },
        keywords: story.keywords || [],
        author: 'Global Travel Report Editorial Team'
      };

      // Create markdown content
      const markdown = matter.stringify(story.content, frontmatter);

      // Generate filename
      const filename = `${story.slug}.md`;
      const filepath = path.join(CONTENT_DIR, filename);

      // Write to file
      await fs.writeFile(filepath, markdown);

      console.log(`✅ Saved story: ${filename}`);
      stats.storiesSaved++;
    } catch (error) {
      console.error(`❌ Error saving story "${story.title}":`, error.message);
      stats.errors.saving++;
    }
  }
}

/**
 * Create a slug from a title
 * @param {string} title - The title
 * @returns {string} - The slug
 */
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Get a command line argument value
 * @param {string[]} args - Command line arguments
 * @param {string} name - Argument name
 * @param {any} defaultValue - Default value
 * @returns {any} - Argument value
 */
function getArgValue(args, name, defaultValue) {
  const arg = args.find(arg => arg.startsWith(`${name}=`));
  if (!arg) return defaultValue;

  const value = arg.split('=')[1];
  return isNaN(value) ? value : parseInt(value, 10);
}

// Run the script if called directly
if (require.main === module) {
  generateDailyStories();
}

module.exports = { generateDailyStories };
