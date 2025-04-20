require('dotenv').config();
const ErrorBot = require('./errors/errorBot');

const bot = new ErrorBot();
bot.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 