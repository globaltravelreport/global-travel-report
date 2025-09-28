/**
 * Australian English Story Rewriter
 *
 * Rewrites content in professional Australian English editorial style
 * with proper tone, structure, and SEO optimization
 */

import { Story } from '@/types/Story';
import { IStoryRewriter } from './interfaces';

export interface RewriteOptions {
  preserveTags?: boolean;
  maintainTone?: boolean;
  australianEnglish?: boolean;
  targetWordCount?: number;
  includeCallToAction?: boolean;
}

export interface RewriteResult {
  originalContent: string;
  rewrittenContent: string;
  changes: string[];
  wordCount: number;
  readabilityScore: number;
}

export class AustralianEnglishRewriter implements IStoryRewriter {
  private static instance: AustralianEnglishRewriter | null = null;

  // Australian English spelling mappings
  private australianSpelling: Record<string, string> = {
    'travelled': 'travelled',
    'travelling': 'travelling',
    'traveller': 'traveller',
    'organised': 'organised',
    'organising': 'organising',
    'organisation': 'organisation',
    'organizational': 'organisational',
    'realised': 'realised',
    'realising': 'realising',
    'colour': 'colour',
    'colourful': 'colourful',
    'favourite': 'favourite',
    'behaviour': 'behaviour',
    'centre': 'centre',
    'metre': 'metre',
    'litre': 'litre',
    'theatre': 'theatre',
    'honour': 'honour',
    'labour': 'labour',
    'neighbour': 'neighbour',
    'rumour': 'rumour',
    'vigour': 'vigour',
  };

  private constructor() {}

  public static getInstance(): AustralianEnglishRewriter {
    if (!AustralianEnglishRewriter.instance) {
      AustralianEnglishRewriter.instance = new AustralianEnglishRewriter();
    }
    return AustralianEnglishRewriter.instance;
  }

  /**
   * Rewrite content in Australian English editorial style
   */
  public async rewrite(
    content: string,
    category: string,
    options: RewriteOptions = {}
  ): Promise<Story> {
    const {
      preserveTags = true,
      maintainTone = true,
      australianEnglish = true,
      targetWordCount = 400,
      includeCallToAction = true,
    } = options;

    console.log(`✍️ Rewriting content for ${category} in Australian English style...`);

    // Clean and prepare content
    const cleanContent = this.cleanContent(content);

    // Apply Australian English spelling
    const australianContent = australianEnglish
      ? this.applyAustralianSpelling(cleanContent)
      : cleanContent;

    // Restructure content with editorial style
    const restructuredContent = this.restructureContent(australianContent, category);

    // Optimize for SEO and readability
    const optimizedContent = this.optimizeForSEO(restructuredContent, category);

    // Generate title and excerpt
    const title = this.generateSEOHeadline(optimizedContent, category);
    const excerpt = this.generateEditorialExcerpt(optimizedContent);

    // Create story object
    const story: Story = {
      id: `rewritten_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      slug: this.generateSlug(title),
      excerpt,
      content: optimizedContent,
      author: 'Global Travel Report Editorial Team',
      category,
      country: 'Global',
      tags: preserveTags ? this.extractTags(content) : [],
      featured: false,
      editorsPick: false,
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=800&h=600',
    };

    console.log(`✅ Content rewritten: "${title}" (${optimizedContent.split(' ').length} words)`);
    return story;
  }

  /**
   * Clean content and remove unwanted elements
   */
  private cleanContent(content: string): string {
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Apply Australian English spelling
   */
  private applyAustralianSpelling(content: string): string {
    let processedContent = content;

    // Apply spelling corrections
    Object.entries(this.australianSpelling).forEach(([american, australian]) => {
      const regex = new RegExp(`\\b${american}\\b`, 'gi');
      processedContent = processedContent.replace(regex, australian);
    });

    return processedContent;
  }

  /**
   * Restructure content with editorial style
   */
  private restructureContent(content: string, category: string): string {
    // Split into paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);

    if (paragraphs.length === 0) {
      return content;
    }

    // Create editorial structure
    const restructured: string[] = [];

    // Lead paragraph (summary)
    if (paragraphs.length > 0) {
      const leadParagraph = this.createLeadParagraph(paragraphs[0], category);
      restructured.push(leadParagraph);
    }

    // Body paragraphs (details)
    for (let i = 1; i < paragraphs.length; i++) {
      const paragraph = this.polishParagraph(paragraphs[i]);
      if (paragraph.length > 50) { // Only include substantial paragraphs
        restructured.push(paragraph);
      }
    }

    return restructured.join('\n\n');
  }

  /**
   * Create compelling lead paragraph
   */
  private createLeadParagraph(firstParagraph: string, category: string): string {
    // Extract key information for the lead
    const sentences = firstParagraph.split(/[.!?]+/).filter(s => s.trim().length > 10);

    if (sentences.length === 0) {
      return firstParagraph;
    }

    // Create a clear, compelling lead
    const lead = sentences[0].trim();

    // Add context based on category
    const categoryContexts = {
      'Cruises': 'cruise enthusiasts',
      'Hotels': 'discerning travellers',
      'Flights': 'aviation enthusiasts',
      'Destinations': 'adventurous travellers',
      'Food': 'culinary explorers',
    };

    const context = categoryContexts[category as keyof typeof categoryContexts] || 'travellers';

    return `${lead} This destination offers exceptional experiences for ${context} seeking authentic cultural immersion and world-class amenities.`;
  }

  /**
   * Polish paragraph with editorial style
   */
  private polishParagraph(paragraph: string): string {
    // Improve sentence structure and flow
    let polished = paragraph.trim();

    // Ensure proper punctuation
    polished = polished.replace(/,+/g, ',').replace(/\.+/g, '.');
    polished = polished.replace(/\s+/g, ' ');

    // Add variety to sentence structure
    const sentences = polished.split(/[.!?]+/).filter(s => s.trim().length > 0);

    if (sentences.length > 1) {
      // Vary sentence length for better rhythm
      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i].trim();
        if (sentence.length > 100 && i < sentences.length - 1) {
          // Break up long sentences
          const words = sentence.split(' ');
          if (words.length > 15) {
            const breakPoint = Math.floor(words.length / 2);
            sentences[i] = words.slice(0, breakPoint).join(' ') + '. ' + words.slice(breakPoint).join(' ');
          }
        }
      }

      polished = sentences.join('. ') + '.';
    }

    return polished;
  }

  /**
   * Optimize content for SEO
   */
  private optimizeForSEO(content: string, category: string): string {
    // Add relevant keywords naturally
    const categoryKeywords = {
      'Cruises': ['cruise holiday', 'ocean voyage', 'luxury cruising', 'cruise itinerary'],
      'Hotels': ['luxury accommodation', 'hotel experience', 'resort stay', 'hospitality service'],
      'Flights': ['flight route', 'airline service', 'aviation industry', 'air travel'],
      'Destinations': ['travel destination', 'tourist attraction', 'cultural experience', 'local guide'],
    };

    const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || [];

    // Insert keywords naturally (this is a simplified approach)
    let optimized = content;

    // Add keyword variations in context
    keywords.forEach(keyword => {
      // Only add if not already present
      if (!optimized.toLowerCase().includes(keyword.toLowerCase())) {
        // Find a good place to insert the keyword
        const sentences = optimized.split('. ');
        if (sentences.length > 2) {
          const insertIndex = Math.floor(sentences.length / 2);
          sentences[insertIndex] += ` This ${keyword} offers exceptional value and memorable experiences.`;
          optimized = sentences.join('. ');
        }
      }
    });

    return optimized;
  }

  /**
   * Generate SEO-optimized headline
   */
  private generateSEOHeadline(content: string, category: string): string {
    // Extract key phrases from content
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const firstSentence = sentences[0]?.trim() || 'New Travel Experience';

    // Create headline based on category and content
    const categoryHeadlines = {
      'Cruises': 'Discover the Ultimate Cruise Experience',
      'Hotels': 'Experience Luxury Hotel Stays',
      'Flights': 'Premium Flight Experiences',
      'Destinations': 'Explore Amazing Destinations',
      'Food': 'Culinary Adventures Await',
    };

    const baseHeadline = categoryHeadlines[category as keyof typeof categoryHeadlines] || 'Travel Experience';

    // Customize with specific details
    if (firstSentence.length < 60) {
      return `${baseHeadline}: ${firstSentence}`;
    }

    // Use first sentence as headline if it's compelling
    return firstSentence.length > 30 && firstSentence.length < 80
      ? firstSentence
      : baseHeadline;
  }

  /**
   * Generate editorial-style excerpt
   */
  private generateEditorialExcerpt(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);

    if (sentences.length === 0) {
      return 'Discover this amazing travel experience with Global Travel Report.';
    }

    // Use first two sentences for excerpt
    const excerpt = sentences.slice(0, 2).join('. ').trim() + '.';

    // Ensure excerpt is appropriate length
    if (excerpt.length > 200) {
      return excerpt.substring(0, 197) + '...';
    }

    return excerpt;
  }

  /**
   * Generate URL-friendly slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 60);
  }

  /**
   * Extract relevant tags from content
   */
  private extractTags(content: string): string[] {
    const tags: string[] = [];
    const contentLower = content.toLowerCase();

    // Common travel tags
    const travelTags = [
      'travel', 'luxury', 'budget', 'family', 'solo', 'adventure',
      'culture', 'food', 'beach', 'mountain', 'city', 'nature',
      'romantic', 'business', 'eco-friendly', 'sustainable'
    ];

    travelTags.forEach(tag => {
      if (contentLower.includes(tag) && !tags.includes(tag)) {
        tags.push(tag);
      }
    });

    return tags.slice(0, 5);
  }

  /**
   * Get rewrite statistics
   */
  public getRewriteStats(content: string, rewrittenContent: string): {
    originalWordCount: number;
    rewrittenWordCount: number;
    compressionRatio: number;
    australianWordsAdded: number;
  } {
    const originalWords = content.split(/\s+/).length;
    const rewrittenWords = rewrittenContent.split(/\s+/).length;
    const compressionRatio = rewrittenWords / originalWords;

    // Count Australian English words added
    const australianWords = Object.values(this.australianSpelling);
    const australianWordsAdded = australianWords.filter(word =>
      rewrittenContent.includes(word) && !content.includes(word)
    ).length;

    return {
      originalWordCount: originalWords,
      rewrittenWordCount: rewrittenWords,
      compressionRatio,
      australianWordsAdded,
    };
  }
}