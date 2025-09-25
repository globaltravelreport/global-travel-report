/**
 * Test OpenAI API Key
 * 
 * This script tests if the OpenAI API key is valid and working.
 * 
 * Usage:
 * 1. Run this script: `node scripts/testOpenAI.js`
 */

require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API key...');
    
    // Get the API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('Error: OPENAI_API_KEY is not set in environment variables');
      process.exit(1);
    }
    
    console.log('API key found in environment variables');
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    // Make a simple request to test the API key
    console.log('Making a test request to OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: 'Hello, this is a test message to verify the OpenAI API key is working.'
        }
      ],
      max_tokens: 50,
    });
    
    // Log the response
    console.log('Response from OpenAI:');
    console.log(completion.choices[0].message.content);
    
    console.log('OpenAI API key is valid and working!');
  } catch (error) {
    console.error('Error testing OpenAI API key:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the script
testOpenAI();
