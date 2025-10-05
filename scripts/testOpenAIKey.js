/**
 * Test OpenAI API Key
 *
 * This script tests if the OpenAI API key is valid and working.
 * It also checks if the key is properly configured in the environment.
 *
 * Usage:
 * 1. Run this script: `node scripts/testOpenAIKey.js`
 */

require('dotenv').config({ path: '.env.local' });
const { OpenAI } = require('openai');

async function testOpenAIKey() {
  try {
    console.log('Testing OpenAI API key...');

    // Get the API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('Error: OPENAI_API_KEY is not set in environment variables');
      console.log('Please set a valid OpenAI API key in your .env.local file');
      process.exit(1);
    }

    if (apiKey === 'your_openai_api_key_here') {
      console.error('Error: OPENAI_API_KEY is set to the placeholder value "your_openai_api_key_here"');
      console.log('Please replace it with a valid OpenAI API key in your .env.local file');
      process.exit(1);
    }

    console.log('API key found in environment variables');
    console.log(`API key: ${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 4)}`);

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Test the API key with a simple request
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
          content: 'Hello, this is a test request to verify my API key is working.'
        }
      ],
      max_tokens: 50
    });

    if (completion.choices && completion.choices.length > 0) {
      console.log('Test request successful!');
      console.log('Response:', completion.choices[0].message.content);
      console.log('Your OpenAI API key is valid and working correctly.');

      // Check if the key is properly configured in the application
      console.log('\nChecking if the key is properly configured in the application...');

      try {
        // Check if the OpenAIService is using the correct key
        const { OpenAIService } = require('../src/services/openaiService');
        const openaiService = OpenAIService.getInstance();

        if (openaiService.canMakeRequest()) {
          console.log('OpenAIService is properly configured and can make requests.');
          console.log('Remaining requests today:', openaiService.getRemainingRequests());
        } else {
          console.warn('OpenAIService is not able to make requests. This might be due to rate limiting or configuration issues.');
        }
      } catch (__error) {
        console.log('Could not check OpenAIService configuration, but the API key is valid.');
        console.log('This is normal when running the script outside the application context.');
      }

      return true;
    } else {
      console.error('Error: Received an empty response from OpenAI');
      return false;
    }
  } catch (error) {
    console.error('Error testing OpenAI API key:', error);

    if (error.response) {
      console.error('OpenAI API Error:', error.response.status, error.response.data);
    }

    console.log('\nPossible solutions:');
    console.log('1. Check if your API key is valid and has not expired');
    console.log('2. Verify that your OpenAI account has sufficient credits');
    console.log('3. Make sure your account is not suspended');
    console.log('4. Check if you have exceeded your rate limits');

    return false;
  }
}

// Run the test
testOpenAIKey()
  .then(success => {
    if (success) {
      console.log('\nAPI key test passed!');
      console.log('Your OpenAI API key is valid and working correctly.');
      console.log('You should now see OpenAI usage in your dashboard when generating stories.');
      process.exit(0);
    } else {
      console.error('\nAPI key test failed!');
      console.error('Please check your OpenAI API key and try again.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
