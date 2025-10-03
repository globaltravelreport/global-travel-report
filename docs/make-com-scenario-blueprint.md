# Make.com Scenario Blueprint: Global Travel Report Daily Automation

## Overview
Complete Make.com scenario to automate daily content publishing for Global Travel Report.

**Trigger:** Daily at 10:00 AM AEST (00:00 UTC)
**Runtime:** ~5-10 minutes
**Modules:** 15+ integrated modules

---

## 🔑 Required Credentials (Set in Make.com Data Store)

You'll need to provide these credentials when setting up the scenario:

### API Keys
- `GEMINI_API_KEY` - Google Gemini API key
- `UNSPLASH_ACCESS_KEY` - Unsplash API access key
- `ADMIN_TOKEN` - Website admin authentication token

### Social Media Tokens
- `FACEBOOK_ACCESS_TOKEN` - Facebook Graph API token
- `FACEBOOK_PAGE_ID` - Facebook page ID
- `TWITTER_BEARER_TOKEN` - Twitter API bearer token
- `LINKEDIN_ACCESS_TOKEN` - LinkedIn API access token
- `LINKEDIN_ORG_ID` - LinkedIn organization ID

---

## 📋 Scenario Structure

### 1. Schedule Trigger
**Module:** Schedule (Watch Events)
- **Trigger:** Every day at specific time
- **Time:** 10:00 AM
- **Timezone:** Australia/Brisbane (AEST)
- **Output:** Timestamp for logging

### 2. RSS Feed Parser
**Module:** RSS (Retrieve RSS feed items)
- **URL:** `https://globaltravelreport.com/rss/new`
- **Limit:** 8 items
- **Output:** Array of story objects with title, content, link, pubDate

### 3. Story Filter & Deduplication
**Module:** Iterator (Process each RSS item)
- **Input:** RSS feed items array
- **Filter:** Skip if title or content empty
- **Deduplication:** Check against previously processed stories (use Data Store)

### 4. Gemini AI Content Rewriting
**Module:** HTTP (Make a request)
- **Method:** POST
- **URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- **Headers:**
  ```
  Content-Type: application/json
  x-goog-api-key: {{GEMINI_API_KEY}}
  ```
- **Body:**
  ```json
  {
    "contents": [{
      "parts": [{
        "text": "Rewrite the following travel story in Australian English, in a professional tone, optimised for SEO and social media.\n\nProvide:\n- HEADLINE: [engaging, SEO-optimised title]\n- SUMMARY: [concise 150–200 word summary with key tips and details]\n\nMaintain all facts, locations, names, and relevance.\n\nOriginal Title: {{title}}\nOriginal Content: {{content}}"
      }]
    }],
    "generationConfig": {
      "temperature": 0.7,
      "maxOutputTokens": 1000
    }
  }
  ```
- **Output:** Extract HEADLINE and SUMMARY from response

### 5. Category Classification
**Module:** Router (Route based on content analysis)
- **Routes:**
  - Cruise: If content contains "cruise"
  - Flight: If content contains "flight", "airport", or "airline"
  - New Zealand: If content contains "new zealand"
  - Europe: If content contains "europe", "france", or "italy"
  - Travel News: Default route

### 6. Unsplash Image Search
**Module:** HTTP (Make a request)
- **Method:** GET
- **URL:** `https://api.unsplash.com/search/photos`
- **Query Parameters:**
  ```
  query: {{headline}} {{summary}} (first 100 chars)
  orientation: landscape
  per_page: 1
  ```
- **Headers:**
  ```
  Authorization: Client-ID {{UNSPLASH_ACCESS_KEY}}
  ```
- **Output:** Extract image URL and photographer name

### 7. Website Content Publishing
**Module:** HTTP (Make a request)
- **Method:** POST
- **URL:** `https://globaltravelreport.com/api/admin/ingest-content`
- **Headers:**
  ```
  Authorization: Bearer {{ADMIN_TOKEN}}
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "title": "{{HEADLINE}}",
    "content": "{{SUMMARY}}",
    "imageUrl": "{{image_url}}",
    "photographer": "{{photographer_name}}",
    "category": "{{category}}",
    "tags": ["travel", "automated"],
    "publish": true
  }
  ```

### 8. Facebook Page Posting
**Module:** HTTP (Make a request)
- **Method:** POST
- **URL:** `https://graph.facebook.com/v18.0/{{FACEBOOK_PAGE_ID}}/feed`
- **Query Parameters:**
  ```
  access_token: {{FACEBOOK_ACCESS_TOKEN}}
  message: {{HEADLINE}}

  {{SUMMARY}} (first 200 chars)...

  #GlobalTravelReport #Travel #{{category}}
  link: {{original_link}}
  ```

### 9. Twitter (X) Posting
**Module:** HTTP (Make a request)
- **Method:** POST
- **URL:** `https://api.twitter.com/2/tweets`
- **Headers:**
  ```
  Authorization: Bearer {{TWITTER_BEARER_TOKEN}}
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "text": "{{HEADLINE}}\n\n{{SUMMARY}} (first 150 chars)...\n\n#GlobalTravelReport #Travel #{{category}}\n\n{{original_link}}"
  }
  ```

### 10. LinkedIn Company Page Posting
**Module:** HTTP (Make a request)
- **Method:** POST
- **URL:** `https://api.linkedin.com/v2/ugcPosts`
- **Headers:**
  ```
  Authorization: Bearer {{LINKEDIN_ACCESS_TOKEN}}
  Content-Type: application/json
  X-Restli-Protocol-Version: 2.0.0
  ```
- **Body:**
  ```json
  {
    "author": "urn:li:organization:{{LINKEDIN_ORG_ID}}",
    "lifecycleState": "PUBLISHED",
    "specificContent": {
      "com.linkedin.ugc.ShareContent": {
        "shareCommentary": {
          "text": "{{HEADLINE}}\n\n{{SUMMARY}} (first 200 chars)...\n\n#TravelIndustry #Tourism #{{category}}"
        },
        "shareMediaCategory": "NONE"
      }
    },
    "visibility": {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
  }
  ```

### 11. RSS Feed Update
**Module:** HTTP (Make a request)
- **Method:** POST
- **URL:** `https://globaltravelreport.com/api/rss/update`
- **Headers:**
  ```
  Authorization: Bearer {{ADMIN_TOKEN}}
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "title": "{{HEADLINE}}",
    "description": "{{SUMMARY}}",
    "link": "https://globaltravelreport.com/stories/{{slug}}",
    "image": "{{image_url}}",
    "pubDate": "{{original_pubDate}}",
    "category": "{{category}}"
  }
  ```

### 12. Success Logging & Notifications
**Module:** Data Store (Add/Replace record)
- Store processed story IDs to prevent duplicates
- Log successful publications

### 13. Error Handling Router
**Module:** Error Handler (Handle errors)
- **Routes:**
  - API failures → Send email alert
  - Authentication errors → Log and retry
  - Content issues → Skip and continue
  - Rate limits → Wait and retry

### 14. Email Notifications
**Module:** Email (Send email)
- **Trigger:** On errors or completion
- **Recipients:** Admin email
- **Subject:** "Daily Automation Report - {{date}}"
- **Body:** Summary of processed stories, any errors, social media post links

---

## 🔄 Data Flow

```
Schedule Trigger → RSS Parser → Iterator → Gemini AI → Category Router → Unsplash → Website API → Social Media APIs → RSS Update → Logging
```

## ⚙️ Configuration Settings

### Scenario Settings
- **Name:** Global Travel Report Daily Publisher
- **Timezone:** Australia/Brisbane
- **Max Runtime:** 10 minutes
- **Error Handling:** Continue on error

### Data Store Schema
**Table:** processed_stories
- story_id (string, unique)
- title (string)
- processed_date (datetime)
- category (string)
- social_links (object)

### Variables
- `processed_count`: Running count of successful publications
- `error_log`: Array of errors encountered
- `social_stats`: Object tracking social media post IDs

---

## 🧪 Testing Checklist

### Pre-Production Tests
- [ ] RSS feed returns valid stories
- [ ] Gemini API responds correctly
- [ ] Unsplash returns images
- [ ] Website API accepts posts
- [ ] Social media APIs work (test tokens)
- [ ] Error handling triggers notifications

### Production Validation
- [ ] Stories appear on website within 5 minutes
- [ ] Social media posts are published
- [ ] RSS feed updates correctly
- [ ] No duplicate stories
- [ ] Original dates preserved
- [ ] Email notifications sent

---

## 🚨 Error Handling

### API Failures
- **Gemini timeout:** Use fallback summary (original content truncated)
- **Unsplash rate limit:** Skip image, use default
- **Social API errors:** Log but continue (don't fail entire process)
- **Website API down:** Retry 3 times, then alert

### Data Issues
- **Empty RSS feed:** Log and exit gracefully
- **Malformed content:** Skip story, continue with others
- **Duplicate detection:** Check Data Store before processing

### Rate Limiting
- **Gemini:** 60 requests/minute → Add delays between calls
- **Unsplash:** 50 requests/hour → Monitor usage
- **Social APIs:** Respect rate limits with exponential backoff

---

## 📊 Monitoring & Analytics

### Success Metrics
- Stories processed per day
- Social media engagement rates
- Website traffic from automated content
- Error rates and types

### Alerts
- Daily summary email
- Critical failures (website down, all APIs failing)
- Rate limit warnings
- Content quality issues

---

## 🔧 Maintenance

### Weekly Tasks
- Review error logs
- Update API tokens if expired
- Monitor social media posting success rates
- Clean up old Data Store records

### Monthly Tasks
- Review content quality and engagement
- Update category classification rules if needed
- Optimize API call patterns
- Update social media posting formats

---

This blueprint provides everything needed to build the complete Make.com scenario. Each module is configured with exact URLs, headers, and payloads for seamless automation.