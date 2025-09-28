/**
 * Brevo (Sendinblue) Service
 *
 * Integrates with Brevo API for email marketing, automation, and contact management
 */

export interface BrevoContact {
  email: string;
  attributes?: {
    FIRSTNAME?: string;
    LASTNAME?: string;
    SUBSCRIPTION_DATE?: string;
    SOURCE?: string;
    PREFERENCES?: string;
  };
  listIds?: number[];
  updateEnabled?: boolean;
}

export interface BrevoEmailTemplate {
  id?: number;
  name: string;
  subject: string;
  htmlContent: string;
  sender?: {
    name: string;
    email: string;
  };
}

export interface BrevoApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  messageId?: string;
}

export class BrevoService {
  private static instance: BrevoService | null = null;
  private apiKey: string;
  private baseUrl = 'https://api.brevo.com/v3';

  private constructor() {
    this.apiKey = process.env.BREVO_API_KEY || '';
    if (!this.apiKey) {
      console.warn('BREVO_API_KEY not found. Brevo integration will not work.');
    }
  }

  public static getInstance(): BrevoService {
    if (!BrevoService.instance) {
      BrevoService.instance = new BrevoService();
    }
    return BrevoService.instance;
  }

  /**
   * Add or update a contact in Brevo
   */
  async addContact(contact: BrevoContact): Promise<BrevoApiResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Brevo API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          email: contact.email,
          attributes: contact.attributes || {},
          listIds: contact.listIds || [2], // Default to "Global Travel Report Newsletter" list
          updateEnabled: contact.updateEnabled !== false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Error adding contact to Brevo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get contact information from Brevo
   */
  async getContact(email: string): Promise<BrevoApiResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Brevo API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/contacts/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'api-key': this.apiKey,
        },
      });

      if (response.status === 404) {
        return {
          success: false,
          error: 'Contact not found',
        };
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Error getting contact from Brevo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Remove contact from Brevo list
   */
  async removeContact(email: string): Promise<BrevoApiResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Brevo API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/contacts/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          'api-key': this.apiKey,
        },
      });

      if (response.status === 404) {
        return {
          success: true, // Already removed
          data: null,
        };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: null,
      };
    } catch (error) {
      console.error('Error removing contact from Brevo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send transactional email via Brevo
   */
  async sendEmail(
    to: string | string[],
    templateId: number,
    params?: Record<string, any>
  ): Promise<BrevoApiResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Brevo API key not configured');
      }

      const recipients = Array.isArray(to) ? to : [to];

      const response = await fetch(`${this.baseUrl}/smtp/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          to: recipients.map(email => ({ email })),
          templateId: templateId,
          params: params || {},
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: data,
        messageId: data.messageId,
      };
    } catch (error) {
      console.error('Error sending email via Brevo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create or update email template
   */
  async createTemplate(template: BrevoEmailTemplate): Promise<BrevoApiResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Brevo API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/smtp/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          name: template.name,
          subject: template.subject,
          htmlContent: template.htmlContent,
          sender: template.sender || {
            name: 'Global Travel Report',
            email: 'newsletter@globaltravelreport.com',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Error creating template in Brevo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all email templates
   */
  async getTemplates(): Promise<BrevoApiResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Brevo API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/smtp/templates`, {
        method: 'GET',
        headers: {
          'api-key': this.apiKey,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: data.templates || [],
      };
    } catch (error) {
      console.error('Error getting templates from Brevo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get account information
   */
  async getAccount(): Promise<BrevoApiResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Brevo API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/account`, {
        method: 'GET',
        headers: {
          'api-key': this.apiKey,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Error getting account info from Brevo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Send notification email for new story submission
 */
export async function sendSubmissionNotification(submission: {
  name: string;
  email: string;
  title: string;
  content: string;
  category: string;
  country: string;
  tags: string[];
}): Promise<BrevoApiResponse> {
  try {
    const brevoService = BrevoService.getInstance();

    // Email to editor
    const editorEmailResult = await brevoService.sendEmail(
      'editor@globaltravelreport.com',
      1, // Template ID for submission notification
      {
        submitterName: submission.name,
        submitterEmail: submission.email,
        storyTitle: submission.title,
        storyContent: submission.content.substring(0, 500) + (submission.content.length > 500 ? '...' : ''),
        storyCategory: submission.category,
        storyCountry: submission.country,
        storyTags: submission.tags.join(', '),
        submissionDate: new Date().toLocaleDateString(),
      }
    );

    if (!editorEmailResult.success) {
      console.error('Failed to send editor notification:', editorEmailResult.error);
    }

    // Thank you email to submitter
    const submitterEmailResult = await brevoService.sendEmail(
      submission.email,
      2, // Template ID for thank you email
      {
        submitterName: submission.name,
        storyTitle: submission.title,
        reviewTimeline: '2-3 business days',
      }
    );

    if (!submitterEmailResult.success) {
      console.error('Failed to send submitter thank you email:', submitterEmailResult.error);
    }

    return {
      success: editorEmailResult.success && submitterEmailResult.success,
      data: {
        editorEmail: editorEmailResult,
        submitterEmail: submitterEmailResult,
      },
    };
  } catch (error) {
    console.error('Error sending submission notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default BrevoService;