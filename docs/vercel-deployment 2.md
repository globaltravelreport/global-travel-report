# Vercel Production Runbook — GlobalTravelReport

This runbook details the environment, build, caching/ISR, images, and monitoring setup for deploying GlobalTravelReport.com to Vercel.

1) Environment Variables (Vercel Project Settings → Environment Variables)
- NEXT_PUBLIC_BASE_URL
  - e.g. https://www.globaltravelreport.com
- NEXT_PUBLIC_SITE_URL
  - e.g. https://www.globaltravelreport.com
- NEXT_PUBLIC_GA_ID
  - GA4 measurement ID (G-XXXXXXX)
- FACEBOOK_APP_ID
  - Used by [FacebookMetaTags](src/components/social/FacebookMetaTags.tsx:14)
- GOOGLE_SITE_VERIFICATION (optional)
  - [RootLayout metadata.verification](app/layout.tsx:63)
- YANDEX_VERIFICATION / YAHOO_VERIFICATION (optional)
  - [RootLayout metadata.verification](app/layout.tsx:63)
- OPENAI_API_KEY (if used by editorial tooling)
- KV / DB keys (if you later enable persistence)
- NEXT_PUBLIC_ENABLE_AI_ASSISTANT (optional) 
  - Set "true" to render experimental AI assistant in production; omit/false for prod off
  - Mounted via [AITravelAssistantMount](src/components/experimental/AITravelAssistantMount.tsx:1) and added in [RootLayout](app/layout.tsx:8)

2) Build & Start Commands
- Build: next build
- Start: next start
  - Package scripts already configured:
    - dev/build/start in [package.json](package.json:6)
- For Lighthouse CI (local/CI runners), configuration file: [.lighthouserc.json](.lighthouserc.json:1)

3) Static Assets & Image Optimization
- Prefer WebP where feasible. 
- Convert legacy public/ JPG to WebP with:
  - node scripts/convert-public-jpg-to-webp.js
  - Script is idempotent and keeps JPG fallback: [convert-public-jpg-to-webp.js](scripts/convert-public-jpg-to-webp.js:1)
- Unsplash assets auto-tuned to WebP and compressed by:
  - [OptimizedImage.optimizeUnsplashUrl()](components/OptimizedImage.tsx:51) and [OptimizedImageV2](src/components/ui/OptimizedImageV2.tsx:43)
- For responsive hero/cover images on stories: [ResponsiveImage usage](app/stories/[slug]/page.tsx:270)

4) Caching, ISR, and Revalidation
- Story revalidation (Next ISR) is configured at route-level:
  - [app/stories/[slug]/page.tsx](app/stories/[slug]/page.tsx:31) sets export const revalidate = 3600
- Revalidate API exists: [app/api/revalidate/route.ts](app/api/revalidate/route.ts:1) (ensure secret if used in automation scripts)
- Additional scripts reference revalidation for bulk refresh (optional/adjust as needed)

5) Routing, SEO & Sitemaps
- Default metadata in layout: [RootLayout.metadata](app/layout.tsx:12)
- Dynamic story metadata: [generateMetadata()](app/stories/[slug]/page.tsx:33)
- Robots and sitemap:
  - [robots.ts](app/robots.ts:1)
  - [sitemap.ts](app/sitemap.ts:1)
  - [server-sitemap.xml route](app/server-sitemap.xml/route.ts:1)
- OpenGraph/Twitter tags:
  - [FacebookMetaTags](src/components/social/FacebookMetaTags.tsx:14)
  - [EnhancedOpenGraph](src/components/social/EnhancedOpenGraph.tsx:138)
  - [StructuredData](src/components/seo/StructuredData.tsx:20)

6) Accessibility & Web Vitals
- Accessibility Provider mounted globally:
  - [AccessibilityProvider / SkipToContent](app/layout.tsx:8), wrapper usage at [RootLayout body](app/layout.tsx:148)
- Web Vitals tracker mounted in layout:
  - [WebVitalsTracker](app/layout.tsx:8) and appended at [RootLayout body end](app/layout.tsx:156)
  - Reports via [reportWebVitals()](src/utils/web-vitals.ts:123) and local storage helpers

7) Social Automation & RSS
- RSS endpoint (connect to Buffer/Publer/dlvr.it):
  - [RSS route](app/api/feed/rss/route.ts:1)
  - Production URL: https://www.globaltravelreport.com/api/feed/rss
- Post template guidance:
  - [docs/social-templates.md](docs/social-templates.md:1)

8) Deployment Checks (pre-flight)
- Run image conversion (optional): node scripts/convert-public-jpg-to-webp.js
- Build locally: npm run build
- Lighthouse (optional, local):
  - npx lhci autorun --config=.lighthouserc.json (install lhci or run on CI)
- Verify SEO/OG cards on a sample story:
  - [StoryPage](app/stories/[slug]/page.tsx:132)
- Smoke test pages:
  - /, /destinations, /categories, /stories/[slug], /search

9) Observability
- Google Analytics activated via NEXT_PUBLIC_GA_ID in:
  - [GoogleAnalytics](src/components/analytics/GoogleAnalytics.tsx:5)
- Console logs for Web Vitals locally; storage helpers in [src/utils/web-vitals.ts](src/utils/web-vitals.ts:123)

10) Production Flags & Experimental
- AI assistant (staging/dev by default):
  - [AITravelAssistantMount](src/components/experimental/AITravelAssistantMount.tsx:1) loaded in [RootLayout](app/layout.tsx:8)
  - Toggle with NEXT_PUBLIC_ENABLE_AI_ASSISTANT
- Future components scaffolded:
  - Eco Tags filter: [EcoTags](src/components/filters/EcoTags.tsx:1)
  - 360° viewer placeholder: [components/experimental/360Viewer.tsx](components/experimental/360Viewer.tsx:1)
