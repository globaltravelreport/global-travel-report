# Automated Story Generation System

This document explains how the automated story generation system works in Global Travel Report. The system automatically fetches stories from RSS feeds, rewrites them using OpenAI, adds images from Unsplash, and publishes them to the website.

## Overview

The automated story generation system consists of several components:

1. **RSS Feed Service**: Fetches stories from various travel-related RSS feeds
2. **OpenAI Service**: Rewrites the stories to make them unique and engaging
3. **Unsplash Service**: Adds high-quality images to the stories
4. **Story Processor Service**: Orchestrates the entire process
5. **Cron Job**: Triggers the process daily at 2 PM Sydney time

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your Vercel project:

```
OPENAI_API_KEY=your_openai_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
CRON_SECRET_KEY=your_cron_secret_key
```

You can generate a random CRON_SECRET_KEY using the setup script.

### 2. Set Up Vercel Cron Job

Run the setup script to create a Vercel cron job:

```bash
npm run setup-cron
```

This script will:
- Generate a random secret key for the cron job
- Create a cron job that runs daily at 2 PM Sydney time
- Print instructions for adding the secret key to your Vercel environment variables

### 3. Deploy to Vercel

Deploy your project to Vercel:

```bash
vercel --prod
```

## Testing

You can manually trigger the story processing to test it:

```bash
# Test locally
npm run trigger-stories

# Test on production
npm run trigger-stories:prod

# Specify the number of stories to process
npm run trigger-stories -- --count=5 --cruise-count=1
```

## Customization

### RSS Feeds

You can customize the RSS feeds in `src/services/rssFeedService.ts`:

```typescript
// Initialize with default feed URLs
this.feedUrls = [
  'https://www.travelandleisure.com/feed/all',
  // Add or remove feeds here
];

// Cruise-specific feeds
this.cruiseFeedUrls = [
  'https://www.cruisecritic.com/news/feed/',
  // Add or remove cruise feeds here
];
```

### OpenAI Settings

You can customize the OpenAI settings in `src/services/openaiService.ts`:

```typescript
this.model = process.env.OPENAI_MODEL || 'gpt-4o';
this.maxTokens = 2000;
this.temperature = 0.7;
```

### Unsplash Settings

You can customize the Unsplash settings in `src/services/unsplashService.ts`:

```typescript
// Build a search query based on the story
let query = `${story.country} ${story.category}`;

// Add more specific terms for better results
if (story.category === 'Cruises') {
  query += ' cruise ship ocean';
}
// Customize search queries for other categories
```

## Troubleshooting

### Rate Limits

The system respects API rate limits for both OpenAI and Unsplash. If you hit rate limits, you can:

1. Reduce the number of stories processed daily
2. Upgrade to higher tier API plans
3. Implement more aggressive caching

### Error Handling

The system includes robust error handling:

- If story rewriting fails, the original story is used
- If image fetching fails, the story is published without an image
- Processing stats are logged for debugging

### Logs

Check the Vercel logs for detailed information about the story processing:

1. Go to your Vercel dashboard
2. Select your project
3. Click on "Functions" or "Logs"
4. Look for logs from the `/api/cron/dailyStories` endpoint

## Architecture

The system is designed to be compatible with Vercel's Edge Runtime:

- Uses native fetch API instead of Node.js specific modules
- Avoids file system operations
- Uses DOMParser for XML parsing
- Implements proper error handling and retries

## Security

The cron endpoint is protected by a secret key to prevent unauthorized access. Make sure to:

1. Keep your CRON_SECRET_KEY secure
2. Don't expose your API keys in client-side code
3. Monitor your API usage for unusual patterns

## Future Improvements

Potential improvements to consider:

1. Add more diverse RSS feed sources
2. Implement more sophisticated content filtering
3. Add category-specific rewriting instructions
4. Improve image selection based on story content
5. Add social media auto-posting
