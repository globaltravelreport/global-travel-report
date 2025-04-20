#!/bin/bash

# Create necessary directories
mkdir -p data/{seo,errors,logs/{seo,errors},reports}

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Start SEO Bot
echo "Starting SEO Bot..."
pm2 start bots/seo/seoBot.js --name "seo-bot" --time --log "data/logs/seo/seo-bot.log"

# Start Error Bot
echo "Starting Error Bot..."
pm2 start bots/errors/errorBot.js --name "error-bot" --time --log "data/logs/errors/error-bot.log"

# Save PM2 process list
pm2 save

# Configure PM2 to start on system reboot
pm2 startup

echo "Bots deployed successfully!"
echo "Use 'pm2 status' to check bot status"
echo "Use 'pm2 logs' to view logs" 