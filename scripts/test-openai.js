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
  
  console.log(`API Key: ${process.env.OPENAI_API_KEY.substring(0, 5)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4)}`);
  
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Make a simple API call
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
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
      console.error('Response:', completion);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing OpenAI API key:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
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
