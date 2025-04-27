#!/bin/bash

# Build the project
echo "Building project..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

# Verify deployment
echo "Verifying deployment..."
curl -I https://www.globaltravelreport.com 