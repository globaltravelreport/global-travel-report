# Social Automation Templates and Setup

This document describes how to hook GlobalTravelReport.com to social scheduling tools and recommended post templates per platform.

## 1) Connect RSS to Buffer / Publer / dlvr.it

- RSS endpoint: [/api/feed/rss](app/api/feed/rss/route.ts)
  - Full URL in production: https://www.globaltravelreport.com/api/feed/rss

Steps (example: Buffer)
1. Create a Buffer account and connect your brand profiles (Facebook Page, LinkedIn Company Page, X/Twitter).
2. In Buffer, add an RSS source and paste the RSS endpoint above.
3. Set auto-post options (immediate posting or add to queue).
4. Configure UTM parameters in Buffer if available (Source: buffer, Medium: social, Campaign: auto-rss).

Notes
- The in-site share widgets already append UTM on tracked flows: [EnhancedSocialShare](src/components/social/EnhancedSocialShare.tsx:107).
- For more granular templates, schedule posts via CSV import or manual templates below.

## 2) Post Templates

Use these templates in Buffer/Publer as defaults. Curly braces indicate variables to be substituted by the scheduler or your workflow.

Facebook (max reach + link)
- {title}
- {excerpt}
- Read more: {url}
- #Travel #GlobalTravelReport {hash_tags}

LinkedIn (professional tone)
- {title}
- {excerpt}
- Full story: {url}
- #Travel #Destinations #Airlines #Cruises #GlobalTravelReport

X / Twitter (succinct)
- {title} — {short_excerpt}
- {url} {hash_tags}

Pinterest (visual-first)
- Pin Title: {title}
- Pin Description: {excerpt} {hash_tags}
- Destination Link: {url}
- Image: Prefer 2:3 ratio thumbnails (use the story image or a dedicated Pinterest graphic)

Instagram (with Link-in-bio or Stories)
- Caption:
  - {title}
  - {excerpt}
  - More in bio: globaltravelreport.com
  - #Travel #Wanderlust #GlobalTravelReport {hash_tags}
- Image/Video: Use the story hero or an editorial image sized for IG
- Optional: Schedule IG Story with “Swipe Up” if available; link the story URL

## 3) Hashtags

Suggested base tags
- #Travel #Wanderlust #Destinations #Adventure #GlobalTravelReport #TravelTips #Cruises #Airlines #SustainableTravel

Contextual expansion
- Pull 2–4 keywords from story tags to include (e.g., #Japan #Maldives #BudgetTravel #Luxury)

## 4) Bulk Scheduling

Option A: Use the in-app SocialAutomation (staging / internal use)
- Component: [SocialAutomation](src/components/social/SocialAutomation.tsx:244)
- Hook: [useSocialAutomation()](src/components/social/SocialAutomation.tsx:36)
- This simulates scheduling and analytics; use external platforms for real publishing.

Option B: Scheduler CSV import
- Export recent stories with: title, excerpt, url, publish_at, platform(s)
- Import to Buffer/Publer/dlvr.it per their CSV template

## 5) Image Guidance

- Prefer WebP when possible
- Use 1200x630 for link previews (OpenGraph)
- Pinterest prefers vertical (2:3) images

## 6) QA

- Verify OG/Twitter cards with:
  - Facebook Sharing Debugger
  - Twitter Card Validator
- Ensure live URLs render expected title/description/image