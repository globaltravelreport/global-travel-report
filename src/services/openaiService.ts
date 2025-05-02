/**
 * OpenAI Service
 * 
 * This service handles interactions with the OpenAI API for content rewriting
 * in a way that's compatible with Vercel's Edge Runtime.
 */

import { Story } from '@/types/Story';

interface RewriteOptions {
  style?: 'professional' | 'casual' | 'formal';
  tone?: 'informative' | 'enthusiastic' | 'balanced';
  targetAudience?: 'general' | 'luxury' | 'budget' | 'family';
  maxLength?: number;
  preserveKeyInfo?: boolean;
  enhanceWithFacts?: boolean;
  focusKeywords?: string[];
}

export class OpenAIService {
  private static instance: OpenAIService | null = null;
  private apiKey: string;
  private model: string;
  private maxRetries: number;
  private retryDelay: number;
  private maxTokens: number;
  private temperature: number;
  private requestsPerDay: number;
  private dailyRequestCount: number;
  private lastResetDate: string;
  
  private constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o';
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.maxTokens = 2000;
    this.temperature = 0.7;
    this.requestsPerDay = 100;
    this.dailyRequestCount = 0;
    this.lastResetDate = new Date().toDateString();
    
    // Reset counter if it's a new day
    this.checkAndResetDailyCounter();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Check and reset the daily counter if needed
   */
  private checkAndResetDailyCounter(): void {
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.dailyRequestCount = 0;
      this.lastResetDate = today;
    }
  }

  /**
   * Check if we can make more API requests today
   */
  public canMakeRequest(): boolean {
    this.checkAndResetDailyCounter();
    return this.dailyRequestCount < this.requestsPerDay;
  }

  /**
   * Get remaining requests for today
   */
  public getRemainingRequests(): number {
    this.checkAndResetDailyCounter();
    return this.requestsPerDay - this.dailyRequestCount;
  }

  /**
   * Make a request to the OpenAI API with retry logic
   */
  private async makeRequest(messages: any[], options: any = {}): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    if (!this.canMakeRequest()) {
      throw new Error('Daily OpenAI API request limit reached');
    }

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.maxRetries) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            max_tokens: options.maxTokens || this.maxTokens,
            temperature: options.temperature || this.temperature,
            top_p: options.topP || 1,
            frequency_penalty: options.frequencyPenalty || 0,
            presence_penalty: options.presencePenalty || 0
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        this.dailyRequestCount++;
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if we should retry
        if (attempt < this.maxRetries - 1) {
          // Exponential backoff
          const delay = this.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
        } else {
          break;
        }
      }
    }

    throw lastError || new Error('Failed to make OpenAI API request after multiple attempts');
  }

  /**
   * Rewrite a story using OpenAI
   */
  public async rewriteStory(story: Story, options: RewriteOptions = {}): Promise<Story> {
    try {
      const style = options.style || 'professional';
      const tone = options.tone || 'balanced';
      const targetAudience = options.targetAudience || 'general';
      const preserveKeyInfo = options.preserveKeyInfo !== false;
      const enhanceWithFacts = options.enhanceWithFacts !== false;
      
      // Create system message
      const systemMessage = {
        role: 'system',
        content: `You are a professional travel writer for Global Travel Report, an Australian travel publication. 
Your task is to rewrite travel articles in a ${style} style with a ${tone} tone for a ${targetAudience} audience.
${preserveKeyInfo ? 'Preserve all key information, facts, and details from the original article.' : ''}
${enhanceWithFacts ? 'Enhance the article with additional relevant facts where appropriate.' : ''}
Use Australian English spelling and conventions.
Write in a journalistic style appropriate for a reputable travel publication.
Attribute the article to "Global Travel Report Editorial Team" rather than any individual author.
Focus on providing valuable, accurate information to readers.
Maintain the same general structure and flow as the original article.
Ensure the rewritten content is engaging, informative, and free of errors.`
      };

      // Create user message with the story content
      const userMessage = {
        role: 'user',
        content: `Please rewrite the following travel article:

Title: ${story.title}

Category: ${story.category}

Country: ${story.country}

Content:
${story.content}

${options.focusKeywords && options.focusKeywords.length > 0 ? 
  `Please incorporate these keywords naturally in the rewritten article: ${options.focusKeywords.join(', ')}` : ''}

${options.maxLength ? `The rewritten article should be approximately ${options.maxLength} words in length.` : ''}

Please provide the rewritten article with the same title but improved content.`
      };

      // Make the API request
      const response = await this.makeRequest([systemMessage, userMessage]);
      
      // Extract the rewritten content
      const rewrittenContent = response.choices[0]?.message?.content;
      
      if (!rewrittenContent) {
        throw new Error('No content returned from OpenAI');
      }

      // Create a new story object with the rewritten content
      return {
        ...story,
        content: rewrittenContent,
        excerpt: this.generateExcerpt(rewrittenContent),
        rewritten: true,
        rewrittenAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error rewriting story:', error);
      
      // Return the original story if rewriting fails
      return {
        ...story,
        rewritten: false
      };
    }
  }

  /**
   * Generate an excerpt from content
   */
  private generateExcerpt(content: string, maxLength: number = 200): string {
    // Remove any markdown or HTML
    const cleanContent = content.replace(/\n/g, ' ').replace(/<[^>]*>/g, '');
    
    // Get the first paragraph or a portion of it
    const firstParagraph = cleanContent.split(/\.\s+/)[0];
    
    if (firstParagraph.length <= maxLength) {
      return firstParagraph + '.';
    }
    
    // Truncate and add ellipsis
    return firstParagraph.substring(0, maxLength - 3) + '...';
  }

  /**
   * Generate SEO metadata for a story
   */
  public async generateSEOMetadata(story: Story): Promise<{
    metaTitle: string;
    metaDescription: string;
    focusKeywords: string[];
  }> {
    try {
      const systemMessage = {
        role: 'system',
        content: `You are an SEO expert for a travel website. Your task is to generate SEO metadata for travel articles.
Generate a compelling meta title (max 60 characters), meta description (max 160 characters), and 5-7 focus keywords.
The metadata should be optimized for search engines while accurately representing the content.`
      };

      const userMessage = {
        role: 'user',
        content: `Please generate SEO metadata for the following travel article:

Title: ${story.title}

Category: ${story.category}

Country: ${story.country}

Excerpt:
${story.excerpt}

Please provide:
1. Meta Title (max 60 characters)
2. Meta Description (max 160 characters)
3. Focus Keywords (5-7 keywords or short phrases)`
      };

      // Make the API request
      const response = await this.makeRequest([systemMessage, userMessage], { maxTokens: 500 });
      
      // Extract the metadata
      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content returned from OpenAI');
      }

      // Parse the response
      const metaTitleMatch = content.match(/Meta Title:?\s*(.+)/i);
      const metaDescriptionMatch = content.match(/Meta Description:?\s*(.+)/i);
      const focusKeywordsMatch = content.match(/Focus Keywords:?\s*(.+)/i);

      return {
        metaTitle: metaTitleMatch ? metaTitleMatch[1].trim() : story.title,
        metaDescription: metaDescriptionMatch ? metaDescriptionMatch[1].trim() : story.excerpt,
        focusKeywords: focusKeywordsMatch 
          ? focusKeywordsMatch[1].split(/,\s*/).map(k => k.trim()) 
          : [story.category, story.country, 'travel']
      };
    } catch (error) {
      console.error('Error generating SEO metadata:', error);
      
      // Return basic metadata if generation fails
      return {
        metaTitle: story.title,
        metaDescription: story.excerpt,
        focusKeywords: [story.category, story.country, 'travel']
      };
    }
  }
}
