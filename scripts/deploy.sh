#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment process...${NC}"

# Check if there are any uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo -e "${YELLOW}Found uncommitted changes. Committing them...${NC}"
  git add .
  git commit -m "Rebuild website with RSS fetching, OpenAI rewriting, and Unsplash images"
fi

# Push changes to GitHub
echo -e "${YELLOW}Pushing changes to GitHub...${NC}"
git push origin main

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo -e "${YELLOW}Installing Vercel CLI...${NC}"
  npm install -g vercel
fi

# Deploy to Vercel
echo -e "${YELLOW}Deploying to Vercel...${NC}"
vercel --prod

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Please check the Vercel dashboard for deployment status.${NC}"

# Verify deployment
echo "Verifying deployment..."
curl -I https://www.globaltravelreport.com 