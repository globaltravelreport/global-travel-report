/**
 * Social Media Poster
 *
 * This script automatically posts new stories to social media platforms:
 * - Facebook
 * - Twitter (X)
 * - LinkedIn
 * - Medium
 * - YouTube (community post)
 * - TikTok (bio link)
 *
 * Usage:
 * node scripts/social-media-poster.js [--story=path/to/story.md] [--test]
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { TwitterApi } = require('twitter-api-v2');
// Using axios directly for Facebook API instead of the deprecated 'fb' package
const { createFacebookService } = require('../src/services/facebookService');
const tumblr = require('tumblr.js');

// LinkedIn API client (using axios directly since there's no official package)
const LinkedInApi = function(config) {
  const instance = {
    posts: {
      create: async (post) => {
        try {
          // Prepare the post data
          const postData = {
            author: `urn:li:person:${process.env.LINKEDIN_PERSON_ID || 'me'}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                  text: post.text
                },
                shareMediaCategory: 'NONE'
              }
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
          };

          // Add media if available
          if (post.media && post.media.originalUrl) {
            postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
            postData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
              status: 'READY',
              description: {
                text: post.media.description || ''
              },
              originalUrl: post.media.originalUrl,
              title: {
                text: post.media.title || post.text.substring(0, 50)
              }
            }];
          }

          // Log the post data for debugging
          console.log('LinkedIn post data:', JSON.stringify(postData, null, 2));

          // Make the API call
          const response = await axios({
            method: 'POST',
            url: 'https://api.linkedin.com/v2/ugcPosts',
            headers: {
              'Authorization': `Bearer ${config.accessToken}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0'
            },
            data: postData
          });

          return { id: response.data.id };
        } catch (error) {
          console.error('LinkedIn API error:', error.response?.data || error.message);
          if (error.response && error.response.data) {
            console.error('LinkedIn API error details:', JSON.stringify(error.response.data, null, 2));
          }
          throw error;
        }
      }
    }
  };

  return instance;
};

// Facebook API client (using our modern FacebookService)
const FacebookApi = function(token) {
  const facebookService = createFacebookService(token);

  return {
    posts: {
      create: async (pageId, post) => {
        try {
          // Prepare post parameters
          const postParams = {
            message: post.message,
            link: post.link
          };

          // Add image if available
          if (post.picture) {
            postParams.picture = post.picture;
          }

          // Use our FacebookService to create the post
          const response = await facebookService.createPost(pageId, postParams);
          return response;
        } catch (error) {
          console.error('Facebook API error details:', error.message);
          throw error;
        }
      }
    }
  };
};

// Medium API client (using axios directly)
const MediumApi = function(config) {
  return {
    posts: {
      create: async (post) => {
        try {
          const response = await axios({
            method: 'POST',
            url: 'https://api.medium.com/v1/users/me/posts',
            headers: {
              'Authorization': `Bearer ${config.accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            data: {
              title: post.title,
              contentFormat: post.contentFormat,
              content: post.content,
              canonicalUrl: post.canonicalUrl,
              tags: post.tags,
              publishStatus: post.publishStatus
            }
          });

          return { id: response.data.data.id };
        } catch (error) {
          console.error('Medium API error:', error.response?.data || error.message);
          throw error;
        }
      }
    }
  };
};

// Tumblr API client (using tumblr.js)
const TumblrApi = function(config) {
  // Create a Tumblr client
  const client = tumblr.createClient({
    consumer_key: config.consumerKey,
    consumer_secret: config.consumerSecret || '',
    token: config.accessToken || '',
    token_secret: config.accessTokenSecret || ''
  });

  return {
    posts: {
      create: async (post) => {
        try {
          // Create a new post on the blog
          const response = await new Promise((resolve, reject) => {
            // Ensure we have a valid blog name
            const blogName = config.blogName || 'globaltravelreport';

            // Prepare post parameters
            const postParams = {
              title: post.title,
              body: post.body,
              tags: post.tags || [],
              format: post.format || 'html',
              state: post.state || 'published'
            };

            // Log the post parameters for debugging
            console.log(`Tumblr post parameters for blog "${blogName}":`, JSON.stringify(postParams, null, 2));

            // Create the post
            client.createTextPost(blogName, postParams, (err, data) => {
              if (err) {
                console.error('Tumblr API error details:', err);
                reject(err);
                return;
              }
              resolve(data);
            });
          });

          return { id: response.id_string || response.id || 'unknown-id' };
        } catch (error) {
          console.error('Tumblr API error:', error);
          throw error;
        }
      }
    }
  };
};

// Configuration
const CONTENT_DIR = path.join(process.cwd(), 'content/articles');
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'social-media-poster.log');

// Stats tracking
const stats = {
  storiesProcessed: 0,
  postsCreated: {
    facebook: 0,
    twitter: 0,
    linkedin: 0,
    medium: 0,
    tumblr: 0,
    youtube: 0,
    tiktok: 0
  },
  errors: {
    facebook: 0,
    twitter: 0,
    linkedin: 0,
    medium: 0,
    tumblr: 0,
    youtube: 0,
    tiktok: 0
  }
};

// Validate environment variables
function validateEnvironment() {
  // Group required variables by platform
  const requiredVarsByPlatform = {
    twitter: ['TWITTER_API_KEY', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_SECRET'],
    facebook: ['FACEBOOK_PAGE_ID', 'FACEBOOK_ACCESS_TOKEN'],
    linkedin: ['LINKEDIN_ACCESS_TOKEN'],
    tumblr: ['TUMBLR_API_KEY'],
    // Medium is optional since we don't have the token yet
    medium: []
  };

  // Check which platforms are available
  const availablePlatforms = [];
  const unavailablePlatforms = [];
  const missingVars = [];

  for (const [platform, vars] of Object.entries(requiredVarsByPlatform)) {
    const platformMissingVars = vars.filter(varName => !process.env[varName]);

    if (platformMissingVars.length === 0) {
      availablePlatforms.push(platform);
    } else {
      unavailablePlatforms.push(platform);
      missingVars.push(...platformMissingVars);
    }
  }

  if (missingVars.length > 0) {
    console.warn(`⚠️ Missing some social media API keys: ${missingVars.join(', ')}`);
    console.warn(`⚠️ Unavailable platforms: ${unavailablePlatforms.join(', ')}`);
    console.warn(`✅ Available platforms: ${availablePlatforms.join(', ')}`);
  } else {
    console.log(`✅ All configured social media platforms are available`);
  }

  // Return true if at least one platform is available
  return availablePlatforms.length > 0;
}

// Initialize API clients
function initializeApiClients() {
  const clients = {};

  // Twitter API client
  if (process.env.TWITTER_API_KEY &&
      process.env.TWITTER_API_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_SECRET) {
    try {
      clients.twitter = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET
      });
      console.log('✅ Twitter API client initialized');
    } catch (error) {
      console.error(`❌ Failed to initialize Twitter API client: ${error.message}`);
    }
  }

  // Facebook API client
  if (process.env.FACEBOOK_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID) {
    try {
      clients.facebook = new FacebookApi(process.env.FACEBOOK_ACCESS_TOKEN);
      console.log('✅ Facebook API client initialized');
    } catch (error) {
      console.error(`❌ Failed to initialize Facebook API client: ${error.message}`);
    }
  }

  // LinkedIn API client
  if (process.env.LINKEDIN_ACCESS_TOKEN) {
    try {
      clients.linkedin = new LinkedInApi({
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN
      });
      console.log('✅ LinkedIn API client initialized');
    } catch (error) {
      console.error(`❌ Failed to initialize LinkedIn API client: ${error.message}`);
    }
  }

  // Medium API client
  if (process.env.MEDIUM_ACCESS_TOKEN) {
    try {
      clients.medium = new MediumApi({
        accessToken: process.env.MEDIUM_ACCESS_TOKEN
      });
      console.log('✅ Medium API client initialized');
    } catch (error) {
      console.error(`❌ Failed to initialize Medium API client: ${error.message}`);
    }
  }

  // Tumblr API client
  if (process.env.TUMBLR_API_KEY) {
    try {
      clients.tumblr = new TumblrApi({
        consumerKey: process.env.TUMBLR_API_KEY,
        consumerSecret: process.env.TUMBLR_CONSUMER_SECRET || '',
        accessToken: process.env.TUMBLR_ACCESS_TOKEN || '',
        accessTokenSecret: process.env.TUMBLR_ACCESS_TOKEN_SECRET || '',
        blogName: process.env.TUMBLR_BLOG_NAME || 'globaltravelreport'
      });
      console.log('✅ Tumblr API client initialized');
    } catch (error) {
      console.error(`❌ Failed to initialize Tumblr API client: ${error.message}`);
    }
  }

  return clients;
}

/**
 * Main function to post stories to social media
 */
async function postToSocialMedia() {
  try {
    console.log('🚀 Starting social media posting...');

    // Create logs directory if it doesn't exist
    await fs.mkdir(LOG_DIR, { recursive: true });

    // Parse command line arguments
    const args = process.argv.slice(2);
    const storyPath = getArgValue(args, '--story');
    const isTest = args.includes('--test');

    // Validate environment variables
    validateEnvironment();

    // Initialize API clients
    const apiClients = initializeApiClients();

    // Get stories to post
    let stories = [];
    if (storyPath) {
      // Post a specific story
      const story = await loadStory(storyPath);
      if (story) {
        stories = [story];
      }
    } else {
      // Get recent stories
      stories = await getRecentStories();
    }

    if (stories.length === 0) {
      console.log('ℹ️ No stories found to post');
      return;
    }

    console.log(`📊 Found ${stories.length} stories to post to social media`);

    // Post each story to social media
    for (const story of stories) {
      await postStoryToSocialMedia(story, apiClients, isTest);
      stats.storiesProcessed++;
    }

    // Print summary
    console.log('\n✨ Social media posting completed!');
    console.log('📊 Summary:');
    console.log(`- Stories processed: ${stats.storiesProcessed}`);
    console.log('- Posts created:');
    Object.entries(stats.postsCreated).forEach(([platform, count]) => {
      console.log(`  - ${platform}: ${count}`);
    });
    console.log('- Errors:');
    Object.entries(stats.errors).forEach(([platform, count]) => {
      console.log(`  - ${platform}: ${count}`);
    });

    // Log to file
    await logToFile(`Social media posting completed at ${new Date().toISOString()}`);
    await logToFile(`Stories processed: ${stats.storiesProcessed}`);
    await logToFile(`Posts created: ${JSON.stringify(stats.postsCreated)}`);
    await logToFile(`Errors: ${JSON.stringify(stats.errors)}`);

  } catch (error) {
    console.error('❌ Error posting to social media:', error);
    await logToFile(`Error: ${error.message}`);
  }
}

/**
 * Post a story to all available social media platforms
 */
async function postStoryToSocialMedia(story, apiClients, isTest = false) {
  console.log(`\n📱 Posting story to social media: "${story.title}"`);

  // Generate the site URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com';
  const storyUrl = `${siteUrl}/stories/${story.slug}`;

  // Add UTM parameters for tracking
  const utmParams = `utm_source=social&utm_medium=post&utm_campaign=auto-post`;
  const trackingUrl = `${storyUrl}?${utmParams}`;

  // Generate hashtags from story tags and category
  const hashtags = generateHashtags(story);

  // Log the story being posted
  await logToFile(`Posting story: ${story.title} (${trackingUrl})`);

  // Track successful posts to determine if we should mark the story as posted
  let successfulPosts = 0;

  // Post to Twitter
  if (apiClients.twitter) {
    try {
      const tweetText = formatForTwitter(story, trackingUrl, hashtags);
      console.log(`🐦 Posting to Twitter: ${tweetText.substring(0, 50)}...`);

      if (!isTest) {
        const tweet = await apiClients.twitter.v2.tweet(tweetText);
        console.log(`✅ Posted to Twitter: ${tweet.data.id}`);
        stats.postsCreated.twitter++;
        successfulPosts++;
        await logToFile(`Posted to Twitter: ${tweet.data.id}`);
      } else {
        console.log('🧪 Test mode: Would post to Twitter');
      }
    } catch (error) {
      console.error(`❌ Failed to post to Twitter: ${error.message}`);
      stats.errors.twitter++;
      await logToFile(`Error posting to Twitter: ${error.message}`);
    }
  }

  // Post to Facebook
  if (apiClients.facebook) {
    try {
      const fbPost = formatForFacebook(story, trackingUrl, hashtags);
      console.log(`📘 Posting to Facebook: ${fbPost.message.substring(0, 50)}...`);

      if (!isTest) {
        const post = await apiClients.facebook.posts.create(process.env.FACEBOOK_PAGE_ID, fbPost);
        console.log(`✅ Posted to Facebook: ${post.id}`);
        stats.postsCreated.facebook++;
        successfulPosts++;
        await logToFile(`Posted to Facebook: ${post.id}`);
      } else {
        console.log('🧪 Test mode: Would post to Facebook');
      }
    } catch (error) {
      console.error(`❌ Failed to post to Facebook: ${error.message}`);
      stats.errors.facebook++;
      await logToFile(`Error posting to Facebook: ${error.message}`);
    }
  }

  // Post to LinkedIn
  if (apiClients.linkedin) {
    try {
      const linkedinPost = formatForLinkedIn(story, trackingUrl, hashtags);
      console.log(`📙 Posting to LinkedIn: ${linkedinPost.text.substring(0, 50)}...`);

      if (!isTest) {
        const post = await apiClients.linkedin.posts.create(linkedinPost);
        console.log(`✅ Posted to LinkedIn: ${post.id}`);
        stats.postsCreated.linkedin++;
        successfulPosts++;
        await logToFile(`Posted to LinkedIn: ${post.id}`);
      } else {
        console.log('🧪 Test mode: Would post to LinkedIn');
      }
    } catch (error) {
      console.error(`❌ Failed to post to LinkedIn: ${error.message}`);
      stats.errors.linkedin++;
      await logToFile(`Error posting to LinkedIn: ${error.message}`);
    }
  }

  // Post to Medium
  if (apiClients.medium) {
    try {
      const mediumPost = formatForMedium(story, trackingUrl, hashtags);
      console.log(`📝 Posting to Medium: ${mediumPost.title}`);

      if (!isTest) {
        const post = await apiClients.medium.posts.create(mediumPost);
        console.log(`✅ Posted to Medium: ${post.id}`);
        stats.postsCreated.medium++;
        await logToFile(`Posted to Medium: ${post.id}`);
      } else {
        console.log('🧪 Test mode: Would post to Medium');
      }
    } catch (error) {
      console.error(`❌ Failed to post to Medium: ${error.message}`);
      stats.errors.medium++;
      await logToFile(`Error posting to Medium: ${error.message}`);
    }
  }

  // Post to Tumblr
  if (apiClients.tumblr) {
    try {
      const tumblrPost = formatForTumblr(story, trackingUrl, hashtags);
      console.log(`📓 Posting to Tumblr: ${tumblrPost.title}`);

      if (!isTest) {
        const post = await apiClients.tumblr.posts.create(tumblrPost);
        console.log(`✅ Posted to Tumblr: ${post.id}`);
        stats.postsCreated.tumblr++;
        successfulPosts++;
        await logToFile(`Posted to Tumblr: ${post.id}`);
      } else {
        console.log('🧪 Test mode: Would post to Tumblr');
      }
    } catch (error) {
      console.error(`❌ Failed to post to Tumblr: ${error.message}`);
      stats.errors.tumblr++;
      await logToFile(`Error posting to Tumblr: ${error.message}`);
    }
  }

  // Mark the story as posted if at least one post was successful
  if (successfulPosts > 0 && !isTest) {
    console.log(`✅ Successfully posted to ${successfulPosts} platform(s)`);
    await markStoryAsPosted(story);
    await logToFile(`Marked story as posted: ${story.title}`);
  } else if (isTest) {
    console.log('🧪 Test mode: Would mark story as posted');
  } else {
    console.log(`⚠️ No successful posts for story: ${story.title}`);
    await logToFile(`No successful posts for story: ${story.title}`);
  }
}

/**
 * Format a story for Twitter
 */
function formatForTwitter(story, url, hashtags) {
  // Twitter has a 280 character limit
  const maxLength = 280;

  // Start with the title and URL (required)
  let tweet = `${story.title}\n\n${url}`;

  // Add hashtags if there's room
  if (hashtags && hashtags.length > 0) {
    const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');
    if (tweet.length + hashtagString.length + 2 <= maxLength) {
      tweet += `\n\n${hashtagString}`;
    }
  }

  return tweet;
}

/**
 * Format a story for Facebook
 */
function formatForFacebook(story, url, hashtags) {
  // Create the message
  let message = `${story.title}\n\n${story.excerpt}\n\n`;

  // Add hashtags
  if (hashtags && hashtags.length > 0) {
    message += hashtags.map(tag => `#${tag}`).join(' ') + '\n\n';
  }

  // Add call to action
  message += `Read the full story: ${url}`;

  return {
    message,
    link: url,
    // Add image if available
    picture: story.imageUrl
  };
}

/**
 * Format a story for LinkedIn
 */
function formatForLinkedIn(story, url, hashtags) {
  // Create the content
  let text = `${story.title}\n\n${story.excerpt}\n\n`;

  // Add hashtags
  if (hashtags && hashtags.length > 0) {
    text += hashtags.map(tag => `#${tag}`).join(' ') + '\n\n';
  }

  // Add call to action
  text += `Read the full story: ${url}`;

  // Prepare the post object
  const post = {
    text,
    visibility: 'PUBLIC'
  };

  // Add image if available
  if (story.imageUrl) {
    post.media = {
      title: story.title,
      description: story.excerpt,
      originalUrl: story.imageUrl
    };
  }

  return post;
}

/**
 * Format a story for Medium
 */
function formatForMedium(story, url, hashtags) {
  // Create the content
  let content = `${story.content}\n\n---\n\n*Originally published at [Global Travel Report](${url})*`;

  return {
    title: story.title,
    contentFormat: 'markdown',
    content,
    canonicalUrl: url,
    tags: hashtags,
    publishStatus: 'public'
  };
}

/**
 * Format a story for Tumblr
 */
function formatForTumblr(story, url, hashtags) {
  // Create the title and content
  const title = story.title;

  // Format the content with HTML
  let content = `<p>${story.excerpt}</p>`;

  // Add the full story link
  content += `<p><a href="${url}" target="_blank">Read the full story on Global Travel Report</a></p>`;

  // Add image if available
  if (story.imageUrl) {
    content = `<p><img src="${story.imageUrl}" alt="${story.title}" /></p>` + content;
  }

  // Add photographer credit if available
  if (story.photographer && story.photographer.name) {
    content += `<p><small>Photo by ${story.photographer.name} on Unsplash</small></p>`;
  } else if (typeof story.photographer === 'string') {
    content += `<p><small>Photo by ${story.photographer} on Unsplash</small></p>`;
  }

  // Process hashtags to ensure they're strings
  let processedTags = [];
  if (hashtags && Array.isArray(hashtags)) {
    processedTags = hashtags.map(tag => tag.toString());
  }

  return {
    title: title,
    body: content,
    tags: processedTags,
    format: 'html',
    state: 'published'
  };
}

/**
 * Generate hashtags from story metadata
 */
function generateHashtags(story) {
  const hashtags = ['globaltravelreport', 'travel'];

  // Add category as hashtag
  if (story.category) {
    hashtags.push(story.category.toLowerCase().replace(/\s+/g, ''));
  }

  // Add country as hashtag if not "Global"
  if (story.country && story.country !== 'Global') {
    hashtags.push(story.country.toLowerCase().replace(/\s+/g, ''));
  }

  // Add tags as hashtags
  if (story.tags && Array.isArray(story.tags)) {
    story.tags.forEach(tag => {
      const hashtagVersion = tag.toLowerCase().replace(/\s+/g, '');
      if (!hashtags.includes(hashtagVersion)) {
        hashtags.push(hashtagVersion);
      }
    });
  }

  // Limit to 5 hashtags to avoid looking spammy
  return hashtags.slice(0, 5);
}

/**
 * Get stories that haven't been posted to social media yet
 */
async function getRecentStories() {
  try {
    // Create content directory if it doesn't exist
    try {
      await fs.access(CONTENT_DIR);
    } catch (error) {
      console.warn(`⚠️ Content directory does not exist: ${CONTENT_DIR}`);
      console.log(`Creating content directory: ${CONTENT_DIR}`);
      await fs.mkdir(CONTENT_DIR, { recursive: true });
      return []; // Return empty array since there are no stories yet
    }

    // Get all story files
    const files = await fs.readdir(CONTENT_DIR);
    const storyFiles = files.filter(file => file.endsWith('.md'));

    if (storyFiles.length === 0) {
      console.log(`No story files found in ${CONTENT_DIR}`);
      return [];
    }

    // Load each story
    const stories = [];
    for (const file of storyFiles) {
      try {
        const story = await loadStory(path.join(CONTENT_DIR, file));
        if (story) {
          stories.push(story);
        }
      } catch (error) {
        console.warn(`⚠️ Error loading story ${file}: ${error.message}`);
        // Continue with other stories
      }
    }

    if (stories.length === 0) {
      console.log(`No valid stories found in ${CONTENT_DIR}`);
      return [];
    }

    // Log date formats for debugging
    if (stories.length > 0) {
      const sampleStory = stories[0];
      console.log(`Sample story date formats:`);
      console.log(`- date: ${sampleStory.date}`);
      console.log(`- publishedAt: ${sampleStory.publishedAt}`);
      console.log(`- Date object from date: ${new Date(sampleStory.date || '')}`);
      console.log(`- Date object from publishedAt: ${new Date(sampleStory.publishedAt || '')}`);
    }

    // Sort by publication date (newest first)
    stories.sort((a, b) => {
      // Handle potential date parsing errors
      try {
        // Try to parse dates, with fallbacks
        let dateA, dateB;

        // For dateA (from story b)
        if (b.date) {
          dateA = new Date(b.date);
          if (isNaN(dateA.getTime())) {
            console.warn(`⚠️ Invalid date format for story "${b.title}": ${b.date}`);
            dateA = b.publishedAt ? new Date(b.publishedAt) : new Date();
          }
        } else if (b.publishedAt) {
          dateA = new Date(b.publishedAt);
        } else {
          dateA = new Date();
        }

        // For dateB (from story a)
        if (a.date) {
          dateB = new Date(a.date);
          if (isNaN(dateB.getTime())) {
            console.warn(`⚠️ Invalid date format for story "${a.title}": ${a.date}`);
            dateB = a.publishedAt ? new Date(a.publishedAt) : new Date();
          }
        } else if (a.publishedAt) {
          dateB = new Date(a.publishedAt);
        } else {
          dateB = new Date();
        }

        return dateA - dateB;
      } catch (error) {
        console.warn(`⚠️ Error comparing dates: ${error.message}`);
        return 0;
      }
    });

    // Get all stories that haven't been posted to social media
    // Filter stories
    const unpublishedStories = stories.filter(story => {
      try {
        // Check if the story has already been posted to social media
        const notPosted = !story.postedToSocialMedia;

        // Make sure the story has a valid title and content
        const hasValidContent = story.title && story.content && story.title.length > 0;

        // Log the story status for debugging
        console.log(`Story "${story.title}" - Posted: ${!notPosted}, Valid Content: ${hasValidContent}`);

        // Check if the story has a valid date
        let hasValidDate = true;
        if (story.date) {
          const dateObj = new Date(story.date);
          if (isNaN(dateObj.getTime())) {
            console.warn(`⚠️ Story "${story.title}" has invalid date: ${story.date}`);
            hasValidDate = false;
          }
        } else if (story.publishedAt) {
          const dateObj = new Date(story.publishedAt);
          if (isNaN(dateObj.getTime())) {
            console.warn(`⚠️ Story "${story.title}" has invalid publishedAt: ${story.publishedAt}`);
            hasValidDate = false;
          }
        }

        return notPosted && hasValidContent && hasValidDate;
      } catch (error) {
        console.warn(`⚠️ Error processing story: ${error.message}`);
        return false;
      }
    });

    console.log(`📊 Found ${unpublishedStories.length} stories that haven't been posted to social media`);

    // Get the command line arguments
    const args = process.argv.slice(2);

    // Check if we should post all stories
    const postAll = args.includes('--post-all');

    if (postAll) {
      console.log(`🔄 Posting all unpublished stories (${unpublishedStories.length})`);
      return unpublishedStories;
    } else {
      // Limit to 10 stories to avoid flooding social media
      const storiesToPost = unpublishedStories.slice(0, 10);
      console.log(`🔄 Posting the newest ${storiesToPost.length} stories`);
      return storiesToPost;
    }
  } catch (error) {
    console.error(`❌ Error getting stories: ${error.message}`);
    await logToFile(`Error getting stories: ${error.message}`);
    return [];
  }
}

/**
 * Load a story from a markdown file
 */
async function loadStory(filePath) {
  try {
    // Check if the file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error(`❌ File does not exist: ${filePath}`);
      return null;
    }

    // Read the file
    let fileContent;
    try {
      fileContent = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      console.error(`❌ Error reading file ${filePath}: ${error.message}`);
      return null;
    }

    // Parse frontmatter
    let data, content;
    try {
      const parsed = matter(fileContent);
      data = parsed.data;
      content = parsed.content;
    } catch (error) {
      console.error(`❌ Error parsing frontmatter in ${filePath}: ${error.message}`);
      return null;
    }

    // Validate required fields
    if (!data.title) {
      console.warn(`⚠️ Story in ${filePath} is missing a title`);
    }

    // Extract excerpt if not present
    if (!data.excerpt && content) {
      // Create an excerpt from the first paragraph of content
      const firstParagraph = content.split('\n\n')[0];
      data.excerpt = firstParagraph.replace(/[#*_]/g, '').trim().substring(0, 150) + '...';
    }

    // Return the story object
    return {
      ...data,
      content,
      filePath
    };
  } catch (error) {
    console.error(`❌ Error loading story from ${filePath}: ${error.message}`);
    await logToFile(`Error loading story from ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Mark a story as posted to social media
 */
async function markStoryAsPosted(story) {
  try {
    // Check if the story has a valid file path
    if (!story.filePath) {
      console.error(`❌ Cannot mark story as posted: No file path provided for "${story.title}"`);
      await logToFile(`Cannot mark story as posted: No file path provided for "${story.title}"`);
      return;
    }

    // Check if the file exists
    try {
      await fs.access(story.filePath);
    } catch (error) {
      console.error(`❌ Cannot mark story as posted: File does not exist: ${story.filePath}`);
      await logToFile(`Cannot mark story as posted: File does not exist: ${story.filePath}`);
      return;
    }

    // Read the file
    let fileContent;
    try {
      fileContent = await fs.readFile(story.filePath, 'utf8');
    } catch (error) {
      console.error(`❌ Error reading file ${story.filePath}: ${error.message}`);
      await logToFile(`Error reading file ${story.filePath}: ${error.message}`);
      return;
    }

    // Parse frontmatter
    let data, content;
    try {
      const parsed = matter(fileContent);
      data = parsed.data;
      content = parsed.content;
    } catch (error) {
      console.error(`❌ Error parsing frontmatter in ${story.filePath}: ${error.message}`);
      await logToFile(`Error parsing frontmatter in ${story.filePath}: ${error.message}`);
      return;
    }

    // Log the current frontmatter for debugging
    console.log(`Current frontmatter for "${story.title}":`);
    console.log(JSON.stringify(data, null, 2));

    // Update frontmatter
    data.postedToSocialMedia = true;
    data.postedToSocialMediaAt = new Date().toISOString();

    // Preserve the original date
    if (story.date && !data.date) {
      data.date = story.date;
    }

    // Stringify frontmatter
    let updatedFileContent;
    try {
      updatedFileContent = matter.stringify(content, data);
    } catch (error) {
      console.error(`❌ Error stringifying frontmatter: ${error.message}`);
      await logToFile(`Error stringifying frontmatter: ${error.message}`);
      return;
    }

    // Write the file
    try {
      await fs.writeFile(story.filePath, updatedFileContent);
    } catch (error) {
      console.error(`❌ Error writing file ${story.filePath}: ${error.message}`);
      await logToFile(`Error writing file ${story.filePath}: ${error.message}`);
      return;
    }

    console.log(`✅ Marked story as posted to social media: ${story.title}`);
    await logToFile(`Marked story as posted to social media: ${story.title}`);

    // Verify the update
    try {
      const verifyContent = await fs.readFile(story.filePath, 'utf8');
      const verifyData = matter(verifyContent).data;

      if (verifyData.postedToSocialMedia) {
        console.log(`✅ Verified story marked as posted: ${story.title}`);
      } else {
        console.warn(`⚠️ Failed to verify story marked as posted: ${story.title}`);
        await logToFile(`Failed to verify story marked as posted: ${story.title}`);
      }
    } catch (error) {
      console.error(`❌ Error verifying update: ${error.message}`);
      await logToFile(`Error verifying update: ${error.message}`);
    }
  } catch (error) {
    console.error(`❌ Error marking story as posted: ${error.message}`);
    await logToFile(`Error marking story as posted: ${error.message}`);
  }
}

/**
 * Log a message to the log file
 */
async function logToFile(message) {
  try {
    // Create log directory if it doesn't exist
    try {
      await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
    } catch (error) {
      console.error(`❌ Error creating log directory: ${error.message}`);
      // Try to continue anyway
    }

    // Append to log file
    try {
      await fs.appendFile(
        LOG_FILE,
        `[${new Date().toISOString()}] ${message}\n`,
        'utf8'
      );
    } catch (error) {
      console.error(`❌ Error appending to log file: ${error.message}`);

      // Try to write to a fallback log file in the current directory
      try {
        const fallbackLogFile = './social-media-poster-fallback.log';
        await fs.appendFile(
          fallbackLogFile,
          `[${new Date().toISOString()}] ${message}\n`,
          'utf8'
        );
        console.log(`✅ Wrote to fallback log file: ${fallbackLogFile}`);
      } catch (fallbackError) {
        console.error(`❌ Error writing to fallback log file: ${fallbackError.message}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error in logToFile function: ${error.message}`);
  }
}

/**
 * Get a command line argument value
 */
function getArgValue(args, name, defaultValue = null) {
  const arg = args.find(arg => arg.startsWith(`${name}=`));
  if (!arg) return defaultValue;
  return arg.split('=')[1];
}

// Run the script if called directly
if (require.main === module) {
  postToSocialMedia().catch(console.error);
}
