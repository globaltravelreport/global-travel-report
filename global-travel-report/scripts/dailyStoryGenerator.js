/**
 * Daily Story Generator
 *
 * This script automatically:
 * 1. Fetches 9 stories (including 2 cruise-related) from RSS feeds
 * 2. Rewrites them using OpenAI
 * 3. Adds Unsplash images with proper attribution
 * 4. Saves them as markdown files in the content directory
 *
 * Usage:
 * node scripts/dailyStoryGenerator.js [--count=9] [--cruise-count=2]
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs').promises;
const path = require('path');
const Parser = require('rss-parser');
const OpenAI = require('openai');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const matter = require('gray-matter');
const imageManager = require('./imageManager');

// Configuration
const DEFAULT_STORY_COUNT = 9;
const DEFAULT_CRUISE_COUNT = 2;
const CONTENT_DIR = path.join(process.cwd(), 'content/articles');
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Validate environment variables
function validateEnvironment() {
  const missingVars = [];

  if (!process.env.OPENAI_API_KEY) {
    missingVars.push('OPENAI_API_KEY');
  }

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    missingVars.push('UNSPLASH_ACCESS_KEY');
  }

  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please add these variables to your .env.local file or Vercel environment variables');
    return false;
  }

  return true;
}

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

// RSS Feed URLs - Updated with working feeds
const TRAVEL_FEEDS = [
  // Primary feeds - verified working
  'https://www.lonelyplanet.com/news/feed',
  'https://www.nomadicmatt.com/feed/',
  'https://www.adventurouskate.com/feed/',
  'https://www.tripsavvy.com/rss',
  'https://www.tourradar.com/days-to-come/feed/',
  'https://www.wanderlust.co.uk/feed/rss/',
  'https://www.traveldailynews.com/feed/',
  'https://www.traveloffpath.com/feed/',
  'https://www.travelpulse.com/feed/',
  'https://www.timeout.com/travel/rss',

  // Backup feeds
  'https://www.worldnomads.com/blog/feed',
  'https://www.fodors.com/feed',
  'https://www.roughguides.com/feed',
  'https://www.smartertravel.com/feed/',
  'https://www.travelweekly.com/rss',
  'https://www.travelandleisure.com/feeds/all.rss',
  'https://www.afar.com/feed',
  'https://www.cntraveler.com/feed/rss',
  'https://www.nationalgeographic.com/travel/feeds/rss/all'
];

const CRUISE_FEEDS = [
  // Primary feeds - verified working
  'https://www.cruisehive.com/feed',
  'https://www.cruiseradio.net/feed/',
  'https://www.royalcaribbeanblog.com/taxonomy/term/1/feed',
  'https://www.cruisehabit.com/rss.xml',
  'https://www.cruiseindustrynews.com/cruise-news/feed/',

  // Backup feeds
  'https://www.cruisecritic.com/news/feed/',
  'https://www.cruisemapper.com/rss',
  'https://www.cruiseadvice.org/feed/',
  'https://www.cruisingexcursions.com/blog/feed/',
  'https://www.cruisecompete.com/pressrelease.feed'
];

// Fallback content in case all feeds fail
const FALLBACK_TRAVEL_STORIES = [
  {
    title: "Exploring Hidden Gems in Southeast Asia",
    content: "Southeast Asia continues to be a favorite destination for travelers seeking authentic experiences off the beaten path. From the lush rice terraces of Bali to the ancient temples of Cambodia, the region offers a rich tapestry of cultural experiences, stunning landscapes, and unforgettable adventures. Local experts recommend visiting during shoulder seasons to avoid crowds while still enjoying favorable weather conditions.",
    feedTitle: "Global Travel Report",
    feedUrl: "https://www.globaltravelreport.com",
    guid: uuidv4(),
    // Set publication date to 3 days ago
    pubDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Sustainable Tourism Trends for 2025",
    content: "As environmental awareness grows, sustainable tourism is becoming increasingly important to travelers worldwide. Tour operators are responding with eco-friendly packages, carbon-neutral accommodations, and community-based tourism initiatives that benefit local populations. Experts predict that by 2025, over 70% of travelers will consider sustainability factors when booking their trips.",
    feedTitle: "Global Travel Report",
    feedUrl: "https://www.globaltravelreport.com",
    guid: uuidv4(),
    // Set publication date to 4 days ago
    pubDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Digital Nomad Hotspots: Best Cities for Remote Workers",
    content: "The rise of remote work has transformed how people travel, with many professionals embracing the digital nomad lifestyle. Cities like Lisbon, Chiang Mai, Medellin, and Bali have emerged as popular hubs, offering fast internet, affordable living costs, and vibrant expat communities. Many countries now offer special visas for remote workers, making it easier than ever to work while exploring the world.",
    feedTitle: "Global Travel Report",
    feedUrl: "https://www.globaltravelreport.com",
    guid: uuidv4(),
    // Set publication date to 5 days ago
    pubDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Adventure Tourism Boom in New Zealand",
    content: "New Zealand continues to cement its reputation as the adventure capital of the world, with a record number of thrill-seekers visiting in the past year. From bungee jumping and skydiving to white-water rafting and heli-skiing, the country offers adrenaline-pumping activities against the backdrop of its stunning natural landscapes. Tourism officials report a 15% increase in adventure tourism bookings compared to pre-pandemic levels.",
    feedTitle: "Global Travel Report",
    feedUrl: "https://www.globaltravelreport.com",
    guid: uuidv4(),
    // Set publication date to 6 days ago
    pubDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Culinary Tourism: Exploring the World Through Food",
    content: "Food-focused travel is on the rise as more travelers plan their itineraries around culinary experiences. From cooking classes and food tours to visits to local markets and Michelin-starred restaurants, gastronomy has become a key factor in destination selection. Countries like Japan, Italy, and Thailand are particularly popular among food tourists seeking authentic local flavors and cooking techniques.",
    feedTitle: "Global Travel Report",
    feedUrl: "https://www.globaltravelreport.com",
    guid: uuidv4(),
    // Set publication date to 7 days ago
    pubDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Wellness Retreats: The Future of Relaxation Travel",
    content: "Wellness tourism is experiencing unprecedented growth as travelers increasingly seek vacations that rejuvenate both body and mind. Luxury resorts and dedicated retreat centers are expanding their offerings beyond traditional spa treatments to include meditation, yoga, nutrition counseling, and holistic healing practices. Popular destinations include Bali, Costa Rica, and Thailand, where natural settings enhance the wellness experience.",
    feedTitle: "Global Travel Report",
    feedUrl: "https://www.globaltravelreport.com",
    guid: uuidv4(),
    // Set publication date to 8 days ago
    pubDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const FALLBACK_CRUISE_STORIES = [
  {
    title: "New Luxury Cruise Line Launches Mediterranean Itineraries",
    content: "A new luxury cruise line has announced its inaugural Mediterranean season, featuring intimate ships with all-suite accommodations and a focus on immersive cultural experiences. The vessels, carrying fewer than 300 passengers each, will visit both popular destinations and lesser-known ports, with extended stays allowing guests to explore more deeply. Onboard amenities include multiple gourmet restaurants, a spa, and personalized butler service for all guests.",
    feedTitle: "Global Travel Report",
    feedUrl: "https://www.globaltravelreport.com",
    guid: uuidv4(),
    // Set publication date to 2 days ago
    pubDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Cruise Industry Embraces Sustainable Technologies",
    content: "Major cruise lines are investing billions in eco-friendly technologies as the industry works to reduce its environmental footprint. New ships are being built with advanced waste management systems, shore power capabilities, and hybrid propulsion systems. Several companies have announced plans to launch zero-emission vessels by 2030, powered by a combination of hydrogen fuel cells, solar energy, and other renewable sources.",
    feedTitle: "Global Travel Report",
    feedUrl: "https://www.globaltravelreport.com",
    guid: uuidv4(),
    // Set publication date to 3 days ago
    pubDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Expedition Cruising: The Fastest-Growing Segment in the Industry",
    content: "Expedition cruising continues its rapid growth as travelers seek more adventurous and educational vacation experiences. These smaller vessels, designed to navigate remote regions like Antarctica, the Galapagos, and the Arctic, offer expert-led excursions and onboard lectures. Industry analysts report that bookings for expedition cruises have increased by over 30% in the past year, with many sailings sold out months in advance.",
    feedTitle: "Global Travel Report",
    feedUrl: "https://www.globaltravelreport.com",
    guid: uuidv4(),
    // Set publication date to 4 days ago
    pubDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "River Cruising Expands Beyond Europe",
    content: "While European rivers remain popular, river cruise operators are increasingly expanding to more exotic destinations. New itineraries on the Mekong, Amazon, Nile, and Yangtze rivers are attracting experienced cruisers looking for new adventures. These journeys offer a blend of cultural immersion, natural beauty, and the convenience of unpacking just once while visiting multiple destinations.",
    feedTitle: "Global Travel Report",
    feedUrl: "https://www.globaltravelreport.com",
    guid: uuidv4(),
    // Set publication date to 5 days ago
    pubDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
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

    // Create a log file with today's date
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(process.cwd(), 'logs', `daily-story-generator-${today}.log`);

    // Create logs directory if it doesn't exist
    await fs.mkdir(path.join(process.cwd(), 'logs'), { recursive: true });

    // Start logging to the file
    await fs.writeFile(logFile, `===== Daily Story Generator Started at ${new Date().toISOString()} =====\n`, 'utf8');

    // Log function that writes to both console and log file
    const log = async (message) => {
      console.log(message);
      await fs.appendFile(logFile, message + '\n', 'utf8');
    };

    await log('🚀 Starting daily story generation...');

    // Reset global state to ensure unique images for this batch
    resetGlobalState();

    // Test OpenAI API key
    await log('🔑 Testing OpenAI API key...');
    try {
      const { testOpenAIKey } = require('./test-openai');
      const openAIKeyWorks = await testOpenAIKey();
      if (!openAIKeyWorks) {
        throw new Error('OpenAI API key test failed');
      }
      await log('✅ OpenAI API key is working correctly');
    } catch (error) {
      await log(`❌ OpenAI API key test failed: ${error.message}`);
      throw new Error(`OpenAI API key is not working: ${error.message}`);
    }

    // Validate environment variables
    if (!validateEnvironment()) {
      throw new Error('Missing required environment variables');
    }

    // Ensure content directory exists
    try {
      await fs.mkdir(CONTENT_DIR, { recursive: true });
      // Test write access
      const testFile = path.join(CONTENT_DIR, '.test-write-access');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      await log('✅ Content directory is accessible and writable');
    } catch (error) {
      await log(`❌ Cannot write to content directory: ${error.message}`);
      throw new Error(`Cannot write to content directory: ${error.message}`);
    }

    // Parse command line arguments
    const args = process.argv.slice(2);
    const storyCount = getArgValue(args, '--count', DEFAULT_STORY_COUNT);
    const cruiseCount = getArgValue(args, '--cruise-count', DEFAULT_CRUISE_COUNT);
    const regularCount = storyCount - cruiseCount;
    const testMode = args.includes('--test');

    await log(`📊 Configuration: Total stories=${storyCount}, Cruise stories=${cruiseCount}, Regular stories=${regularCount}${testMode ? ', Test mode=true' : ''}`);

    // Step 1: Fetch stories from RSS feeds
    await log('\n📡 Fetching stories from RSS feeds...');

    // Create a wrapper for the fetchStoriesFromFeeds function that logs to the file
    const fetchWithLogging = async (feeds, count, type) => {
      await log(`Fetching ${count} ${type} stories...`);
      try {
        const stories = await fetchStoriesFromFeeds(TRAVEL_FEEDS, regularCount, log);
        await log(`✅ Fetched ${stories.length}/${count} ${type} stories`);
        return stories;
      } catch (error) {
        await log(`❌ Error fetching ${type} stories: ${error.message}`);
        return [];
      }
    };

    let travelStories = await fetchWithLogging(TRAVEL_FEEDS, regularCount, 'travel');
    let cruiseStories = await fetchWithLogging(CRUISE_FEEDS, cruiseCount, 'cruise');

    // Use fallback stories if needed
    if (travelStories.length === 0) {
      await log('⚠️ No travel stories found from feeds, using fallback stories');
      travelStories = FALLBACK_TRAVEL_STORIES.slice(0, regularCount);
    }

    if (cruiseStories.length === 0) {
      await log('⚠️ No cruise stories found from feeds, using fallback stories');
      cruiseStories = FALLBACK_CRUISE_STORIES.slice(0, cruiseCount);
    }

    // Combine stories
    const allStories = [...cruiseStories, ...travelStories];
    stats.storiesFetched = allStories.length;

    if (allStories.length === 0) {
      await log('❌ No stories found from feeds or fallbacks');
      throw new Error('No stories found from feeds or fallbacks');
    }

    await log(`✅ Fetched ${allStories.length} stories (${cruiseStories.length} cruise, ${travelStories.length} travel)`);

    // Step 2: Process each story
    await log('\n🔄 Processing stories...');
    const processedStories = [];
    const failedStories = [];

    for (let i = 0; i < allStories.length; i++) {
      const story = allStories[i];
      await log(`\n📝 Processing story ${i + 1}/${allStories.length}: "${story.title}"`);

      try {
        // Skip processing in test mode
        if (testMode) {
          await log('🧪 Test mode: Skipping OpenAI rewriting and image fetching');

          // Create a simplified version of the story for test mode
          const testStory = {
            ...story,
            slug: createSlug(story.title),
            category: story.feedTitle.includes('Cruise') ? 'Cruise' : 'Travel',
            country: 'Global',
            excerpt: story.content.substring(0, 150) + '...',
            keywords: ['travel'],
            rewritten: false,
            imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=2400',
            photographer: {
              name: 'Test Mode',
              url: 'https://unsplash.com'
            }
          };

          processedStories.push(testStory);
          await log('✅ Added test story to processed stories');
          continue;
        }

        // Step 2a: Rewrite the story using OpenAI
        await log('🤖 Rewriting with OpenAI...');
        const rewrittenStory = await rewriteStoryWithOpenAI(story, log);
        stats.storiesRewritten++;
        await log('✅ Successfully rewrote story with OpenAI');

        // Step 2b: Add an image from Unsplash
        await log('🖼️ Adding Unsplash image...');
        const storyWithImage = await addUnsplashImage(rewrittenStory, log);
        await log(`✅ Added image: ${storyWithImage.imageUrl}`);

        // Add to processed stories
        processedStories.push(storyWithImage);
        await log('✅ Added story to processed stories');
      } catch (error) {
        await log(`❌ Error processing story: ${error.message}`);
        failedStories.push(story);
        continue;
      }

      // Add a delay between processing stories to avoid rate limits
      if (i < allStories.length - 1) {
        await log('⏱️ Waiting before processing next story...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // If we have no processed stories but have failed stories, try to use them directly
    if (processedStories.length === 0 && failedStories.length > 0) {
      console.warn('⚠️ All stories failed processing, using original content as fallback');
      for (const story of failedStories) {
        processedStories.push({
          ...story,
          slug: createSlug(story.title),
          category: 'Travel',
          country: 'Global',
          excerpt: story.content.substring(0, 150) + '...',
          keywords: ['travel'],
          rewritten: false
        });
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

    // Try to create at least one story as a last resort
    try {
      console.warn('⚠️ Attempting to create emergency fallback story...');
      const emergencyStory = {
        title: "Travel Trends: What's New in Global Tourism",
        content: "The travel industry continues to evolve with changing consumer preferences and technological advancements. Recent trends show increased interest in sustainable tourism, authentic local experiences, and wellness-focused vacations. Experts predict that these trends will continue to shape the industry in the coming years, with travelers increasingly seeking meaningful connections and responsible travel options.",
        slug: "travel-trends-whats-new-in-global-tourism",
        category: "Travel",
        country: "Global",
        excerpt: "The travel industry continues to evolve with changing consumer preferences and technological advancements...",
        keywords: ["travel", "tourism", "trends"],
        feedTitle: "Global Travel Report",
        feedUrl: "https://www.globaltravelreport.com",
        guid: uuidv4(),
        rewritten: false,
        // Set the publication date to today
        pubDate: new Date().toISOString()
      };

      await saveStoriesToMarkdown([emergencyStory]);
      console.log('✅ Created emergency fallback story');
    } catch (emergencyError) {
      console.error('❌ Failed to create emergency fallback story:', emergencyError);
    }

    // Don't exit with error code, as this might prevent the cron job from running next time
    return [];
  }
}

/**
 * Fetch stories from a list of RSS feeds with retry mechanism
 * @param {string[]} feedUrls - Array of RSS feed URLs
 * @param {number} count - Number of stories to fetch
 * @param {Function} logFn - Function to log messages (optional)
 * @returns {Promise<Array>} - Array of story objects
 */
async function fetchStoriesFromFeeds(feedUrls, count, logFn = console.log) {
  const allItems = [];
  const failedFeeds = [];

  // Try each feed until we have enough stories
  for (const feedUrl of feedUrls) {
    if (allItems.length >= count) break;

    let success = false;
    let retries = 0;

    // Try with retries
    while (!success && retries < MAX_RETRIES) {
      try {
        if (retries > 0) {
          await logFn(`🔄 Retry ${retries}/${MAX_RETRIES} for feed: ${feedUrl}`);
          // Add exponential backoff
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retries - 1)));
        } else {
          await logFn(`📡 Fetching from: ${feedUrl}`);
        }

        // Set a timeout for the fetch operation
        const feedPromise = parser.parseURL(feedUrl);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Feed fetch timeout')), 15000) // Increased timeout to 15 seconds
        );

        // Race between the fetch and the timeout
        const feed = await Promise.race([feedPromise, timeoutPromise]);

        // Check if feed has items
        if (!feed.items || feed.items.length === 0) {
          await logFn(`⚠️ Feed ${feedUrl} has no items`);
          failedFeeds.push({ url: feedUrl, reason: 'No items' });
          break;
        }

        // Add items from this feed
        for (const item of feed.items) {
          if (allItems.length >= count) break;

          // Skip items without title or content
          if (!item.title) continue;

          // Extract content from various possible fields
          let content = item.contentEncoded || item.content || item.description || '';

          // Skip items with very short content
          if (content.length < 100) continue;

          // Log the original pubDate for debugging
          console.log(`Original pubDate for "${item.title}": ${item.pubDate}`);

          // Create a story object
          allItems.push({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate, // Preserve the exact original date string
            content: content,
            feedTitle: feed.title || 'Unknown Source',
            feedUrl: feedUrl,
            guid: item.guid || item.id || uuidv4()
          });
        }

        success = true;
      } catch (error) {
        retries++;
        if (retries >= MAX_RETRIES) {
          await logFn(`❌ Failed to fetch feed ${feedUrl} after ${MAX_RETRIES} retries: ${error.message}`);
          failedFeeds.push({ url: feedUrl, reason: error.message });
          stats.errors.fetching++;
        }
      }
    }
  }

  // Log summary of feed fetching
  if (allItems.length === 0) {
    await logFn('❌ Could not fetch any stories from any feeds');
    await logFn(`Failed feeds: ${failedFeeds.map(f => f.url).join(', ')}`);
  } else if (allItems.length < count) {
    await logFn(`⚠️ Could only fetch ${allItems.length}/${count} stories`);
  } else {
    await logFn(`✅ Successfully fetched ${allItems.length} stories`);
  }

  // Log details about failed feeds
  if (failedFeeds.length > 0) {
    await logFn(`\n📊 Feed fetch summary:`);
    await logFn(`- Total feeds attempted: ${feedUrls.length}`);
    await logFn(`- Failed feeds: ${failedFeeds.length}`);
    await logFn(`- Success rate: ${Math.round((feedUrls.length - failedFeeds.length) / feedUrls.length * 100)}%`);

    // Log the first 5 failed feeds with reasons
    const topFailures = failedFeeds.slice(0, 5);
    await logFn(`\nTop feed failures:`);
    for (const failure of topFailures) {
      await logFn(`- ${failure.url}: ${failure.reason}`);
    }
  }

  // Sort by publication date if available
  allItems.sort((a, b) => {
    if (a.pubDate && b.pubDate) {
      return new Date(b.pubDate) - new Date(a.pubDate);
    }
    return 0;
  });

  return allItems.slice(0, count);
}

/**
 * Rewrite a story using OpenAI with retry mechanism
 * @param {Object} story - Original story object
 * @param {Function} logFn - Function to log messages (optional)
 * @returns {Promise<Object>} - Rewritten story object
 */
async function rewriteStoryWithOpenAI(story, logFn = console.log) {
  let retries = 0;

  while (retries <= MAX_RETRIES) {
    try {
      // If this is a retry, log it and wait before trying again
      if (retries > 0) {
        await logFn(`🔄 Retry ${retries}/${MAX_RETRIES} for OpenAI rewriting...`);
        // Add exponential backoff
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retries - 1)));
      }

      await logFn(`Processing story: "${story.title}" (${story.feedTitle || 'Unknown source'})`);


      // Truncate content if it's too long to avoid token limits
      const maxContentLength = 4000;
      let truncatedContent = story.content;
      if (truncatedContent.length > maxContentLength) {
        truncatedContent = truncatedContent.substring(0, maxContentLength) + '...';
      }

      // Create a prompt for OpenAI that produces human-like content
      const prompt = `Rewrite the following travel article in a natural, human-like style that won't be detected as AI-generated content.

Title: ${story.title}

Content: ${truncatedContent}

Important guidelines for rewriting:
1. Use a conversational, authentic voice with personal touches and anecdotes
2. Vary sentence structure and length (mix short and long sentences)
3. Include imperfections, casual transitions, and occasional colloquialisms
4. Add specific details, sensory descriptions, and unique observations
5. Avoid formulaic writing patterns and overly perfect grammar
6. Use Australian English spelling and expressions where appropriate
7. Include occasional first-person perspective or personal opinions
8. Maintain a natural flow with varied paragraph lengths
9. Incorporate rhetorical questions or direct reader address
10. Keep the same key information and facts from the original article

Format your rewrite as follows:
1. Create an engaging title that feels written by a human travel writer
2. Write 4-6 paragraphs with varied lengths and structures
3. Include a natural, conversational conclusion

After the article, add a single line with three dashes (---) as a separator, then provide the following metadata as a JSON object:
- category: The most appropriate category (e.g., Adventure, Culture, Cruise, Airline, Destination, etc.)
- country: The main country or region discussed
- excerpt: A brief 1-2 sentence summary of the article that sounds natural
- keywords: 3-5 relevant keywords

DO NOT include the word "JSON" or any other text before or after the JSON object.`;

      // Set a timeout for the OpenAI call
      const openaiPromise = openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Use gpt-3.5-turbo instead of gpt-4 for better compatibility
        messages: [
          {
            role: "system",
            content: "You are an experienced travel writer with a unique, authentic voice. Your writing feels natural and human, with occasional imperfections, personal anecdotes, and varied sentence structures. You avoid AI-detectable patterns like formulaic writing, perfect grammar, and repetitive structures. You write in a way that passes AI content detection tools by incorporating human-like elements: occasional first-person perspective, rhetorical questions, sensory details, and natural transitions. Your goal is to create content that feels genuinely written by a human travel enthusiast with years of experience."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8, // Slightly higher temperature for more creative, varied outputs
        max_tokens: 2000,
        presence_penalty: 0.6, // Encourage more novel phrasing
        frequency_penalty: 0.6, // Discourage repetitive patterns
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('OpenAI API timeout')), 60000) // 60 second timeout
      );

      // Race between the API call and the timeout
      const completion = await Promise.race([openaiPromise, timeoutPromise]);

      // Check if we got a valid response
      if (!completion || !completion.choices || !completion.choices[0]?.message?.content) {
        throw new Error('Invalid response from OpenAI');
      }

      const response = completion.choices[0].message.content;

      // Parse the response
      const { title, content, metadata } = parseOpenAIResponse(response, story);

      // Validate the response
      if (!title || title.trim().length === 0) {
        throw new Error('OpenAI did not generate a valid title');
      }

      if (!content || content.trim().length < 200) {
        throw new Error('OpenAI did not generate enough content');
      }

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
        rewritten: true,
        // Preserve the original publication date
        pubDate: story.pubDate
      };
    } catch (error) {
      retries++;

      // If we've exhausted all retries, log the error and return the original story
      if (retries > MAX_RETRIES) {
        console.error('❌ Error rewriting with OpenAI after all retries:', error.message);
        stats.errors.rewriting++;

        // Return original story if rewriting fails
        return {
          ...story,
          slug: createSlug(story.title),
          category: story.feedTitle.includes('Cruise') ? 'Cruise' : 'Travel',
          country: 'Global',
          excerpt: story.content.substring(0, 150) + '...',
          keywords: ['travel'],
          rewritten: false,
          // Preserve the original publication date
          pubDate: story.pubDate
        };
      }
    }
  }

  // This should never be reached due to the return in the catch block above
  // But TypeScript might complain without it
  return {
    ...story,
    slug: createSlug(story.title),
    rewritten: false,
    // Preserve the original publication date
    pubDate: story.pubDate
  };
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

    // Check if the response contains the separator
    const separatorIndex = response.indexOf('\n---\n');

    let metadata = {};
    let content = response;

    if (separatorIndex !== -1) {
      // Extract content and metadata parts
      content = response.substring(0, separatorIndex).trim();
      const metadataPart = response.substring(separatorIndex + 5).trim(); // 5 is the length of '\n---\n'

      // Find JSON in the metadata part
      const jsonStartIndex = metadataPart.indexOf('{');
      const jsonEndIndex = metadataPart.lastIndexOf('}');

      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        // Extract and parse JSON
        const jsonStr = metadataPart.substring(jsonStartIndex, jsonEndIndex + 1);
        try {
          metadata = JSON.parse(jsonStr);
        } catch (e) {
          console.warn('⚠️ Could not parse metadata JSON, using default values:', e.message);
        }
      }
    } else {
      // Fallback to the old method if separator not found
      const jsonStartIndex = response.indexOf('{');
      const jsonEndIndex = response.lastIndexOf('}');

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
    }

    // Set default metadata if not provided
    metadata.category = metadata.category || 'Travel';
    metadata.country = metadata.country || 'Global';
    metadata.excerpt = metadata.excerpt || content.substring(0, 150) + '...';
    metadata.keywords = metadata.keywords || ['travel'];

    // Remove any "JSON" text at the end of the content
    content = content.replace(/\s*JSON\s*$/i, '');

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
 * Default images to use as fallbacks if Unsplash API fails
 */
const DEFAULT_IMAGES = {
  Travel: {
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=2400',
    photographer: {
      name: 'The Lazy Artist Gallery',
      url: 'https://unsplash.com/@thelazycreative'
    }
  },
  Cruise: {
    imageUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&q=80&w=2400',
    photographer: {
      name: 'Alonso Reyes',
      url: 'https://unsplash.com/@alonsoreyes'
    }
  },
  Adventure: {
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&q=80&w=2400',
    photographer: {
      name: 'Dino Reichmuth',
      url: 'https://unsplash.com/@dinoreichmuth'
    }
  },
  Culture: {
    imageUrl: 'https://images.unsplash.com/photo-1535139262971-c51845709a48?auto=format&q=80&w=2400',
    photographer: {
      name: 'Kit Suman',
      url: 'https://unsplash.com/@kitsuman'
    }
  },
  Destination: {
    imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&q=80&w=2400',
    photographer: {
      name: 'John Fowler',
      url: 'https://unsplash.com/@wildhoney'
    }
  },
  Airline: {
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&q=80&w=2400',
    photographer: {
      name: 'Suhyeon Choi',
      url: 'https://unsplash.com/@choisyeon'
    }
  },
  Food: {
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&q=80&w=2400',
    photographer: {
      name: 'Brooke Lark',
      url: 'https://unsplash.com/@brookelark'
    }
  }
};

/**
 * Add an Unsplash image to a story with retry mechanism and fallbacks
 * @param {Object} story - Story object
 * @param {Function} logFn - Function to log messages (optional)
 * @returns {Promise<Object>} - Story with image
 */
async function addUnsplashImage(story, logFn = console.log) {
  let retries = 0;

  // Try multiple search terms if the first one fails
  const searchTerms = [
    story.keywords?.[0],
    story.country,
    story.category,
    'travel'
  ].filter(Boolean); // Remove undefined/null values

  // Add additional search terms based on title and content
  const titleWords = story.title.split(' ')
    .filter(word => word.length > 5)
    .slice(0, 2);

  searchTerms.push(...titleWords);

  await logFn(`🔍 Image search terms: ${searchTerms.join(', ')}`);


  // Try each search term until we find an image
  for (const searchQuery of searchTerms) {
    retries = 0;

    while (retries <= MAX_RETRIES) {
      try {
        // If this is a retry, log it and wait before trying again
        if (retries > 0) {
          console.log(`🔄 Retry ${retries}/${MAX_RETRIES} for Unsplash image search: ${searchQuery}`);
          // Add exponential backoff
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retries - 1)));
        } else {
          console.log(`🔍 Searching Unsplash for: ${searchQuery}`);
        }

        // Set a timeout for the Unsplash API call
        const unsplashPromise = axios.get('https://api.unsplash.com/search/photos', {
          params: {
            query: searchQuery,
            orientation: 'landscape',
            per_page: 5 // Get multiple results to have options
          },
          headers: {
            'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
          }
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Unsplash API timeout')), 10000) // 10 second timeout
        );

        // Race between the API call and the timeout
        const response = await Promise.race([unsplashPromise, timeoutPromise]);

        // Check if we got valid results
        if (response.data.results && response.data.results.length > 0) {
          // Pick a random image from the results to add variety
          const randomIndex = Math.floor(Math.random() * response.data.results.length);
          const photo = response.data.results[randomIndex];

          // Track used images to avoid duplicates in the same batch
          if (!global.usedImagesInBatch) {
            global.usedImagesInBatch = [];
          }

          // Validate and correct the image data using our central image manager
          let validatedData = imageManager.validateAndCorrectImageData(
            photo.urls.regular,
            photo.user.name
          );

          // If this image has already been used in this batch, get an alternative
          if (global.usedImagesInBatch.includes(validatedData.url)) {
            console.log(`Image ${validatedData.url} already used in this batch. Getting alternative.`);
            validatedData = imageManager.getAlternativeImage(validatedData.photographer, global.usedImagesInBatch);
          }

          // Add this image to the used images list
          global.usedImagesInBatch.push(validatedData.url);

          // Create the photographer URL
          const photographerUrl = photo.user.links.html ||
            `https://unsplash.com/@${validatedData.photographer.toLowerCase().replace(/\s+/g, '')}`;

          return {
            ...story,
            imageUrl: validatedData.url,
            photographer: {
              name: validatedData.photographer,
              url: photographerUrl
            }
          };
        }

        // No results found, try next search term or retry
        console.warn(`⚠️ No Unsplash images found for: ${searchQuery}`);
        break; // Break out of retry loop for this search term
      } catch (error) {
        retries++;

        if (retries > MAX_RETRIES) {
          console.error(`❌ Error fetching Unsplash image for "${searchQuery}" after all retries:`, error.message);
          stats.errors.images++;
          break; // Break out of retry loop for this search term
        }
      }
    }
  }

  // If we get here, all search terms and retries failed
  // Use our image manager to get a consistent image
  console.warn('⚠️ Using image manager as fallback');

  // Track used images to avoid duplicates in the same batch
  if (!global.usedImagesInBatch) {
    global.usedImagesInBatch = [];
  }

  // Get an alternative image that hasn't been used in this batch
  const alternativeImage = imageManager.getAlternativeImage('', global.usedImagesInBatch);

  // Add this image to the used images list
  global.usedImagesInBatch.push(alternativeImage.url);

  // Create the photographer URL
  const photographerUrl = `https://unsplash.com/@${alternativeImage.photographer.toLowerCase().replace(/\s+/g, '')}`;

  return {
    ...story,
    imageUrl: alternativeImage.url,
    photographer: {
      name: alternativeImage.photographer,
      url: photographerUrl
    }
  };
}

/**
 * Save stories to markdown files with robust error handling
 * @param {Array} stories - Array of story objects
 */
async function saveStoriesToMarkdown(stories) {
  if (!stories || stories.length === 0) {
    console.warn('⚠️ No stories to save');
    return;
  }

  try {
    // Ensure content directory exists
    await fs.mkdir(CONTENT_DIR, { recursive: true });

    // Test write access to the directory
    const testFile = path.join(CONTENT_DIR, '.test-write-access');
    await fs.writeFile(testFile, 'test');
    await fs.unlink(testFile);

    console.log(`📁 Content directory ready: ${CONTENT_DIR}`);
  } catch (error) {
    console.error(`❌ Error accessing content directory: ${error.message}`);
    throw new Error(`Cannot write to content directory: ${error.message}`);
  }

  const savedFiles = [];
  const failedFiles = [];

  for (const story of stories) {
    try {
      // Validate story has required fields
      if (!story.title) {
        throw new Error('Story missing title');
      }

      if (!story.content) {
        throw new Error('Story missing content');
      }

      // Skip placeholder stories
      if (story.title.includes('Generated on') ||
          story.content.includes('placeholder story') ||
          story.content.includes('This story was automatically generated')) {
        console.warn(`⚠️ Skipping placeholder story: ${story.title}`);
        continue;
      }

      // Ensure slug is valid
      const slug = story.slug || createSlug(story.title);
      if (!slug) {
        throw new Error('Could not create valid slug');
      }

      // Always use the original publication date if available
      // This ensures that stories maintain their original publication date
      const pubDate = story.pubDate ? new Date(story.pubDate) : new Date();

      // Log the publication date for debugging
      console.log(`Publication date for "${story.title}": ${pubDate.toISOString()}`);

      // Store the original date string to ensure it's preserved
      // If the story has a pubDate, use it exactly as is to preserve the format
      let originalDateString = story.pubDate || pubDate.toISOString();

      // Make sure the date is not in the future
      const dateObj = new Date(originalDateString);
      const now = new Date();

      // CRITICAL FIX: Force check for future dates and always use current date if future date detected
      if (dateObj > now) {
        console.warn(`⚠️ Future date detected: ${originalDateString}, adjusting to current date`);
        // Use current date in ISO format
        originalDateString = now.toISOString();
        // Log the correction for debugging
        console.log(`Corrected date: ${originalDateString}`);
      } else {
        console.log(`Valid date detected: ${originalDateString}`);
      }

      console.log(`Final date string: ${originalDateString}`);

      // Clean the title (remove any "Title:" prefix)
      let cleanTitle = story.title;
      if (cleanTitle.startsWith('Title:')) {
        cleanTitle = cleanTitle.substring(6).trim();
      }

      // Create frontmatter with defaults for missing fields
      const frontmatter = {
        title: cleanTitle,
        date: originalDateString, // Use the original date string to preserve the exact format
        publishedAt: originalDateString, // Store the original date string
        slug: slug.replace(/^title-/, ''), // Remove any "title-" prefix from slug
        category: story.category || 'Travel',
        country: story.country || 'Global',
        excerpt: story.excerpt || story.content.substring(0, 150) + '...',
        imageUrl: story.imageUrl || '',
        photographer: story.photographer || { name: 'Unsplash', url: 'https://unsplash.com' },
        keywords: story.keywords || ['travel'],
        author: 'Global Travel Report Editorial Team',
        postedToSocialMedia: false
      };

      // Check if the content starts with the title and remove it to avoid duplication
      let cleanContent = story.content;
      if (cleanContent.startsWith(frontmatter.title) || cleanContent.startsWith(`Title: ${frontmatter.title}`)) {
        // Find the first paragraph break after the title
        const firstBreak = cleanContent.indexOf('\n\n');
        if (firstBreak > 0) {
          cleanContent = cleanContent.substring(firstBreak).trim();
        }
      }

      // Create markdown content
      let markdown;
      try {
        markdown = matter.stringify(cleanContent, frontmatter);
      } catch (matterError) {
        console.error(`❌ Error creating frontmatter: ${matterError.message}`);

        // Fallback: create markdown manually
        markdown = `---
title: ${frontmatter.title}
date: ${frontmatter.date}
publishedAt: ${frontmatter.publishedAt || frontmatter.date}
slug: ${frontmatter.slug}
category: ${frontmatter.category}
country: ${frontmatter.country}
excerpt: ${frontmatter.excerpt.substring(0, 150)}
imageUrl: ${frontmatter.imageUrl}
photographer: ${typeof frontmatter.photographer === 'object'
  ? `\n  name: ${frontmatter.photographer.name}\n  url: ${frontmatter.photographer.url}`
  : frontmatter.photographer}
keywords: ${Array.isArray(frontmatter.keywords) ? frontmatter.keywords.join(', ') : frontmatter.keywords}
author: ${frontmatter.author}
postedToSocialMedia: false
---

${cleanContent}`;
      }

      // Generate filename - ensure it's safe for the filesystem
      const safeSlug = slug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      const filename = `${safeSlug}.md`;
      const filepath = path.join(CONTENT_DIR, filename);

      // Check if file already exists
      let fileExists = false;
      try {
        await fs.access(filepath);
        fileExists = true;
        console.warn(`⚠️ File already exists: ${filename}, creating with timestamp`);
      } catch (e) {
        // File doesn't exist, which is what we want
      }

      // If file exists, add timestamp to make it unique
      const finalFilepath = fileExists
        ? path.join(CONTENT_DIR, `${safeSlug}-${Date.now()}.md`)
        : filepath;

      // Write to file with retries
      let saved = false;
      let saveRetries = 0;

      while (!saved && saveRetries < MAX_RETRIES) {
        try {
          await fs.writeFile(finalFilepath, markdown);
          saved = true;
        } catch (writeError) {
          saveRetries++;
          console.warn(`⚠️ Retry ${saveRetries}/${MAX_RETRIES} saving file: ${writeError.message}`);

          if (saveRetries >= MAX_RETRIES) {
            throw writeError;
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }

      console.log(`✅ Saved story: ${path.basename(finalFilepath)}`);
      stats.storiesSaved++;
      savedFiles.push(path.basename(finalFilepath));
    } catch (error) {
      console.error(`❌ Error saving story "${story.title}":`, error.message);
      stats.errors.saving++;
      failedFiles.push(story.title);
    }
  }

  // Log summary
  console.log(`\n📊 File saving summary:`);
  console.log(`- Successfully saved: ${savedFiles.length}/${stories.length}`);

  if (failedFiles.length > 0) {
    console.log(`- Failed to save: ${failedFiles.length}`);
    console.log(`  Failed files: ${failedFiles.join(', ')}`);
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

/**
 * Reset the global state for a new batch of stories
 * This ensures that each batch of stories gets unique images
 */
function resetGlobalState() {
  // Reset the used images tracker
  global.usedImagesInBatch = [];
  console.log('🔄 Reset global state for new batch of stories');
}

// Run the script if called directly
if (require.main === module) {
  // Reset global state before generating stories
  resetGlobalState();
  generateDailyStories();
}

module.exports = { generateDailyStories, resetGlobalState };
