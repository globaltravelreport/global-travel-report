#!/bin/bash

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Create logs directory if it doesn't exist
mkdir -p data/logs

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a data/logs/bot-manager.log
}

# Function to start a bot with retry logic
start_bot() {
    local bot_name=$1
    local bot_script=$2
    local max_retries=3
    local retry_count=0

    while [ $retry_count -lt $max_retries ]; do
        log "Starting $bot_name..."
        node $bot_script
        local exit_code=$?

        if [ $exit_code -eq 0 ]; then
            log "$bot_name completed successfully"
            return 0
        else
            retry_count=$((retry_count + 1))
            log "$bot_name crashed (attempt $retry_count/$max_retries). Exit code: $exit_code"
            
            if [ $retry_count -lt $max_retries ]; then
                log "Restarting $bot_name in 10 seconds..."
                sleep 10
            else
                log "Maximum retries reached for $bot_name. Giving up."
                return 1
            fi
        fi
    done
}

# Main loop
while true; do
    # Start SEO Bot
    start_bot "SEO Bot" "bots/seo/seoBot.js"
    
    # Start Error Bot
    start_bot "Error Bot" "bots/errors/errorBot.js"
    
    # If both bots failed, wait before restarting
    log "Both bots failed. Waiting 30 seconds before restarting..."
    sleep 30
done 