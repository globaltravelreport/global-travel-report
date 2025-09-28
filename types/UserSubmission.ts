/**
 * User Submission interface for story submissions
 */
export interface UserSubmission {
  id: string;
  name: string;
  email: string;
  title: string;
  content: string;
  category: string;
  country: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date | string;
  updatedAt?: Date | string;
  reviewedAt?: Date | string;
  reviewedBy?: string;
  rejectionReason?: string;
  approvedStoryId?: string; // Reference to the published story if approved
}

/**
 * Type for creating new user submissions
 */
export interface CreateUserSubmissionData {
  name: string;
  email: string;
  title: string;
  content: string;
  category: string;
  country: string;
  tags: string[];
}

/**
 * Type for updating submission status
 */
export interface UpdateSubmissionStatusData {
  status: 'approved' | 'rejected';
  reviewedBy?: string;
  rejectionReason?: string;
  approvedStoryId?: string;
}

/**
 * Type for submission validation results
 */
export interface SubmissionValidationResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}

/**
 * Type for submission processing statistics
 */
export interface SubmissionProcessingStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  averageReviewTime: number; // in hours
}