#!/bin/bash

# Constants
REPO_URL="https://github.com/globaltravelreport/global-travel-report"
PRODUCTION_URL="https://www.globaltravelreport.com"
MAX_RETRIES=3
LOG_FILE="deploy-log.txt"

# Function to get timestamp in AEST
get_timestamp() {
  date -u "+%d/%m/%Y %H:%M AEST"
}

# Function to log messages
log() {
  local type=$1
  local message=$2
  local timestamp=$(get_timestamp)
  echo "[$timestamp] [$type] $message"
  echo "[$timestamp] [$type] $message" >> "$LOG_FILE"
}

# Ensure log file exists
touch "$LOG_FILE"

# Add separator for new deployment
echo -e "\n$(printf '=%.0s' {1..80})\n" >> "$LOG_FILE"
log "INFO" "Starting new deployment..."

# Stage all changes
log "INFO" "Staging all changes..."
if ! git add .; then
  log "ERROR" "Failed to stage changes"
  exit 1
fi

# Create commit with timestamp
timestamp=$(get_timestamp)
commit_message="Auto-update from Cursor - [$timestamp]"
log "INFO" "Creating commit: $commit_message"
if ! git commit -m "$commit_message"; then
  log "ERROR" "Failed to create commit"
  exit 1
fi

# Push to main with retries
log "INFO" "Pushing to main branch..."
attempt=1
push_success=false

while [ $attempt -le $MAX_RETRIES ] && [ "$push_success" = false ]; do
  if git push origin main; then
    push_success=true
    log "SUCCESS" "Successfully pushed to main branch"
  else
    if [ $attempt -lt $MAX_RETRIES ]; then
      log "INFO" "Push failed, retrying (attempt $((attempt + 1))/$MAX_RETRIES)..."
      ((attempt++))
    else
      log "ERROR" "Failed to push after $MAX_RETRIES attempts"
      exit 1
    fi
  fi
done

# Verify the push
log "INFO" "Verifying push..."
local_hash=$(git rev-parse HEAD)
remote_hash=$(git rev-parse origin/main)

if [ "$local_hash" = "$remote_hash" ]; then
  log "SUCCESS" "Push verified successfully"
  log "INFO" "Changes will be deployed to: $PRODUCTION_URL"
  
  # Show success message
  cat << EOF

🎉 Deployment Successful! 🎉

Your changes have been successfully deployed to:
$PRODUCTION_URL

The deployment process included:
✓ Staging all changes
✓ Creating a commit with timestamp
✓ Pushing to main branch
✓ Verifying the push

You can view the deployment logs in:
$(pwd)/$LOG_FILE

Thank you for using the auto-deploy script!
EOF

else
  log "ERROR" "Local and remote commit hashes do not match"
  exit 1
fi 