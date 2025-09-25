"use client";

import { useState, useCallback, useEffect } from 'react';
import { useGlobalError } from '@/components/ui/GlobalErrorHandler';
import { ErrorType } from '@/utils/error-handler';

/**
 * API request state
 */
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * API request options
 */
interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  retries?: number;
}

/**
 * Enhanced API hook with error handling, caching, and retry logic
 */
export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });
  
  const { showError } = useGlobalError();
  
  // Simple cache for GET requests
  const cache = new Map<string, { data: T; timestamp: number }>();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Make an API request
   */
  const request = useCallback(async (
    url: string, 
    options: ApiOptions = {}
  ): Promise<T | null> => {
    const {
      method = 'GET',
      headers = {},
      body,
      cache: useCache = method === 'GET',
      retries = 3
    } = options;
    
    // Check cache for GET requests
    if (useCache && method === 'GET') {
      const cached = cache.get(url);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setState({ data: cached.data, loading: false, error: null });
        return cached.data;
      }
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: body ? JSON.stringify(body) : undefined
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Cache successful GET requests
        if (useCache && method === 'GET') {
          cache.set(url, { data, timestamp: Date.now() });
        }
        
        setState({ data, loading: false, error: null });
        return data;
        
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    // All retries failed
    const errorMessage = lastError?.message || 'Request failed';
    setState({ data: null, loading: false, error: errorMessage });
    
    // Show global error notification
    showError(errorMessage, ErrorType.NETWORK);
    
    return null;
  }, [showError]);
  
  /**
   * GET request shorthand
   */
  const get = useCallback((url: string, options?: Omit<ApiOptions, 'method'>) => {
    return request(url, { ...options, method: 'GET' });
  }, [request]);
  
  /**
   * POST request shorthand
   */
  const post = useCallback((url: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    return request(url, { ...options, method: 'POST', body });
  }, [request]);
  
  /**
   * PUT request shorthand
   */
  const put = useCallback((url: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    return request(url, { ...options, method: 'PUT', body });
  }, [request]);
  
  /**
   * DELETE request shorthand
   */
  const del = useCallback((url: string, options?: Omit<ApiOptions, 'method'>) => {
    return request(url, { ...options, method: 'DELETE' });
  }, [request]);
  
  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    cache.clear();
  }, []);
  
  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);
  
  // Cleanup cache on unmount
  useEffect(() => {
    return () => {
      cache.clear();
    };
  }, []);
  
  return {
    ...state,
    request,
    get,
    post,
    put,
    delete: del,
    clearCache,
    reset
  };
}

export default useApi;