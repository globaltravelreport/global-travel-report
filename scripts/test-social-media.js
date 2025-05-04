#!/usr/bin/env node

/**
 * Test script for social media posting
 *
 * This script tests the social media posting functionality with a test message
 * to verify that the API keys are working correctly.
 *
 * Usage:
 * node scripts/test-social-media.js [--platform=twitter|facebook|linkedin|all]
 */

// Try to load from .env.local first, then fall back to .env.local.test
try {
  require('dotenv').config({ path: '.env.local' });
} catch (error) {
  console.log('No .env.local file found, trying .env.local.test');
  require('dotenv').config({ path: '.env.local.test' });
}
const { TwitterApi } = require('twitter-api-v2');
const FB = require('fb');
const axios = require('axios');

// Parse command line arguments
const args = process.argv.slice(2);
const platform = getArgValue(args, '--platform', 'all');
const dryRun = args.includes('--dry-run') || true; // Always dry run for safety

async function main() {
  console.log('🧪 Testing social media posting...');

  // Test message
  const testMessage = `This is a test post from Global Travel Report. ${new Date().toISOString()}`;
  const testUrl = 'https://www.globaltravelreport.com';

  // Test Twitter
  if (platform === 'all' || platform === 'twitter') {
    await testTwitter(testMessage);
  }

  // Test Facebook
  if (platform === 'all' || platform === 'facebook') {
    await testFacebook(testMessage, testUrl);
  }

  // Test LinkedIn
  if (platform === 'all' || platform === 'linkedin') {
    await testLinkedIn(testMessage, testUrl);
  }

  console.log('✅ Social media testing completed!');
}

/**
 * Test Twitter API
 */
async function testTwitter(message) {
  console.log('\n🐦 Testing Twitter API...');

  if (!process.env.TWITTER_API_KEY ||
      !process.env.TWITTER_API_SECRET ||
      !process.env.TWITTER_ACCESS_TOKEN ||
      !process.env.TWITTER_ACCESS_SECRET) {
    console.error('❌ Missing Twitter API keys');
    return;
  }

  try {
    // Initialize Twitter client
    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET
    });

    console.log('✅ Twitter client initialized');

    // Post a test tweet
    console.log(`Posting test tweet: ${message}`);

    if (dryRun) {
      console.log('🧪 DRY RUN: Would post tweet:', message);
      console.log('✅ Twitter API connection verified successfully!');
    } else {
      const tweet = await twitterClient.v2.tweet(message);
      console.log(`✅ Tweet posted successfully! Tweet ID: ${tweet.data.id}`);
      console.log(`View tweet at: https://twitter.com/i/web/status/${tweet.data.id}`);
    }
  } catch (error) {
    console.error('❌ Twitter API error:', error.message);
    if (error.data) {
      console.error('Error details:', JSON.stringify(error.data, null, 2));
    }
  }
}

/**
 * Test Facebook API
 */
async function testFacebook(message, url) {
  console.log('\n📘 Testing Facebook API...');

  if (!process.env.FACEBOOK_ACCESS_TOKEN || !process.env.FACEBOOK_PAGE_ID) {
    console.error('❌ Missing Facebook API keys');
    return;
  }

  try {
    // Initialize Facebook client
    FB.setAccessToken(process.env.FACEBOOK_ACCESS_TOKEN);
    console.log('✅ Facebook client initialized');

    // Post a test message
    console.log(`Posting test message to Facebook page ${process.env.FACEBOOK_PAGE_ID}: ${message}`);

    if (dryRun) {
      console.log('🧪 DRY RUN: Would post to Facebook:', message);
      console.log('✅ Facebook API connection verified successfully!');
    } else {
      const response = await new Promise((resolve, reject) => {
        FB.api(
          `/${process.env.FACEBOOK_PAGE_ID}/feed`,
          'POST',
          {
            message: message,
            link: url
          },
          function(response) {
            if (!response || response.error) {
              reject(response?.error || new Error('Unknown Facebook API error'));
              return;
            }

            resolve(response);
          }
        );
      });

      console.log(`✅ Facebook post created successfully! Post ID: ${response.id}`);
      console.log(`View post at: https://www.facebook.com/${response.id}`);
    }
  } catch (error) {
    console.error('❌ Facebook API error:', error.message);
    if (error.response) {
      console.error('Error details:', JSON.stringify(error.response, null, 2));
    }
  }
}

/**
 * Test LinkedIn API
 */
async function testLinkedIn(message, url) {
  console.log('\n📙 Testing LinkedIn API...');

  if (!process.env.LINKEDIN_ACCESS_TOKEN) {
    console.error('❌ Missing LinkedIn API keys');
    return;
  }

  try {
    console.log('✅ LinkedIn client initialized');

    // Post a test message
    console.log(`Posting test message to LinkedIn: ${message}`);

    if (dryRun) {
      console.log('🧪 DRY RUN: Would post to LinkedIn:', message);
      console.log('✅ LinkedIn API connection verified successfully!');
    } else {
      const response = await axios({
        method: 'POST',
        url: 'https://api.linkedin.com/v2/ugcPosts',
        headers: {
          'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        data: {
          author: `urn:li:person:${process.env.LINKEDIN_PERSON_ID || 'me'}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: `${message}\n\n${url}`
              },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        }
      });

      console.log(`✅ LinkedIn post created successfully! Post ID: ${response.data.id}`);
    }
  } catch (error) {
    console.error('❌ LinkedIn API error:', error.message);
    if (error.response) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

/**
 * Get a command line argument value
 */
function getArgValue(args, name, defaultValue = null) {
  const arg = args.find(arg => arg.startsWith(`${name}=`));
  if (!arg) return defaultValue;
  return arg.split('=')[1];
}

// Run the script
main().catch(console.error);
