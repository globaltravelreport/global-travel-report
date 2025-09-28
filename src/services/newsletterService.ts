/**
 * Newsletter Service
 *
 * Manages newsletter subscriptions, drip campaigns, and email automation
 * for the Global Travel Report platform.
 */

import { v4 as uuidv4 } from 'uuid';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionDate: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  preferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    categories: string[];
    destinations: string[];
  };
  tags: string[];
  source: string; // Where they subscribed from
  dripCampaignStatus: {
    welcomeSeries: number; // Current step in welcome series (0-5)
    lastEmailSent?: string;
    engagementScore: number; // 0-100 based on opens/clicks
  };
}

export interface DripCampaign {
  id: string;
  name: string;
  description: string;
  trigger: 'subscription' | 'engagement' | 'abandoned_cart' | 'time_based';
  steps: DripCampaignStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DripCampaignStep {
  id: string;
  stepNumber: number;
  delayHours: number; // Hours after trigger or previous step
  emailTemplate: EmailTemplate;
  conditions?: DripCondition[]; // Conditions that must be met to send this step
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[]; // Available template variables
}

export interface DripCondition {
  type: 'engagement_score' | 'category_interest' | 'time_since_subscription' | 'custom_field';
  operator: 'greater_than' | 'less_than' | 'equals' | 'contains' | 'not_contains';
  value: any;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  recipient: string;
  templateId: string;
}

export class NewsletterService {
  private static instance: NewsletterService | null = null;
  private subscribers: Map<string, NewsletterSubscriber> = new Map();
  private campaigns: Map<string, DripCampaign> = new Map();

  private constructor() {
    this.initializeDefaultCampaigns();
  }

  public static getInstance(): NewsletterService {
    if (!NewsletterService.instance) {
      NewsletterService.instance = new NewsletterService();
    }
    return NewsletterService.instance;
  }

  /**
   * Subscribe a new user to the newsletter
   */
  async subscribeUser(
    email: string,
    preferences: Partial<NewsletterSubscriber['preferences']> = {},
    source: string = 'website'
  ): Promise<{ success: boolean; subscriber?: NewsletterSubscriber; error?: string }> {
    try {
      // Check if already subscribed
      const existingSubscriber = Array.from(this.subscribers.values())
        .find(sub => sub.email.toLowerCase() === email.toLowerCase());

      if (existingSubscriber) {
        if (existingSubscriber.status === 'active') {
          return { success: false, error: 'Already subscribed' };
        } else {
          // Reactivate subscription
          existingSubscriber.status = 'active';
          return { success: true, subscriber: existingSubscriber };
        }
      }

      // Create new subscriber
      const subscriber: NewsletterSubscriber = {
        id: uuidv4(),
        email,
        subscriptionDate: new Date().toISOString(),
        status: 'active',
        preferences: {
          frequency: 'weekly',
          categories: [],
          destinations: [],
          ...preferences
        },
        tags: ['new_subscriber'],
        source,
        dripCampaignStatus: {
          welcomeSeries: 0,
          engagementScore: 0
        }
      };

      this.subscribers.set(subscriber.id, subscriber);

      // Trigger welcome series
      await this.triggerWelcomeSeries(subscriber);

      return { success: true, subscriber };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Unsubscribe a user
   */
  async unsubscribeUser(email: string): Promise<boolean> {
    const subscriber = Array.from(this.subscribers.values())
      .find(sub => sub.email.toLowerCase() === email.toLowerCase());

    if (subscriber) {
      subscriber.status = 'unsubscribed';
      return true;
    }

    return false;
  }

  /**
   * Trigger welcome series for new subscriber
   */
  private async triggerWelcomeSeries(subscriber: NewsletterSubscriber): Promise<void> {
    try {
      const welcomeCampaign = Array.from(this.campaigns.values())
        .find(campaign => campaign.name === 'Welcome Series');

      if (welcomeCampaign && welcomeCampaign.isActive) {
        // Schedule first email immediately
        await this.scheduleEmail(
          subscriber.email,
          welcomeCampaign.steps[0].emailTemplate,
          { firstName: subscriber.firstName || 'there' }
        );
      }
    } catch (error) {
      console.error('Error triggering welcome series:', error);
    }
  }

  /**
   * Schedule email for sending
   */
  private async scheduleEmail(
    email: string,
    template: EmailTemplate,
    variables: Record<string, any> = {}
  ): Promise<EmailSendResult> {
    try {
      // Replace template variables
      let subject = template.subject;
      let htmlContent = template.htmlContent;
      let textContent = template.textContent;

      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        htmlContent = htmlContent.replace(regex, value);
        textContent = textContent.replace(regex, value);
      });

      // In production, this would integrate with an email service
      console.log('Email scheduled:', {
        to: email,
        subject,
        template: template.name
      });

      // Simulate email sending
      const result: EmailSendResult = {
        success: true,
        messageId: uuidv4(),
        recipient: email,
        templateId: template.id
      };

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recipient: email,
        templateId: template.id
      };
    }
  }

  /**
   * Initialize default drip campaigns
   */
  private initializeDefaultCampaigns(): void {
    const welcomeCampaign: DripCampaign = {
      id: 'welcome-series',
      name: 'Welcome Series',
      description: '5-email series welcoming new subscribers and introducing them to our content',
      trigger: 'subscription',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        {
          id: 'welcome-1',
          stepNumber: 1,
          delayHours: 0, // Send immediately
          emailTemplate: {
            id: 'welcome-email-1',
            name: 'Welcome Email 1',
            subject: 'Welcome to Global Travel Report! {{firstName}}',
            htmlContent: `
              <h1>Welcome to Global Travel Report!</h1>
              <p>Hi {{firstName}},</p>
              <p>Thank you for subscribing to our newsletter. We're excited to share the world's most amazing travel stories with you.</p>
              <p>In the coming days, you'll receive our best travel tips, destination guides, and exclusive deals.</p>
              <p>Happy travels!</p>
              <p>The Global Travel Report Team</p>
            `,
            textContent: 'Welcome to Global Travel Report! Hi {{firstName}}, thank you for subscribing...',
            variables: ['firstName']
          }
        },
        {
          id: 'welcome-2',
          stepNumber: 2,
          delayHours: 24, // Send after 1 day
          emailTemplate: {
            id: 'welcome-email-2',
            name: 'Top Travel Tips',
            subject: 'Your Ultimate Travel Planning Guide {{firstName}}',
            htmlContent: `
              <h1>Your Ultimate Travel Planning Guide</h1>
              <p>Hi {{firstName}},</p>
              <p>Here are our top travel planning tips to make your next adventure unforgettable...</p>
            `,
            textContent: 'Your Ultimate Travel Planning Guide. Hi {{firstName}}, here are our top travel tips...',
            variables: ['firstName']
          }
        }
      ]
    };

    this.campaigns.set(welcomeCampaign.id, welcomeCampaign);
  }

  /**
   * Get subscriber statistics
   */
  async getSubscriberStats(): Promise<{
    total: number;
    active: number;
    newThisWeek: number;
    unsubscribed: number;
    engagementRate: number;
  }> {
    const subscribers = Array.from(this.subscribers.values());
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const total = subscribers.length;
    const active = subscribers.filter(sub => sub.status === 'active').length;
    const newThisWeek = subscribers.filter(sub =>
      new Date(sub.subscriptionDate) >= oneWeekAgo
    ).length;
    const unsubscribed = subscribers.filter(sub => sub.status === 'unsubscribed').length;

    const avgEngagementScore = subscribers
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => sum + sub.dripCampaignStatus.engagementScore, 0) / Math.max(active, 1);

    return {
      total,
      active,
      newThisWeek,
      unsubscribed,
      engagementRate: Math.round(avgEngagementScore)
    };
  }

  /**
   * Send weekly digest to active subscribers
   */
  async sendWeeklyDigest(): Promise<{
    success: boolean;
    emailsSent: number;
    errors: string[];
  }> {
    const result = {
      success: false,
      emailsSent: 0,
      errors: [] as string[]
    };

    try {
      const activeSubscribers = Array.from(this.subscribers.values())
        .filter(sub => sub.status === 'active');

      const weeklyTemplate: EmailTemplate = {
        id: 'weekly-digest',
        name: 'Weekly Digest',
        subject: 'Your Weekly Travel Digest - {{firstName}}',
        htmlContent: `
          <h1>Your Weekly Travel Digest</h1>
          <p>Hi {{firstName}},</p>
          <p>Here's what's trending in travel this week...</p>
          <p>Happy reading!</p>
          <p>The Global Travel Report Team</p>
        `,
        textContent: 'Your Weekly Travel Digest. Hi {{firstName}}, here\'s what\'s trending...',
        variables: ['firstName']
      };

      for (const subscriber of activeSubscribers) {
        try {
          const sendResult = await this.scheduleEmail(
            subscriber.email,
            weeklyTemplate,
            { firstName: subscriber.firstName || 'there' }
          );

          if (sendResult.success) {
            result.emailsSent++;
          } else {
            result.errors.push(`Failed to send to ${subscriber.email}: ${sendResult.error}`);
          }
        } catch (error) {
          result.errors.push(`Error sending to ${subscriber.email}: ${error}`);
        }
      }

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      result.errors.push(`General error: ${error}`);
      return result;
    }
  }

  /**
   * Update subscriber engagement score based on email interactions
   */
  async updateEngagementScore(
    email: string,
    action: 'open' | 'click' | 'unsubscribe' | 'bounce'
  ): Promise<void> {
    const subscriber = Array.from(this.subscribers.values())
      .find(sub => sub.email.toLowerCase() === email.toLowerCase());

    if (!subscriber) return;

    switch (action) {
      case 'open':
        subscriber.dripCampaignStatus.engagementScore = Math.min(100,
          subscriber.dripCampaignStatus.engagementScore + 5
        );
        break;
      case 'click':
        subscriber.dripCampaignStatus.engagementScore = Math.min(100,
          subscriber.dripCampaignStatus.engagementScore + 10
        );
        break;
      case 'unsubscribe':
        subscriber.status = 'unsubscribed';
        break;
      case 'bounce':
        subscriber.dripCampaignStatus.engagementScore = Math.max(0,
          subscriber.dripCampaignStatus.engagementScore - 20
        );
        if (subscriber.dripCampaignStatus.engagementScore < 30) {
          subscriber.status = 'bounced';
        }
        break;
    }

    subscriber.dripCampaignStatus.lastEmailSent = new Date().toISOString();
  }
}

export default NewsletterService;