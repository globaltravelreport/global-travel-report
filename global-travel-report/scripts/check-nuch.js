require('dotenv').config();
const ErrorBot = require('../bots/errors/errorBot');

async function checkNuchPage() {
  console.log('Starting error check for /nuch page...');
  
  try {
    const bot = new ErrorBot();
    // Set target URL and auth credentials
    bot.targetUrl = 'http://localhost:3000/nuch';
    bot.setHeaders({
      'Authorization': 'Basic ' + Buffer.from('admin:password123').toString('base64')
    });
    
    await bot.run();
    console.log('Error check completed successfully');
  } catch (error) {
    console.error('Error during check:', error);
    process.exit(1);
  }
}

checkNuchPage(); 