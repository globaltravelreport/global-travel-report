'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
  loadTime: number; // Total load time
  domContentLoaded: number;
  firstPaint: number;
}

interface LighthouseScore {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
}

interface PerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  onLighthouseUpdate?: (scores: LighthouseScore) => void;
  showDetails?: boolean;
  className?: string;
}

export function PerformanceMonitor({
  onMetricsUpdate,
  onLighthouseUpdate,
  showDetails = false,
  className = '',
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: 0,
    lcp: 0,
    cls: 0,
    fid: 0,
    ttfb: 0,
    loadTime: 0,
    domContentLoaded: 0,
    firstPaint: 0,
  });

  const [lighthouseScores, setLighthouseScores] = useState<LighthouseScore>({
    performance: 0,
    accessibility: 0,
    bestPractices: 0,
    seo: 0,
    pwa: 0,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    // Measure Core Web Vitals
    measureCoreWebVitals();

    // Measure Navigation Timing
    measureNavigationTiming();

    // Measure Resource Timing
    measureResourceTiming();

    // Simulate Lighthouse scores (in real app, this would come from actual Lighthouse API)
    simulateLighthouseScores();

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const measureCoreWebVitals = () => {
    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcp = entries[entries.length - 1];
      setMetrics(prev => ({ ...prev, fcp: fcp.startTime }));
    });

    try {
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('FCP measurement not supported');
    }

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1];
      setMetrics(prev => ({ ...prev, lcp: lcp.startTime }));
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP measurement not supported');
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      setMetrics(prev => ({ ...prev, cls: clsValue }));
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS measurement not supported');
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fid = entries[entries.length - 1] as any;
      setMetrics(prev => ({ ...prev, fid: fid.processingStart - fid.startTime }));
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID measurement not supported');
    }
  };

  const measureNavigationTiming = () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;

      setMetrics(prev => ({
        ...prev,
        ttfb,
        domContentLoaded,
        loadTime,
      }));

      onMetricsUpdate?.({
        ...metrics,
        ttfb,
        domContentLoaded,
        loadTime,
      });
    }
  };

  const measureResourceTiming = () => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    // Calculate average resource load time
    const resourceLoadTimes = resources
      .filter(r => r.duration > 0)
      .map(r => r.duration);

    if (resourceLoadTimes.length > 0) {
      const avgResourceTime = resourceLoadTimes.reduce((a, b) => a + b, 0) / resourceLoadTimes.length;
      console.log(`Average resource load time: ${avgResourceTime.toFixed(2)}ms`);
    }
  };

  const simulateLighthouseScores = () => {
    // Simulate realistic Lighthouse scores
    setTimeout(() => {
      const scores: LighthouseScore = {
        performance: Math.floor(Math.random() * 30) + 70, // 70-100
        accessibility: Math.floor(Math.random() * 20) + 80, // 80-100
        bestPractices: Math.floor(Math.random() * 15) + 85, // 85-100
        seo: Math.floor(Math.random() * 20) + 80, // 80-100
        pwa: Math.floor(Math.random() * 25) + 75, // 75-100
      };

      setLighthouseScores(scores);
      onLighthouseUpdate?.(scores);
      setIsLoading(false);
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return '🟢';
    if (score >= 70) return '🟡';
    return '🔴';
  };

  const formatMetric = (value: number, unit: string = 'ms') => {
    if (value === 0) return 'Measuring...';
    return `${value.toFixed(2)}${unit}`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📊</span>
          <h3 className="text-lg font-semibold">Performance Monitor</h3>
        </div>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isVisible ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Core Web Vitals Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-1">🎨</div>
          <div className="text-sm text-gray-600">FCP</div>
          <div className="font-semibold">{formatMetric(metrics.fcp)}</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-1">🖼️</div>
          <div className="text-sm text-gray-600">LCP</div>
          <div className="font-semibold">{formatMetric(metrics.lcp)}</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-1">📐</div>
          <div className="text-sm text-gray-600">CLS</div>
          <div className="font-semibold">{metrics.cls.toFixed(3)}</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-1">👆</div>
          <div className="text-sm text-gray-600">FID</div>
          <div className="font-semibold">{formatMetric(metrics.fid)}</div>
        </div>
      </div>

      {/* Lighthouse Scores */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Lighthouse Scores</h4>
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Running audit...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(lighthouseScores).map(([key, score]) => (
              <div key={key} className="text-center p-2 rounded-lg">
                <div className="text-lg mb-1">{getScoreIcon(score)}</div>
                <div className="text-xs text-gray-600 capitalize">{key}</div>
                <div className={`text-sm font-semibold px-2 py-1 rounded ${getScoreColor(score)}`}>
                  {score}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Metrics */}
      <AnimatePresence>
        {isVisible && showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t space-y-4">
              <h4 className="font-medium">Detailed Metrics</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time to First Byte:</span>
                    <span className="text-sm font-medium">{formatMetric(metrics.ttfb)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">DOM Content Loaded:</span>
                    <span className="text-sm font-medium">{formatMetric(metrics.domContentLoaded)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Load Time:</span>
                    <span className="text-sm font-medium">{formatMetric(metrics.loadTime)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">First Paint:</span>
                    <span className="text-sm font-medium">{formatMetric(metrics.firstPaint)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Connection Speed:</span>
                    <span className="text-sm font-medium">
                      {(navigator as any).connection?.effectiveType || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Device Memory:</span>
                    <span className="text-sm font-medium">
                      {(navigator as any).deviceMemory ? `${(navigator as any).deviceMemory}GB` : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Recommendations */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Performance Tips</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  {metrics.lcp > 2500 && (
                    <li>• Largest Contentful Paint is high - consider optimizing images and fonts</li>
                  )}
                  {metrics.fid > 100 && (
                    <li>• First Input Delay is high - consider reducing JavaScript execution time</li>
                  )}
                  {metrics.cls > 0.1 && (
                    <li>• Cumulative Layout Shift is high - ensure images have width and height attributes</li>
                  )}
                  {metrics.ttfb > 800 && (
                    <li>• Time to First Byte is high - consider server-side optimizations</li>
                  )}
                  {metrics.lcp <= 2500 && metrics.fid <= 100 && metrics.cls <= 0.1 && (
                    <li className="text-green-800">• Great! Your Core Web Vitals are within recommended ranges</li>
                  )}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Performance Budget Component
interface PerformanceBudgetProps {
  budgets: {
    lcp: number;
    fid: number;
    cls: number;
    bundleSize: number;
  };
  currentMetrics: Partial<PerformanceMetrics>;
  className?: string;
}

export function PerformanceBudget({
  budgets,
  currentMetrics,
  className = '',
}: PerformanceBudgetProps) {
  const getBudgetStatus = (current: number, budget: number) => {
    if (current <= budget * 0.8) return { status: 'good', color: 'green' };
    if (current <= budget) return { status: 'warning', color: 'yellow' };
    return { status: 'exceeded', color: 'red' };
  };

  const lcpStatus = getBudgetStatus(currentMetrics.lcp || 0, budgets.lcp);
  const fidStatus = getBudgetStatus(currentMetrics.fid || 0, budgets.fid);
  const clsStatus = getBudgetStatus(currentMetrics.cls || 0, budgets.cls);

  return (
    <div className={`bg-white rounded-lg shadow-lg border p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Performance Budget</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🖼️</span>
            <div>
              <div className="font-medium">Largest Contentful Paint</div>
              <div className="text-sm text-gray-600">Should be ≤ {budgets.lcp}ms</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${
              lcpStatus.status === 'good' ? 'text-green-600' :
              lcpStatus.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {currentMetrics.lcp ? `${currentMetrics.lcp.toFixed(0)}ms` : 'Measuring...'}
            </div>
            <div className={`text-sm ${
              lcpStatus.status === 'good' ? 'text-green-600' :
              lcpStatus.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {lcpStatus.status === 'good' ? '✅ Good' :
               lcpStatus.status === 'warning' ? '⚠️ Warning' : '❌ Exceeded'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">👆</span>
            <div>
              <div className="font-medium">First Input Delay</div>
              <div className="text-sm text-gray-600">Should be ≤ {budgets.fid}ms</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${
              fidStatus.status === 'good' ? 'text-green-600' :
              fidStatus.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {currentMetrics.fid ? `${currentMetrics.fid.toFixed(0)}ms` : 'Measuring...'}
            </div>
            <div className={`text-sm ${
              fidStatus.status === 'good' ? 'text-green-600' :
              fidStatus.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {fidStatus.status === 'good' ? '✅ Good' :
               fidStatus.status === 'warning' ? '⚠️ Warning' : '❌ Exceeded'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📐</span>
            <div>
              <div className="font-medium">Cumulative Layout Shift</div>
              <div className="text-sm text-gray-600">Should be ≤ {budgets.cls}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${
              clsStatus.status === 'good' ? 'text-green-600' :
              clsStatus.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {currentMetrics.cls ? currentMetrics.cls.toFixed(3) : 'Measuring...'}
            </div>
            <div className={`text-sm ${
              clsStatus.status === 'good' ? 'text-green-600' :
              clsStatus.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {clsStatus.status === 'good' ? '✅ Good' :
               clsStatus.status === 'warning' ? '⚠️ Warning' : '❌ Exceeded'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}