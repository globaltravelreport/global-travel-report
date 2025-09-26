// Import the RSS parser package
const Parser = require('rss-parser');

// Create a new parser instance
const parser = new Parser();

// Google News RSS feed URL for travel and tourism
const FEED_URL = 'https://news.google.com/rss/search?q=travel+destinations+OR+tourism';

// Main function to fetch and display top stories
async function getTopStories() {
    try {
        // Fetch and parse the RSS feed
        const feed = await parser.parseURL(FEED_URL);
        
        // Get the first 10 items from the feed
        const topStories = feed.items.slice(0, 10);
        
        // Display each story
        topStories.forEach((story, index) => {
            console.log(`\nStory ${index + 1}:`);
            console.log(`Title: ${story.title}`);
            console.log(`Link: ${story.link}`);
            console.log('---');
        });
        
    } catch (error) {
        console.error('Error fetching news:', error.message);
    }
}

// Run the main function
getTopStories(); 