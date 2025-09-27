/**
 * Setup Vercel Cron Jobs
 * 
 * This script sets up cron jobs for Vercel using the Vercel CLI.
 * It creates a cron job to fetch and process daily stories at 2 PM Sydney time.
 * 
 * Usage:
 * 1. Make sure you're logged in to Vercel CLI: `vercel login`
 * 2. Run this script: `node scripts/setupVercelCron.js`
 */

const { execSync } = require('child_process');
const crypto = require('crypto');

// Generate a random secret key for the cron job
function generateSecretKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Convert Sydney time (AEST/AEDT) to UTC
function sydneyToUtc(hour) {
  // Sydney is UTC+10 (AEST) or UTC+11 (AEDT)
  // For simplicity, we'll use UTC+10 (AEST)
  const utcHour = (hour - 10 + 24) % 24;
  return utcHour;
}

// Main function to set up cron jobs
async function setupCronJobs() {
  try {
    console.log('Setting up Vercel cron jobs...');
    
    // Generate a secret key for the cron job
    const secretKey = generateSecretKey();
    console.log(`Generated secret key: ${secretKey}`);
    console.log('Make sure to add this key to your Vercel environment variables as CRON_SECRET_KEY');
    
    // Sydney time: 2 PM (14:00)
    // Convert to UTC
    const utcHour = sydneyToUtc(14);
    
    // Create the cron schedule (run daily at the specified UTC hour)
    const cronSchedule = `0 ${utcHour} * * *`;
    
    // Create the cron job command
    const cronCommand = `vercel cron add "Daily Stories" "${cronSchedule}" "https://www.globaltravelreport.com/api/cron/dailyStories" --header "x-api-key=${secretKey}"`;
    
    // Execute the command
    console.log(`Creating cron job to run at ${utcHour}:00 UTC (14:00 Sydney time)...`);
    execSync(cronCommand, { stdio: 'inherit' });
    
    console.log('Cron job created successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Add the CRON_SECRET_KEY to your Vercel environment variables');
    console.log('2. Make sure your Vercel project has the required environment variables:');
    console.log('   - OPENAI_API_KEY');
    console.log('   - UNSPLASH_ACCESS_KEY');
    console.log('   - CRON_SECRET_KEY');
    console.log('3. Deploy your project to Vercel');
    
  } catch (error) {
    console.error('Error setting up cron jobs:', error.message);
    process.exit(1);
  }
}

// Run the script
setupCronJobs();
