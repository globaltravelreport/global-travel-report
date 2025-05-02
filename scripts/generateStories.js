/**
 * Simple script to generate stories automatically
 * 
 * This script triggers the daily story generation process
 * and can be run manually or scheduled with a cron job.
 */
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

// Configuration
const DEFAULT_COUNT = 2;
const DEFAULT_CRUISE_COUNT = 1;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com';
const SECRET_KEY = process.env.CRON_SECRET_KEY || '';

async function generateStories() {
  try {
    console.log('Starting story generation process...');
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const count = getArgValue(args, '--count', DEFAULT_COUNT);
    const cruiseCount = getArgValue(args, '--cruise-count', DEFAULT_CRUISE_COUNT);
    const production = args.includes('--production');
    
    console.log(`Configuration: count=${count}, cruiseCount=${cruiseCount}, production=${production}`);
    
    // Build the URL
    let url = `${BASE_URL}/api/cron/dailyStories?count=${count}&cruiseCount=${cruiseCount}`;
    
    // Add headers
    const headers = {};
    if (SECRET_KEY) {
      headers['x-cron-secret'] = SECRET_KEY;
    }
    
    console.log(`Making request to: ${url}`);
    
    // Make the request
    const response = await fetch(url, { headers });
    const data = await response.json();
    
    console.log('Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('Story generation completed successfully!');
      
      // Trigger revalidation to update the website
      await revalidatePages();
      
      return true;
    } else {
      console.error('Story generation failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error generating stories:', error);
    return false;
  }
}

async function revalidatePages() {
  try {
    console.log('Revalidating pages...');
    
    // Revalidate homepage
    await fetch(`${BASE_URL}/api/revalidate?path=/`);
    
    // Revalidate stories page
    await fetch(`${BASE_URL}/api/revalidate?path=/stories`);
    
    console.log('Pages revalidated successfully!');
  } catch (error) {
    console.error('Error revalidating pages:', error);
  }
}

function getArgValue(args, flag, defaultValue) {
  const index = args.findIndex(arg => arg.startsWith(`${flag}=`));
  if (index !== -1) {
    const value = args[index].split('=')[1];
    return isNaN(value) ? value : parseInt(value, 10);
  }
  return defaultValue;
}

// Run the script
generateStories()
  .then(success => {
    if (success) {
      console.log('Script completed successfully!');
      process.exit(0);
    } else {
      console.error('Script failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
