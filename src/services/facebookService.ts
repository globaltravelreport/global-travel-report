/**
 * Facebook Service
 * 
 * A modern implementation of Facebook API integration using axios instead of the deprecated 'fb' package.
 * This service handles posting to Facebook pages and other Facebook-related functionality.
 */

import axios from 'axios';
import { errorService } from './errorService';
import { ErrorCategory } from '@/src/types/errors';

// Facebook Graph API base URL
const FACEBOOK_API_BASE_URL = 'https://graph.facebook.com/v18.0';

interface FacebookPostParams {
  message: string;
  link?: string;
  picture?: string;
}

interface FacebookPostResponse {
  id: string;
}

/**
 * Facebook Service class for interacting with the Facebook Graph API
 */
export class FacebookService {
  private accessToken: string;
  
  /**
   * Create a new FacebookService instance
   * @param accessToken Facebook access token
   */
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
  
  /**
   * Post a message to a Facebook page
   * @param pageId Facebook page ID
   * @param params Post parameters (message, link, picture)
   * @returns Promise with the post ID
   */
  async createPost(pageId: string, params: FacebookPostParams): Promise<FacebookPostResponse> {
    try {
      // Log the post parameters for debugging
      console.log(`Facebook post parameters for page "${pageId}":`, JSON.stringify(params, null, 2));
      
      // Make the API call
      const response = await axios.post(
        `${FACEBOOK_API_BASE_URL}/${pageId}/feed`,
        {
          ...params,
          access_token: this.accessToken
        }
      );
      
      return { id: response.data.id };
    } catch (error) {
      // Log the error
      errorService.logError(
        `Failed to post to Facebook: ${error instanceof Error ? error.message : String(error)}`,
        errorService.ErrorSeverity.ERROR,
        ErrorCategory.SOCIAL_MEDIA,
        { action: 'createPost', additionalData: { pageId } }
      );
      
      // Rethrow the error
      throw error;
    }
  }
  
  /**
   * Get information about a Facebook page
   * @param pageId Facebook page ID
   * @returns Promise with the page information
   */
  async getPageInfo(pageId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${FACEBOOK_API_BASE_URL}/${pageId}`,
        {
          params: {
            access_token: this.accessToken,
            fields: 'name,category,fan_count,link'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      // Log the error
      errorService.logError(
        `Failed to get Facebook page info: ${error instanceof Error ? error.message : String(error)}`,
        errorService.ErrorSeverity.ERROR,
        ErrorCategory.SOCIAL_MEDIA,
        { action: 'getPageInfo', additionalData: { pageId } }
      );
      
      // Rethrow the error
      throw error;
    }
  }
  
  /**
   * Check if the access token is valid
   * @returns Promise with a boolean indicating if the token is valid
   */
  async validateAccessToken(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${FACEBOOK_API_BASE_URL}/debug_token`,
        {
          params: {
            input_token: this.accessToken,
            access_token: this.accessToken
          }
        }
      );
      
      return response.data.data.is_valid === true;
    } catch (error) {
      // Log the error
      errorService.logError(
        `Failed to validate Facebook access token: ${error instanceof Error ? error.message : String(error)}`,
        errorService.ErrorSeverity.ERROR,
        ErrorCategory.SOCIAL_MEDIA,
        { action: 'validateAccessToken' }
      );
      
      return false;
    }
  }
}

// Export a factory function to create a FacebookService instance
export function createFacebookService(accessToken: string): FacebookService {
  return new FacebookService(accessToken);
}

export default createFacebookService;
