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
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Get the secret key from environment variables
    const secretKey = config.api.recaptcha.secretKey;

    // Skip verification in development mode if no key is provided
    if (!secretKey) {
      if (isDevelopment) {
        console.log('Development mode: Skipping reCAPTCHA verification');
        return true; // Auto-pass in development
      } else {
        console.error('reCAPTCHA secret key is not configured');
        return false;
      }
    }

    // Skip verification if token is missing (likely in development)
    if (!token) {
      if (isDevelopment) {
        console.log('Development mode: No reCAPTCHA token provided, skipping verification');
        return true; // Auto-pass in development
      } else {
        console.error('No reCAPTCHA token provided');
        return false;
      }
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
  } catch (_error) {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: reCAPTCHA error, bypassing verification');
      return true; // Auto-pass in development
    }

    console.error(_error);
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
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Get the secret key from environment variables
    const secretKey = config.api.recaptcha.secretKey;

    // Return mock data in development mode if no key is provided
    if (!secretKey) {
      if (isDevelopment) {
        console.log('Development mode: Returning mock reCAPTCHA details');
        return {
          success: true,
          score: 1.0,
          action: 'mock_action',
          challenge_ts: new Date().toISOString(),
          hostname: 'localhost'
        };
      } else {
        console.error('reCAPTCHA secret key is not configured');
        return null;
      }
    }

    // Return mock data if token is missing (likely in development)
    if (!token) {
      if (isDevelopment) {
        console.log('Development mode: No reCAPTCHA token provided, returning mock details');
        return {
          success: true,
          score: 1.0,
          action: 'mock_action',
          challenge_ts: new Date().toISOString(),
          hostname: 'localhost'
        };
      } else {
        console.error('No reCAPTCHA token provided');
        return null;
      }
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
  } catch (_error) {
    // Return mock data in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: reCAPTCHA error, returning mock details');
      return {
        success: true,
        score: 1.0,
        action: 'mock_action',
        challenge_ts: new Date().toISOString(),
        hostname: 'localhost'
      };
    }

    console.error(_error);
    return null;
  }
}
