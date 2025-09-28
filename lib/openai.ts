import OpenAI from 'openai';
import { Story } from '@/types/Story';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function rewriteStory(story: Story): Promise<Story> {
  try {
    const prompt = `Rewrite the following article in the style of a professional Australian travel journalist, using Australian English (no slang). The article should be engaging, informative, and detailed, presenting facts in a polished, unbiased manner, as if written for a national travel magazine.

Title: ${story.title}
Content: ${story.content}

Please maintain the same key information and facts, but rewrite it in a more engaging and professional style.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional Australian travel journalist. Your writing style is engaging, informative, and objective. You use Australian English without slang, and your tone is polished and professional."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const rewrittenContent = completion.choices[0]?.message?.content || story.content;

    return {
      ...story,
      content: rewrittenContent,
      excerpt: rewrittenContent.slice(0, 200) + '...',
    };
  } catch (_error) {
    // Return original story if rewriting fails
    return story;
  }
}