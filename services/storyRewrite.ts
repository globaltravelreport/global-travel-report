import OpenAI from 'openai';

interface StoryRewriteOptions {
  tone?: 'professional' | 'casual' | 'humorous';
  length?: 'short' | 'medium' | 'long';
  focus?: string[];
}

export async function rewriteStory(
  content: string,
  options: StoryRewriteOptions = {}
): Promise<string> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = generatePrompt(content, options);
    const response = await openai.completions.create({
      model: "text-davinci-003",
      prompt,
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].text?.trim() || content;
  } catch (error) {
    // In a real application, this would log to a proper logging service
    throw new Error('Error rewriting story: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

function generatePrompt(content: string, options: StoryRewriteOptions): string {
  const tone = options.tone || 'professional';
  const length = options.length || 'medium';
  const focus = options.focus || [];

  return `Rewrite the following travel story in a ${tone} tone, with ${length} length, focusing on ${focus.join(', ')}:

${content}

Rewritten story:`;
} 