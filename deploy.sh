#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
YELLOW='\033[1;33m'

# Function to get Sydney timestamp
get_sydney_time() {
    TZ="Australia/Sydney" date '+%d/%m/%Y %H:%M'
}

# Function to print status messages
print_status() {
    echo -e "${GREEN}[$(get_sydney_time) AEST]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(get_sydney_time) AEST]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(get_sydney_time) AEST]${NC} $1"
}

# Log to file function
log_to_file() {
    echo "[$(get_sydney_time) AEST] $1" >> deploy-log.txt
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Please run: npm install -g vercel"
    log_to_file "ERROR: Vercel CLI not installed"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    print_error "Not in a git repository"
    log_to_file "ERROR: Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes"
    git status --short
    
    # Get Sydney timestamp for commit message
    TIMESTAMP=$(get_sydney_time)
    COMMIT_MSG="Auto-deploy: Changes committed on $TIMESTAMP"
    
    print_status "Committing changes with message: $COMMIT_MSG"
    log_to_file "Committing changes: $COMMIT_MSG"
    
    git add .
    git commit -m "$COMMIT_MSG"
fi

# Pull latest changes to avoid conflicts
print_status "Pulling latest changes from GitHub..."
log_to_file "Pulling latest changes from GitHub"
if ! git pull origin main; then
    print_error "Failed to pull latest changes"
    log_to_file "ERROR: Failed to pull latest changes"
    exit 1
fi

# Build the project
print_status "Building project..."
log_to_file "Starting project build"
if ! npm run build; then
    print_error "Build failed"
    log_to_file "ERROR: Build failed"
    exit 1
fi
log_to_file "Build completed successfully"

# Deploy to Vercel
print_status "Deploying to Vercel production..."
log_to_file "Starting Vercel deployment"
if ! vercel --prod --confirm; then
    print_error "Vercel deployment failed"
    log_to_file "ERROR: Vercel deployment failed"
    exit 1
fi
log_to_file "Vercel deployment completed successfully"

# Push changes to GitHub
print_status "Pushing changes to GitHub..."
log_to_file "Pushing changes to GitHub"
if ! git push origin main; then
    print_warning "Failed to push to GitHub, but Vercel deployment was successful"
    log_to_file "WARNING: Failed to push to GitHub"
    exit 1
fi
log_to_file "Successfully pushed to GitHub"

print_status "Deployment completed successfully!"
print_status "Deployed at $(get_sydney_time) Sydney time"
print_status "Visit: https://www.globaltravelreport.com"

log_to_file "-------------------------------------------"
log_to_file "Deployment completed successfully at $(get_sydney_time)"
log_to_file "Site is live at https://www.globaltravelreport.com"
log_to_file "-------------------------------------------" 