#!/usr/bin/env node

/**
 * YouTube OAuth 2.0 Token Exchange Helper
 *
 * This script helps you exchange an authorization code for YouTube API access tokens.
 *
 * Prerequisites:
 * 1. Create a Google Cloud Project: https://console.cloud.google.com/
 * 2. Enable YouTube Data API v3
 * 3. Create OAuth 2.0 credentials
 * 4. Set up OAuth consent screen
 *
 * Usage:
 * 1. Set your credentials as environment variables:
 *    export YOUTUBE_CLIENT_ID="your_client_id"
 *    export YOUTUBE_CLIENT_SECRET="your_client_secret"
 *
 * 2. Get authorization code from OAuth flow
 * 3. Run: node scripts/get-youtube-token.js "your_auth_code"
 */

const axios = require('axios');

// YouTube OAuth endpoints
const YOUTUBE_OAUTH_URL = 'https://oauth2.googleapis.com/token';

// Get credentials from environment
const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(authCode) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Missing YouTube API credentials!');
    console.error('Please set these environment variables:');
    console.error('  YOUTUBE_CLIENT_ID=your_client_id');
    console.error('  YOUTUBE_CLIENT_SECRET=your_client_secret');
    process.exit(1);
  }

  if (!authCode) {
    console.error('❌ Missing authorization code!');
    console.error('Usage: node scripts/get-youtube-token.js "your_auth_code"');
    console.error('');
    console.error('To get an authorization code:');
    console.error('1. Visit: https://accounts.google.com/o/oauth2/v2/auth?' +
      'scope=https://www.googleapis.com/auth/youtube.force-ssl&' +
      'access_type=offline&' +
      'include_granted_scopes=true&' +
      'response_type=code&' +
      `client_id=${CLIENT_ID}&` +
      'redirect_uri=urn:ietf:wg:oauth:2.0:oob');
    console.error('2. Authorize the app');
    console.error('3. Copy the authorization code');
    process.exit(1);
  }

  console.log('🔄 Exchanging authorization code for access token...');

  try {
    const response = await axios.post(YOUTUBE_OAUTH_URL, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: authCode,
      grant_type: 'authorization_code',
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
    });

    const { access_token, refresh_token, expires_in } = response.data;

    console.log('✅ Successfully obtained YouTube access token!');
    console.log('');
    console.log('📋 Add these to your environment variables:');
    console.log('');
    console.log(`YOUTUBE_ACCESS_TOKEN=${access_token}`);
    console.log(`YOUTUBE_REFRESH_TOKEN=${refresh_token}`);
    console.log('');
    console.log(`Token expires in: ${expires_in} seconds (${Math.round(expires_in / 3600)} hours)`);
    console.log('');
    console.log('⚠️  IMPORTANT: Keep these tokens secure and never commit them to version control!');
    console.log('');
    console.log('📺 Next steps:');
    console.log('1. Add tokens to Vercel environment variables');
    console.log('2. Get your YouTube channel ID from YouTube Studio');
    console.log('3. Add YOUTUBE_CHANNEL_ID to environment variables');
    console.log('4. Test the integration: npm run test-social-media');

    return { access_token, refresh_token, expires_in };

  } catch (error) {
    console.error('❌ Error exchanging code for token:', error.response?.data || error.message);

    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }

    process.exit(1);
  }
}

/**
 * Get YouTube channel information
 */
async function getChannelInfo(accessToken) {
  try {
    console.log('📺 Getting YouTube channel information...');

    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'snippet',
        mine: true
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const channel = response.data.items[0];
    console.log('✅ Channel found:', channel.snippet.title);
    console.log('📋 Channel ID:', channel.id);
    console.log('');
    console.log('Add this to your environment variables:');
    console.log(`YOUTUBE_CHANNEL_ID=${channel.id}`);

    return channel.id;

  } catch (error) {
    console.error('❌ Error getting channel info:', error.response?.data || error.message);
    return null;
  }
}

// Main execution
async function main() {
  const authCode = process.argv[2];

  try {
    const tokens = await exchangeCodeForToken(authCode);

    if (tokens?.access_token) {
      console.log('');
      console.log('🔍 Getting channel information...');
      await getChannelInfo(tokens.access_token);
    }
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { exchangeCodeForToken, getChannelInfo };