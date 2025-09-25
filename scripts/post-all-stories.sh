#!/bin/bash

# Post All Stories to Social Media
#
# This script posts all unpublished stories to social media
#
# Usage: bash scripts/post-all-stories.sh

# Set up error handling
set -e

# Configuration
LOG_FILE="logs/post-all-stories-$(date +%Y-%m-%d).log"

# Create logs directory if it doesn't exist
mkdir -p logs

# Log start time
echo "===== Post All Stories Started at $(date) =====" > "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Run the social media poster with the --post-all flag
echo "Posting all unpublished stories to social media..." | tee -a "$LOG_FILE"
node scripts/social-media-poster.js --post-all | tee -a "$LOG_FILE"

# Log end time
echo "" >> "$LOG_FILE"
echo "===== Post All Stories Finished at $(date) =====" >> "$LOG_FILE"

echo "Completed. Log file: $LOG_FILE"
