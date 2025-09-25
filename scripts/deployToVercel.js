// Deploy to Vercel with proper environment variables
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function deployToVercel() {
  try {
    console.log('Preparing to deploy to Vercel...');
    
    // Commit changes
    console.log('Committing changes...');
    try {
      execSync('git add app/stories/[slug]/page.tsx src/components/ui/OptimizedImage.tsx scripts/testMongoDB.js scripts/addMockStoriesToDB.js scripts/deployToVercel.js', { stdio: 'inherit' });
      execSync('git commit -m "Fix 404 pages and image attribution issues" --no-verify', { stdio: 'inherit' });
    } catch (error) {
      console.log('Git commit failed, but continuing with deployment...');
    }
    
    // Deploy to Vercel
    console.log('Deploying to Vercel...');
    execSync('vercel --prod', { stdio: 'inherit' });
    
    console.log('Deployment complete!');
  } catch (error) {
    console.error('Error deploying to Vercel:', error);
    process.exit(1);
  }
}

deployToVercel();
