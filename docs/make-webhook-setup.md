# Make.com Webhook Setup for Daily Automation

## Overview
The Global Travel Report uses Make.com webhooks to trigger the daily automation script that processes RSS stories, rewrites them with Gemini AI, adds images, and publishes them.

## Webhook Endpoint
**URL:** `https://globaltravelreport.com/api/webhooks/daily-automation`

**Method:** POST

**Authentication:** Bearer token in Authorization header

## Environment Variables (Set in Vercel)
```env
MAKE_WEBHOOK_SECRET=your_webhook_secret_here
```

## Make.com Scenario Setup

### 1. Create New Scenario
- Go to Make.com dashboard
- Click "Create a new scenario"

### 2. Add Schedule Trigger
- Search for "Schedule" trigger
- Select "Watch Events" → "Every day at specific time"
- Set time to: **10:00 AM AEST** (00:00 UTC)
- Set timezone to: Australia/Brisbane (AEST)

### 3. Add HTTP Request Module
- Search for "HTTP" module
- Select "Make a request"

**Configuration:**
- URL: `https://globaltravelreport.com/api/webhooks/daily-automation`
- Method: POST
- Headers:
  - `Authorization: Bearer {{WEBHOOK_SECRET}}`
  - `Content-Type: application/json`
- Body:
  ```json
  {
    "trigger": "daily_automation",
    "timestamp": "{{now}}"
  }
  ```

### 4. Add Error Handling
- Add "Set Variable" module to store response
- Add router to check response status
- Send email notification on failure

### 5. Test the Webhook
- Run the scenario manually
- Check Vercel function logs for successful execution
- Verify stories appear on the website

## Expected Response
**Success (200):**
```json
{
  "success": true,
  "message": "Global Travel Report Auto-Publisher completed successfully",
  "timestamp": "2025-01-10T00:00:00.000Z",
  "timezone": "AEST (Australian Eastern Standard Time)",
  "triggered_by": "make_webhook"
}
```

**Error (500):**
```json
{
  "error": "Internal server error",
  "message": "Error details",
  "timestamp": "2025-01-10T00:00:00.000Z"
}
```

## Monitoring
- Check Vercel function logs daily
- Monitor website for new published stories
- Verify RSS feed updates
- Check for any error notifications

## Troubleshooting
- **403 Unauthorized:** Check `MAKE_WEBHOOK_SECRET` in Vercel
- **500 Error:** Check Vercel function logs for detailed error
- **No stories published:** Verify RSS feed has new content
- **API failures:** Check Gemini/Unsplash API keys in Vercel