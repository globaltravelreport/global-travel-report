# Global Travel Report - Make.com Daily Automation

Complete automated content publishing system for Global Travel Report using Make.com.

## 🎯 Overview

This system automatically:
- Fetches up to 8 stories daily from RSS feed
- Rewrites content using Google Gemini AI in Australian English
- Finds relevant landscape images via Unsplash
- Categorizes content (Cruise, Flight, New Zealand, Europe, Travel News)
- Publishes to website, Facebook, Twitter, and LinkedIn
- Updates RSS feed while preserving original dates
- Runs daily at 10:00 AM AEST

## 📁 Files Included

### Core Automation
- `automation/dailyAutoPublisher.mjs` - Main automation script (alternative to Make.com)
- `app/api/webhooks/daily-automation/route.ts` - Webhook endpoint for Make.com

### Make.com Integration
- `make-scenario-export.json` - Complete scenario configuration for import
- `docs/make-com-scenario-blueprint.md` - Detailed setup instructions
- `docs/make-webhook-setup.md` - Alternative webhook-only setup
- `scripts/setup-make-automation.sh` - Interactive setup and testing script

### Documentation
- `docs/full-audit-20250110.md` - Complete codebase audit
- `docs/production-readiness-audit-20250107.md` - Production readiness assessment

## 🚀 Quick Start

### Option 1: Use Make.com (Recommended)

1. **Run setup script:**
   ```bash
   ./scripts/setup-make-automation.sh
   ```
   This will prompt for all API credentials and test them.

2. **Import scenario:**
   - Go to Make.com → Create Scenario → Import from JSON
   - Upload `make-scenario-export.json`
   - Add your credentials to Data Store

3. **Configure schedule:**
   - Set trigger to run daily at 10:00 AM AEST
   - Test with one story first

### Option 2: Use Direct Webhook

1. **Set environment variables in Vercel:**
   ```env
   MAKE_WEBHOOK_SECRET=your_webhook_secret
   ```

2. **Configure Make.com webhook:**
   - POST to: `https://globaltravelreport.com/api/webhooks/daily-automation`
   - Authorization: `Bearer {MAKE_WEBHOOK_SECRET}`
   - Payload: `{"trigger": "daily_automation"}`

3. **Schedule daily trigger in Make.com**

## 🔑 Required API Credentials

### Core APIs
- **GEMINI_API_KEY** - Google Gemini API key
- **UNSPLASH_ACCESS_KEY** - Unsplash API access key
- **ADMIN_TOKEN** - Website admin authentication token

### Social Media APIs
- **FACEBOOK_ACCESS_TOKEN** - Facebook Graph API token
- **FACEBOOK_PAGE_ID** - Facebook page ID to post to
- **TWITTER_BEARER_TOKEN** - Twitter API bearer token
- **LINKEDIN_ACCESS_TOKEN** - LinkedIn API access token
- **LINKEDIN_ORG_ID** - LinkedIn organization ID

### Webhook Security
- **MAKE_WEBHOOK_SECRET** - Secret for webhook authentication

## 🏗️ Make.com Scenario Architecture

```
Schedule Trigger → RSS Parser → Story Iterator → Gemini AI → Category Router → Unsplash → Parallel Publishing → RSS Update → Notifications
```

### Key Modules:
1. **Schedule Trigger** - Daily at 10:00 AM AEST
2. **RSS Parser** - Fetches from `/rss/new`, limits to 8 items
3. **Iterator** - Processes each story individually
4. **Gemini AI** - Rewrites content with HEADLINE/SUMMARY format
5. **Category Router** - Classifies by keywords
6. **Unsplash** - Finds landscape images
7. **Parallel Publishing** - Website + Social Media APIs
8. **RSS Update** - Maintains original publication dates
9. **Error Handling** - Comprehensive failure management
10. **Email Notifications** - Daily completion reports

## 🧪 Testing & Validation

### Pre-Production Testing
```bash
# Run the setup script to test all APIs
./scripts/setup-make-automation.sh
```

### Manual Testing
1. **RSS Feed:** Verify `https://globaltravelreport.com/rss/new` returns valid stories
2. **Gemini API:** Test content rewriting with sample story
3. **Unsplash:** Confirm image search returns landscape photos
4. **Website API:** Test content publishing endpoint
5. **Social APIs:** Validate posting permissions

### Production Validation
- Stories appear on website within 5 minutes
- Social media posts publish correctly
- RSS feed updates with preserved dates
- Email notifications sent daily
- No duplicate content published

## ⚙️ Configuration Options

### Content Limits
- **Max Stories:** 8 per day (configurable in RSS parser)
- **Image Orientation:** Landscape only
- **Content Length:** Headlines + 150-200 word summaries

### Error Handling
- **API Failures:** Continue with next story, log errors
- **Rate Limits:** Built-in delays and retry logic
- **Missing Data:** Graceful fallbacks (skip images, use defaults)
- **Authentication:** Comprehensive token validation

### Scheduling
- **Frequency:** Daily
- **Time:** 10:00 AM AEST (00:00 UTC)
- **Timezone:** Australia/Brisbane
- **Duration:** ~5-10 minutes

## 📊 Monitoring & Maintenance

### Daily Monitoring
- Check email notifications for completion status
- Verify stories published on website
- Confirm social media posts
- Review error logs in Make.com

### Weekly Maintenance
- Update API tokens if expired
- Review content quality and engagement
- Monitor API rate limit usage
- Clean up old scenario run data

### Monthly Reviews
- Analyze publishing performance metrics
- Update category classification rules
- Optimize API call patterns
- Review social media engagement rates

## 🚨 Troubleshooting

### Common Issues

**RSS Feed Empty:**
- Check if source feed has new content
- Verify feed URL is accessible

**Gemini API Errors:**
- Validate API key and quota
- Check content length limits

**Social Media Failures:**
- Refresh API tokens
- Verify page/organization permissions
- Check rate limits

**Website Publishing Issues:**
- Confirm ADMIN_TOKEN is valid
- Check API endpoint availability

### Error Recovery
- **Automatic:** Most errors are handled gracefully
- **Manual:** Failed stories can be reprocessed individually
- **Notifications:** All failures trigger email alerts

## 🔒 Security Considerations

- All API keys stored securely in Make.com Data Store
- Bearer token authentication for webhooks
- No sensitive data logged in scenario runs
- Regular token rotation recommended
- Rate limiting and error handling prevent abuse

## 📈 Performance Optimization

- **Parallel Processing:** Social media posts run simultaneously
- **Rate Limiting:** Built-in delays prevent API throttling
- **Caching:** Story deduplication prevents reprocessing
- **Error Isolation:** Individual story failures don't stop the batch

## 🎯 Success Metrics

- **Stories Published:** 8 per day (target)
- **Social Reach:** Posts to 3+ platforms per story
- **Engagement:** Track likes, shares, comments
- **SEO Impact:** Improved search rankings from fresh content
- **Automation Uptime:** 99%+ successful runs

---

## 📞 Support

For issues with:
- **Make.com setup:** Refer to `docs/make-com-scenario-blueprint.md`
- **API integrations:** Check `scripts/setup-make-automation.sh` test results
- **Content quality:** Review Gemini prompt and category rules
- **Performance:** Monitor scenario run times and error rates

The system is designed for reliability, scalability, and easy maintenance. All components include comprehensive error handling and logging for production use.