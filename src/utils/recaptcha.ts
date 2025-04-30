/**
 * reCAPTCHA verification utilities
 */

import config from '@/src/config';

/**
 * reCAPTCHA verification response
 */
interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  action?: string;
  error_codes?: string[];
}

/**
 * Verify a reCAPTCHA token
 * @param token - The reCAPTCHA token to verify
 * @param minScore - Minimum score required for v3 reCAPTCHA (0.0 to 1.0)
 * @returns Promise resolving to a boolean indicating if the token is valid
 */
export async function verifyRecaptcha(
  token: string,
  minScore: number = 0.5
): Promise<boolean> {
  try {
    // Get the secret key from environment variables
    const secretKey = config.api.recaptcha.secretKey;
    
    if (!secretKey) {
      console.error('reCAPTCHA secret key is not configured');
      return false;
    }
    
    // Make the verification request to Google's API
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );
    
    // Parse the response
    const data = await response.json() as RecaptchaResponse;
    
    // For reCAPTCHA v3, check the score
    if (data.score !== undefined) {
      return data.success && data.score >= minScore;
    }
    
    // For reCAPTCHA v2, just check success
    return data.success;
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return false;
  }
}

/**
 * Log reCAPTCHA verification details (for debugging)
 * @param token - The reCAPTCHA token to verify
 * @returns Promise resolving to the full reCAPTCHA response
 */
export async function getRecaptchaDetails(token: string): Promise<RecaptchaResponse | null> {
  try {
    // Get the secret key from environment variables
    const secretKey = config.api.recaptcha.secretKey;
    
    if (!secretKey) {
      console.error('reCAPTCHA secret key is not configured');
      return null;
    }
    
    // Make the verification request to Google's API
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );
    
    // Parse and return the full response
    return await response.json() as RecaptchaResponse;
  } catch (error) {
    console.error('Error getting reCAPTCHA details:', error);
    return null;
  }
}
