/**
 * Test Daily Stories Processing
 * 
 * This script tests the daily stories processing endpoint with a specific CRON_SECRET_KEY.
 * 
 * Usage:
 * 1. Run this script: `node scripts/testDailyStories.js YOUR_CRON_SECRET_KEY`
 */

const fetch = require('node-fetch');

// Get the secret key from command line arguments
const secretKey = process.argv[2];

if (!secretKey) {
  console.error('Error: No secret key provided');
  console.error('Usage: node scripts/testDailyStories.js YOUR_CRON_SECRET_KEY');
  process.exit(1);
}

// Main function to test daily stories processing
async function testDailyStories() {
  try {
    console.log('Testing daily stories processing...');
    
    // Build the URL with query parameters
    const url = 'https://www.globaltravelreport.com/api/cron/dailyStories?count=2&cruiseCount=1';
    
    // Prepare headers
    const headers = {
      'x-api-key': secretKey
    };
    
    console.log('Using secret key for authentication');
    console.log(`Making request to: ${url}`);
    
    // Make the request
    const response = await fetch(url, { headers });
    
    // Parse the response
    const data = await response.json();
    
    // Log the response
    console.log('Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('Daily stories processing triggered successfully!');
    } else {
      console.error('Error triggering daily stories processing:', data.message);
    }
  } catch (error) {
    console.error('Error triggering daily stories processing:', error.message);
    process.exit(1);
  }
}

// Run the script
testDailyStories();
