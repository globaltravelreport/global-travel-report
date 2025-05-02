/**
 * Trigger Daily Stories Processing
 *
 * This script triggers the daily stories processing endpoint manually.
 * It's useful for testing the story processing functionality without waiting for the cron job.
 *
 * Usage:
 * 1. Make sure your local development server is running: `npm run dev`
 * 2. Run this script: `node scripts/triggerDailyStories.js`
 *
 * Options:
 * --count=<number>       Number of stories to process (default: 8)
 * --cruise-count=<number> Number of cruise stories to include (default: 2)
 * --production           Trigger the production endpoint instead of localhost
 * --secret-key=<string>  The CRON_SECRET_KEY to use for authentication
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  count: 8,
  cruiseCount: 2,
  production: false,
  secretKey: null
};

args.forEach(arg => {
  if (arg.startsWith('--count=')) {
    options.count = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--cruise-count=')) {
    options.cruiseCount = parseInt(arg.split('=')[1], 10);
  } else if (arg === '--production') {
    options.production = true;
  } else if (arg.startsWith('--secret-key=')) {
    options.secretKey = arg.split('=')[1];
  }
});

// Main function to trigger daily stories processing
async function triggerDailyStories() {
  try {
    console.log('Triggering daily stories processing...');
    console.log(`Options: count=${options.count}, cruiseCount=${options.cruiseCount}, production=${options.production}`);

    // Determine the base URL
    const baseUrl = options.production
      ? 'https://www.globaltravelreport.com'
      : 'http://localhost:3000';

    // Build the URL with query parameters
    const url = `${baseUrl}/api/cron/dailyStories?count=${options.count}&cruiseCount=${options.cruiseCount}`;

    // Get the secret key from command line args or environment variables
    const secretKey = options.secretKey || process.env.CRON_SECRET_KEY;

    // Prepare headers
    const headers = {};
    if (secretKey) {
      headers['x-api-key'] = secretKey;
      console.log('Using secret key for authentication');
    } else {
      console.warn('No secret key provided. Request may be unauthorized.');
    }

    // Make the request
    console.log(`Making request to: ${url}`);
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
triggerDailyStories();
