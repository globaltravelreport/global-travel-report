/* eslint-disable no-console */
import OpenAI from "openai";
import type { Story } from "@/lib/stories";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class StoryRewriter {
  private dailyStoriesProcessed: number = 0;
  private lastProcessedTime: Date | null = null;
  private readonly maxDailyStories: number = 100;

  public async rewriteStory(originalContent: string, _category: string): Promise<Story> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a travel story rewriter. Your task is to rewrite travel stories in a more engaging and professional way while maintaining the original content and facts."
          },
          {
            role: "user",
            content: originalContent
          }
        ]
      });

      const rewrittenContent = completion.choices[0]?.message?.content || originalContent;

      // Generate a unique ID
      const id = uuidv4();

      // Extract title from the first line
      const lines = rewrittenContent.split('\n');
      const title = lines[0]?.trim() || 'Untitled Story';

      // Generate a slug from the title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Extract excerpt (first paragraph after title)
      const excerpt = lines
        .slice(1)
        .find((line: string) => line.trim().length > 0) || 'No excerpt available';

      // Get current date
      const publishedAt = new Date();

      // Create the rewritten story object
      const rewrittenStory: Story = {
        id,
        slug,
        title,
        excerpt,
        content: rewrittenContent,
        author: "AI Travel Writer",
        publishedAt,
        tags: ["travel", "ai-generated"],
        category: _category,
        country: "Unknown",
        featured: false,
        editorsPick: false
      };

      console.log("Story rewritten successfully");
      return rewrittenStory;
    } catch (error) {
      console.error("Error rewriting story:", error);
      throw error;
    }
  }

  public canProcessMoreStories(): boolean {
    if (this.dailyStoriesProcessed >= this.maxDailyStories) {
      return false;
    }

    if (!this.lastProcessedTime) {
      return true;
    }

    const now = new Date();
    const timeSinceLastProcess = now.getTime() - this.lastProcessedTime.getTime();
    const oneMinuteInMs = 60 * 1000;

    return timeSinceLastProcess >= oneMinuteInMs;
  }

  public resetDailyCount(): void {
    this.dailyStoriesProcessed = 0;
    this.lastProcessedTime = null;
  }
} 