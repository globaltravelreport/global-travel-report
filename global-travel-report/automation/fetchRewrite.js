// Import required packages
const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const { rewriteArticle } = require('./rewriteAndPublish.js');
const { saveArticles } = require('./saveArticlesToMarkdown.js');
require('dotenv').config({ path: '.env.local' });

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

// Sample articles for testing
const SAMPLE_ARTICLES = [
    {
        title: "Southeast Asia Emerges as Top Travel Destination for Australians",
        content: `Southeast Asia has become the number one travel destination for Australian tourists in 2025, according to recent travel booking data. The region's combination of rich culture, stunning beaches, and affordable luxury experiences has captured the attention of Australian travelers.

Thailand leads the pack with Bangkok and Phuket seeing record numbers of Australian visitors. Vietnam and Indonesia follow closely, with Bali remaining a perennial favorite. The trend shows a clear preference for destinations that offer a mix of adventure, relaxation, and cultural immersion.

Travel experts attribute this surge to improved airline connectivity, competitive pricing, and a growing interest in authentic cultural experiences. Many travelers are also extending their stays, combining work and leisure in these destinations.

Local tourism boards have responded by enhancing infrastructure and developing new attractions that cater to Australian preferences, while maintaining the authentic charm that makes these destinations unique.`
    },
    {
        title: "Australia's Cruise Industry Sets Sail for Record Growth",
        content: `The Australian cruise industry is experiencing unprecedented growth, with new partnerships and expanded routes promising an exciting future for maritime tourism. Industry leaders are reporting a surge in bookings for both domestic and international cruises.

South Australia has taken center stage with its new CLIA partnership, positioning itself as a premier cruise destination. The state's unique combination of wine regions, wildlife experiences, and coastal attractions has proven particularly appealing to cruise operators and passengers alike.

Major cruise lines are introducing new ships specifically designed for the Australian market, featuring amenities and itineraries tailored to local preferences. The industry's focus on sustainability and responsible tourism has also resonated strongly with environmentally conscious travelers.

Port cities across Australia are investing in infrastructure upgrades to accommodate larger vessels and enhance the passenger experience. These developments are expected to generate significant economic benefits for local communities.`
    },
    {
        title: "Japan Remains Top Choice for Australian Travelers",
        content: `Japan continues to captivate Australian travelers, with tourism numbers reaching new heights in the post-pandemic era. The combination of ancient traditions and modern innovations has created an irresistible draw for visitors from Down Under.

From the neon-lit streets of Tokyo to the serene temples of Kyoto, Australian tourists are exploring Japan in record numbers. The country's efficient transportation system, unique cuisine, and distinctive culture have made it a standout destination for both first-time and returning visitors.

Cherry blossom season remains particularly popular, but travelers are increasingly discovering the appeal of other seasons, including autumn's colorful foliage and winter's world-class skiing. The Japanese government's efforts to enhance English-language services and develop new tourist attractions have made the country more accessible than ever.

Australian travel agencies report strong bookings for both independent travel and guided tours, with many visitors combining city experiences with adventures in Japan's scenic rural regions.`
    }
];

// Function to fetch an image from Unsplash
async function getUnsplashImage(searchQuery) {
    if (!UNSPLASH_ACCESS_KEY) {
        console.warn('⚠️ UNSPLASH_ACCESS_KEY not found in .env.local');
        return null;
    }

    try {
        console.log('🖼️ Searching Unsplash for:', searchQuery);
        
        const response = await axios.get(UNSPLASH_API_URL, {
            params: {
                query: searchQuery,
                orientation: 'landscape',
                client_id: UNSPLASH_ACCESS_KEY
            }
        });

        if (response.data.results && response.data.results.length > 0) {
            const photo = response.data.results[0];
            return {
                imageUrl: photo.urls.regular,
                imageAlt: photo.alt_description || photo.description || searchQuery,
                imageCredit: `${photo.user.name} on Unsplash`,
                imageLink: photo.links.html
            };
        }

        console.warn('⚠️ No images found for:', searchQuery);
        return null;
    } catch (error) {
        console.error('❌ Failed to fetch Unsplash image:', error.message);
        return null;
    }
}

// Main function to process and rewrite articles
async function processArticles() {
    try {
        console.log('🔍 Starting article processing...');
        
        // Array to store successfully rewritten articles
        const rewrittenArticles = [];
        
        // Process sample articles
        for (const [index, article] of SAMPLE_ARTICLES.entries()) {
            console.log(`\n📄 Processing article ${index + 1}/${SAMPLE_ARTICLES.length}:`);
            console.log('✅ Original title:', article.title);
            
            try {
                // Add delay between requests to avoid rate limiting
                if (index > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                
                // Combine title and content
                const fullContent = `${article.title}\n\n${article.content}`;
                
                // Rewrite the article
                console.log('🔄 Rewriting article...');
                const rewrittenArticle = await rewriteArticle(fullContent);
                
                // Add metadata
                rewrittenArticle.country = "Australia";
                rewrittenArticle.type = "Travel News";

                // Get Unsplash image
                const searchQuery = rewrittenArticle.keywords?.[0] || rewrittenArticle.title;
                const imageData = await getUnsplashImage(searchQuery);
                
                if (imageData) {
                    console.log('✅ Found Unsplash image');
                    Object.assign(rewrittenArticle, imageData);
                }
                
                // Print results
                console.log('\n📝 Results:');
                console.log('🔄 Rewritten title:', rewrittenArticle.title);
                console.log('✏️ Summary:', rewrittenArticle.summary);
                console.log('📌 Keywords:', rewrittenArticle.keywords.join(', '));
                if (imageData) {
                    console.log('🖼️ Image:', imageData.imageUrl);
                    console.log('📸 Credit:', imageData.imageCredit);
                }
                
                // Add to collection
                rewrittenArticles.push(rewrittenArticle);
                
                console.log('\n---\n');
                
            } catch (error) {
                console.error(`❌ Failed to process article: ${error.message}`);
                continue;
            }
        }
        
        // Save all rewritten articles
        if (rewrittenArticles.length > 0) {
            console.log('\n💾 Saving articles to Markdown files...');
            await saveArticles(rewrittenArticles);
        }
        
        console.log('\n✨ Finished processing articles');
        console.log(`📊 Total articles processed: ${SAMPLE_ARTICLES.length}`);
        console.log(`📊 Successfully rewritten: ${rewrittenArticles.length}`);
        
    } catch (error) {
        console.error('❌ Error in main process:', error.message);
    }
}

// Run the main function
processArticles(); 