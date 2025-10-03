#!/usr/bin/env node

/**
 * Tumblr OAuth Token Generator
 *
 * This script helps you obtain Tumblr OAuth tokens for API access.
 * Run this script to get the authorization URL, then follow the instructions.
 */

const crypto = require('crypto');
const querystring = require('querystring');
const http = require('http');
const url = require('url');
const readline = require('readline');

const TUMBLR_REQUEST_TOKEN_URL = 'https://www.tumblr.com/oauth/request_token';
const TUMBLR_AUTHORIZE_URL = 'https://www.tumblr.com/oauth/authorize';
const TUMBLR_ACCESS_TOKEN_URL = 'https://www.tumblr.com/oauth/access_token';

// Get credentials from environment variables
const CONSUMER_KEY = process.env.TUMBLR_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.TUMBLR_CONSUMER_SECRET;

if (!CONSUMER_KEY || !CONSUMER_SECRET) {
  console.error('❌ Error: Missing Tumblr credentials!');
  console.error('Please set these environment variables:');
  console.error('  TUMBLR_CONSUMER_KEY=your_consumer_key');
  console.error('  TUMBLR_CONSUMER_SECRET=your_consumer_secret');
  process.exit(1);
}

console.log('🔑 Tumblr OAuth Token Generator');
console.log('================================\n');

// Generate OAuth signature
function generateSignature(method, url, params, consumerSecret, tokenSecret = '') {
  const sortedParams = Object.keys(params).sort().map(key => {
    return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
  }).join('&');

  const signatureBase = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  return crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64');
}

// Generate OAuth header
function generateOAuthHeader(params) {
  const header = Object.keys(params).map(key => {
    return `${key}="${encodeURIComponent(params[key])}"`;
  }).join(', ');

  return `OAuth ${header}`;
}

// Step 1: Get request token
async function getRequestToken() {
  console.log('📡 Step 1: Getting request token...');

  const oauthParams = {
    oauth_consumer_key: CONSUMER_KEY,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: '1.0'
  };

  const signature = generateSignature('POST', TUMBLR_REQUEST_TOKEN_URL, oauthParams, CONSUMER_SECRET);
  oauthParams.oauth_signature = signature;

  const header = generateOAuthHeader(oauthParams);

  try {
    const response = await makeRequest(TUMBLR_REQUEST_TOKEN_URL, 'POST', {
      'Authorization': header,
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const parsed = querystring.parse(response);
    console.log('✅ Request token obtained!');
    return {
      token: parsed.oauth_token,
      tokenSecret: parsed.oauth_token_secret
    };
  } catch (error) {
    console.error('❌ Failed to get request token:', error.message);
    throw error;
  }
}

// Step 2: Get authorization URL
function getAuthorizationUrl(requestToken) {
  console.log('\n🔗 Step 2: Authorization URL');
  console.log('===========================');

  const authUrl = `${TUMBLR_AUTHORIZE_URL}?oauth_token=${requestToken}`;
  console.log(`Visit this URL in your browser:`);
  console.log(`\n${authUrl}\n`);

  console.log('Instructions:');
  console.log('1. Click the link above');
  console.log('2. Log in to Tumblr if prompted');
  console.log('3. Authorize the application');
  console.log('4. Tumblr will redirect you to a URL with oauth_verifier parameter');
  console.log('5. Copy the oauth_verifier value from the URL\n');

  return authUrl;
}

// Step 3: Get access token
async function getAccessToken(requestToken, requestTokenSecret, verifier) {
  console.log('🔑 Step 3: Getting access token...');

  const oauthParams = {
    oauth_consumer_key: CONSUMER_KEY,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: requestToken,
    oauth_verifier: verifier,
    oauth_version: '1.0'
  };

  const signature = generateSignature('POST', TUMBLR_ACCESS_TOKEN_URL, oauthParams, CONSUMER_SECRET, requestTokenSecret);
  oauthParams.oauth_signature = signature;

  const header = generateOAuthHeader(oauthParams);

  try {
    const response = await makeRequest(TUMBLR_ACCESS_TOKEN_URL, 'POST', {
      'Authorization': header,
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const parsed = querystring.parse(response);
    console.log('✅ Access token obtained!');
    return {
      token: parsed.oauth_token,
      tokenSecret: parsed.oauth_token_secret
    };
  } catch (error) {
    console.error('❌ Failed to get access token:', error.message);
    throw error;
  }
}

// Make HTTP request
function makeRequest(url, method, headers, body = '') {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.path,
      method: method,
      headers: headers
    };

    const req = require(parsedUrl.protocol === 'https:' ? 'https' : 'http').request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

// Create readline interface for user input
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Main function
async function main() {
  try {
    // Step 1: Get request token
    const requestTokenData = await getRequestToken();

    // Step 2: Get authorization URL
    getAuthorizationUrl(requestTokenData.token);

    // Step 3: Get verifier from user
    const rl = createReadlineInterface();
    const verifier = await askQuestion(rl, 'Enter the oauth_verifier from the URL: ');
    rl.close();

    if (!verifier) {
      console.error('❌ No verifier provided. Exiting...');
      process.exit(1);
    }

    // Step 4: Get access token
    const accessTokenData = await getAccessToken(
      requestTokenData.token,
      requestTokenData.tokenSecret,
      verifier
    );

    // Display results
    console.log('\n🎉 Success! Your Tumblr OAuth tokens:');
    console.log('=====================================');
    console.log(`TUMBLR_OAUTH_TOKEN=${accessTokenData.token}`);
    console.log(`TUMBLR_OAUTH_TOKEN_SECRET=${accessTokenData.tokenSecret}`);
    console.log('\n📋 Add these to your environment variables:');
    console.log('==========================================');
    console.log('# In your .env.local file:');
    console.log(`TUMBLR_OAUTH_TOKEN=${accessTokenData.token}`);
    console.log(`TUMBLR_OAUTH_TOKEN_SECRET=${accessTokenData.tokenSecret}`);
    console.log('\n# In Vercel dashboard (Environment Variables):');
    console.log(`TUMBLR_OAUTH_TOKEN = ${accessTokenData.token}`);
    console.log(`TUMBLR_OAUTH_TOKEN_SECRET = ${accessTokenData.tokenSecret}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Make sure your Tumblr app is configured correctly');
    console.log('2. Check that the callback URL is set properly in your Tumblr app');
    console.log('3. Verify your consumer key and secret are correct');
    console.log('4. Try the process again');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };