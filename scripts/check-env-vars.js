#!/usr/bin/env node

/**
 * Check for required environment variables
 */

const requiredVars = [
  'NEXT_PUBLIC_GA_ID',
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_SITE_URL',
  'BREVO_API_KEY'
];

const optionalVars = [
  'TWITTER_API_KEY',
  'DATABASE_URL',
  'SENTRY_DSN',
  'YOUTUBE_ACCESS_TOKEN',
  'YOUTUBE_CHANNEL_ID'
];

console.log('🔍 Checking environment variables...\n');

// Check if we're running in Vercel (production build)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'production';

let missingRequired = [];
let missingOptional = [];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingRequired.push(varName);
  }
});

optionalVars.forEach(varName => {
  if (!process.env[varName]) {
    missingOptional.push(varName);
  }
});

if (missingRequired.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingRequired.forEach(varName => {
    console.log(`   - ${varName}`);
  });

  if (isVercel) {
    console.log('\nThese must be set in Vercel for the build to succeed.\n');
  } else {
    console.log('\n⚠️  Running locally - these should be set in Vercel for production.\n');
  }
}

if (missingOptional.length > 0) {
  console.log('⚠️  Missing optional environment variables:');
  missingOptional.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\nThese are optional but recommended for full functionality.\n');
}

if (missingRequired.length === 0) {
  console.log('✅ All required environment variables are present.');
}

if (missingOptional.length === 0) {
  console.log('✅ All optional environment variables are present.');
}

// Only fail the build in Vercel/production, allow local development
if (missingRequired.length > 0 && isVercel) {
  console.log('🚫 Build failed: Missing required environment variables in Vercel');
  process.exit(1);
} else if (missingRequired.length > 0 && !isVercel) {
  console.log('⚠️  Local development: Missing environment variables, but allowing build to continue');
} else {
  console.log('✅ Environment check passed');
}