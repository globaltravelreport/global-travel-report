# Performance Optimization Guide

## Overview

This guide outlines the comprehensive performance optimization strategy for the Global Travel Report website. The goal is to improve Core Web Vitals, reduce loading times, and enhance the overall user experience.

## Key Performance Metrics

- **Largest Contentful Paint (LCP)**: Target < 2.5 seconds
- **First Input Delay (FID)**: Target < 100ms
- **Cumulative Layout Shift (CLS)**: Target < 0.1
- **Time to Interactive (TTI)**: Target < 3.5 seconds
- **Total Blocking Time (TBT)**: Target < 200ms

## Optimization Areas

### 1. Image Optimization

Images often account for the largest portion of page weight. Our optimization strategy includes:

- **Next.js Image Component**: Using the built-in `<Image>` component for automatic optimization
- **WebP Format**: Converting images to WebP for better compression
- **Responsive Images**: Serving different image sizes based on device
- **Lazy Loading**: Loading images only when they enter the viewport
- **Image Dimensions**: Always specifying width and height to prevent layout shifts

**Implementation**:
- Use the `<OptimizedImage>` component for all images
- Run `node scripts/optimize-images.js` to convert existing images to WebP
- Run `node scripts/analyze-image-usage.js` to identify optimization opportunities

### 2. JavaScript Optimization

Reducing JavaScript size and execution time is crucial for performance:

- **Code Splitting**: Breaking the bundle into smaller chunks
- **Tree Shaking**: Removing unused code
- **Lazy Loading**: Loading components only when needed
- **Dependency Optimization**: Replacing heavy libraries with lighter alternatives
- **Script Loading Strategy**: Using `defer` and `async` attributes appropriately

**Implementation**:
- Run `node scripts/analyze-bundles.js` to identify large dependencies
- Use dynamic imports for route-based code splitting
- Implement lazy loading for below-the-fold components

### 3. Core Web Vitals Optimization

Specific optimizations for Core Web Vitals:

- **LCP Optimization**: Prioritizing the loading of the largest content element
- **FID Optimization**: Minimizing main thread blocking
- **CLS Optimization**: Preventing unexpected layout shifts

**Implementation**:
- Run `node scripts/optimize-web-vitals.js` to implement optimizations
- Add the `<WebVitalsTracker>` component to monitor performance
- Use the `<LayoutShiftPreventer>` for dynamic content

### 4. Caching Strategy

Effective caching reduces server load and improves repeat visit performance:

- **Browser Caching**: Setting appropriate Cache-Control headers
- **Service Worker**: Implementing offline support and caching strategies
- **CDN Caching**: Leveraging Vercel's global CDN

**Implementation**:
- Run `node scripts/setup-caching.js` to implement caching
- Review the caching documentation at `docs/CACHING_STRATEGY.md`

## Running All Optimizations

To run all performance optimizations at once:

```bash
node scripts/run-performance-optimization.js
```

This script will:
1. Set up image optimization
2. Analyze image usage
3. Analyze JavaScript bundles
4. Optimize Core Web Vitals
5. Set up caching strategy

## Measuring Performance

### Tools for Measurement

- **Lighthouse**: Run in Chrome DevTools for overall performance score
- **PageSpeed Insights**: For field data and lab data
- **Web Vitals Report**: Using the `<WebVitalsTracker>` component
- **Chrome DevTools Performance Panel**: For detailed performance analysis

### Continuous Monitoring

- Monitor Core Web Vitals in Google Search Console
- Set up alerts for performance regressions
- Regularly run Lighthouse audits

## Best Practices

1. **Optimize Images Before Upload**: Compress and resize images before adding them to the project
2. **Minimize Third-Party Scripts**: Each additional script impacts performance
3. **Prioritize Above-the-Fold Content**: Ensure critical content loads first
4. **Avoid Layout Shifts**: Always specify dimensions for images and dynamic content
5. **Regular Audits**: Continuously monitor and improve performance

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Image Optimization in Next.js](https://nextjs.org/docs/basic-features/image-optimization)
- [JavaScript Performance](https://web.dev/fast/#optimize-your-javascript)
- [Caching Best Practices](https://web.dev/http-cache/)

## Troubleshooting

If you encounter issues with the optimization scripts:

1. Check the logs in the `logs` directory
2. Ensure all dependencies are installed
3. Run scripts individually to isolate issues
4. Check for errors in the browser console

For specific issues, refer to the individual documentation for each optimization area.
