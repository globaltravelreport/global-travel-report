#!/bin/bash
# Script to test the GitHub Actions workflow locally
# This script simulates what the GitHub Actions workflow will do

# Set the path to the project directory
PROJECT_DIR="$(pwd)"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/github-action-test-$(date +\%Y-\%m-\%d).log"
SITE_URL="https://www.globaltravelreport.com"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Log the start time
echo "===== GitHub Actions Test Started at $(date) =====" > "$LOG_FILE"

# Check if environment variables are set
if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ OPENAI_API_KEY is not set. Please set it before running this script." | tee -a "$LOG_FILE"
  exit 1
fi

if [ -z "$UNSPLASH_ACCESS_KEY" ]; then
  echo "❌ UNSPLASH_ACCESS_KEY is not set. Please set it before running this script." | tee -a "$LOG_FILE"
  exit 1
fi

if [ -z "$CRON_SECRET_KEY" ]; then
  echo "❌ CRON_SECRET_KEY is not set. Please set it before running this script." | tee -a "$LOG_FILE"
  exit 1
fi

# Run the story generator with 9 stories (7 travel + 2 cruise) for testing
echo "Running story generator with count=9 (7 travel + 2 cruise)..." | tee -a "$LOG_FILE"
node scripts/dailyStoryGenerator.js --count=9 --cruise-count=2 >> "$LOG_FILE" 2>&1

# Check if the script ran successfully
if [ $? -eq 0 ]; then
  echo "✅ Story generation completed successfully" | tee -a "$LOG_FILE"
else
  echo "❌ Story generation failed with exit code $?" | tee -a "$LOG_FILE"
  exit 1
fi

# Check if there are any changes to commit
if [[ -n $(git status -s content/articles/) ]]; then
  echo "✅ New stories were generated" | tee -a "$LOG_FILE"

  # Ask if the user wants to commit and push the changes
  read -p "Do you want to commit and push the changes? (y/n) " -n 1 -r
  echo

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "===== Committing and pushing changes to GitHub =====" | tee -a "$LOG_FILE"

    # Add new story files
    git add content/articles/

    # Commit with today's date
    git commit -m "Add test stories for GitHub Actions ($(date +%Y-%m-%d))" --no-verify

    # Push to the repository
    git push

    echo "✅ Changes pushed to GitHub successfully" | tee -a "$LOG_FILE"
  else
    echo "Skipping commit and push" | tee -a "$LOG_FILE"
  fi
else
  echo "No new stories to commit" | tee -a "$LOG_FILE"
fi

# Run the revalidation script
echo "===== Revalidating website =====" | tee -a "$LOG_FILE"
node scripts/revalidate-website.js >> "$LOG_FILE" 2>&1

# Check if the revalidation was successful
if [ $? -eq 0 ]; then
  echo "✅ Website revalidation completed successfully" | tee -a "$LOG_FILE"
else
  echo "❌ Website revalidation failed with exit code $?" | tee -a "$LOG_FILE"
fi

# Log the end time
echo "===== GitHub Actions Test Finished at $(date) =====" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE"
