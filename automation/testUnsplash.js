// Import required packages
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Function to search Unsplash
async function searchUnsplash(query) {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    
    if (!accessKey) {
        throw new Error('UNSPLASH_ACCESS_KEY is not set in .env.local');
    }

    console.log(`Searching Unsplash for: "${query}"`);
    console.log(`Using Access Key: ${accessKey.substring(0, 5)}...`);

    try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: {
                query,
                per_page: 1
            },
            headers: {
                'Authorization': `Client-ID ${accessKey}`
            }
        });

        const { total, total_pages, results } = response.data;
        console.log(`Found ${total} images across ${total_pages} pages`);

        if (results.length > 0) {
            const firstImage = results[0];
            console.log('\nFirst image details:');
            console.log(`- Description: ${firstImage.description || firstImage.alt_description || 'No description'}`);
            console.log(`- URL: ${firstImage.urls.regular}`);
            console.log(`- Author: ${firstImage.user.name}`);
        }

        return response.data;
    } catch (error) {
        console.error('Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message
        });
        throw error;
    }
}

// Test the API
async function testUnsplash() {
    try {
        console.log('Testing Unsplash API access...\n');
        await searchUnsplash('australia travel landscape');
        console.log('\nTest completed successfully!');
    } catch (error) {
        console.error('\nTest failed:', error.message);
    }
}

// Run the test
testUnsplash(); 