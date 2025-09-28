/**
 * Engagement Service
 *
 * Tracks user engagement metrics including comments, reactions, views, and social shares
 * for the Global Travel Report platform.
 */

import { v4 as uuidv4 } from 'uuid';

export interface Comment {
  id: string;
  storyId: string;
  author: string;
  email?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  parentId?: string; // For nested replies
  likes: number;
  dislikes: number;
}

export interface Reaction {
  id: string;
  storyId: string;
  userId?: string;
  type: 'like' | 'love' | 'laugh' | 'angry' | 'sad' | 'wow';
  createdAt: string;
}

export interface StoryView {
  id: string;
  storyId: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  duration?: number; // Time spent reading in seconds
  referrer?: string;
  userAgent?: string;
}

export interface EngagementMetrics {
  storyId: string;
  views: number;
  uniqueViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  comments: number;
  reactions: number;
  shares: number;
  lastUpdated: string;
}

export class EngagementService {
  private static instance: EngagementService | null = null;
  private comments: Map<string, Comment> = new Map();
  private reactions: Map<string, Reaction> = new Map();
  private views: Map<string, StoryView> = new Map();
  private metrics: Map<string, EngagementMetrics> = new Map();

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): EngagementService {
    if (!EngagementService.instance) {
      EngagementService.instance = new EngagementService();
    }
    return EngagementService.instance;
  }

  /**
   * Add a comment to a story
   */
  async addComment(comment: Omit<Comment, 'id' | 'createdAt' | 'likes' | 'dislikes'>): Promise<Comment> {
    const newComment: Comment = {
      ...comment,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
    };

    this.comments.set(newComment.id, newComment);
    await this.updateEngagementMetrics(comment.storyId);

    return newComment;
  }

  /**
   * Add a reaction to a story
   */
  async addReaction(reaction: Omit<Reaction, 'id' | 'createdAt'>): Promise<Reaction> {
    const newReaction: Reaction = {
      ...reaction,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    this.reactions.set(newReaction.id, newReaction);
    await this.updateEngagementMetrics(reaction.storyId);

    return newReaction;
  }

  /**
   * Track a story view
   */
  async trackView(view: Omit<StoryView, 'id' | 'timestamp'>): Promise<StoryView> {
    const newView: StoryView = {
      ...view,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };

    this.views.set(newView.id, newView);
    await this.updateEngagementMetrics(view.storyId);

    return newView;
  }

  /**
   * Get comments for a story
   */
  async getComments(storyId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.storyId === storyId && comment.status === 'approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get reactions for a story
   */
  async getReactions(storyId: string): Promise<Reaction[]> {
    return Array.from(this.reactions.values())
      .filter(reaction => reaction.storyId === storyId);
  }

  /**
   * Get engagement metrics for a story
   */
  async getEngagementMetrics(storyId: string): Promise<EngagementMetrics> {
    if (this.metrics.has(storyId)) {
      return this.metrics.get(storyId)!;
    }

    // Return default metrics if none exist
    return {
      storyId,
      views: 0,
      uniqueViews: 0,
      averageTimeOnPage: 0,
      bounceRate: 0,
      comments: 0,
      reactions: 0,
      shares: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get trending stories based on engagement
   */
  async getTrendingStories(limit: number = 10): Promise<string[]> {
    const storyIds = Array.from(this.metrics.keys());
    const trending = storyIds
      .map(storyId => ({
        storyId,
        score: this.calculateEngagementScore(storyId),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.storyId);

    return trending;
  }

  /**
   * Update engagement metrics for a story
   */
  private async updateEngagementMetrics(storyId: string): Promise<void> {
    const storyComments = Array.from(this.comments.values())
      .filter(comment => comment.storyId === storyId && comment.status === 'approved');

    const storyReactions = Array.from(this.reactions.values())
      .filter(reaction => reaction.storyId === storyId);

    const storyViews = Array.from(this.views.values())
      .filter(view => view.storyId === storyId);

    // Calculate unique views by session
    const uniqueSessions = new Set(storyViews.map(view => view.sessionId));
    const uniqueViews = uniqueSessions.size;

    // Calculate average time on page
    const viewsWithDuration = storyViews.filter(view => view.duration);
    const averageTimeOnPage = viewsWithDuration.length > 0
      ? viewsWithDuration.reduce((sum, view) => sum + (view.duration || 0), 0) / viewsWithDuration.length
      : 0;

    // Calculate bounce rate (views with duration < 30 seconds)
    const bouncedViews = storyViews.filter(view => (view.duration || 0) < 30).length;
    const bounceRate = storyViews.length > 0 ? (bouncedViews / storyViews.length) * 100 : 0;

    const metrics: EngagementMetrics = {
      storyId,
      views: storyViews.length,
      uniqueViews,
      averageTimeOnPage,
      bounceRate,
      comments: storyComments.length,
      reactions: storyReactions.length,
      shares: 0, // Would be tracked separately
      lastUpdated: new Date().toISOString(),
    };

    this.metrics.set(storyId, metrics);
  }

  /**
   * Calculate engagement score for trending algorithm
   */
  private calculateEngagementScore(storyId: string): number {
    const metrics = this.metrics.get(storyId);
    if (!metrics) return 0;

    // Weighted scoring algorithm
    const viewScore = metrics.views * 1;
    const uniqueViewScore = metrics.uniqueViews * 2;
    const timeScore = metrics.averageTimeOnPage * 0.5;
    const commentScore = metrics.comments * 10;
    const reactionScore = metrics.reactions * 5;

    // Apply time decay (newer content gets slight boost)
    const daysSinceUpdate = (Date.now() - new Date(metrics.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    const timeDecay = Math.max(0.5, 1 - daysSinceUpdate * 0.1);

    return (viewScore + uniqueViewScore + timeScore + commentScore + reactionScore) * timeDecay;
  }

  /**
   * Initialize with mock engagement data
   */
  private initializeMockData(): void {
    // Add some mock comments and reactions for demonstration
    const mockComments: Comment[] = [
      {
        id: 'comment-1',
        storyId: 'story-1',
        author: 'Travel Enthusiast',
        content: 'Great article! I\'ve been planning a trip to Japan and this gave me some excellent ideas.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
        likes: 5,
        dislikes: 0,
      },
      {
        id: 'comment-2',
        storyId: 'story-1',
        author: 'Adventure Seeker',
        content: 'The photos are absolutely stunning! Which camera did you use?',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
        likes: 3,
        dislikes: 0,
      },
    ];

    mockComments.forEach(comment => {
      this.comments.set(comment.id, comment);
    });

    // Add some mock reactions
    const mockReactions: Reaction[] = [
      {
        id: 'reaction-1',
        storyId: 'story-1',
        type: 'love',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'reaction-2',
        storyId: 'story-1',
        type: 'like',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    mockReactions.forEach(reaction => {
      this.reactions.set(reaction.id, reaction);
    });

    // Add some mock views
    const mockViews: StoryView[] = [];
    for (let i = 0; i < 25; i++) {
      mockViews.push({
        id: `view-${i}`,
        storyId: 'story-1',
        sessionId: `session-${Math.floor(i / 3)}`, // Some repeated sessions
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: Math.random() * 300 + 30, // 30-330 seconds
      });
    }

    mockViews.forEach(view => {
      this.views.set(view.id, view);
    });
  }
}

export default EngagementService;