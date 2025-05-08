/**
 * Test OpenAI API Key
 *
 * This script tests if the OpenAI API key is working correctly.
 * It makes a simple API call and reports the result.
 */

require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');

async function testOpenAIKey() {
  console.log('Testing OpenAI API key...');

  // Check if API key is set
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set in environment variables');
    return false;
  }

  // Check if API key is valid format
  if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
    console.error('❌ OPENAI_API_KEY does not appear to be in the correct format (should start with "sk-")');
    console.log('Full API key for debugging:', process.env.OPENAI_API_KEY);
    return false;
  }

  console.log(`API Key: ${process.env.OPENAI_API_KEY.substring(0, 5)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4)}`);
  console.log('Environment variables loaded from:', process.env.DOTENV_CONFIG_PATH || '.env.local');

  try {
    console.log('Initializing OpenAI client...');
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('Making API call to OpenAI...');
    // Make a simple API call
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: "Hello, this is a test message to verify the API key is working."
          }
        ],
        max_tokens: 50,
      });

      // Check if we got a valid response
      if (completion && completion.choices && completion.choices[0]?.message?.content) {
        console.log('✅ OpenAI API key is working correctly');
        console.log('Response:', completion.choices[0].message.content);
        return true;
      } else {
        console.error('❌ OpenAI API returned an invalid response');
        console.error('Response:', JSON.stringify(completion, null, 2));
        return false;
      }
    } catch (apiError) {
      console.error('❌ Error calling OpenAI API:', apiError.message);
      if (apiError.response) {
        console.error('Error details:', JSON.stringify(apiError.response.data, null, 2));
      }

      // Try with a different model as fallback
      console.log('Trying with a different model (text-ada-001) as fallback...');
      try {
        const fallbackCompletion = await openai.completions.create({
          model: "text-ada-001",
          prompt: "Hello, this is a test message to verify the API key is working.",
          max_tokens: 50,
        });

        if (fallbackCompletion && fallbackCompletion.choices && fallbackCompletion.choices[0]?.text) {
          console.log('✅ OpenAI API key is working with fallback model');
          console.log('Response:', fallbackCompletion.choices[0].text);
          return true;
        } else {
          console.error('❌ OpenAI API returned an invalid response with fallback model');
          return false;
        }
      } catch (fallbackError) {
        console.error('❌ Error with fallback model:', fallbackError.message);
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Error initializing OpenAI client:', error.message);
    if (error.response) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Run the test if called directly
if (require.main === module) {
  testOpenAIKey()
    .then(success => {
      if (!success) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = { testOpenAIKey };
