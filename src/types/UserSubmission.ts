/**
 * User Submission type definition for Global Travel Report
 *
 * Represents a user-submitted story or content for moderation and publishing
 */

export interface UserSubmission {
  id?: string;
  name: string;
  email: string;
  title: string;
  content: string;
  category: string;
  country: string;
  tags?: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  imageUrl?: string;
  imageAlt?: string;
  photographer?: {
    name: string;
    url?: string;
  };
}