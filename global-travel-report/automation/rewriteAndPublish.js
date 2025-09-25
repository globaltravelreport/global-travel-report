// Load environment variables first
require('dotenv').config({ path: '.env.local' });
console.log('Loaded OpenAI key:', process.env.OPENAI_API_KEY);

// Import required packages
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// System message for GPT-4
const SYSTEM_MESSAGE = `You are a travel journalist. Rewrite the input into an original, engaging travel article. Respond only with valid JSON in this format:
{
  "title": "",
  "summary": "",
  "content": "",
  "keywords": ["", "", ...]
}
No extra text or formatting. Make sure JSON is parseable. Use travel keywords and SEO-friendly headlines.`;

// Function to rewrite article with retry logic
async function rewriteArticle(content, maxRetries = 3) {
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            console.log(`Attempt ${retries + 1} to rewrite article...`);
            
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: SYSTEM_MESSAGE },
                    { role: "user", content: content }
                ],
                temperature: 0.7,
                max_tokens: 2000
            });

            // Parse the response to ensure it's valid JSON
            const response = completion.choices[0].message.content;
            const parsedResponse = JSON.parse(response);
            
            console.log('Successfully rewrote article!');
            return parsedResponse;
            
        } catch (error) {
            retries++;
            console.error(`Error on attempt ${retries}:`, error.message);
            
            if (retries === maxRetries) {
                throw new Error(`Failed to rewrite article after ${maxRetries} attempts`);
            }
            
            // Wait before retrying (exponential backoff)
            const delay = Math.pow(2, retries) * 1000;
            console.log(`Waiting ${delay}ms before retrying...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Export the rewriteArticle function
module.exports = { rewriteArticle };

// If this file is run directly, process the sample article
if (require.main === module) {
    // Sample article content (to be replaced with actual content later)
    const article = "Paris has reopened its Eiffel Tower tours after extensive renovations. The iconic landmark now features new glass floors and improved accessibility. Visitors can enjoy panoramic views of the city from the top floor, which has been completely refurbished. The surrounding Champ de Mars gardens have also been updated with new walking paths and seating areas.";

    // Main function to process the article
    async function processArticle() {
        try {
            console.log('Starting article processing...');
            const rewrittenArticle = await rewriteArticle(article);
            
            console.log('\nRewritten Article:');
            console.log('------------------');
            console.log('Title:', rewrittenArticle.title);
            console.log('Summary:', rewrittenArticle.summary);
            console.log('Keywords:', rewrittenArticle.keywords.join(', '));
            console.log('\nContent:', rewrittenArticle.content);
            
        } catch (error) {
            console.error('Failed to process article:', error.message);
        }
    }

    // Run the main function
    processArticle();
} 