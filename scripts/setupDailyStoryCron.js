/**
 * Setup Daily Story Cron Job
 * 
 * This script sets up a cron job to run the daily story generator at 2 PM Sydney time.
 * It updates the vercel.json file with the appropriate cron configuration.
 */

const fs = require('fs').promises;
const path = require('path');

async function setupDailyStoryCron() {
  try {
    console.log('Setting up daily story cron job...');
    
    // Path to vercel.json
    const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
    
    // Read existing vercel.json
    let vercelConfig;
    try {
      const vercelJsonContent = await fs.readFile(vercelJsonPath, 'utf8');
      vercelConfig = JSON.parse(vercelJsonContent);
    } catch (__error) {
      // Create a new config if file doesn't exist
      vercelConfig = {
        version: 2,
        buildCommand: "npm run build",
        devCommand: "npm run dev",
        installCommand: "npm install",
        framework: "nextjs",
        regions: ["syd1"],
        env: {
          NEXT_PUBLIC_SITE_URL: "https://globaltravelreport.com"
        }
      };
    }
    
    // Add or update crons configuration
    // 4 AM UTC = 2 PM Sydney time (AEST, UTC+10)
    vercelConfig.crons = [
      {
        path: "/api/cron/dailyStories",
        schedule: "0 4 * * *"
      }
    ];
    
    // Write updated config back to vercel.json
    await fs.writeFile(
      vercelJsonPath,
      JSON.stringify(vercelConfig, null, 2),
      'utf8'
    );
    
    console.log('✅ Daily story cron job set up successfully!');
    console.log('The job will run daily at 2 PM Sydney time (4 AM UTC)');
    console.log('\nNext steps:');
    console.log('1. Commit and push the updated vercel.json file');
    console.log('2. Make sure your Vercel project has the required environment variables:');
    console.log('   - OPENAI_API_KEY');
    console.log('   - UNSPLASH_ACCESS_KEY');
    
  } catch (error) {
    console.error('❌ Error setting up cron job:', error.message);
    process.exit(1);
  }
}

// Run the script
setupDailyStoryCron();
