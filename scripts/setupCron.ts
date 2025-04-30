import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function setupCron() {
  try {
    // Add cron job to run daily at 1 AM
    const cronCommand = '0 1 * * * curl -X GET https://www.globaltravelreport.com/api/cron/dailyStories';
    
    // Add to crontab
    await execAsync(`(crontab -l 2>/dev/null; echo "${cronCommand}") | crontab -`);
    
    console.log('Cron job set up successfully');
  } catch (error) {
    console.error('Error setting up cron job:', error);
    process.exit(1);
  }
}

// Run the script
setupCron(); 