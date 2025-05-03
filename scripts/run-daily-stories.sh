#!/bin/bash
# Script to run the daily story generator and log the output
# This script should be executed by cron

# Set the path to the project directory
PROJECT_DIR="/Users/rodneypattison/Desktop/global-travel-report"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/daily-story-generator-$(date +\%Y-\%m-\%d).log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Navigate to the project directory
cd "$PROJECT_DIR" || {
  echo "Failed to change directory to $PROJECT_DIR" >> "$LOG_FILE"
  exit 1
}

# Log the start time
echo "===== Daily Story Generator Started at $(date) =====" >> "$LOG_FILE"

# Run the story generator
node scripts/dailyStoryGenerator.js >> "$LOG_FILE" 2>&1

# Check if the script ran successfully
if [ $? -eq 0 ]; then
  echo "✅ Story generation completed successfully" >> "$LOG_FILE"
else
  echo "❌ Story generation failed with exit code $?" >> "$LOG_FILE"
fi

# Commit and push the changes to GitHub
echo "===== Committing and pushing changes to GitHub =====" >> "$LOG_FILE"
git add content/articles/ >> "$LOG_FILE" 2>&1
git commit -m "Add daily stories for $(date +\%Y-\%m-\%d)" --no-verify >> "$LOG_FILE" 2>&1
git push >> "$LOG_FILE" 2>&1

# Check if the push was successful
if [ $? -eq 0 ]; then
  echo "✅ Changes pushed to GitHub successfully" >> "$LOG_FILE"
else
  echo "❌ Failed to push changes to GitHub" >> "$LOG_FILE"
fi

# Log the end time
echo "===== Daily Story Generator Finished at $(date) =====" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
