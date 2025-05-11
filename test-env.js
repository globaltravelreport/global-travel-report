// Load environment variables
require('dotenv').config();

// Log all environment variables
console.log('Environment variables:');
console.log('---------------------');
console.log('Loaded OpenAI Key:', process.env.OPENAI_API_KEY);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('---------------------');

// Check if .env.local is being loaded
console.log('\nChecking .env.local loading:');
console.log('-------------------------');
console.log('Current working directory:', process.cwd());
console.log('-------------------------'); 