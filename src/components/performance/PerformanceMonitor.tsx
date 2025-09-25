'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
  totalLoadTime: number;
  totalSize: number;
  requestCount: number;
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
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [lighthouseScores, setLighthouseScores] = useState<LighthouseScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const measurePerformance = () => {
      // Use Performance Observer API for Core Web Vitals
      if ('PerformanceObserver' in window) {
        // First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcp = entries[entries.length - 1];
          setMetrics(prev => prev ? { ...prev, fcp: fcp.startTime } : null);
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries[entries.length - 1];
          setMetrics(prev => prev ? { ...prev, lcp: lcp.startTime } : null);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            setMetrics(prev => prev ? { ...prev, fid: entry.processingStart - entry.startTime } : null);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Layout Shifts
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          setMetrics(prev => prev ? { ...prev, cls: clsValue } : null);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Navigation timing
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            setMetrics(prev => ({
              fcp: prev?.fcp || 0,
              lcp: prev?.lcp || 0,
              cls: prev?.cls || 0,
              fid: prev?.fid || 0,
              ttfb: entry.responseStart - entry.requestStart,
              totalLoadTime: entry.loadEventEnd - entry.loadEventStart,
              totalSize: entry.transferSize || 0,
              requestCount: entry.requestCount || 0,
            }));
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });

        return () => {
          fcpObserver.disconnect();
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
          navigationObserver.disconnect();
        };
      }
    };

    const timer = setTimeout(measurePerformance, 1000);
    return () => clearTimeout(timer);
  }, []);

  const runLighthouseAudit = async () => {
    // Simulate Lighthouse audit (in real implementation, this would call the Lighthouse API)
    const mockLighthouseScores: LighthouseScore = {
      performance: Math.floor(Math.random() * 40) + 60, // 60-100
      accessibility: Math.floor(Math.random() * 30) + 70, // 70-100
      bestPractices: Math.floor(Math.random() * 20) + 80, // 80-100
      seo: Math.floor(Math.random() * 25) + 75, // 75-100
      pwa: Math.floor(Math.random() * 40) + 60, // 60-100
    };

    setLighthouseScores(mockLighthouseScores);
    return mockLighthouseScores;
  };

  return { metrics, lighthouseScores, isLoading, runLighthouseAudit };
}

export function PerformanceMonitor({
  onMetricsUpdate,
  onLighthouseUpdate,
  showDetails = false,
  autoRefresh = true,
  refreshInterval = 30000,
}: PerformanceMonitorProps) {
  const { metrics, lighthouseScores, isLoading, runLighthouseAudit } = usePerformanceMonitor();
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastAudit, setLastAudit] = useState<Date | null>(null);

  useEffect(() => {
    if (metrics && onMetricsUpdate) {
      onMetricsUpdate(metrics);
    }
  }, [metrics, onMetricsUpdate]);

  useEffect(() => {
    if (lighthouseScores && onLighthouseUpdate) {
      onLighthouseUpdate(lighthouseScores);
    }
  }, [lighthouseScores, onLighthouseUpdate]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        runLighthouseAudit();
        setLastAudit(new Date());
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, runLighthouseAudit]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="performance-monitor bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="font-semibold">Performance Monitor</h3>
          </div>
          <div className="flex items-center space-x-2">
            {lastAudit && (
              <span className="text-xs text-gray-500">
                Last audit: {lastAudit.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-6">
              {/* Core Web Vitals */}
              {metrics && (
                <div>
                  <h4 className="font-medium mb-3">Core Web Vitals</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">{formatTime(metrics.fcp)}</div>
                      <div className="text-xs text-gray-600">First Contentful Paint</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-green-600">{formatTime(metrics.lcp)}</div>
                      <div className="text-xs text-gray-600">Largest Contentful Paint</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-purple-600">{metrics.cls.toFixed(3)}</div>
                      <div className="text-xs text-gray-600">Cumulative Layout Shift</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-orange-600">{formatTime(metrics.fid)}</div>
                      <div className="text-xs text-gray-600">First Input Delay</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lighthouse Scores */}
              {lighthouseScores && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Lighthouse Scores</h4>
                    <button
                      onClick={() => {
                        runLighthouseAudit();
                        setLastAudit(new Date());
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Run Audit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className={`text-lg font-bold px-2 py-1 rounded ${getScoreColor(lighthouseScores.performance)}`}>
                        {lighthouseScores.performance}
                      </div>
                      <div className="text-xs text-gray-600">Performance</div>
                      <div className="text-xs text-gray-500">{getScoreLabel(lighthouseScores.performance)}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className={`text-lg font-bold px-2 py-1 rounded ${getScoreColor(lighthouseScores.accessibility)}`}>
                        {lighthouseScores.accessibility}
                      </div>
                      <div className="text-xs text-gray-600">Accessibility</div>
                      <div className="text-xs text-gray-500">{getScoreLabel(lighthouseScores.accessibility)}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className={`text-lg font-bold px-2 py-1 rounded ${getScoreColor(lighthouseScores.bestPractices)}`}>
                        {lighthouseScores.bestPractices}
                      </div>
                      <div className="text-xs text-gray-600">Best Practices</div>
                      <div className="text-xs text-gray-500">{getScoreLabel(lighthouseScores.bestPractices)}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className={`text-lg font-bold px-2 py-1 rounded ${getScoreColor(lighthouseScores.seo)}`}>
                        {lighthouseScores.seo}
                      </div>
                      <div className="text-xs text-gray-600">SEO</div>
                      <div className="text-xs text-gray-500">{getScoreLabel(lighthouseScores.seo)}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className={`text-lg font-bold px-2 py-1 rounded ${getScoreColor(lighthouseScores.pwa)}`}>
                        {lighthouseScores.pwa}
                      </div>
                      <div className="text-xs text-gray-600">PWA</div>
                      <div className="text-xs text-gray-500">{getScoreLabel(lighthouseScores.pwa)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Metrics */}
              {metrics && (
                <div>
                  <h4 className="font-medium mb-3">Detailed Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Time to First Byte:</span>
                        <span className="text-sm font-medium">{formatTime(metrics.ttfb)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Load Time:</span>
                        <span className="text-sm font-medium">{formatTime(metrics.totalLoadTime)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Size:</span>
                        <span className="text-sm font-medium">{formatSize(metrics.totalSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Request Count:</span>
                        <span className="text-sm font-medium">{metrics.requestCount}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className="text-sm font-medium text-green-600">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Update:</span>
                        <span className="text-sm font-medium">{new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Tips */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Performance Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Optimize images to reduce load time</li>
                  <li>• Minimize CSS and JavaScript files</li>
                  <li>• Use browser caching for static assets</li>
                  <li>• Implement lazy loading for below-fold content</li>
                  <li>• Reduce server response time</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Measuring performance...</p>
        </div>
      )}
    </div>
  );
}

// Performance Budget Component
interface PerformanceBudgetProps {
  budgets: {
    lcp: number;
    fid: number;
    cls: number;
    totalSize: number;
  };
  onBudgetExceeded?: (metric: string, value: number, budget: number) => void;
}

const formatTime = (ms: number) => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function PerformanceBudget({ budgets, onBudgetExceeded }: PerformanceBudgetProps) {
  const { metrics } = usePerformanceMonitor();

  useEffect(() => {
    if (!metrics || !onBudgetExceeded) return;

    if (metrics.lcp > budgets.lcp) {
      onBudgetExceeded('LCP', metrics.lcp, budgets.lcp);
    }
    if (metrics.fid > budgets.fid) {
      onBudgetExceeded('FID', metrics.fid, budgets.fid);
    }
    if (metrics.cls > budgets.cls) {
      onBudgetExceeded('CLS', metrics.cls, budgets.cls);
    }
    if (metrics.totalSize > budgets.totalSize) {
      onBudgetExceeded('Total Size', metrics.totalSize, budgets.totalSize);
    }
  }, [metrics, budgets, onBudgetExceeded]);

  return (
    <div className="performance-budget p-4 bg-white rounded-lg shadow-sm border">
      <h4 className="font-medium mb-3">Performance Budget</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>LCP (Largest Contentful Paint):</span>
          <span className={metrics && metrics.lcp > budgets.lcp ? 'text-red-600' : 'text-green-600'}>
            {metrics ? formatTime(metrics.lcp) : '—'} / {formatTime(budgets.lcp)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>FID (First Input Delay):</span>
          <span className={metrics && metrics.fid > budgets.fid ? 'text-red-600' : 'text-green-600'}>
            {metrics ? formatTime(metrics.fid) : '—'} / {formatTime(budgets.fid)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>CLS (Cumulative Layout Shift):</span>
          <span className={metrics && metrics.cls > budgets.cls ? 'text-red-600' : 'text-green-600'}>
            {metrics ? metrics.cls.toFixed(3) : '—'} / {budgets.cls.toFixed(3)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Total Bundle Size:</span>
          <span className={metrics && metrics.totalSize > budgets.totalSize ? 'text-red-600' : 'text-green-600'}>
            {metrics ? formatSize(metrics.totalSize) : '—'} / {formatSize(budgets.totalSize)}
          </span>
        </div>
      </div>
    </div>
  );
}