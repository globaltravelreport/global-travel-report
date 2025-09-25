/**
 * Daily Story Generation Monitoring Script
 * 
 * This script checks if the daily story generation was successful and sends an alert if it fails.
 * It can be run after the daily story generation to verify success.
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  // Number of stories that should be generated daily
  expectedStoryCount: 9,
  
  // Number of days to look back for stories
  daysToCheck: 1,
  
  // Directory where stories are stored
  contentDir: path.join(process.cwd(), 'content/articles'),
  
  // Directory where logs are stored
  logsDir: path.join(process.cwd(), 'logs'),
  
  // Webhook URL for alerts (optional)
  webhookUrl: process.env.ALERT_WEBHOOK_URL || '',
};

/**
 * Main monitoring function
 */
async function monitorDailyStories() {
  console.log('🔍 Starting daily story generation monitoring...');
  
  try {
    // Create logs directory if it doesn't exist
    await fs.mkdir(CONFIG.logsDir, { recursive: true });
    
    // Get today's date
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    // Check if log file exists
    const logFilePath = path.join(CONFIG.logsDir, `daily-story-generator-${formattedDate}.log`);
    let logFileExists = false;
    
    try {
      await fs.access(logFilePath);
      logFileExists = true;
      console.log(`✅ Log file found: ${logFilePath}`);
    } catch (error) {
      console.warn(`⚠️ Log file not found: ${logFilePath}`);
    }
    
    // Read log file if it exists
    let logContent = '';
    if (logFileExists) {
      logContent = await fs.readFile(logFilePath, 'utf8');
      console.log('✅ Successfully read log file');
    }
    
    // Check for success message in log
    const isSuccessInLog = logContent.includes('Daily story generation completed successfully');
    
    // Count stories created today
    const storyCount = await countStoriesCreatedRecently(CONFIG.daysToCheck);
    console.log(`📊 Stories created in the last ${CONFIG.daysToCheck} day(s): ${storyCount}`);
    
    // Determine if the daily story generation was successful
    const isSuccessful = isSuccessInLog && storyCount >= CONFIG.expectedStoryCount;
    
    if (isSuccessful) {
      console.log('✅ Daily story generation was successful!');
      return true;
    } else {
      const reason = !isSuccessInLog 
        ? 'Success message not found in log file' 
        : `Only ${storyCount}/${CONFIG.expectedStoryCount} stories were created`;
      
      console.error(`❌ Daily story generation failed: ${reason}`);
      
      // Send alert
      if (CONFIG.webhookUrl) {
        await sendAlert({
          status: 'failed',
          reason,
          storyCount,
          expectedStoryCount: CONFIG.expectedStoryCount,
          date: formattedDate,
          logExcerpt: logContent.slice(-500) // Last 500 characters of log
        });
      }
      
      return false;
    }
  } catch (error) {
    console.error(`❌ Error monitoring daily story generation: ${error.message}`);
    
    // Send alert for unexpected error
    if (CONFIG.webhookUrl) {
      await sendAlert({
        status: 'error',
        reason: error.message,
        date: new Date().toISOString().split('T')[0]
      });
    }
    
    return false;
  }
}

/**
 * Count stories created in the last N days
 * @param {number} days - Number of days to look back
 * @returns {Promise<number>} - Number of stories created
 */
async function countStoriesCreatedRecently(days) {
  try {
    // Get all markdown files in content directory
    const files = await fs.readdir(CONFIG.contentDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    // Get current date and date N days ago
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    
    let recentStoryCount = 0;
    
    // Check each file's creation date
    for (const file of markdownFiles) {
      const filePath = path.join(CONFIG.contentDir, file);
      const stats = await fs.stat(filePath);
      
      // Check if file was created in the last N days
      if (stats.birthtime >= startDate) {
        recentStoryCount++;
      }
    }
    
    return recentStoryCount;
  } catch (error) {
    console.error(`Error counting recent stories: ${error.message}`);
    return 0;
  }
}

/**
 * Send an alert via webhook
 * @param {Object} data - Alert data
 * @returns {Promise<void>}
 */
async function sendAlert(data) {
  if (!CONFIG.webhookUrl) {
    console.log('⚠️ No webhook URL configured for alerts');
    return;
  }
  
  return new Promise((resolve, reject) => {
    try {
      const payload = JSON.stringify({
        text: `🚨 Daily Story Generation Alert 🚨`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Daily Story Generation ${data.status === 'failed' ? 'Failed' : 'Error'}*\n${data.reason}`
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Date:*\n${data.date}`
              },
              {
                type: 'mrkdwn',
                text: `*Stories:*\n${data.storyCount || 0}/${data.expectedStoryCount || CONFIG.expectedStoryCount}`
              }
            ]
          }
        ]
      });
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length
        }
      };
      
      const req = https.request(CONFIG.webhookUrl, options, (res) => {
        if (res.statusCode === 200) {
          console.log('✅ Alert sent successfully');
          resolve();
        } else {
          console.error(`❌ Failed to send alert: HTTP ${res.statusCode}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
      
      req.on('error', (error) => {
        console.error(`❌ Error sending alert: ${error.message}`);
        reject(error);
      });
      
      req.write(payload);
      req.end();
    } catch (error) {
      console.error(`❌ Error sending alert: ${error.message}`);
      reject(error);
    }
  });
}

// Run the monitoring function if called directly
if (require.main === module) {
  monitorDailyStories()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = { monitorDailyStories };
