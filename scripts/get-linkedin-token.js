#!/usr/bin/env node

/**
 * Exchange LinkedIn authorization code for access token
 *
 * Usage:
 * LINKEDIN_CLIENT_ID=your_id LINKEDIN_CLIENT_SECRET=your_secret LINKEDIN_AUTH_CODE=your_code node scripts/get-linkedin-token.js
 */

const axios = require('axios');

// Configuration - Set these in your environment variables
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const AUTHORIZATION_CODE = process.env.LINKEDIN_AUTH_CODE;
const REDIRECT_URI = 'https://globaltravelreport.com/api/auth/linkedin/callback';

// Validate required environment variables
if (!LINKEDIN_CLIENT_ID) {
  console.error('❌ LINKEDIN_CLIENT_ID not found in environment variables.');
  console.error('Set it with: export LINKEDIN_CLIENT_ID=your_client_id');
  process.exit(1);
}

if (!LINKEDIN_CLIENT_SECRET) {
  console.error('❌ LINKEDIN_CLIENT_SECRET not found in environment variables.');
  console.error('Set it with: export LINKEDIN_CLIENT_SECRET=your_client_secret');
  process.exit(1);
}

if (!AUTHORIZATION_CODE) {
  console.error('❌ LINKEDIN_AUTH_CODE not found in environment variables.');
  console.error('Set it with: export LINKEDIN_AUTH_CODE=your_authorization_code');
  process.exit(1);
}

async function exchangeCodeForToken() {
  try {
    console.log('🔄 Exchanging LinkedIn authorization code for access token...');

    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
      grant_type: 'authorization_code',
      code: AUTHORIZATION_CODE,
      redirect_uri: REDIRECT_URI,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, expires_in } = response.data;

    console.log('✅ Successfully obtained LinkedIn access token!');
    console.log('🔑 Access Token:', access_token);
    console.log('⏰ Expires in:', expires_in, 'seconds');
    console.log('📅 Expires at:', new Date(Date.now() + (expires_in * 1000)).toISOString());

    console.log('\n📋 Add this to your Vercel environment variables:');
    console.log('LINKEDIN_ACCESS_TOKEN=' + access_token);

    return access_token;

  } catch (error) {
    console.error('❌ Error exchanging code for token:', error.response?.data || error.message);

    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }

    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  exchangeCodeForToken();
}

module.exports = { exchangeCodeForToken };