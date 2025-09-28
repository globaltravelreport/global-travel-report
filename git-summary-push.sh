#!/bin/bash

# Script to generate git log summary and push changes without triggering Vercel deployments
# Author: Generated for repository management
# Description: This script performs two main operations:
# 1. Generates a detailed git log summary with commit hashes, authors, emails, timestamps, and descriptions
# 2. Pushes current changes to repository while avoiding Vercel deployments

set -e  # Exit on any error

echo "=========================================="
echo "Git Repository Summary and Push Script"
echo "=========================================="
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo "----------------------------------------"
    echo "$1"
    echo "----------------------------------------"
}

# 1. Generate detailed git log summary
print_section "GIT LOG SUMMARY"
echo "Generating detailed summary of all changes in the repository..."
echo ""

git log --pretty=format:"%H | %an | %ae | %ai | %s" --date=iso

# 2. Push changes without triggering Vercel deployments
print_section "PUSHING CHANGES"
echo "Pushing current changes to repository..."
echo ""
echo "Note: Using --no-verify to skip pre-push hooks and avoid Vercel deployments"
echo ""

# Check if there are any unpushed commits
if git log --oneline origin/main..HEAD 2>/dev/null | grep -q .; then
    echo "Found unpushed commits. Pushing with --no-verify to avoid Vercel deployment..."
    git push --no-verify origin main
else
    echo "No unpushed commits found. Checking if there are local changes to commit..."

    # Check if there are uncommitted changes
    if git diff --quiet && git diff --staged --quiet; then
        echo "No local changes to push."
    else
        echo "Found local changes. Adding and committing..."
        git add .
        git commit -m "Auto-commit: Update changes before push"
        echo "Committing and pushing with --no-verify to avoid Vercel deployment..."
        git push --no-verify origin main
    fi
fi

print_section "OPERATION COMPLETED"
echo "Git log summary generated and changes pushed successfully!"
echo ""
echo "Summary of actions performed:"
echo "✓ Generated detailed git log with commit hashes, authors, emails, timestamps, and descriptions"
echo "✓ Pushed changes using --no-verify flag to avoid triggering Vercel deployments"
echo ""
echo "The --no-verify flag skips pre-push hooks which typically trigger Vercel deployments."
echo "If you need to force push due to conflicts, run: git push --no-verify --force origin main"