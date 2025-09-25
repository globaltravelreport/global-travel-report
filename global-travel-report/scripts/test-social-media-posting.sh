#!/bin/bash

# Test Social Media Posting Script
#
# This script tests the social media posting functionality by:
# 1. Creating a test story
# 2. Running the social media poster with the test story
# 3. Cleaning up the test story
#
# Usage: bash scripts/test-social-media-posting.sh

# Set up error handling
set -e

# Configuration
LOG_FILE="logs/test-social-media-posting-$(date +%Y-%m-%d).log"
TEST_STORY_PATH="content/articles/test-social-media-story.md"

# Create logs directory if it doesn't exist
mkdir -p logs

# Log start time
echo "===== Test Social Media Posting Started at $(date) =====" > "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Create a test story
echo "Creating test story..." | tee -a "$LOG_FILE"
cat > "$TEST_STORY_PATH" << EOL
---
title: "Test Social Media Post - Please Ignore"
date: "$(date -u +"%a, %d %b %Y %H:%M:%S %z")"
slug: test-social-media-post
category: Travel
country: Global
excerpt: This is a test post to verify that the social media posting functionality is working correctly. Please ignore this post.
imageUrl: https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1
photographer:
  name: Unsplash
  url: https://unsplash.com
keywords: test, social media, automation
author: Global Travel Report Editorial Team
---

# Test Social Media Post - Please Ignore

This is a test post to verify that the social media posting functionality is working correctly. Please ignore this post.

## What is this?

This post was automatically generated to test the social media posting functionality of the Global Travel Report website. It will be automatically deleted after testing.

## Why is this important?

Testing the social media posting functionality ensures that new stories are automatically shared on social media platforms, increasing the reach and visibility of the Global Travel Report.

## When will this be deleted?

This post will be automatically deleted after testing is complete.
EOL

echo "Test story created at $TEST_STORY_PATH" | tee -a "$LOG_FILE"

# Run the social media poster with the test story
echo "Running social media poster..." | tee -a "$LOG_FILE"
node scripts/social-media-poster.js --story="$TEST_STORY_PATH" --test | tee -a "$LOG_FILE"

# Clean up
echo "Cleaning up..." | tee -a "$LOG_FILE"
rm "$TEST_STORY_PATH"
echo "Test story deleted" | tee -a "$LOG_FILE"

# Log end time
echo "" >> "$LOG_FILE"
echo "===== Test Social Media Posting Finished at $(date) =====" >> "$LOG_FILE"

echo "Test completed. Log file: $LOG_FILE"
