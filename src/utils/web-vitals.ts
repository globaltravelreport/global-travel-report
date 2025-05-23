/**
 * Web Vitals Tracking Utility
 *
 * This module provides utilities for tracking Core Web Vitals metrics
 * without relying on third-party services.
 */

import { NextWebVitalsMetric } from 'next/app';

// Types for Web Vitals metrics
export type WebVitalsMetric = {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
};

// Storage key for Web Vitals metrics
const WEB_VITALS_STORAGE_KEY = 'gtr_web_vitals';

/**
 * Get the rating for a Web Vitals metric
 *
 * @param name - The name of the metric
 * @param value - The value of the metric
 * @returns The rating of the metric
 */
function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (name) {
    case 'LCP': // Largest Contentful Paint
      return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
    case 'FID': // First Input Delay
      return value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor';
    case 'CLS': // Cumulative Layout Shift
      return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
    case 'FCP': // First Contentful Paint
      return value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB': // Time to First Byte
      return value < 800 ? 'good' : value < 1800 ? 'needs-improvement' : 'poor';
    case 'INP': // Interaction to Next Paint
      return value < 200 ? 'good' : value < 500 ? 'needs-improvement' : 'poor';
    default:
      return 'needs-improvement';
  }
}

/**
 * Store Web Vitals metrics in local storage
 *
 * @param metric - The Web Vitals metric to store
 */
function storeWebVitalsMetric(metric: WebVitalsMetric): void {
  if (typeof window === 'undefined') return;

  try {
    // Get existing metrics from local storage
    const storedMetrics = localStorage.getItem(WEB_VITALS_STORAGE_KEY);
    const metrics = storedMetrics ? JSON.parse(storedMetrics) : [];

    // Add the new metric
    metrics.push({
      ...metric,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: window.navigator.userAgent,
    });

    // Keep only the last 50 metrics to avoid excessive storage usage
    const trimmedMetrics = metrics.slice(-50);

    // Store the metrics back in local storage
    localStorage.setItem(WEB_VITALS_STORAGE_KEY, JSON.stringify(trimmedMetrics));

    // Log the metric to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Web Vitals: ${metric.name} = ${metric.value} (${metric.rating})`);
    }
  } catch (error) {
    console.error('Error storing Web Vitals metric:', error);
  }
}

/**
 * Get all stored Web Vitals metrics
 *
 * @returns An array of stored Web Vitals metrics
 */
export function getStoredWebVitalsMetrics(): any[] {
  if (typeof window === 'undefined') return [];

  try {
    const storedMetrics = localStorage.getItem(WEB_VITALS_STORAGE_KEY);
    return storedMetrics ? JSON.parse(storedMetrics) : [];
  } catch (error) {
    console.error('Error getting stored Web Vitals metrics:', error);
    return [];
  }
}

/**
 * Clear all stored Web Vitals metrics
 */
export function clearStoredWebVitalsMetrics(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(WEB_VITALS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing stored Web Vitals metrics:', error);
  }
}

/**
 * Report Web Vitals metrics
 *
 * This function is used with Next.js's reportWebVitals function
 * to track Core Web Vitals metrics.
 *
 * @param metric - The Web Vitals metric to report
 */
export function reportWebVitals(metric: NextWebVitalsMetric): void {
  const { id, name, value } = metric;
  // delta is not available in NextWebVitalsMetric type, so we use any to access it
  const delta = (metric as any).delta;

  // Get the rating for the metric
  const rating = getMetricRating(name, value);

  // Store the metric
  storeWebVitalsMetric({
    id,
    name,
    value,
    rating,
    delta: delta || 0,
    navigationType: (performance as any).getEntriesByType?.('navigation')?.[0]?.type || '',
  });
}

export default reportWebVitals;
