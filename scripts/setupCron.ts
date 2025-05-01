import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function setupCron() {
  try {
    // Add cron job to run daily at 2 PM Sydney time (AEST, UTC+10)
    // Note: Cron uses server time, so adjust accordingly if server is not in Sydney timezone
    // For UTC: 4 AM UTC = 2 PM Sydney (during standard time)
    const cronCommand = '0 4 * * * curl -X GET https://www.globaltravelreport.com/api/cron/dailyStories';

    // Add to crontab
    await execAsync(`(crontab -l 2>/dev/null; echo "${cronCommand}") | crontab -`);

    console.log('Cron job set up successfully to run at 2 PM Sydney time');
  } catch (error) {
    console.error('Error setting up cron job:', error);
    process.exit(1);
  }
}

// Run the script
setupCron();