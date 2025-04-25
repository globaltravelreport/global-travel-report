require('dotenv').config();
const ErrorBot = require('./errors/errorBot');
const logger = require('./utils/logger');

const bot = new ErrorBot();
bot.run().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
}); 