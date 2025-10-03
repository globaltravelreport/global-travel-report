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
import { generateStoryContent } from '../src/services/aiService.ts';
import { UnsplashService } from '../src/services/unsplashService.ts';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Configuration
const RSS_FEED_URL = 'https://globaltravelreport.com/rss/new';
const MAX_STORIES_PER_DAY = 8;
const WEBSITE_API_BASE = 'https://globaltravelreport.com/api';

// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

// Initialize services
const unsplashService = UnsplashService.getInstance();

// Gemini prompt for Australian English rewriting
const GEMINI_PROMPT = `Rewrite the following travel story in **Australian English**, in a professional tone, optimised for SEO and social media.
Provide:
- HEADLINE: [engaging, SEO-optimised title]
- SUMMARY: [concise 150–200 word summary with key tips and details]
Maintain all facts, locations, names, and relevance.

Original Title: {title}
Original Content: {content}`;

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
                    publish: true
                };

                processedStories.push(storyData);

                // 7. Post to website
                console.log('🌐 Posting to website...');
                await postToWebsite(storyData);

                // 8. Update RSS feed
                console.log('📰 Updating RSS feed...');
                await updateRSSFeed(storyData, story.pubDate);

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
            model: 'gemini-pro',
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

    if (text.includes('cruise')) {
        return 'Cruise';
    }
    if (text.includes('flight') || text.includes('airport') || text.includes('airline')) {
        return 'Flight';
    }
    if (text.includes('new zealand')) {
        return 'New Zealand';
    }
    if (text.includes('europe') || text.includes('france') || text.includes('italy')) {
        return 'Europe';
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
 * Update RSS feed
 */
async function updateRSSFeed(storyData, originalPubDate) {
    try {
        const rssData = {
            title: storyData.title,
            description: storyData.content,
            link: `https://globaltravelreport.com/stories/${storyData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
            image: storyData.imageUrl,
            pubDate: originalPubDate, // Preserve original story date
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