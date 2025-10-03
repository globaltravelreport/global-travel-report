/**
 * Global Travel Report Auto-Publisher (Gemini Edition – Australian Style)
 *
 * Automated daily content publisher that:
 * 1. Fetches stories from RSS feed
 * 2. Rewrites content using Gemini AI in Australian English
 * 3. Adds Unsplash images
 * 4. Classifies categories
 * 5. Publishes to website and social media
 * 6. Updates RSS feed
 *
 * Runs daily at 10:00 AM AEST
 */

import Parser from 'rss-parser';
import axios from 'axios';
import { generateStoryContent } from '../src/services/aiService.js';
import { UnsplashService } from '../src/services/unsplashService.js';
import { FacebookService } from '../src/services/facebookService.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Configuration
const RSS_FEED_URL = 'https://globaltravelreport.com/rss/new';
const MAX_STORIES_PER_DAY = 8;
const WEBSITE_API_BASE = 'https://globaltravelreport.com/api';

// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_ORG_ID = process.env.LINKEDIN_ORG_ID;

// Initialize services
const unsplashService = UnsplashService.getInstance();
const facebookService = new FacebookService(FACEBOOK_ACCESS_TOKEN);

// Gemini prompt for Australian English rewriting
const GEMINI_PROMPT = `You are a professional Australian travel writer for Global Travel Report. Rewrite the following story using correct Australian English, in a professional tone, for publication on our website and social media.

Original Title: {title}
Original Content: {content}

Please return:
1. An SEO-optimised headline (Australian English spelling)
2. A concise, informative summary (150–200 words)
3. Key travel highlights or tips
4. Preserve factual details and place names
5. Avoid overly casual language or exaggeration

Format:
HEADLINE: [headline]
SUMMARY: [summary]

No extra text or formatting.`;

/**
 * Main automation function
 */
async function runDailyAutomation() {
    console.log('🚀 Starting Global Travel Report Auto-Publisher...');
    console.log(`📅 Date: ${new Date().toISOString()}`);
    console.log(`⏰ Time (AEST): ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' })}`);

    try {
        // 1. Fetch RSS feed
        console.log('📡 Fetching RSS feed...');
        const stories = await fetchRSSFeed();
        console.log(`✅ Fetched ${stories.length} stories from RSS feed`);

        if (stories.length === 0) {
            console.log('⚠️ No stories found in RSS feed');
            return;
        }

        // Limit to 8 stories per day
        const limitedStories = stories.slice(0, MAX_STORIES_PER_DAY);
        console.log(`📊 Processing ${limitedStories.length} stories (limited to ${MAX_STORIES_PER_DAY} per day)`);

        const processedStories = [];

        // 2. Process each story
        for (let i = 0; i < limitedStories.length; i++) {
            const story = limitedStories[i];
            console.log(`\n📄 Processing story ${i + 1}/${limitedStories.length}: ${story.title}`);

            try {
                // Skip if missing required fields
                if (!story.title || !story.content) {
                    console.log('⚠️ Skipping story - missing title or content');
                    continue;
                }

                // 3. Rewrite with Gemini AI
                console.log('🤖 Rewriting with Gemini AI...');
                const rewrittenData = await rewriteWithGemini(story.title, story.content);

                // 4. Get Unsplash image
                console.log('🖼️ Fetching Unsplash image...');
                const imageData = await getUnsplashImage(rewrittenData.headline, rewrittenData.summary);

                // 5. Classify category
                console.log('🏷️ Classifying category...');
                const category = classifyCategory(rewrittenData.headline, rewrittenData.summary);

                // 6. Prepare story data
                const storyData = {
                    title: rewrittenData.headline,
                    content: rewrittenData.summary,
                    imageUrl: imageData?.imageUrl || '',
                    photographer: imageData?.photographer || '',
                    category: category,
                    tags: ['travel', 'automated'],
                    publish: true,
                    date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD
                };

                processedStories.push(storyData);

                // 7. Post to website
                console.log('🌐 Posting to website...');
                await postToWebsite(storyData);

                // 8. Post to social media
                console.log('📱 Posting to social media...');
                await postToSocialMedia(storyData);

                // 9. Update RSS feed
                console.log('📰 Updating RSS feed...');
                await updateRSSFeed(storyData);

                console.log('✅ Story processed successfully');

                // Rate limiting delay
                if (i < limitedStories.length - 1) {
                    console.log('⏳ Waiting 2 seconds before next story...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

            } catch (error) {
                console.error(`❌ Failed to process story "${story.title}":`, error.message);
                // Continue with next story
            }
        }

        console.log(`\n🎉 Daily automation completed! Processed ${processedStories.length} stories`);

    } catch (error) {
        console.error('💥 Critical error in daily automation:', error);
        await sendErrorAlert(error);
    }
}

/**
 * Fetch stories from RSS feed
 */
async function fetchRSSFeed() {
    try {
        const parser = new Parser();
        const feed = await parser.parseURL(RSS_FEED_URL);

        return feed.items.map(item => ({
            title: item.title,
            content: item.content || item.summary || item.description,
            link: item.link,
            pubDate: item.pubDate
        })).filter(item => item.title && item.content);

    } catch (error) {
        console.error('Error fetching RSS feed:', error);
        throw error;
    }
}

/**
 * Rewrite content using Gemini AI
 */
async function rewriteWithGemini(title, content) {
    try {
        const prompt = GEMINI_PROMPT
            .replace('{title}', title)
            .replace('{content}', content);

        const response = await generateStoryContent(prompt, {
            provider: 'google',
            model: 'gemini-1.5-flash',
            temperature: 0.7,
            maxTokens: 1000
        });

        const text = response.content;
        console.log('Gemini response:', text);

        // Parse the response
        const headlineMatch = text.match(/HEADLINE:\s*(.+?)(?:\n|$)/i);
        const summaryMatch = text.match(/SUMMARY:\s*(.+?)(?:\nHEADLINE:|$)/is);

        if (!headlineMatch || !summaryMatch) {
            throw new Error('Failed to parse Gemini response format');
        }

        return {
            headline: headlineMatch[1].trim(),
            summary: summaryMatch[1].trim()
        };

    } catch (error) {
        console.error('Error rewriting with Gemini:', error);
        throw error;
    }
}

/**
 * Get image from Unsplash
 */
async function getUnsplashImage(headline, summary) {
    try {
        // Extract keywords from headline and summary
        const text = `${headline} ${summary}`;
        const keywords = extractKeywords(text);

        // Try multiple search queries
        for (const query of keywords) {
            try {
                const images = await unsplashService.searchImages(query, { orientation: 'landscape' });
                if (images.length > 0) {
                    const image = images[0];
                    return {
                        imageUrl: image.url,
                        photographer: image.photographer.name
                    };
                }
            } catch (error) {
                console.log(`Unsplash search failed for "${query}":`, error.message);
            }
        }

        console.log('No images found for any keywords');
        return null;

    } catch (error) {
        console.error('Error getting Unsplash image:', error);
        return null;
    }
}

/**
 * Extract keywords from text for image search
 */
function extractKeywords(text) {
    const keywords = [];

    // Common travel keywords
    const travelKeywords = [
        'beach', 'mountain', 'city', 'hotel', 'resort', 'cruise', 'flight',
        'restaurant', 'food', 'culture', 'adventure', 'nature', 'urban',
        'landscape', 'travel', 'vacation', 'holiday', 'destination'
    ];

    const lowerText = text.toLowerCase();

    // Add matching keywords
    travelKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
            keywords.push(`${keyword} travel`);
        }
    });

    // Add location-based keywords
    const locations = ['australia', 'japan', 'france', 'italy', 'thailand', 'usa', 'uk', 'canada', 'europe', 'asia'];
    locations.forEach(location => {
        if (lowerText.includes(location)) {
            keywords.push(`${location} travel`);
        }
    });

    // Fallback keywords
    if (keywords.length === 0) {
        keywords.push('travel landscape', 'australia travel');
    }

    return keywords.slice(0, 3); // Limit to 3 queries
}

/**
 * Classify story category
 */
function classifyCategory(headline, summary) {
    const text = `${headline} ${summary}`.toLowerCase();

    const categoryRules = {
        'Flight': ['qantas', 'flight', 'airline', 'airport', 'aviation'],
        'Cruise': ['cruise', 'princess', 'ship', 'voyage', 'ocean liner'],
        'New Zealand': ['new zealand', 'nz', 'auckland', 'wellington'],
        'Europe': ['france', 'italy', 'spain', 'germany', 'uk', 'europe'],
        'Travel News': ['travel', 'tourism', 'industry', 'market']
    };

    for (const [category, keywords] of Object.entries(categoryRules)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return category;
        }
    }

    return 'Travel News'; // Default category
}

/**
 * Post story to website
 */
async function postToWebsite(storyData) {
    try {
        const response = await axios.post(
            `${WEBSITE_API_BASE}/admin/ingest-content`,
            storyData,
            {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Posted to website:', response.data);
        return response.data;

    } catch (error) {
        console.error('Error posting to website:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Post to social media platforms
 */
async function postToSocialMedia(storyData) {
    const results = {
        facebook: false,
        twitter: false,
        linkedin: false
    };

    // Facebook
    try {
        if (FACEBOOK_ACCESS_TOKEN && FACEBOOK_PAGE_ID) {
            const message = `${storyData.title}\n\n${storyData.content.substring(0, 200)}...\n\n#GlobalTravelReport #Travel`;
            await facebookService.createPost(FACEBOOK_PAGE_ID, { message });
            results.facebook = true;
            console.log('✅ Posted to Facebook');
        }
    } catch (error) {
        console.error('Facebook posting failed:', error.message);
    }

    // Twitter/X
    try {
        if (TWITTER_BEARER_TOKEN) {
            await postToTwitter(storyData);
            results.twitter = true;
            console.log('✅ Posted to Twitter');
        }
    } catch (error) {
        console.error('Twitter posting failed:', error.message);
    }

    // LinkedIn
    try {
        if (LINKEDIN_ACCESS_TOKEN && LINKEDIN_ORG_ID) {
            await postToLinkedIn(storyData);
            results.linkedin = true;
            console.log('✅ Posted to LinkedIn');
        }
    } catch (error) {
        console.error('LinkedIn posting failed:', error.message);
    }

    return results;
}

/**
 * Post to Twitter/X
 */
async function postToTwitter(storyData) {
    try {
        const message = `${storyData.title}\n\n${storyData.content.substring(0, 150)}...\n\n#GlobalTravelReport #Travel`;

        const response = await axios.post(
            'https://api.twitter.com/2/tweets',
            { text: message },
            {
                headers: {
                    'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error('Twitter API error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Post to LinkedIn
 */
async function postToLinkedIn(storyData) {
    try {
        const postData = {
            author: `urn:li:organization:${LINKEDIN_ORG_ID}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: `${storyData.title}\n\n${storyData.content.substring(0, 200)}...\n\n#TravelIndustry #Tourism`
                    },
                    shareMediaCategory: 'NONE'
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        };

        const response = await axios.post(
            'https://api.linkedin.com/v2/ugcPosts',
            postData,
            {
                headers: {
                    'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0'
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error('LinkedIn API error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Update RSS feed
 */
async function updateRSSFeed(storyData) {
    try {
        const rssData = {
            title: storyData.title,
            description: storyData.content,
            link: `https://globaltravelreport.com/stories/${storyData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
            image: storyData.imageUrl,
            pubDate: new Date().toISOString(),
            category: storyData.category
        };

        const response = await axios.post(
            `${WEBSITE_API_BASE}/rss/update`,
            rssData,
            {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Updated RSS feed');
        return response.data;

    } catch (error) {
        console.error('Error updating RSS feed:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Send error alert
 */
async function sendErrorAlert(error) {
    console.error('🚨 Error alert:', error.message);

    // TODO: Implement email/Discord alerts
    // For now, just log the error
}

/**
 * Validate environment variables
 */
function validateEnvironment() {
    const required = [
        'GEMINI_API_KEY',
        'UNSPLASH_ACCESS_KEY',
        'ADMIN_TOKEN'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    console.log('✅ Environment variables validated');
}

// Run the automation if called directly
if (require.main === module) {
    validateEnvironment();
    runDailyAutomation().catch(console.error);
}

export { runDailyAutomation };