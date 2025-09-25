#!/usr/bin/env node

/**
 * Core Web Vitals Optimization Script
 * 
 * This script:
 * 1. Analyzes the application for Core Web Vitals issues
 * 2. Suggests optimizations for LCP, FID, and CLS
 * 3. Implements some automatic optimizations
 * 
 * Usage:
 * node scripts/optimize-web-vitals.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  reportPath: './web-vitals-report.md',
  componentsDir: './src/components',
  appDir: './app',
  publicDir: './public'
};

// Check if required tools are installed
function checkRequirements() {
  try {
    require.resolve('next');
    return true;
  } catch (error) {
    console.error('Next.js is not installed. Please install it first.');
    return false;
  }
}

// Create Web Vitals tracking component
function createWebVitalsTracker() {
  const trackerPath = path.join(config.componentsDir, 'analytics', 'WebVitalsTracker.tsx');
  const trackerDir = path.dirname(trackerPath);
  
  if (!fs.existsSync(trackerDir)) {
    fs.mkdirSync(trackerDir, { recursive: true });
  }
  
  if (fs.existsSync(trackerPath)) {
    console.log('Web Vitals tracker already exists.');
    return;
  }
  
  const trackerContent = `'use client';

import { useEffect } from 'react';
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

type WebVitalsMetric = {
  id: string;
  name: string;
  value: number;
  delta: number;
};

/**
 * Component to track and report Core Web Vitals
 */
export function WebVitalsTracker() {
  useEffect(() => {
    // Function to send metrics to analytics
    const reportWebVitals = ({ id, name, value, delta }: WebVitalsMetric) => {
      // Send to analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', name, {
          event_category: 'web-vitals',
          event_label: id,
          value: Math.round(name === 'CLS' ? value * 1000 : value),
          non_interaction: true,
        });
      }
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(\`Web Vitals: \${name} | Value: \${value} | Delta: \${delta}\`);
      }
    };

    // Register metrics
    onCLS(reportWebVitals);
    onFID(reportWebVitals);
    onLCP(reportWebVitals);
    onFCP(reportWebVitals);
    onTTFB(reportWebVitals);
  }, []);

  return null;
}
`;
  
  fs.writeFileSync(trackerPath, trackerContent);
  console.log(`Created Web Vitals tracker at ${trackerPath}`);
}

// Create font optimization component
function createFontOptimizer() {
  const fontOptimizerPath = path.join(config.componentsDir, 'ui', 'FontOptimizer.tsx');
  const fontOptimizerDir = path.dirname(fontOptimizerPath);
  
  if (!fs.existsSync(fontOptimizerDir)) {
    fs.mkdirSync(fontOptimizerDir, { recursive: true });
  }
  
  if (fs.existsSync(fontOptimizerPath)) {
    console.log('Font optimizer already exists.');
    return;
  }
  
  const fontOptimizerContent = `import React from 'react';

/**
 * FontOptimizer component to preload and optimize fonts
 */
export function FontOptimizer() {
  return (
    <>
      {/* Preconnect to Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Preload critical fonts */}
      <link
        rel="preload"
        href="/fonts/inter.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      {/* Font display strategy */}
      <style jsx global>{\`
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url('/fonts/inter.woff2') format('woff2');
        }
        
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 700;
          font-display: swap;
          src: url('/fonts/inter-bold.woff2') format('woff2');
        }
      \`}</style>
    </>
  );
}
`;
  
  fs.writeFileSync(fontOptimizerPath, fontOptimizerContent);
  console.log(`Created Font Optimizer at ${fontOptimizerPath}`);
}

// Create layout shift prevention component
function createLayoutShiftPreventer() {
  const layoutShiftPreventerPath = path.join(config.componentsDir, 'ui', 'LayoutShiftPreventer.tsx');
  const layoutShiftPreventerDir = path.dirname(layoutShiftPreventerPath);
  
  if (!fs.existsSync(layoutShiftPreventerDir)) {
    fs.mkdirSync(layoutShiftPreventerDir, { recursive: true });
  }
  
  if (fs.existsSync(layoutShiftPreventerPath)) {
    console.log('Layout shift preventer already exists.');
    return;
  }
  
  const layoutShiftPreventerContent = `'use client';

import React, { useEffect, useState } from 'react';

/**
 * LayoutShiftPreventer component to prevent layout shifts
 * by maintaining consistent heights for dynamic content
 */
export function LayoutShiftPreventer({
  children,
  className = '',
  minHeight = 0,
}: {
  children: React.ReactNode;
  className?: string;
  minHeight?: number;
}) {
  const [height, setHeight] = useState<number | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Reference to measure the content
  const ref = React.useRef<HTMLDivElement>(null);
  
  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Measure the content on mount and when children change
  useEffect(() => {
    if (ref.current) {
      const { offsetHeight, offsetWidth } = ref.current;
      setHeight(Math.max(offsetHeight, minHeight));
      setWidth(offsetWidth);
    }
  }, [children, minHeight]);
  
  // If we're on the server or haven't measured yet, render with min-height
  if (!isClient || !height) {
    return (
      <div 
        ref={ref} 
        className={className}
        style={{ minHeight: \`\${minHeight}px\` }}
      >
        {children}
      </div>
    );
  }
  
  // Once measured, render with fixed height
  return (
    <div 
      className={className}
      style={{ height: \`\${height}px\` }}
    >
      {children}
    </div>
  );
}
`;
  
  fs.writeFileSync(layoutShiftPreventerPath, layoutShiftPreventerContent);
  console.log(`Created Layout Shift Preventer at ${layoutShiftPreventerPath}`);
}

// Generate optimization recommendations
function generateRecommendations() {
  const recommendations = {
    lcp: [
      {
        title: 'Optimize LCP Element',
        description: 'Identify and optimize the Largest Contentful Paint element',
        implementation: 'Use priority attribute on the main hero image: `<Image priority ... />`'
      },
      {
        title: 'Preload Critical Resources',
        description: 'Preload critical CSS, fonts, and images',
        implementation: 'Add `<link rel="preload" href="/critical.css" as="style" />` to the head'
      },
      {
        title: 'Optimize Server Response Time',
        description: 'Reduce Time to First Byte (TTFB)',
        implementation: 'Implement caching, use CDN, optimize API responses'
      }
    ],
    fid: [
      {
        title: 'Minimize JavaScript',
        description: 'Reduce JavaScript execution time',
        implementation: 'Split code into chunks, defer non-critical JS'
      },
      {
        title: 'Optimize Event Handlers',
        description: 'Use efficient event handlers',
        implementation: 'Debounce scroll/resize events, use passive event listeners'
      },
      {
        title: 'Web Workers',
        description: 'Move heavy computation to web workers',
        implementation: 'Use `new Worker()` for data processing, calculations'
      }
    ],
    cls: [
      {
        title: 'Set Size Attributes',
        description: 'Always set width and height on images',
        implementation: 'Use `width` and `height` props on all `<Image>` components'
      },
      {
        title: 'Reserve Space for Dynamic Content',
        description: 'Reserve space for content that loads asynchronously',
        implementation: 'Use the LayoutShiftPreventer component'
      },
      {
        title: 'Avoid Layout Shifts from Fonts',
        description: 'Prevent layout shifts from font loading',
        implementation: 'Use `font-display: swap` and preload fonts'
      }
    ]
  };
  
  return recommendations;
}

// Generate a markdown report
function generateReport() {
  const recommendations = generateRecommendations();
  
  let markdown = `# Core Web Vitals Optimization Report\n\n`;
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;
  
  // LCP Recommendations
  markdown += `## Largest Contentful Paint (LCP) Optimizations\n\n`;
  markdown += `LCP measures loading performance. To provide a good user experience, aim for LCP to occur within 2.5 seconds of when the page first starts loading.\n\n`;
  
  recommendations.lcp.forEach((rec, index) => {
    markdown += `### ${index + 1}. ${rec.title}\n\n`;
    markdown += `${rec.description}\n\n`;
    markdown += `**Implementation:**\n\`\`\`\n${rec.implementation}\n\`\`\`\n\n`;
  });
  
  // FID Recommendations
  markdown += `## First Input Delay (FID) Optimizations\n\n`;
  markdown += `FID measures interactivity. To provide a good user experience, aim for an FID of 100 milliseconds or less.\n\n`;
  
  recommendations.fid.forEach((rec, index) => {
    markdown += `### ${index + 1}. ${rec.title}\n\n`;
    markdown += `${rec.description}\n\n`;
    markdown += `**Implementation:**\n\`\`\`\n${rec.implementation}\n\`\`\`\n\n`;
  });
  
  // CLS Recommendations
  markdown += `## Cumulative Layout Shift (CLS) Optimizations\n\n`;
  markdown += `CLS measures visual stability. To provide a good user experience, aim for a CLS score of 0.1 or less.\n\n`;
  
  recommendations.cls.forEach((rec, index) => {
    markdown += `### ${index + 1}. ${rec.title}\n\n`;
    markdown += `${rec.description}\n\n`;
    markdown += `**Implementation:**\n\`\`\`\n${rec.implementation}\n\`\`\`\n\n`;
  });
  
  // Next steps
  markdown += `## Next Steps\n\n`;
  markdown += `1. Implement the Web Vitals tracker to monitor performance\n`;
  markdown += `2. Apply the recommended optimizations\n`;
  markdown += `3. Test with Lighthouse and PageSpeed Insights\n`;
  markdown += `4. Monitor real user metrics with Google Analytics\n\n`;
  
  // Resources
  markdown += `## Resources\n\n`;
  markdown += `- [Web Vitals](https://web.dev/vitals/)\n`;
  markdown += `- [Optimize LCP](https://web.dev/optimize-lcp/)\n`;
  markdown += `- [Optimize FID](https://web.dev/optimize-fid/)\n`;
  markdown += `- [Optimize CLS](https://web.dev/optimize-cls/)\n`;
  
  return markdown;
}

// Main function
function main() {
  console.log('Starting Core Web Vitals optimization...');
  
  if (!checkRequirements()) {
    return;
  }
  
  try {
    // Create optimization components
    createWebVitalsTracker();
    createFontOptimizer();
    createLayoutShiftPreventer();
    
    // Generate report
    const reportContent = generateReport();
    fs.writeFileSync(config.reportPath, reportContent);
    
    console.log(`Optimization complete! Report saved to ${config.reportPath}`);
    console.log('\nNext steps:');
    console.log('1. Add the WebVitalsTracker component to your layout');
    console.log('2. Add the FontOptimizer component to your head');
    console.log('3. Use the LayoutShiftPreventer for dynamic content');
    console.log('4. Review the report for more optimizations');
  } catch (error) {
    console.error('Error optimizing Core Web Vitals:', error);
  }
}

// Run the optimization
main();
