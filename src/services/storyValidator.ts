/* eslint-disable no-console */
import { Story } from '@/lib/stories';
import { storyRewriteConfig } from '@/config/storyRewrite';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class StoryValidator {
  private static instance: StoryValidator;

  private constructor() {}

  public static getInstance(): StoryValidator {
    if (!StoryValidator.instance) {
      StoryValidator.instance = new StoryValidator();
    }
    return StoryValidator.instance;
  }

  public async validateStory(story: Story): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Basic validation
    if (!this.validateBasicRequirements(story, issues)) {
      return { isValid: false, issues, suggestions };
    }

    // Content safety check
    if (!await this.checkContentSafety(story, issues)) {
      return { isValid: false, issues, suggestions };
    }

    // SEO optimization check
    this.checkSEOOptimization(story, issues, suggestions);

    // Readability check
    if (!this.checkReadability(story, issues)) {
      return { isValid: false, issues, suggestions };
    }

    // Factual accuracy check
    if (!await this.checkFactualAccuracy(story, issues)) {
      return { isValid: false, issues, suggestions };
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  private validateBasicRequirements(story: Story, issues: string[]): boolean {
    // Check title length
    if (story.title.length > storyRewriteConfig.contentRules.headline.maxLength) {
      issues.push(`Title exceeds maximum length of ${storyRewriteConfig.contentRules.headline.maxLength} characters`);
    }

    // Check meta description length
    if (story.excerpt.length > storyRewriteConfig.contentRules.meta.descriptionMaxLength) {
      issues.push(`Meta description exceeds maximum length of ${storyRewriteConfig.contentRules.meta.descriptionMaxLength} characters`);
    }

    // Check required elements
    const requiredElements = storyRewriteConfig.contentRules.headline.requiredElements;
    for (const element of requiredElements) {
      if (!story.title.toLowerCase().includes(element.toLowerCase())) {
        issues.push(`Title missing required element: ${element}`);
      }
    }

    return issues.length === 0;
  }

  private async checkContentSafety(story: Story, issues: string[]): Promise<boolean> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a content safety checker. Analyze the text for any inappropriate content, including: adult content, violence, discrimination, political bias, or any other content that would not be suitable for a family-friendly travel website. Respond with a JSON object containing 'isSafe' (boolean) and 'issues' (array of strings)."
          },
          {
            role: "user",
            content: JSON.stringify({
              title: story.title,
              content: story.content,
              excerpt: story.excerpt
            })
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const response = JSON.parse(completion.choices[0].message.content || '{"isSafe": false, "issues": ["Invalid content"]}');
      
      if (!response.isSafe) {
        issues.push(...response.issues);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking content safety:', error);
      issues.push('Failed to perform content safety check');
      return false;
    }
  }

  private checkSEOOptimization(story: Story, issues: string[], suggestions: string[]): void {
    // Check keyword density
    const keywords = story.tags;
    const content = story.content.toLowerCase();
    const title = story.title.toLowerCase();

    for (const keyword of keywords) {
      const keywordCount = (content.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      const keywordDensity = (keywordCount / content.split(' ').length) * 100;

      if (keywordDensity < 0.5) {
        suggestions.push(`Consider increasing usage of keyword: ${keyword}`);
      } else if (keywordDensity > 3) {
        issues.push(`Keyword density too high for: ${keyword}`);
      }

      if (!title.includes(keyword.toLowerCase())) {
        suggestions.push(`Consider including keyword in title: ${keyword}`);
      }
    }

    // Check meta description
    if (!story.excerpt.includes(story.country)) {
      suggestions.push('Consider including destination in meta description');
    }
  }

  private checkReadability(story: Story, issues: string[]): boolean {
    // Simple readability check
    const sentences = story.content.split(/[.!?]+/);
    const words = story.content.split(/\s+/);
    const avgWordsPerSentence = words.length / sentences.length;

    if (avgWordsPerSentence > 20) {
      issues.push('Content may be too complex. Consider shorter sentences.');
      return false;
    }

    return true;
  }

  private async checkFactualAccuracy(story: Story, issues: string[]): Promise<boolean> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a fact-checker for travel content. Verify the accuracy of the information provided, particularly regarding: locations, dates, prices, and specific details about destinations, hotels, or services. Respond with a JSON object containing 'isAccurate' (boolean) and 'issues' (array of strings)."
          },
          {
            role: "user",
            content: JSON.stringify({
              title: story.title,
              content: story.content,
              country: story.country,
              category: story.category
            })
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const response = JSON.parse(completion.choices[0].message.content || '{"isAccurate": false, "issues": ["Invalid content"]}');
      
      if (!response.isAccurate) {
        issues.push(...response.issues);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking factual accuracy:', error);
      issues.push('Failed to perform factual accuracy check');
      return false;
    }
  }
} 