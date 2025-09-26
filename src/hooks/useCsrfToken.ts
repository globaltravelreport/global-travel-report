'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to get and manage CSRF token
 * @returns Object containing the CSRF token and a function to refresh it
 */
export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch a new CSRF token from the server
   */
  const refreshToken = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      
      const data = await response.json();
      setCsrfToken(data.token);
    } catch (err) {
      console.error('Error fetching CSRF token:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch token on component mount
  useEffect(() => {
    refreshToken();
  }, []);

  return {
    csrfToken,
    refreshToken,
    isLoading,
    error,
  };
}
