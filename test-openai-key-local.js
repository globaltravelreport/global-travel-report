const { OpenAI } = require('openai');
require('dotenv').config({ path: '.env.local' });

async function testOpenAI() {
  try {
    // Check if API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY is not set');
      process.exit(1);
    }
    
    // Log masked API key for debugging
    const apiKey = process.env.OPENAI_API_KEY;
    console.log(`API Key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Test with a simple completion
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello, this is a test message to verify the API key is working." }
      ],
      max_tokens: 50,
    });
    
    console.log('✅ OpenAI API key is valid');
    console.log('Response:', completion.choices[0].message.content);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing OpenAI API key:', error.message);
    
    // Try with a different model as fallback
    try {
      console.log('Trying with a different model (gpt-3.5-turbo-instruct) as fallback...');
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      const fallbackCompletion = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt: "Hello, this is a test message to verify the API key is working.",
        max_tokens: 50,
      });
      
      console.log('✅ OpenAI API key is valid with fallback model');
      console.log('Response:', fallbackCompletion.choices[0].text);
      process.exit(0);
    } catch (fallbackError) {
      console.error('❌ Error with fallback model:', fallbackError.message);
      process.exit(1);
    }
  }
}

testOpenAI();
