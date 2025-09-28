/**
 * OpenAI Story Rewriting Service (Legacy - Use aiService instead)
 *
 * @deprecated This file is deprecated. Use src/services/aiService.ts instead for new implementations.
 * This file is kept for backward compatibility but will be removed in a future version.
 */

import { Story } from '../types/Story';
import { generateStoryContent } from '../src/services/aiService';

/**
 * @deprecated Use aiService.generateStoryContent() instead
 */
export async function rewriteStory(story: Story): Promise<Story> {
  try {
    const prompt = `Rewrite the following article in the style of a professional Australian travel journalist, using Australian English (no slang). The article should be engaging, informative, and detailed, presenting facts in a polished, unbiased manner, as if written for a national travel magazine.

Title: ${story.title}
Content: ${story.content}

Please maintain the same key information and facts, but rewrite it in a more engaging and professional style.`;

    const result = await generateStoryContent(prompt);

    const rewrittenContent = result.content || story.content;

    return {
      ...story,
      content: rewrittenContent,
      excerpt: rewrittenContent.slice(0, 200) + '...',
    };
  } catch (_error) {
    console.error('Error in legacy rewriteStory function:', _error);
    // Return original story if rewriting fails
    return story;
  }
}