/**
 * Global Travel Report — Social Media Poster
 *
 * Posts recent live stories to configured platforms.
 *
 * Usage:
 *   node scripts/social-media-poster.js --test
 *   node scripts/social-media-poster.js --post-all
 *   node scripts/social-media-poster.js --story=slug-or-path
 *
 * Platforms (only if env keys are present):
 *   Twitter/X, Facebook Page, LinkedIn, Tumblr
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');
const tumblr = require('tumblr.js');

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com').replace(/\/$/, '');
const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'social-media-poster.log');
const STATE_FILE = path.join(LOG_DIR, 'social-posted-slugs.json');
const MAX_DEFAULT = Math.max(1, Math.min(Number.parseInt(process.env.SOCIAL_MAX_STORIES || '5', 10), 20));
const LOOKBACK_HOURS = Math.max(6, Math.min(Number.parseInt(process.env.SOCIAL_LOOKBACK_HOURS || '36', 10), 168));

const stats = {
  storiesProcessed: 0,
  postsCreated: { twitter: 0, facebook: 0, linkedin: 0, tumblr: 0 },
  errors: { twitter: 0, facebook: 0, linkedin: 0, tumblr: 0 }
};

function getArgValue(args, name) {
  const match = args.find((arg) => arg.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

async function logToFile(message) {
  await fs.mkdir(LOG_DIR, { recursive: true });
  await fs.appendFile(LOG_FILE, `${new Date().toISOString()} ${message}\n`);
}

async function loadPostedState() {
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed.slugs) ? parsed.slugs : []);
  } catch {
    return new Set();
  }
}

async function savePostedState(slugs) {
  await fs.mkdir(LOG_DIR, { recursive: true });
  await fs.writeFile(STATE_FILE, JSON.stringify({ slugs: [...slugs], updatedAt: new Date().toISOString() }, null, 2));
}

function validateEnvironment() {
  const available = [];
  if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET && process.env.TWITTER_ACCESS_TOKEN && process.env.TWITTER_ACCESS_SECRET) {
    available.push('twitter');
  }
  if (process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_ACCESS_TOKEN) {
    available.push('facebook');
  }
  if (process.env.LINKEDIN_ACCESS_TOKEN) {
    available.push('linkedin');
  }
  const tumblrKey = process.env.TUMBLR_API_KEY || process.env.TUMBLR_CONSUMER_KEY;
  const tumblrSecret = process.env.TUMBLR_CONSUMER_SECRET;
  const tumblrToken = process.env.TUMBLR_ACCESS_TOKEN || process.env.TUMBLR_OAUTH_TOKEN;
  const tumblrTokenSecret = process.env.TUMBLR_ACCESS_TOKEN_SECRET || process.env.TUMBLR_OAUTH_TOKEN_SECRET;
  if (tumblrKey && tumblrSecret && tumblrToken && tumblrTokenSecret) {
    available.push('tumblr');
  }

  if (available.length === 0) {
    console.warn('⚠️ No social API credentials found. --test will still list candidate stories.');
  } else {
    console.log(`✅ Platforms ready: ${available.join(', ')}`);
  }
  return available;
}

function initializeApiClients() {
  const clients = {};

  if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET && process.env.TWITTER_ACCESS_TOKEN && process.env.TWITTER_ACCESS_SECRET) {
    clients.twitter = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET
    });
  }

  if (process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_ACCESS_TOKEN) {
    clients.facebook = {
      pageId: process.env.FACEBOOK_PAGE_ID,
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN
    };
  }

  if (process.env.LINKEDIN_ACCESS_TOKEN) {
    clients.linkedin = {
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
      personUrn: process.env.LINKEDIN_PERSON_ID ? `urn:li:person:${process.env.LINKEDIN_PERSON_ID}` : null,
      organizationUrn: process.env.LINKEDIN_ORGANIZATION_ID ? `urn:li:organization:${process.env.LINKEDIN_ORGANIZATION_ID}` : null
    };
  }

  const tumblrKey = process.env.TUMBLR_API_KEY || process.env.TUMBLR_CONSUMER_KEY;
  const tumblrSecret = process.env.TUMBLR_CONSUMER_SECRET;
  const tumblrToken = process.env.TUMBLR_ACCESS_TOKEN || process.env.TUMBLR_OAUTH_TOKEN;
  const tumblrTokenSecret = process.env.TUMBLR_ACCESS_TOKEN_SECRET || process.env.TUMBLR_OAUTH_TOKEN_SECRET;
  if (tumblrKey && tumblrSecret && tumblrToken && tumblrTokenSecret) {
    clients.tumblr = {
      client: tumblr.createClient({
        consumer_key: tumblrKey,
        consumer_secret: tumblrSecret,
        token: tumblrToken,
        token_secret: tumblrTokenSecret
      }),
      blogName: process.env.TUMBLR_BLOG_NAME || 'globaltravelreport'
    };
  }

  return clients;
}

function buildHashtags(story) {
  const tags = Array.isArray(story.tags) ? story.tags : [];
  const hashtags = tags
    .map((tag) => String(tag).toLowerCase().replace(/[^a-z0-9]+/g, ''))
    .filter(Boolean);
  if (!hashtags.includes('travel')) hashtags.unshift('travel');
  return hashtags.slice(0, 5);
}

function buildShareText(story, maxLen = 240) {
  const url = `${SITE_URL}/stories/${story.slug}`;
  const tags = buildHashtags(story).map((t) => `#${t}`).join(' ');
  const base = `${story.title}\n\n${url}`;
  const withTags = `${base}\n\n${tags}`.trim();
  if (withTags.length <= maxLen) return withTags;
  if (base.length <= maxLen) return base;
  const clipped = `${story.title}`.slice(0, Math.max(40, maxLen - url.length - 5));
  return `${clipped}…\n${url}`;
}

async function fetchLiveStories(limit = 20) {
  const response = await axios.get(`${SITE_URL}/api/stories`, {
    params: { limit, page: 1 },
    timeout: 20000,
    headers: { 'User-Agent': 'GlobalTravelReport-SocialPoster/1.0' }
  });
  if (!response.data?.success || !Array.isArray(response.data.stories)) {
    throw new Error('Unexpected /api/stories response');
  }
  return response.data.stories;
}

async function getRecentStories(postAll) {
  const posted = await loadPostedState();
  const stories = await fetchLiveStories(postAll ? 40 : Math.max(MAX_DEFAULT * 2, 10));
  const cutoff = Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000;

  const candidates = stories.filter((story) => {
    if (!story?.slug || !story?.title) return false;
    if (posted.has(story.slug)) return false;
    const published = new Date(story.publishedAt || story.date || 0).getTime();
    if (!Number.isFinite(published) || published < cutoff) return false;
    return true;
  });

  const selected = postAll ? candidates : candidates.slice(0, MAX_DEFAULT);
  console.log(`📊 Live candidates in last ${LOOKBACK_HOURS}h (not yet posted): ${candidates.length}; selecting ${selected.length}`);
  return { selected, posted };
}

async function postTwitter(client, story, isTest) {
  const text = buildShareText(story, 260);
  console.log(`🐦 Twitter: ${text.slice(0, 80)}...`);
  if (isTest) return;
  await client.v2.tweet(text);
  stats.postsCreated.twitter++;
}

async function postFacebook(client, story, isTest) {
  const message = buildShareText(story, 500);
  const link = `${SITE_URL}/stories/${story.slug}`;
  console.log(`📘 Facebook: ${message.slice(0, 80)}...`);
  if (isTest) return;
  await axios.post(`https://graph.facebook.com/v18.0/${client.pageId}/feed`, null, {
    params: {
      message,
      link,
      access_token: client.accessToken
    },
    timeout: 20000
  });
  stats.postsCreated.facebook++;
}

async function postLinkedIn(client, story, isTest) {
  const text = buildShareText(story, 600);
  const url = `${SITE_URL}/stories/${story.slug}`;
  const author = client.organizationUrn || client.personUrn;
  console.log(`💼 LinkedIn: ${text.slice(0, 80)}...`);
  if (!author) {
    console.warn('⚠️ LinkedIn skipped: set LINKEDIN_PERSON_ID or LINKEDIN_ORGANIZATION_ID');
    return;
  }
  if (isTest) return;

  const body = {
    author,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'ARTICLE',
        media: [{
          status: 'READY',
          originalUrl: url,
          title: { text: story.title }
        }]
      }
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
  };

  await axios.post('https://api.linkedin.com/v2/ugcPosts', body, {
    headers: {
      Authorization: `Bearer ${client.accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    timeout: 20000
  });
  stats.postsCreated.linkedin++;
}

async function postTumblr(client, story, isTest) {
  const url = `${SITE_URL}/stories/${story.slug}`;
  const body = `<p>${story.excerpt || story.title}</p><p><a href="${url}">Read more on Global Travel Report</a></p>`;
  console.log(`📓 Tumblr: ${story.title}`);
  if (isTest) return;

  await new Promise((resolve, reject) => {
    client.client.createTextPost(client.blogName, {
      title: story.title,
      body,
      tags: buildHashtags(story).join(',')
    }, (err, _resp) => {
      if (err) reject(err);
      else resolve();
    });
  });
  stats.postsCreated.tumblr++;
}

async function postStoryToSocialMedia(story, apiClients, isTest) {
  console.log(`\n📱 Posting: ${story.title}`);
  await logToFile(`Posting ${story.slug}${isTest ? ' (test)' : ''}`);

  if (apiClients.twitter) {
    try {
      await postTwitter(apiClients.twitter, story, isTest);
    } catch (error) {
      stats.errors.twitter++;
      console.error('❌ Twitter:', error.message || error);
      await logToFile(`Twitter error for ${story.slug}: ${error.message || error}`);
    }
  }

  if (apiClients.facebook) {
    try {
      await postFacebook(apiClients.facebook, story, isTest);
    } catch (error) {
      stats.errors.facebook++;
      console.error('❌ Facebook:', error.message || error);
      await logToFile(`Facebook error for ${story.slug}: ${error.message || error}`);
    }
  }

  if (apiClients.linkedin) {
    try {
      await postLinkedIn(apiClients.linkedin, story, isTest);
    } catch (error) {
      stats.errors.linkedin++;
      console.error('❌ LinkedIn:', error.message || error);
      await logToFile(`LinkedIn error for ${story.slug}: ${error.message || error}`);
    }
  }

  if (apiClients.tumblr) {
    try {
      await postTumblr(apiClients.tumblr, story, isTest);
    } catch (error) {
      stats.errors.tumblr++;
      console.error('❌ Tumblr:', error.message || error);
      await logToFile(`Tumblr error for ${story.slug}: ${error.message || error}`);
    }
  }

  stats.storiesProcessed++;
}

async function postToSocialMedia() {
  await fs.mkdir(LOG_DIR, { recursive: true });
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const postAll = args.includes('--post-all');
  const storyArg = getArgValue(args, '--story');

  console.log(`🚀 Social poster starting (${isTest ? 'TEST' : 'LIVE'})`);
  validateEnvironment();
  const apiClients = initializeApiClients();

  let selected = [];
  let posted = await loadPostedState();

  if (storyArg) {
    const stories = await fetchLiveStories(50);
    const match = stories.find((s) => s.slug === storyArg || s.slug === path.basename(storyArg, '.md'));
    if (!match) {
      console.log(`ℹ️ Story not found via /api/stories: ${storyArg}`);
      return;
    }
    selected = [match];
  } else {
    ({ selected, posted } = await getRecentStories(postAll));
  }

  if (selected.length === 0) {
    console.log('ℹ️ No stories to post');
    await logToFile('No stories to post');
    return;
  }

  for (const story of selected) {
    await postStoryToSocialMedia(story, apiClients, isTest);
    if (!isTest) {
      posted.add(story.slug);
      await savePostedState(posted);
    }
  }

  console.log('\n✨ Done');
  console.log(`Stories processed: ${stats.storiesProcessed}`);
  console.log('Posts created:', stats.postsCreated);
  console.log('Errors:', stats.errors);
  await logToFile(`Completed posts=${JSON.stringify(stats.postsCreated)} errors=${JSON.stringify(stats.errors)}`);
}

postToSocialMedia().catch(async (error) => {
  console.error('❌ Fatal:', error);
  try {
    await logToFile(`Fatal: ${error.message || error}`);
  } catch {
    // ignore
  }
  process.exitCode = 1;
});
